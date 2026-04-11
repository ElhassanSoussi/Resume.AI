"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { AUTH_ROUTES, APP_ROUTES } from "@/lib/auth/routes";
import { loginUser } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [emailConfirmationHint, setEmailConfirmationHint] = useState<string | null>(null);

  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const emailValue = fd.get("email");
    const passwordValue = fd.get("password");
    const email = (typeof emailValue === "string" ? emailValue : "").trim();
    const password = typeof passwordValue === "string" ? passwordValue : "";

    if (!email || !password) {
      toast.error("Enter email and password.");
      return;
    }

    setPending(true);
    try {
      await loginUser({ email, password });
      setEmailConfirmationHint(null);
      toast.success("Signed in");
      router.replace(APP_ROUTES.dashboard);
      router.refresh();
    } catch (err) {
      let msg: string;
      if (err instanceof TypeError) {
        msg =
          "Cannot reach Supabase. Check that NEXT_PUBLIC_SUPABASE_URL and your Supabase public key are set.";
      } else {
        msg = err instanceof Error ? err.message : "Could not sign in.";
      }

      if (/confirm|verified|email/i.test(msg)) {
        setEmailConfirmationHint(email);
      }

      toast.error("Login failed", { description: msg });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-md glass-panel border-white/10 shadow-2xl">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to open your resumes and billing.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Continue"}
          </Button>
        </form>
        {emailConfirmationHint ? (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            Confirm the email sent to <span className="font-medium">{emailConfirmationHint}</span> before logging in.
          </p>
        ) : null}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href={AUTH_ROUTES.signup} className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
