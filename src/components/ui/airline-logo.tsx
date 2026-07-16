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

/**
 * Custom-designed placeholder mark — not a real airline logo/trademark.
 * Every airline gets a consistent circular badge derived from its brand
 * color so branding reads the same across search results, confirmations,
 * boarding passes, and the printable itinerary.
 */
export function AirlineLogo({ airline, size = 40, className }: { airline: Airline; size?: number; className?: string }) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-md ring-1 ring-black/10",
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${airline.logoColor}, ${shadeColor(airline.logoColor, -22)})`,
        width: size,
        height: size,
        fontSize: size * 0.34,
        letterSpacing: "0.02em",
      }}
    >
      {airline.code}
    </span>
  );
}
