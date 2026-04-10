import type { Metadata } from "next";
import Link from "next/link";

import { AUTH_ROUTES } from "@/lib/auth/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <Card className="w-full max-w-md glass-panel border-white/10 shadow-2xl">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Create your workspace</CardTitle>
        <CardDescription>
          This form is ready for your auth provider — hook Server Actions or API routes next.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" action="#" method="post">
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
          <Button type="submit" className="w-full">
            Create account
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
