"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { registerUser } from "@/lib/api/auth";
import { AUTH_ROUTES, APP_ROUTES } from "@/lib/auth/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getStringFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function SignupForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const full_name = getStringFormValue(formData, "name").trim();
    const email = getStringFormValue(formData, "email").trim();
    const password = getStringFormValue(formData, "password");

    if (!full_name || !email || !password) {
      toast.error("Fill in all fields.");
      return;
    }

    setPending(true);
    try {
      const result = await registerUser({ email, password, full_name });
      if (result.session != null) {
        toast.success("Account created", { description: "Welcome to ResumeForge AI." });
        router.replace(APP_ROUTES.dashboard);
        router.refresh();
        return;
      }

      setConfirmationEmail(email);
      toast.success("Confirm your email", {
        description: "We sent you a confirmation link before you can sign in.",
      });
    } catch (err) {
      let msg: string;
      if (err instanceof TypeError) {
        msg =
          "Cannot reach Supabase. Check that NEXT_PUBLIC_SUPABASE_URL and your Supabase public key are set.";
      } else {
        msg = err instanceof Error ? err.message : "Could not create account.";
      }
      toast.error("Sign up failed", { description: msg });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-md glass-panel border-white/10 shadow-2xl">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Create your workspace</CardTitle>
        <CardDescription>
          {"Use your work email — we'll send a confirmation link before first login."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {confirmationEmail ? (
          <div className="space-y-4 text-sm text-muted-foreground">
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-50">
              {"Account created for "}
              <span className="font-medium">{confirmationEmail}</span>
              {". Check your inbox and click the confirmation link before logging in."}
            </p>
            <Button
              type="button"
              className="w-full"
              onClick={() => router.replace(AUTH_ROUTES.login)}
            >
              Go to login
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" autoComplete="name" placeholder="Alex Rivera" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
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
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Creating account…" : "Create account"}
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={AUTH_ROUTES.login} className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
