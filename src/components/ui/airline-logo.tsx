"use client";

import { useEffect, useState } from "react";
import type { Airline } from "@/types";
import { findAirline } from "@/lib/data/airlines";
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
 * Renders each airline's official logo, always resolved against the live
 * `airlines` catalog (see src/lib/data/airlines.ts) by id — never trusting
 * the `airline` prop's own `logoSrc`/`logoColor` directly. Callers often
 * pass an `Airline` object embedded inside stored booking/flight data,
 * which is a snapshot frozen at booking-creation time; resolving fresh
 * here means every surface reflects current branding (e.g. a newly added
 * logo.dev token) even for old bookings, with a single source of truth.
 * Falls back to the passed-in object only if the id isn't in the catalog
 * (e.g. a since-removed airline).
 *
 * The brand-color monogram badge is always painted first and stays
 * visible until the real logo has actually finished loading — so a slow
 * or missing asset (404, no logoSrc) never shows a blank gap or
 * broken-image icon, it just stays on the clean fallback badge.
 */
export function AirlineLogo({ airline, size = 40, className }: { airline: Airline; size?: number; className?: string }) {
  const current = findAirline(airline.id) ?? airline;
  const [state, setState] = useState<LoadState>(current.logoSrc ? "loading" : "error");

  useEffect(() => {
    setState(current.logoSrc ? "loading" : "error");
  }, [current.logoSrc]);

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
          background: `linear-gradient(135deg, ${current.logoColor}, ${shadeColor(current.logoColor, -22)})`,
          fontSize: size * 0.34,
          letterSpacing: "0.02em",
          opacity: state === "loaded" ? 0 : 1,
        }}
      >
        {current.code}
      </span>
      {current.logoSrc && state !== "error" && (
        <img
          src={current.logoSrc}
          alt={`${current.name} logo`}
          className="relative h-[78%] w-[78%] object-contain transition-opacity duration-200"
          style={{ opacity: state === "loaded" ? 1 : 0 }}
          decoding="async"
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
        />
      )}
    </span>
  );
}
