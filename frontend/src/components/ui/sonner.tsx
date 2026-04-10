"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      richColors
      closeButton
      expand={false}
      gap={10}
      toastOptions={{
        classNames: {
          toast:
            "group glass-panel border-white/15 bg-card/95 text-foreground shadow-xl backdrop-blur-md",
          title: "font-medium",
          description: "text-muted-foreground text-sm",
          success: "border-emerald-500/30",
          error: "border-destructive/40",
        },
      }}
    />
  );
}
