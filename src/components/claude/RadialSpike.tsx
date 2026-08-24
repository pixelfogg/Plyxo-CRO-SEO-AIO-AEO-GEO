"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { PlyxoLogo } from "@/components/ui/logo";

export function RadialSpike({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block transition-transform duration-300 hover:rotate-90", className)}
      aria-hidden="true"
    >
      {/* Anthropic signature radial spike mark: 4 tapered spokes meeting at center */}
      <path
        d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BrandLogo({ className, variant = "default" }: { className?: string; variant?: "default" | "dark" }) {
  return (
    <div className={cn("flex items-center gap-2.5 group cursor-pointer select-none", className)}>
      <PlyxoLogo className="h-6" />
    </div>
  );
}
