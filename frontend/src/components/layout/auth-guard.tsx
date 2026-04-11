"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthGuard({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (session != null) {
        setChecked(true);
        return;
      }

      router.replace(AUTH_ROUTES.login);
    };

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      if (session != null) {
        setChecked(true);
        return;
      }

      setChecked(false);
      router.replace(AUTH_ROUTES.login);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  if (!checked) return null;

  return <>{children}</>;
}
