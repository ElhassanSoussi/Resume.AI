"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, FileDown, Loader2, Lock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ExportModePicker } from "@/components/resume/export-mode-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PRODUCT_SINGLE_PDF_EXPORT,
  useCreateCheckoutSession,
  useGeneratePdf,
  useLatestExportMetadata,
  useResumePaymentStatus,
} from "@/hooks/use-billing";
import { ApiError } from "@/lib/api/client";
import { getAppOrigin } from "@/lib/app-url";
import {
  DEFAULT_EXPORT_MODE,
  getResumeTemplateMeta,
  type ResumeExportMode,
} from "@/lib/resume/constants";
import { cn } from "@/lib/utils";

type Props = {
  resumeId: string;
  templateKey: string;
};

export function ResumeExportSection({ resumeId, templateKey }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paymentParam = searchParams.get("payment");

  const [unlockOpen, setUnlockOpen] = useState(false);
  const [exportMode, setExportMode] = useState<ResumeExportMode>(DEFAULT_EXPORT_MODE);
  const successToastSent = useRef(false);
  const cancelToastSent = useRef(false);

  const { data: payStatus, isLoading: payLoading, refetch: refetchPay } = useResumePaymentStatus(resumeId);
  const paid = payStatus?.paid === true;

  const { data: latestExport, isLoading: exportLoading, refetch: refetchExport } = useLatestExportMetadata(
    resumeId,
    { enabled: paid },
  );

  const checkoutMut = useCreateCheckoutSession();
  const genMut = useGeneratePdf(resumeId);
  const busy = checkoutMut.isPending || genMut.isPending;
  const paymentPending =
    payStatus?.status === "pending" || payStatus?.status === "processing";
  const checkoutBlocked = busy || paymentPending;
  const designedTemplate = getResumeTemplateMeta(templateKey);

  useEffect(() => {
    if (paymentParam === "success") {
      void refetchPay();
    }
  }, [paymentParam, refetchPay]);

  useEffect(() => {
    if (paymentParam !== "success" || paid) return;
    const id = setInterval(() => {
      void refetchPay();
    }, 2500);
    const stop = setTimeout(() => clearInterval(id), 60_000);
    return () => {
      clearInterval(id);
      clearTimeout(stop);
    };
  }, [paymentParam, paid, refetchPay]);

  useEffect(() => {
    if (paymentParam === "success" && paid && !successToastSent.current) {
      successToastSent.current = true;
      toast.success("Payment confirmed", {
        description: "You can generate and download your PDF export.",
      });
      router.replace(pathname, { scroll: false });
    }
  }, [paymentParam, paid, pathname, router]);

  useEffect(() => {
    if (paymentParam === "canceled" && !cancelToastSent.current) {
      cancelToastSent.current = true;
      toast.message("Checkout canceled", { description: "No charges were made." });
      router.replace(pathname, { scroll: false });
    }
  }, [paymentParam, pathname, router]);

  const startCheckout = () => {
    if (paymentPending) {
      toast.message("Payment still processing", {
        description: "Please wait for Stripe confirmation before starting another checkout.",
      });
      return;
    }
    const origin = getAppOrigin();
    if (!origin) {
      toast.error("Missing app URL", { description: "Set NEXT_PUBLIC_APP_URL or open the app in a browser." });
      return;
    }
    checkoutMut.mutate(
      {
        resume_id: resumeId,
        success_url: `${origin}${pathname}?payment=success`,
        cancel_url: `${origin}${pathname}?payment=canceled`,
        product_type: PRODUCT_SINGLE_PDF_EXPORT,
      },
      {
        onError: (e) => {
          const msg = e instanceof ApiError ? e.message : "Could not start checkout.";
          const title =
            e instanceof ApiError && e.status === 503
              ? "Payments unavailable"
              : "Checkout failed";
          toast.error(title, { description: msg });
        },
      },
    );
  };

  const runGenerate = () => {
    genMut.mutate(
      {
        template_key: exportMode === "designed" ? templateKey : null,
        export_mode: exportMode,
      },
      {
        onSuccess: (meta) => {
          toast.success("PDF ready", { description: meta.suggested_filename });
          void refetchExport();
        },
        onError: (e) => {
          const msg = e instanceof ApiError ? e.message : "Export failed.";
          toast.error("Could not generate PDF", { description: msg });
        },
      },
    );
  };

  const openDownload = () => {
    const url = latestExport?.public_download_url;
    if (!url) {
      toast.error("Download link unavailable", {
        description: "Configure public file URLs on the API or regenerate the PDF.",
      });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (payLoading) {
    return (
      <div
        className="glass-panel space-y-3 rounded-xl border border-white/[0.09] p-5"
        role="status"
        aria-busy="true"
        aria-label="Loading export status"
      >
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-full max-w-sm" />
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "glass-panel relative overflow-hidden rounded-xl border p-5",
          paid
            ? "border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent"
            : "border-white/[0.09] bg-muted/20",
        )}
      >
        {!paid ? (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(120,120,120,0.12),_transparent_55%)]" />
        ) : null}
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {!paid ? (
                <Lock className="size-4 text-muted-foreground" aria-hidden />
              ) : (
                <Sparkles className="size-4 text-emerald-400" aria-hidden />
              )}
              <h3 className="font-heading text-sm font-semibold">PDF export</h3>
              {paid ? (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-emerald-300">
                  Paid
                </span>
              ) : (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                  Locked
                </span>
              )}
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              {paid
                ? "Print-ready export from your current draft. Regenerate anytime after edits."
                : "One-time unlock for this résumé: generate ATS-safe or designed white-paper exports."}
            </p>
            <div className="max-w-2xl space-y-3">
              <div>
                <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Export mode
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  ATS Export uses ATS Classic for the safest parsing. Designed Export uses your selected template with
                  refined spacing on white paper.
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-foreground/70">
                  Designed template: {designedTemplate.label}
                </p>
              </div>
              <ExportModePicker
                selected={exportMode}
                onSelect={setExportMode}
                disabled={busy}
                compact
              />
            </div>
            {!paid && paymentPending ? (
              <p className="text-xs text-amber-200/90">
                Payment processing… This page will update when Stripe confirms your checkout.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!paid ? (
              <>
                <Button
                  type="button"
                  variant="default"
                  disabled={checkoutBlocked}
                  onClick={() => setUnlockOpen(true)}
                  className="btn-inset min-w-[160px]"
                >
                  {checkoutMut.isPending || paymentPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      {paymentPending ? "Awaiting payment…" : "Redirecting…"}
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 size-4" />
                      Unlock PDF export
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  onClick={runGenerate}
                >
                  {genMut.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-4" />
                      {exportMode === "ats" ? "Generate ATS PDF" : "Generate Designed PDF"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy || exportLoading || latestExport?.status !== "completed"}
                  onClick={openDownload}
                >
                  <Download className="mr-2 size-4" />
                  Download
                </Button>
              </>
            )}
          </div>
        </div>
        {paid && latestExport && latestExport.status === "completed" ? (
          <p className="relative mt-3 text-xs text-muted-foreground">
            Latest file: <span className="font-mono text-foreground/90">{latestExport.suggested_filename}</span>
            {latestExport.file_size_bytes != null ? (
              <span> · {(latestExport.file_size_bytes / 1024).toFixed(1)} KB</span>
            ) : null}
          </p>
        ) : null}
      </div>

      <Dialog open={unlockOpen} onOpenChange={setUnlockOpen}>
        <DialogContent className="max-w-md border-white/[0.12] bg-card/95 shadow-2xl backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Unlock PDF export</DialogTitle>
            <DialogDescription>
              Checkout happens on Stripe. When it completes, return here to generate either an ATS-safe export or a
              designed recruiter-ready PDF on white paper.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setUnlockOpen(false)} disabled={busy}>
              Not now
            </Button>
            <Button
              type="button"
              onClick={() => {
                setUnlockOpen(false);
                startCheckout();
              }}
              disabled={checkoutBlocked}
            >
              {checkoutMut.isPending || paymentPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {paymentPending ? "Awaiting payment…" : "Opening Stripe…"}
                </>
              ) : (
                "Continue to checkout"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
