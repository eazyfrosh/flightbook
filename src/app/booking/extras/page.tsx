"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Luggage, Shield, Sparkles, Utensils } from "lucide-react";
import { BookingSteps } from "@/components/booking/booking-steps";
import { TripSummary } from "@/components/booking/trip-summary";
import { SeatMap } from "@/components/booking/seat-map";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useBookingStore } from "@/lib/store/booking-store";
import { useBookingHydrated } from "@/lib/store/use-hydrated";
import { MEAL_OPTIONS } from "@/lib/data/flights";
import { formatCurrency } from "@/lib/utils";

const EXTRA_BAGGAGE_PRICE = 45;
const INSURANCE_PRICE = 29;
const PRIORITY_PRICE = 19;

export default function ExtrasPage() {
  const hydrated = useBookingHydrated();
  if (!hydrated) return null;
  return <ExtrasForm />;
}

function ExtrasForm() {
  const router = useRouter();
  const { itinerary, extras, setExtras } = useBookingStore();
  const [local, setLocal] = useState(extras);

  useEffect(() => {
    if (itinerary.filter(Boolean).length === 0) router.replace("/search");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const extrasTotal =
    (local.extraBaggage ? EXTRA_BAGGAGE_PRICE : 0) +
    (local.travelInsurance ? INSURANCE_PRICE : 0) +
    (local.priorityBoarding ? PRIORITY_PRICE : 0);

  function continueToPayment() {
    setExtras(local);
    router.push("/booking/payment");
  }

  if (itinerary.filter(Boolean).length === 0) return null;
  const primaryFlight = itinerary[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <BookingSteps current="extras" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Enhance your trip</h1>
            <p className="mt-1 text-sm text-foreground/60">Optional extras, priced per trip.</p>
          </div>

          <section className="rounded-2xl border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={17} className="text-brand-600 dark:text-brand-400" />
              <h2 className="font-semibold">Select your seat</h2>
            </div>
            {primaryFlight && (
              <SeatMap
                flightId={primaryFlight.id}
                value={local.seatSelection}
                onChange={(seat) => setLocal((l) => ({ ...l, seatSelection: seat }))}
              />
            )}
          </section>

          <section className="rounded-2xl border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center gap-2">
              <Utensils size={17} className="text-brand-600 dark:text-brand-400" />
              <h2 className="font-semibold">Meal preference</h2>
            </div>
            <Select
              value={local.meal ?? "none"}
              onChange={(e) => setLocal((l) => ({ ...l, meal: e.target.value === "none" ? null : e.target.value }))}
            >
              {MEAL_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m === "none" ? "No preference" : m}
                </option>
              ))}
            </Select>
          </section>

          <section className="space-y-3 rounded-2xl border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-black/[0.02] p-3.5 dark:bg-white/5">
              <span className="flex items-center gap-3">
                <Luggage size={18} className="text-brand-600 dark:text-brand-400" />
                <span>
                  <span className="block text-sm font-medium">Extra checked baggage</span>
                  <span className="block text-xs text-foreground/50">+23kg additional allowance</span>
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span className="text-sm font-semibold">{formatCurrency(EXTRA_BAGGAGE_PRICE)}</span>
                <input
                  type="checkbox"
                  checked={local.extraBaggage}
                  onChange={(e) => setLocal((l) => ({ ...l, extraBaggage: e.target.checked }))}
                  className="h-5 w-5 rounded accent-brand-600"
                />
              </span>
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-black/[0.02] p-3.5 dark:bg-white/5">
              <span className="flex items-center gap-3">
                <Shield size={18} className="text-brand-600 dark:text-brand-400" />
                <span>
                  <span className="block text-sm font-medium">Travel insurance</span>
                  <span className="block text-xs text-foreground/50">Trip cancellation & medical coverage (mock)</span>
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span className="text-sm font-semibold">{formatCurrency(INSURANCE_PRICE)}</span>
                <input
                  type="checkbox"
                  checked={local.travelInsurance}
                  onChange={(e) => setLocal((l) => ({ ...l, travelInsurance: e.target.checked }))}
                  className="h-5 w-5 rounded accent-brand-600"
                />
              </span>
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-black/[0.02] p-3.5 dark:bg-white/5">
              <span className="flex items-center gap-3">
                <Sparkles size={18} className="text-brand-600 dark:text-brand-400" />
                <span>
                  <span className="block text-sm font-medium">Priority boarding</span>
                  <span className="block text-xs text-foreground/50">Board first, skip the line</span>
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span className="text-sm font-semibold">{formatCurrency(PRIORITY_PRICE)}</span>
                <input
                  type="checkbox"
                  checked={local.priorityBoarding}
                  onChange={(e) => setLocal((l) => ({ ...l, priorityBoarding: e.target.checked }))}
                  className="h-5 w-5 rounded accent-brand-600"
                />
              </span>
            </label>
          </section>

          <div className="flex justify-end">
            <Button size="lg" onClick={continueToPayment}>
              Continue to payment <ArrowRight size={17} />
            </Button>
          </div>
        </div>

        <div>
          <TripSummary extrasTotal={extrasTotal} />
        </div>
      </div>
    </div>
  );
}
