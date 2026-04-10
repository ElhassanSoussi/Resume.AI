"use client";

import Link from "next/link";
import { ExternalLink, FileStack, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useExportHistory, usePaymentList } from "@/hooks/use-billing";
import { ApiError } from "@/lib/api/client";
import { APP_ROUTES } from "@/lib/auth/routes";
import { formatMoneyCents } from "@/lib/format-money";
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

  const payErr = payments.error instanceof ApiError ? payments.error.message : null;
  const expErr = exports.error instanceof ApiError ? exports.error.message : null;

  return (
    <PageSection
      eyebrow="Account"
      title="Payments & exports"
      description="Stripe receipts and generated PDFs for your workspace."
    >
      <div className="space-y-8">
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
              <p className="text-sm text-destructive" role="alert">
                {payErr ?? "Could not load payments."}
              </p>
            ) : null}
            {!payments.isLoading && !payments.isError && !payments.data?.length ? (
              <EmptyState
                title="No payments yet"
                description="When you purchase a PDF export, receipts appear here."
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
              <p className="text-sm text-destructive" role="alert">
                {expErr ?? "Could not load exports."}
              </p>
            ) : null}
            {!exports.isLoading && !exports.isError && !exports.data?.length ? (
              <EmptyState
                title="No exports yet"
                description="Generate a PDF from any paid resume — exports list here with download links when available."
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
                        <td className="px-4 py-3.5 text-muted-foreground">{x.template_key}</td>
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
