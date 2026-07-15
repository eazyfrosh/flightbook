"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Ticket } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getBooking, cancelBooking } from "@/lib/services/bookings";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DownloadPdfButton } from "@/components/booking/download-pdf-button";
import { cabinLabel, formatCurrency, formatDateLong, formatTime } from "@/lib/utils";
import type { Booking } from "@/types";

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null | undefined>(undefined);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/auth/login?next=/dashboard/bookings/${id}`);
      return;
    }
    getBooking(id).then(setBooking);
  }, [id, user, loading, router]);

  if (loading || booking === undefined) {
    return <div className="mx-auto max-w-2xl px-4 py-24 text-center text-foreground/50">Loading…</div>;
  }

  if (!booking || (user && booking.userId !== user.uid)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-xl font-semibold">Booking not found</h1>
        <Link href="/dashboard"><Button className="mt-6">Back to dashboard</Button></Link>
      </div>
    );
  }

  async function handleCancel() {
    if (!booking) return;
    await cancelBooking(booking);
    setBooking({ ...booking, status: "cancelled" });
    toast.success("Booking cancelled");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Booking {booking.bookingReference}</h1>
          <Badge tone={booking.status === "confirmed" ? "green" : booking.status === "cancelled" ? "red" : "neutral"} className="mt-1">
            {booking.status}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <DownloadPdfButton label="Download PDF" />
          {booking.status === "confirmed" && (
            <Link href={`/boarding-pass/${booking.id}`}>
              <Button variant="secondary"><Ticket size={15} /> Boarding pass</Button>
            </Link>
          )}
          {booking.status === "confirmed" && (
            <Button variant="danger" onClick={handleCancel}>Cancel booking</Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {booking.flights.map((flight, idx) => {
          const first = flight.segments[0];
          const last = flight.segments[flight.segments.length - 1];
          return (
            <Card key={idx}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-semibold">{first.airline.name} · {flight.segments.map((s) => s.flightNumber).join(", ")}</p>
                  <Badge tone="brand">{cabinLabel(flight.cabin)}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-lg font-bold">{formatTime(first.departureTime)}</p>
                    <p className="text-foreground/50">{first.originCode} · {formatDateLong(first.departureTime)}</p>
                  </div>
                  <div className="text-foreground/40">→</div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatTime(last.arrivalTime)}</p>
                    <p className="text-foreground/50">{last.destinationCode} · {formatDateLong(last.arrivalTime)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 font-semibold">Passengers</h3>
            <ul className="space-y-1 text-sm text-foreground/70">
              {booking.passengers.map((p) => (
                <li key={p.id}>{p.firstName} {p.lastName} <span className="text-foreground/40">· {p.type}</span></li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-black/8 pt-3 text-base font-bold dark:border-white/10">
              <span>Total paid</span>
              <span className="text-brand-700 dark:text-brand-400">{formatCurrency(booking.totalPrice, booking.currency)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
