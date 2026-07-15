"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plane } from "lucide-react";
import { getBooking } from "@/lib/services/bookings";
import { QRCodeImage } from "@/components/booking/qr-code";
import { DownloadPdfButton } from "@/components/booking/download-pdf-button";
import { AirlineLogo } from "@/components/ui/airline-logo";
import { cabinLabel, formatDateLong, formatTime } from "@/lib/utils";
import type { Booking } from "@/types";

function boardingTime(departureIso: string) {
  return formatTime(new Date(new Date(departureIso).getTime() - 45 * 60000).toISOString());
}

function gateFor(flightId: string) {
  const letters = "ABCDEFGHJK";
  const sum = flightId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return `${letters[sum % letters.length]}${(sum % 30) + 1}`;
}

export default function BoardingPassPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null | undefined>(undefined);
  const [legIndex, setLegIndex] = useState(0);

  useEffect(() => {
    getBooking(bookingId).then(setBooking);
  }, [bookingId]);

  if (booking === undefined) {
    return <div className="mx-auto max-w-2xl px-4 py-24 text-center text-foreground/50">Loading…</div>;
  }
  if (!booking) {
    return <div className="mx-auto max-w-2xl px-4 py-24 text-center text-foreground/50">Boarding pass not found.</div>;
  }

  const flight = booking.flights[legIndex];
  const first = flight.segments[0];
  const last = flight.segments[flight.segments.length - 1];
  const passenger = booking.passengers[0];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-center text-2xl font-bold">Mobile Boarding Pass</h1>

      {booking.flights.length > 1 && (
        <div className="no-print mb-4 flex justify-center gap-2">
          {booking.flights.map((_, i) => (
            <button
              key={i}
              onClick={() => setLegIndex(i)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                legIndex === i ? "bg-brand-600 text-white" : "bg-black/5 dark:bg-white/10"
              }`}
            >
              Flight {i + 1}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-neutral-900">
        <div className="flex items-center justify-between bg-gradient-to-r from-brand-700 to-brand-600 p-5 text-white">
          <div className="flex items-center gap-2.5">
            <AirlineLogo airline={first.airline} size={34} />
            <div>
              <p className="font-semibold">{first.airline.name}</p>
              <p className="text-xs text-white/70">{cabinLabel(flight.cabin)}</p>
            </div>
          </div>
          <Plane size={22} className="opacity-70" />
        </div>

        <div className="grid grid-cols-3 gap-4 p-6">
          <div>
            <p className="text-xs text-foreground/50">Passenger</p>
            <p className="font-semibold">{passenger?.firstName} {passenger?.lastName}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/50">Flight</p>
            <p className="font-semibold">{first.flightNumber}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/50">Seat</p>
            <p className="font-semibold">{booking.seatAssignment ?? "—"}</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 pb-2">
          <div>
            <p className="text-2xl font-bold">{first.originCode}</p>
            <p className="text-xs text-foreground/50">{formatTime(first.departureTime)}</p>
          </div>
          <Plane size={16} className="rotate-90 text-foreground/30" />
          <div className="text-right">
            <p className="text-2xl font-bold">{last.destinationCode}</p>
            <p className="text-xs text-foreground/50">{formatTime(last.arrivalTime)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-dashed border-black/15 p-6 dark:border-white/15">
          <div>
            <p className="text-xs text-foreground/50">Date</p>
            <p className="text-sm font-medium">{formatDateLong(first.departureTime)}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/50">Boarding</p>
            <p className="text-sm font-medium">{boardingTime(first.departureTime)}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/50">Gate</p>
            <p className="text-sm font-medium">{gateFor(flight.id)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-black/[0.02] p-6 dark:bg-white/5">
          <div>
            <p className="text-xs text-foreground/50">Booking reference</p>
            <p className="font-mono text-lg font-bold tracking-widest">{booking.bookingReference}</p>
          </div>
          <QRCodeImage value={`SKYBOOK|${booking.bookingReference}|${flight.id}`} size={100} />
        </div>
      </div>

      <div className="no-print mt-6 flex justify-center">
        <DownloadPdfButton label="Download boarding pass (PDF)" />
      </div>
    </div>
  );
}
