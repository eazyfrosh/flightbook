import { Sparkles } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700 px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
      <span className="inline-flex items-center gap-1.5">
        <Sparkles size={14} className="text-gold-400" />
        SkyBook is a portfolio demo — no real flights or airline systems are involved. Bookings are simulated and free.
      </span>
    </div>
  );
}
