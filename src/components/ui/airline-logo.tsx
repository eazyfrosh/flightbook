import type { Airline } from "@/types";
import { cn } from "@/lib/utils";

export function AirlineLogo({ airline, size = 40, className }: { airline: Airline; size?: number; className?: string }) {
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center rounded-xl font-bold text-white", className)}
      style={{ backgroundColor: airline.logoColor, width: size, height: size, fontSize: size * 0.36 }}
    >
      {airline.code}
    </span>
  );
}
