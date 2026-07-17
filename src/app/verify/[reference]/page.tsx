"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, CalendarClock, DoorOpen, Layers, ShieldCheck, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AirlineLogo } from "@/components/ui/airline-logo";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { QRCodeImage } from "@/components/booking/qr-code";
import { getBookingByReference } from "@/lib/services/bookings";
import { extrasLineItems } from "@/lib/data/extras-pricing";
import { bookingStatusLabel, bookingStatusTone } from "@/lib/data/booking-status";
import { getVerificationUrl } from "@/lib/booking/verification-url";
import { cabinLabel, formatCurrency, formatDateLong, formatDuration, formatTime } from "@/lib/utils";
import type { Booking } from "@/types";

export default function VerifyBookingPage() {
  const { reference } = useParams<{ reference: string }>();
  const [booking, setBooking] = useState<Booking | null | undefined>(undefined);

  useEffect(() => {
    getBookingByReference(decodeURIComponent(reference)).then(setBooking);
  }, [reference]);

  if (booking === undefined) {
    return <LoadingState label="Verifying booking…" />;
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6 lg:px-8">
        <EmptyState
          icon={<ShieldCheck size={22} />}
          title="Booking not found"
          description="Please check your booking reference or contact support."
        />
        <Link href="/">
          <Button className="mt-6">Return to homepage</Button>
        </Link>
      </div>
    );
  }

  const extraLineItems = extrasLineItems(booking.extras);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
          <BadgeCheck size={32} />
        </span>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Booking Verified</h1>
        <p className="mt-1 text-sm text-foreground/60">
          This is an official verification of a SkyBook demo booking. No real airline reservation is involved.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="flex flex-col items-center gap-5 p-6 sm:flex-row sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-foreground/50">Booking reference</p>
            <p className="text-3xl font-bold tracking-widest text-brand-700 dark:text-brand-400">
              {booking.bookingReference}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge tone={bookingStatusTone(booking.status)}>{bookingStatusLabel(booking.status)}</Badge>
              {booking.rebookedAt && <Badge tone="gold">Rebooked</Badge>}
            </div>
            <p className="mt-2 text-xs text-foreground/50">Created {formatDateLong(booking.createdAt)}</p>
          </div>
          <QRCodeImage value={getVerificationUrl(booking.bookingReference)} />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="mb-3 font-semibold">Passenger details</h3>
          <ul className="space-y-1.5 text-sm text-foreground/70">
            {booking.passengers.map((p) => (
              <li key={p.id}>
                {p.firstName} {p.lastName} <span className="text-foreground/40">· {p.type} · {p.nationality}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="mb-6 space-y-4">
        {booking.flights.map((flight, idx) => {
          const first = flight.segments[0];
          const last = flight.segments[flight.segments.length - 1];
          return (
            <Card key={idx}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <AirlineLogo airline={first.airline} size={32} />
                    <p className="font-semibold">
                      {first.airline.name} <span className="text-foreground/40">· {flight.segments.map((s) => s.flightNumber).join(", ")}</span>
                    </p>
                  </div>
                  <Badge tone="brand">{cabinLabel(flight.cabin)}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-lg font-bold">{formatTime(first.departureTime)}</p>
                    <p className="text-foreground/50">{first.originCode} · {formatDateLong(first.departureTime)}</p>
                  </div>
                  <div className="px-3 text-center text-xs text-foreground/40">
                    {formatDuration(flight.totalDurationMinutes)}
                    <div className="my-1 border-t border-dashed border-black/15 dark:border-white/15" />
                    {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatTime(last.arrivalTime)}</p>
                    <p className="text-foreground/50">{last.destinationCode} · {formatDateLong(last.arrivalTime)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <DoorOpen size={16} className="text-brand-600 dark:text-brand-400" /> Gate &amp; boarding
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-foreground/50">Seat</p>
              <p className="font-semibold">{booking.seatAssignment ?? "Not assigned"}</p>
            </div>
            <div>
              <p className="text-xs text-foreground/50">Gate</p>
              <p className="font-semibold">{booking.gate ?? "TBD"}</p>
            </div>
            <div>
              <p className="text-xs text-foreground/50">Terminal</p>
              <p className="font-semibold">{booking.terminal ?? "TBD"}</p>
            </div>
          </div>
          {booking.boardingTime && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-foreground/60">
              <CalendarClock size={14} /> Boarding time: <strong className="text-foreground">{booking.boardingTime}</strong>
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Layers size={16} className="text-brand-600 dark:text-brand-400" /> Extras &amp; price
          </h3>
          {extraLineItems.length === 0 ? (
            <p className="text-sm text-foreground/50">No extras selected.</p>
          ) : (
            <ul className="space-y-1.5 text-sm text-foreground/70">
              {extraLineItems.map((item) => (
                <li key={item.label} className="flex justify-between">
                  <span>{item.label}</span>
                  {item.price > 0 && <span>{formatCurrency(item.price, booking.currency)}</span>}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 space-y-1.5 border-t border-black/8 pt-3 text-sm dark:border-white/10">
            <div className="flex justify-between text-foreground/60">
              <span>Ticket price</span>
              <span>{formatCurrency(booking.ticketPrice, booking.currency)}</span>
            </div>
            <div className="flex justify-between border-t border-black/8 pt-1.5 text-base font-bold dark:border-white/10">
              <span>Total</span>
              <span className="text-brand-700 dark:text-brand-400">{formatCurrency(booking.totalPrice, booking.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href={`/boarding-pass/${booking.id}`}>
          <Button variant="secondary">
            <Ticket size={16} /> View boarding pass
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Return to homepage</Button>
        </Link>
      </div>
    </div>
  );
}
