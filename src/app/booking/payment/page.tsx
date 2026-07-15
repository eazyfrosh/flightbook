"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CreditCard, Landmark, Lock, ShieldCheck } from "lucide-react";
import { BookingSteps } from "@/components/booking/booking-steps";
import { TripSummary } from "@/components/booking/trip-summary";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { useBookingStore } from "@/lib/store/booking-store";
import { useBookingHydrated } from "@/lib/store/use-hydrated";
import { useAuth } from "@/context/auth-context";
import { createBooking } from "@/lib/services/bookings";
import { cardPaymentSchema, type CardPaymentValues } from "@/lib/validation/payment";
import { formatCurrency, generateBookingReference } from "@/lib/utils";
import type { Booking, PaymentMethodType } from "@/types";

const EXTRA_BAGGAGE_PRICE = 45;
const INSURANCE_PRICE = 29;
const PRIORITY_PRICE = 19;

const methods: { id: PaymentMethodType; label: string; icon: React.ReactNode }[] = [
  { id: "credit_card", label: "Credit Card", icon: <CreditCard size={17} /> },
  { id: "debit_card", label: "Debit Card", icon: <CreditCard size={17} /> },
  { id: "paypal", label: "PayPal", icon: <Landmark size={17} /> },
  { id: "apple_pay", label: "Apple Pay", icon: <Landmark size={17} /> },
  { id: "google_pay", label: "Google Pay", icon: <Landmark size={17} /> },
];

export default function PaymentPage() {
  const hydrated = useBookingHydrated();
  const { loading: authLoading } = useAuth();
  if (!hydrated || authLoading) return null;
  return <PaymentForm />;
}

function PaymentForm() {
  const router = useRouter();
  const { itinerary, passengers, extras, searchParams, reset } = useBookingStore();
  const { user, addSavedPaymentMethod } = useAuth();
  const [method, setMethod] = useState<PaymentMethodType>("credit_card");
  const [processing, setProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CardPaymentValues>({ resolver: zodResolver(cardPaymentSchema) });

  useEffect(() => {
    if (itinerary.filter(Boolean).length === 0) {
      router.replace("/search");
      return;
    }
    if (!user) {
      router.replace("/auth/login?next=/booking/payment");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (itinerary.filter(Boolean).length === 0 || !user) return null;

  const passengerCount = searchParams
    ? searchParams.passengers.adults + searchParams.passengers.children + searchParams.passengers.infants
    : passengers.length || 1;
  const flightsTotal = itinerary.reduce((sum, f) => sum + (f ? f.price : 0), 0) * Math.max(1, passengerCount);
  const extrasTotal =
    (extras.extraBaggage ? EXTRA_BAGGAGE_PRICE : 0) +
    (extras.travelInsurance ? INSURANCE_PRICE : 0) +
    (extras.priorityBoarding ? PRIORITY_PRICE : 0);
  const total = flightsTotal + extrasTotal;

  async function finalizeBooking(cardValues?: CardPaymentValues) {
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));

    const booking: Booking = {
      id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      bookingReference: generateBookingReference(),
      userId: user!.uid,
      flights: itinerary.filter(Boolean),
      passengers,
      extras,
      totalPrice: total,
      currency: "USD",
      status: "confirmed",
      createdAt: new Date().toISOString(),
      paymentMethod: method,
      seatAssignment: extras.seatSelection,
    };

    await createBooking(booking);

    if (cardValues?.savePaymentMethod) {
      await addSavedPaymentMethod({
        id: `pm-${Date.now()}`,
        type: method,
        label: method === "credit_card" ? "Credit Card" : "Debit Card",
        last4: cardValues.cardNumber.slice(-4),
        expiry: cardValues.expiry,
      });
    }

    setProcessing(false);
    reset();
    toast.success("Payment successful — booking confirmed!");
    router.push(`/booking/confirmation/${booking.id}`);
  }

  function onCardSubmit(values: CardPaymentValues) {
    finalizeBooking(values);
  }

  const isCard = method === "credit_card" || method === "debit_card";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <BookingSteps current="payment" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Payment</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-foreground/60">
              <Lock size={13} /> This is a simulated, demo checkout — no real payment is processed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition ${
                  method === m.id
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                    : "border-black/10 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                }`}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>

          {isCard ? (
            <form
              onSubmit={handleSubmit(onCardSubmit)}
              className="space-y-4 rounded-2xl border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div>
                <Label>Cardholder name</Label>
                <Input {...register("cardholderName")} placeholder="Jane Doe" />
                <FieldError>{errors.cardholderName?.message}</FieldError>
              </div>
              <div>
                <Label>Card number</Label>
                <Input {...register("cardNumber")} placeholder="4242 4242 4242 4242" inputMode="numeric" />
                <FieldError>{errors.cardNumber?.message}</FieldError>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Expiry (MM/YY)</Label>
                  <Input {...register("expiry")} placeholder="08/29" />
                  <FieldError>{errors.expiry?.message}</FieldError>
                </div>
                <div>
                  <Label>CVV</Label>
                  <Input {...register("cvv")} placeholder="123" inputMode="numeric" />
                  <FieldError>{errors.cvv?.message}</FieldError>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground/70">
                <input type="checkbox" {...register("savePaymentMethod")} className="h-4 w-4 rounded accent-brand-600" />
                Save this card for future bookings (demo — no real card data is stored)
              </label>
              <Button type="submit" size="lg" className="w-full" disabled={processing}>
                {processing ? "Processing…" : `Pay ${formatCurrency(total)}`}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 rounded-2xl border border-black/8 bg-white p-6 text-center dark:border-white/10 dark:bg-white/[0.03]">
              <ShieldCheck className="mx-auto text-brand-600 dark:text-brand-400" size={32} />
              <p className="text-sm text-foreground/60">
                You&apos;ll be redirected to {methods.find((m) => m.id === method)?.label} to complete this simulated payment.
              </p>
              <Button size="lg" className="w-full" onClick={() => finalizeBooking()} disabled={processing}>
                {processing ? "Processing…" : `Continue with ${methods.find((m) => m.id === method)?.label}`}
              </Button>
            </div>
          )}
        </div>

        <div>
          <TripSummary extrasTotal={extrasTotal} />
        </div>
      </div>
    </div>
  );
}
