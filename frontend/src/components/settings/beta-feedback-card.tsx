import Link from "next/link";

import { MARKETING_ROUTES } from "@/lib/auth/routes";
import { buildBetaFeedbackMailto, getBetaFeedbackFormUrl } from "@/lib/beta-feedback";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function BetaFeedbackCard() {
  const formUrl = getBetaFeedbackFormUrl();
  const mailto = buildBetaFeedbackMailto();

  return (
    <Card className="glass-panel border-primary/20 bg-primary/[0.04]">
      <CardHeader>
        <CardTitle>Beta feedback</CardTitle>
        <CardDescription>
          Early access: tell us what broke, what confused you, or what almost worked. Short notes are enough — we read
          everything and use it to prioritize fixes.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {formUrl ? (
          <Button size="sm" className="btn-inset" asChild>
            <a href={formUrl} target="_blank" rel="noopener noreferrer">
              Open feedback form
            </a>
          </Button>
        ) : null}
        {mailto ? (
          <Button size="sm" variant={formUrl ? "outline" : "default"} className={formUrl ? "" : "btn-inset"} asChild>
            <a href={mailto}>Email the team</a>
          </Button>
        ) : null}
        <Button size="sm" variant="ghost" asChild>
          <Link href={MARKETING_ROUTES.support}>Support and policies</Link>
        </Button>
        {!formUrl && !mailto ? (
          <p className="text-sm text-muted-foreground">
            The operator can enable quick feedback by setting{" "}
            <code className="rounded bg-white/5 px-1 text-xs text-foreground/90">NEXT_PUBLIC_SUPPORT_EMAIL</code> or{" "}
            <code className="rounded bg-white/5 px-1 text-xs text-foreground/90">NEXT_PUBLIC_BETA_FEEDBACK_URL</code>{" "}
            (see <code className="rounded bg-white/5 px-1 text-xs">frontend/.env.example</code>).
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
