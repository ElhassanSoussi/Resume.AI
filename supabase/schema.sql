-- ResumeForge AI Supabase schema bootstrap
-- Apply in the Supabase SQL editor before switching data reads/writes away from the local Postgres app DB.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key,
  email varchar(320) not null unique,
  full_name varchar(255) not null,
  is_active boolean not null default true,
  is_pro boolean not null default false,
  stripe_customer_id varchar(255),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title varchar(255) not null,
  template_key varchar(100) not null default 'modern',
  status varchar(50) not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists resumes_user_id_idx on public.resumes(user_id);

create table if not exists public.resume_personal_info (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null unique references public.resumes(id) on delete cascade,
  first_name varchar(100) not null,
  last_name varchar(100) not null,
  email varchar(320) not null,
  phone varchar(50),
  location varchar(255),
  website text,
  linkedin_url text,
  github_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_summaries (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null unique references public.resumes(id) on delete cascade,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_experiences (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  company varchar(255) not null,
  job_title varchar(255) not null,
  location varchar(255),
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  bullets text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists resume_experiences_resume_id_idx on public.resume_experiences(resume_id);

create table if not exists public.resume_educations (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  institution varchar(255) not null,
  degree varchar(255) not null,
  field_of_study varchar(255),
  location varchar(255),
  start_date date not null,
  end_date date,
  gpa varchar(20),
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists resume_educations_resume_id_idx on public.resume_educations(resume_id);

create table if not exists public.resume_skills (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  category varchar(100) not null,
  items varchar(100)[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists resume_skills_resume_id_idx on public.resume_skills(resume_id);

create table if not exists public.resume_exports (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  format varchar(20) not null default 'pdf',
  file_url text,
  file_size_bytes integer,
  status varchar(50) not null default 'pending',
  template_key varchar(100) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists resume_exports_resume_id_idx on public.resume_exports(resume_id);
create index if not exists resume_exports_user_id_idx on public.resume_exports(user_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  stripe_payment_intent_id varchar(255) unique,
  stripe_checkout_session_id varchar(255) unique,
  amount integer not null,
  currency varchar(10) not null default 'usd',
  status varchar(50) not null default 'pending',
  product_type varchar(100) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists payments_resume_id_idx on public.payments(resume_id);
create index if not exists payments_checkout_session_idx on public.payments(stripe_checkout_session_id);

create or replace function public.sync_auth_user_to_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, is_active, is_pro)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    true,
    false
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.users.full_name),
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.sync_auth_user_to_profile();

insert into public.users (id, email, full_name, is_active, is_pro)
select
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data ->> 'full_name', split_part(au.email, '@', 1)),
  true,
  false
from auth.users au
on conflict (id) do update
set email = excluded.email,
    full_name = coalesce(excluded.full_name, public.users.full_name),
    updated_at = now();

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'users',
    'resumes',
    'resume_personal_info',
    'resume_summaries',
    'resume_experiences',
    'resume_educations',
    'resume_skills',
    'resume_exports',
    'payments'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', tbl, tbl);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      tbl,
      tbl
    );
  end loop;
end $$;
