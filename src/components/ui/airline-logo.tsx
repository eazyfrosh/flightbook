"use client";

import { useEffect, useState } from "react";
import type { Airline } from "@/types";
import { cn } from "@/lib/utils";

function shadeColor(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

type LoadState = "loading" | "loaded" | "error";

/**
 * Renders each airline's official logo from the centralized `airlines` data
 * mapping (see src/lib/data/airlines.ts). The brand-color monogram badge is
 * always painted first and stays visible until the real logo has actually
 * finished loading — so a slow or missing asset (404, corrupt file, no
 * `logoSrc` set) never shows a blank gap or broken-image icon, it just
 * stays on the clean fallback badge.
 */
export function AirlineLogo({ airline, size = 40, className }: { airline: Airline; size?: number; className?: string }) {
  const [state, setState] = useState<LoadState>(airline.logoSrc ? "loading" : "error");

  useEffect(() => {
    setState(airline.logoSrc ? "loading" : "error");
  }, [airline.logoSrc]);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/10 dark:ring-white/15",
        className
      )}
      style={{ width: size, height: size }}
    >
      <span
        aria-hidden={state === "loaded"}
        className="absolute inset-0 flex items-center justify-center font-bold text-white transition-opacity duration-200"
        style={{
          background: `linear-gradient(135deg, ${airline.logoColor}, ${shadeColor(airline.logoColor, -22)})`,
          fontSize: size * 0.34,
          letterSpacing: "0.02em",
          opacity: state === "loaded" ? 0 : 1,
        }}
      >
        {airline.code}
      </span>
      {airline.logoSrc && state !== "error" && (
        <img
          src={airline.logoSrc}
          alt={`${airline.name} logo`}
          className="relative h-[78%] w-[78%] object-contain transition-opacity duration-200"
          style={{ opacity: state === "loaded" ? 1 : 0 }}
          loading="lazy"
          decoding="async"
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
        />
      )}
    </span>
  );
}
