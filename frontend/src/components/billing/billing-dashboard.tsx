"use client";

import Link from "next/link";
import { ExternalLink, FileStack, Receipt } from "lucide-react";

import { ApiTokenCallout } from "@/components/system/api-token-callout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useExportHistory, usePaymentList } from "@/hooks/use-billing";
import { APP_ROUTES } from "@/lib/auth/routes";
import { formatMoneyCents } from "@/lib/format-money";
import { getResumeTemplateMeta } from "@/lib/resume/constants";
import { cn } from "@/lib/utils";

function statusBadge(status: string) {
  const s = status.toLowerCase();
  const cls =
    s === "succeeded"
      ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25"
      : s === "pending" || s === "processing"
        ? "bg-amber-500/12 text-amber-200 ring-1 ring-amber-500/20"
        : s === "failed" || s === "canceled"
          ? "bg-destructive/12 text-destructive ring-1 ring-destructive/25"
          : "bg-muted text-muted-foreground ring-1 ring-white/5";
  return (
    <span
      className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide", cls)}
    >
      {status}
    </span>
  );
}

function PremiumTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("surface-table", className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function BillingDashboard() {
  const payments = usePaymentList(0, 50);
  const exports = useExportHistory(0, 50);

  const paymentCount = payments.data?.length ?? 0;
  const exportCount = exports.data?.length ?? 0;

  return (
    <PageSection
      eyebrow="Account"
      title="Payments & exports"
      description="Receipts, export history, and the clearest path from payment to final PDF."
    >
      <div className="space-y-8">
        <ApiTokenCallout />

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="glass-panel border-white/[0.09]">
            <CardContent className="pt-5">
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">Payments</p>
              <p className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground">{paymentCount}</p>
              <p className="mt-2 text-sm text-muted-foreground">Successful and pending checkout attempts live here.</p>
            </CardContent>
          </Card>
          <Card className="glass-panel border-white/[0.09]">
            <CardContent className="pt-5">
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">Exports</p>
              <p className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground">{exportCount}</p>
              <p className="mt-2 text-sm text-muted-foreground">Generated PDFs stay available here after payment.</p>
            </CardContent>
          </Card>
          <Card className="glass-panel border-white/[0.09]">
            <CardContent className="pt-5">
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">How it works</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Purchase once per resume, return to the editor, generate the PDF, then download it from export history anytime.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-panel border-white/[0.09]">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-card/80 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)]">
              <Receipt className="size-5 text-primary" aria-hidden />
            </div>
            <div>
              <CardTitle className="font-heading text-lg">Payments</CardTitle>
              <CardDescription>Checkout sessions and outcomes.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {payments.isLoading ? <TableSkeleton rows={5} /> : null}
            {payments.isError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4" role="alert">
                <p className="font-medium text-destructive">We couldn’t load payment activity right now.</p>
                <p className="mt-2 text-sm text-destructive/90">
                  Refresh to try again. Completed charges and receipts are not affected.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => void payments.refetch()}>
                  Refresh payments
                </Button>
              </div>
            ) : null}
            {!payments.isLoading && !payments.isError && !payments.data?.length ? (
              <EmptyState
                title="No payments yet"
                description="When you unlock a resume export, the payment record shows up here with checkout status and receipt details."
              />
            ) : null}
            {!payments.isLoading && !payments.isError && payments.data && payments.data.length > 0 ? (
              <PremiumTable>
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-muted/20 text-xs uppercase tracking-wider text-muted-foreground">
                      <th scope="col" className="px-4 py-3.5 font-semibold">
                        Date
                      </th>
                      <th scope="col" className="px-4 py-3.5 font-semibold">
                        Amount
                      </th>
                      <th scope="col" className="px-4 py-3.5 font-semibold">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3.5 font-semibold">
                        Product
                      </th>
                      <th scope="col" className="px-4 py-3.5 font-semibold">
                        Resume
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.data.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-white/[0.05] transition-colors last:border-0 hover:bg-muted/15"
                      >
                        <td className="px-4 py-3.5 tabular-nums text-muted-foreground">
                          {new Date(p.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-foreground">
                          {formatMoneyCents(p.amount, p.currency)}
                        </td>
                        <td className="px-4 py-3.5">{statusBadge(p.status)}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{p.product_type}</td>
                        <td className="px-4 py-3.5">
                          {p.resume_id ? (
                            <Link
                              href={APP_ROUTES.resumeEdit(p.resume_id)}
                              className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
                            >
                              Open
                              <ExternalLink className="size-3.5 opacity-70" aria-hidden />
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </PremiumTable>
            ) : null}
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/[0.09]">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-card/80 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)]">
              <FileStack className="size-5 text-primary" aria-hidden />
            </div>
            <div>
              <CardTitle className="font-heading text-lg">Export history</CardTitle>
              <CardDescription>PDFs generated after a successful payment.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {exports.isLoading ? <TableSkeleton rows={5} /> : null}
            {exports.isError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4" role="alert">
                <p className="font-medium text-destructive">We couldn’t load export history right now.</p>
                <p className="mt-2 text-sm text-destructive/90">
                  Refresh to try again. Existing files remain available in storage.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => void exports.refetch()}>
                  Refresh exports
                </Button>
              </div>
            ) : null}
            {!exports.isLoading && !exports.isError && !exports.data?.length ? (
              <EmptyState
                title="No exports yet"
                description="After payment, generate the PDF from the resume editor. Completed exports appear here with download links and template details."
              />
            ) : null}
            {!exports.isLoading && !exports.isError && exports.data && exports.data.length > 0 ? (
              <PremiumTable>
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-muted/20 text-xs uppercase tracking-wider text-muted-foreground">
                      <th scope="col" className="px-4 py-3.5 font-semibold">
                        Created
                      </th>
                      <th scope="col" className="px-4 py-3.5 font-semibold">
                        Resume
                      </th>
                      <th scope="col" className="px-4 py-3.5 font-semibold">
                        Template
                      </th>
                      <th scope="col" className="px-4 py-3.5 font-semibold">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3.5 font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {exports.data.map((x) => (
                      <tr
                        key={x.id}
                        className="border-b border-white/[0.05] transition-colors last:border-0 hover:bg-muted/15"
                      >
                        <td className="px-4 py-3.5 tabular-nums text-muted-foreground">
                          {new Date(x.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-foreground">{x.resume_title}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">
                          {getResumeTemplateMeta(x.template_key).label}
                        </td>
                        <td className="px-4 py-3.5">{statusBadge(x.status)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={APP_ROUTES.resumeEdit(x.resume_id)}>Edit</Link>
                            </Button>
                            {x.public_download_url ? (
                              <Button variant="secondary" size="sm" asChild>
                                <a href={x.public_download_url} target="_blank" rel="noopener noreferrer">
                                  Download
                                </a>
                              </Button>
                            ) : (
                              <span className="self-center text-xs text-muted-foreground">Link unavailable</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </PremiumTable>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </PageSection>
  );
}
