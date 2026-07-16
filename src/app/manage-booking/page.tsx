"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock, Mail, Search, SearchX, Ticket } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { AirlineLogo } from "@/components/ui/airline-logo";
import { QRCodeImage } from "@/components/booking/qr-code";
import { DownloadPdfButton } from "@/components/booking/download-pdf-button";
import { PrintableItinerary } from "@/components/booking/printable-itinerary";
import { EmptyState } from "@/components/ui/empty-state";
import { findBookingByReferenceAndName, cancelBooking } from "@/lib/services/bookings";
import { extrasLineItems } from "@/lib/data/extras-pricing";
import { startRebooking } from "@/lib/booking/rebooking";
import { cabinLabel, formatCurrency, formatDateLong, formatTime } from "@/lib/utils";
import type { Booking } from "@/types";

export default function ManageBookingPage() {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [lastName, setLastName] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const found = await findBookingByReferenceAndName(reference, lastName);
    setBooking(found);
    setSearched(true);
    setLoading(false);
    if (!found) toast.error("No booking found for that reference and last name");
  }

  async function handleCancel() {
    if (!booking) return;
    await cancelBooking(booking);
    setBooking({ ...booking, status: "cancelled" });
    toast.success("Booking cancelled");
  }

  function handleRebook() {
    if (!booking) return;
    router.push(startRebooking(booking));
  }

  const extraLineItems = booking ? extrasLineItems(booking.extras) : [];
  const isUpcoming =
    booking && booking.status === "confirmed" && new Date(booking.flights[0].segments[0].departureTime).getTime() >= Date.now();

  return (
    <>
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8 print:hidden">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Manage your booking</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Enter your booking reference and last name to view, cancel, or rebook a trip — no sign-in required.
        </p>
      </div>

      <form onSubmit={handleLookup} className="mb-8 space-y-4 rounded-2xl border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
        <div>
          <Label>Booking reference</Label>
          <Input
            value={reference}
            onChange={(e) => setReference(e.target.value.toUpperCase())}
            placeholder="E4VQVN"
            className="uppercase tracking-widest"
            maxLength={6}
          />
        </div>
        <div>
          <Label>Passenger last name</Label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          <Search size={16} /> {loading ? "Searching…" : "Find my booking"}
        </Button>
      </form>

      {searched && !booking && (
        <EmptyState
          icon={<SearchX size={22} />}
          title="We couldn't find that booking"
          description="Double-check your booking reference and last name, then try again."
        />
      )}

      {booking && (
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-5 p-6 sm:flex-row sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-foreground/50">Booking reference</p>
                <p className="text-2xl font-bold tracking-widest text-brand-700 dark:text-brand-400">
                  {booking.bookingReference}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge tone={booking.status === "confirmed" ? "green" : booking.status === "cancelled" ? "red" : "neutral"}>
                    {booking.status}
                  </Badge>
                  {booking.rebookedAt && <Badge tone="gold">Rebooked</Badge>}
                </div>
              </div>
              <QRCodeImage value={`SKYBOOK|${booking.bookingReference}|${booking.id}`} size={110} />
            </CardContent>
          </Card>

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
              <h3 className="mb-3 font-semibold">Passenger details</h3>
              <ul className="space-y-1 text-sm text-foreground/70">
                {booking.passengers.map((p) => (
                  <li key={p.id}>{p.firstName} {p.lastName} <span className="text-foreground/40">· {p.type}</span></li>
                ))}
              </ul>
              {booking.seatAssignment && (
                <p className="mt-3 text-sm text-foreground/60">Seat number: <strong>{booking.seatAssignment}</strong></p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-semibold">Extras</h3>
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
            <DownloadPdfButton label="Download PDF itinerary" />
            <Link href={`/boarding-pass/${booking.id}`}>
              <Button variant="secondary">
                <Ticket size={16} /> View boarding pass
              </Button>
            </Link>
            <Link href={`/booking/confirmation/${booking.id}/email-preview`}>
              <Button variant="outline">
                <Mail size={16} /> Preview email
              </Button>
            </Link>
            {isUpcoming && (
              <>
                <Button variant="outline" onClick={handleRebook}>
                  <CalendarClock size={16} /> Rebook flight
                </Button>
                <Button variant="danger" onClick={handleCancel}>
                  Cancel booking
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    {booking && <PrintableItinerary booking={booking} />}
    </>
  );
}
