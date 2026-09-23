"use client";

import { useRouter } from "next/navigation";
import { History } from "lucide-react";
import { useSearchHistoryStore } from "@/lib/store/search-history-store";
import { findAirport } from "@/lib/data/airports";
import { Card } from "@/components/ui/card";
import { resolveAirline } from "@/lib/data/airlines";
import { formatCurrency } from "@/lib/utils";

export function RecentSearches() {
  const recentSearches = useSearchHistoryStore((s) => s.recentSearches);
  const router = useRouter();

  if (recentSearches.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-center gap-2">
        <History size={18} className="text-foreground/50" />
        <h2 className="text-lg font-semibold">Recently searched</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {recentSearches.map((s, idx) => {
          const from = findAirport(s.from);
          const to = findAirport(s.to);
          const airline = s.preferredAirlineId ? resolveAirline(s.preferredAirlineId) : undefined;
          return (
            <Card
              key={idx}
              className="min-w-[220px] shrink-0 cursor-pointer p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => {
                const params = new URLSearchParams({
                  tripType: s.tripType,
                  from: s.from,
                  to: s.to,
                  departureDate: s.departureDate,
                  cabin: s.cabin,
                  passengers: JSON.stringify({ adults: 1, children: 0, infants: 0 }),
                });
                if (s.preferredAirlineId) params.set("airline", s.preferredAirlineId);
                if (s.customPrice !== undefined) params.set("price", s.customPrice.toFixed(2));
                router.push(`/search?${params.toString()}`);
              }}
            >
              <p className="text-sm font-semibold">
                {from?.code ?? s.from} → {to?.code ?? s.to}
              </p>
              <p className="mt-1 text-xs text-foreground/50">
                {from?.city} to {to?.city}
              </p>
              <p className="mt-2 text-xs text-foreground/40">{s.departureDate}</p>
              {(airline || s.customPrice !== undefined) && (
                <p className="mt-1 text-xs text-foreground/50">
                  {airline?.name ?? "Any airline"}{s.customPrice !== undefined ? ` · ${formatCurrency(s.customPrice)}` : ""}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
