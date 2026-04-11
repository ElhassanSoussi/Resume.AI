-- ResumeForge AI row-level security policies for Supabase.
-- Apply after schema.sql.

alter table public.users enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_personal_info enable row level security;
alter table public.resume_summaries enable row level security;
alter table public.resume_experiences enable row level security;
alter table public.resume_educations enable row level security;
alter table public.resume_skills enable row level security;
alter table public.resume_exports enable row level security;
alter table public.payments enable row level security;

drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users
for select to authenticated
using (id = auth.uid());

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists resumes_all_own on public.resumes;
create policy resumes_all_own on public.resumes
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists resume_personal_info_all_own on public.resume_personal_info;
create policy resume_personal_info_all_own on public.resume_personal_info
for all to authenticated
using (
  exists (
    select 1 from public.resumes r
    where r.id = resume_personal_info.resume_id
      and r.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.resumes r
    where r.id = resume_personal_info.resume_id
      and r.user_id = auth.uid()
  )
);

drop policy if exists resume_summaries_all_own on public.resume_summaries;
create policy resume_summaries_all_own on public.resume_summaries
for all to authenticated
using (
  exists (
    select 1 from public.resumes r
    where r.id = resume_summaries.resume_id
      and r.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.resumes r
    where r.id = resume_summaries.resume_id
      and r.user_id = auth.uid()
  )
);

drop policy if exists resume_experiences_all_own on public.resume_experiences;
create policy resume_experiences_all_own on public.resume_experiences
for all to authenticated
using (
  exists (
    select 1 from public.resumes r
    where r.id = resume_experiences.resume_id
      and r.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.resumes r
    where r.id = resume_experiences.resume_id
      and r.user_id = auth.uid()
  )
);

drop policy if exists resume_educations_all_own on public.resume_educations;
create policy resume_educations_all_own on public.resume_educations
for all to authenticated
using (
  exists (
    select 1 from public.resumes r
    where r.id = resume_educations.resume_id
      and r.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.resumes r
    where r.id = resume_educations.resume_id
      and r.user_id = auth.uid()
  )
);

drop policy if exists resume_skills_all_own on public.resume_skills;
create policy resume_skills_all_own on public.resume_skills
for all to authenticated
using (
  exists (
    select 1 from public.resumes r
    where r.id = resume_skills.resume_id
      and r.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.resumes r
    where r.id = resume_skills.resume_id
      and r.user_id = auth.uid()
  )
);

drop policy if exists resume_exports_all_own on public.resume_exports;
create policy resume_exports_all_own on public.resume_exports
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists payments_all_own on public.payments;
create policy payments_all_own on public.payments
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
