"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth/token";
import { AUTH_ROUTES } from "@/lib/auth/routes";

export function AuthGuard({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setChecked(true);
    } else {
      router.replace(AUTH_ROUTES.login);
    }
  }, [router]);

  if (!checked) return null;

  return <>{children}</>;
}
