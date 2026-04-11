function isPlaceholder(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase() ?? "";
  return (
    normalized === "" ||
    normalized === "https://your-project-ref.supabase.co" ||
    normalized === "your-public-anon-key"
  );
}

function firstConfiguredValue(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => !isPlaceholder(value));
}

function requireConfiguredValue(value: string | undefined, errorMessage: string): string {
  if (isPlaceholder(value)) {
    throw new Error(errorMessage);
  }

  if (value == null) {
    throw new Error(errorMessage);
  }

  return value.trim();
}

export function getSupabasePublicEnv() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawAnonKey = firstConfiguredValue(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_KEY,
  );

  const url = requireConfiguredValue(
    rawUrl,
    "Missing real NEXT_PUBLIC_SUPABASE_URL. Replace the placeholder in frontend/.env.local.",
  );
  const anonKey = requireConfiguredValue(
    rawAnonKey,
    "Missing real Supabase public key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / NEXT_PUBLIC_SUPABASE_KEY).",
  );

  return {
    url,
    anonKey,
  };
}
