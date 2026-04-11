function isPlaceholder(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase() ?? "";
  return (
    normalized === "" ||
    normalized === "https://your-project-ref.supabase.co" ||
    normalized === "your-public-anon-key"
  );
}

export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isPlaceholder(url)) {
    throw new Error(
      "Missing real NEXT_PUBLIC_SUPABASE_URL. Replace the placeholder in frontend/.env.local.",
    );
  }

  if (isPlaceholder(anonKey)) {
    throw new Error(
      "Missing real NEXT_PUBLIC_SUPABASE_ANON_KEY. Replace the placeholder in frontend/.env.local.",
    );
  }

  return {
    url: url!.trim(),
    anonKey: anonKey!.trim(),
  };
}
