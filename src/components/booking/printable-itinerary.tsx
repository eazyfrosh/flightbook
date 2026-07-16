import { QRCodeImage } from "./qr-code";
import { AirlineLogo } from "@/components/ui/airline-logo";
import { extrasLineItems } from "@/lib/data/extras-pricing";
import { cabinLabel, formatCurrency, formatDateLong, formatDuration, formatTime } from "@/lib/utils";
import type { Booking } from "@/types";

/**
 * Print-only itinerary document. Hidden on screen (`hidden print:block`) and
 * shown only when the browser's print dialog is invoked via DownloadPdfButton,
 * so "download PDF" produces a purpose-built travel document instead of a
 * screenshot of the interactive page.
 */
export function PrintableItinerary({ booking }: { booking: Booking }) {
  const extraItems = extrasLineItems(booking.extras);
  const generatedOn = formatDateLong(new Date().toISOString());

  return (
    <div className="hidden print:block print:bg-white print:text-black">
      <div className="mx-auto max-w-[190mm]">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-lg text-white">✈</span>
            <div>
              <p className="text-xl font-bold tracking-tight">SkyBook</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Travel Itinerary</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Booking Reference</p>
            <p className="text-2xl font-bold tracking-[0.25em]">{booking.bookingReference}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-lg border border-neutral-300 px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Booking Status</p>
            <p className="text-sm font-bold capitalize">
              {booking.status}
              {booking.rebookedAt && <span className="ml-2 rounded-full border border-neutral-400 px-2 py-0.5 text-[9px] uppercase tracking-wide">Rebooked</span>}
            </p>
          </div>
          <QRCodeImage value={`SKYBOOK|${booking.bookingReference}|${booking.id}`} size={76} />
        </div>

        <section className="mt-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">Passenger Information</h2>
          <div className="mt-2 divide-y divide-neutral-200 border-y border-neutral-200">
            {booking.passengers.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-semibold">{p.firstName} {p.lastName}</span>
                <span className="capitalize text-neutral-500">{p.type} · {p.nationality}</span>
              </div>
            ))}
          </div>
          {booking.seatAssignment && (
            <p className="mt-2 text-xs text-neutral-500">
              Seat assignment: <strong className="text-black">{booking.seatAssignment}</strong>
            </p>
          )}
        </section>

        <section className="mt-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">Flight Information</h2>
          <div className="mt-2 space-y-3">
            {booking.flights.map((flight, idx) => {
              const first = flight.segments[0];
              const last = flight.segments[flight.segments.length - 1];
              return (
                <div key={idx} className="rounded-lg border border-neutral-300 p-4" style={{ breakInside: "avoid" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <AirlineLogo airline={first.airline} size={30} />
                      <div>
                        <p className="text-sm font-bold">{first.airline.name}</p>
                        <p className="text-[10px] text-neutral-500">
                          {flight.segments.map((s) => s.flightNumber).join(", ")} · {first.aircraft}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-neutral-400 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                      {cabinLabel(flight.cabin)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold tabular-nums">{first.originCode}</p>
                      <p className="text-xs text-neutral-500">{formatTime(first.departureTime)}</p>
                      <p className="text-[10px] text-neutral-400">{formatDateLong(first.departureTime)}</p>
                    </div>
                    <div className="flex-1 px-4 text-center">
                      <p className="text-[10px] text-neutral-400">{formatDuration(flight.totalDurationMinutes)}</p>
                      <div className="my-1.5 border-t border-dashed border-neutral-300" />
                      <p className="text-[10px] text-neutral-400">
                        {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold tabular-nums">{last.destinationCode}</p>
                      <p className="text-xs text-neutral-500">{formatTime(last.arrivalTime)}</p>
                      <p className="text-[10px] text-neutral-400">{formatDateLong(last.arrivalTime)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">Extras &amp; Price</h2>
          <div className="mt-2 space-y-1.5 text-sm">
            {extraItems.length === 0 ? (
              <p className="text-neutral-500">No extras selected.</p>
            ) : (
              extraItems.map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span>{item.label}</span>
                  {item.price > 0 && <span>{formatCurrency(item.price, booking.currency)}</span>}
                </div>
              ))
            )}
            <div className="mt-1.5 flex justify-between border-t border-neutral-300 pt-1.5 text-neutral-600">
              <span>Ticket price</span>
              <span>{formatCurrency(booking.ticketPrice, booking.currency)}</span>
            </div>
            <div className="mt-1.5 flex justify-between border-t-2 border-black pt-1.5 text-base font-bold">
              <span>Total</span>
              <span>{formatCurrency(booking.totalPrice, booking.currency)}</span>
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-neutral-300 pt-3 text-[9px] leading-relaxed text-neutral-500">
          <p>
            Please arrive at the airport at least 2 hours before departure for international flights (3 hours for
            connecting itineraries). Carry a valid passport and any required visas or travel documents. Baggage
            allowance and fare rules are shown in your booking confirmation.
          </p>
          <p className="mt-1.5">
            SkyBook Demo — this is a portfolio project. No real flights, payments, or airline systems are involved.
            Document generated {generatedOn}.
          </p>
        </footer>
      </div>
    </div>
  );
}
