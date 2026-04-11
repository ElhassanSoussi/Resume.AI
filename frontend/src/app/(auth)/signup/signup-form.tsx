"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { AUTH_ROUTES, APP_ROUTES } from "@/lib/auth/routes";
import { loginUser, registerUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { setAccessToken } from "@/lib/auth/token";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const full_name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    if (!full_name || !email || !password) {
      toast.error("Fill in all fields.");
      return;
    }

    setPending(true);
    try {
      await registerUser({ email, password, full_name });
      const tokens = await loginUser({ email, password });
      setAccessToken(tokens.access_token);
      toast.success("Account created", { description: "Welcome to ResumeForge AI." });
      router.replace(APP_ROUTES.dashboard);
      router.refresh();
    } catch (err) {
      let msg: string;
      if (err instanceof ApiError) {
        msg = err.message;
      } else if (err instanceof TypeError) {
        msg =
          "Cannot reach the API. Start FastAPI (e.g. uvicorn on port 8000), restart `npm run dev` after changing next.config, and check API_PROXY_TARGET.";
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
          Use your work email — you will be signed in automatically after registration.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
