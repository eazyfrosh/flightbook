"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Search, ShieldCheck, Ticket, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { getAllBookings, deleteBooking, updateBooking } from "@/lib/services/bookings";
import { BOOKING_STATUSES, bookingStatusLabel, bookingStatusTone } from "@/lib/data/booking-status";
import { formatCurrency, formatDateLong } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";

interface OperationalDraft {
  seatAssignment: string;
  gate: string;
  terminal: string;
  boardingTime: string;
}

function draftFor(booking: Booking): OperationalDraft {
  return {
    seatAssignment: booking.seatAssignment ?? "",
    gate: booking.gate ?? "",
    terminal: booking.terminal ?? "",
    boardingTime: booking.boardingTime ?? "",
  };
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, OperationalDraft>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    const list = await getAllBookings();
    setBookings(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(booking: Booking, status: BookingStatus) {
    await updateBooking({ ...booking, status });
    toast.success(`Booking marked ${bookingStatusLabel(status)}`);
    load();
  }

  async function handleDelete(id: string) {
    await deleteBooking(id);
    toast.success("Booking removed");
    load();
  }

  function toggleExpanded(booking: Booking) {
    setExpanded((current) => (current === booking.id ? null : booking.id));
    setDrafts((current) => (current[booking.id] ? current : { ...current, [booking.id]: draftFor(booking) }));
  }

  function updateDraft(id: string, field: keyof OperationalDraft, value: string) {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], [field]: value } }));
  }

  async function saveOperational(booking: Booking) {
    const draft = drafts[booking.id] ?? draftFor(booking);
    setSaving(booking.id);
    await updateBooking({
      ...booking,
      seatAssignment: draft.seatAssignment.trim() || null,
      gate: draft.gate.trim() || undefined,
      terminal: draft.terminal.trim() || undefined,
      boardingTime: draft.boardingTime.trim() || undefined,
    });
    toast.success("Booking details updated");
    setSaving(null);
    load();
  }

  const filteredByStatus = useMemo(
    () => (filter === "all" ? bookings : bookings.filter((b) => b.status === filter)),
    [bookings, filter]
  );

  const shown = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return filteredByStatus;
    return filteredByStatus.filter((b) => b.bookingReference.toUpperCase().includes(q));
  }, [filteredByStatus, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Manage bookings</h1>
          <p className="mt-1 text-sm text-foreground/60">{bookings.length} total bookings across all users</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", ...BOOKING_STATUSES] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                filter === f ? "bg-brand-600 text-white" : "bg-black/5 dark:bg-white/10"
              }`}
            >
              {f === "all" ? "All" : bookingStatusLabel(f)}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-xs">
        <Label>Search by booking reference</Label>
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder="E4VQVN"
            className="pl-9 uppercase tracking-widest"
            maxLength={6}
          />
        </div>
      </div>

      <div className="space-y-3">
        {shown.length === 0 ? (
          <EmptyState icon={<Ticket size={22} />} title="No bookings found" description="Try a different status filter or search term." />
        ) : (
          shown.map((booking) => {
            const flight = booking.flights[0];
            const draft = drafts[booking.id] ?? draftFor(booking);
            const isOpen = expanded === booking.id;
            return (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-semibold">{booking.bookingReference}</p>
                      <p className="text-xs text-foreground/50">
                        {flight?.segments[0].originCode} → {flight?.segments[flight.segments.length - 1].destinationCode} ·{" "}
                        {formatDateLong(flight?.segments[0].departureTime ?? booking.createdAt)} ·{" "}
                        {formatCurrency(booking.totalPrice, booking.currency)}
                      </p>
                      <p className="text-xs text-foreground/40">User: {booking.userId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={bookingStatusTone(booking.status)}>{bookingStatusLabel(booking.status)}</Badge>
                      <select
                        value={booking.status}
                        onChange={(e) => setStatus(booking, e.target.value as BookingStatus)}
                        className="rounded-lg border border-black/10 bg-transparent px-2 py-1 text-xs dark:border-white/15"
                      >
                        {BOOKING_STATUSES.map((s) => (
                          <option key={s} value={s}>{bookingStatusLabel(s)}</option>
                        ))}
                      </select>
                      <Link href={`/verify/${booking.bookingReference}?token=${booking.verificationToken}`} target="_blank">
                        <Button size="sm" variant="outline">
                          <ShieldCheck size={13} /> Verify
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" onClick={() => toggleExpanded(booking)}>
                        {isOpen ? "Close" : "Edit details"}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(booking.id)}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-black/8 pt-4 dark:border-white/10 sm:grid-cols-4">
                      <div>
                        <Label>Seat number</Label>
                        <Input
                          value={draft.seatAssignment}
                          onChange={(e) => updateDraft(booking.id, "seatAssignment", e.target.value.toUpperCase())}
                          placeholder="14A"
                        />
                      </div>
                      <div>
                        <Label>Gate</Label>
                        <Input
                          value={draft.gate}
                          onChange={(e) => updateDraft(booking.id, "gate", e.target.value.toUpperCase())}
                          placeholder="B12"
                        />
                      </div>
                      <div>
                        <Label>Terminal</Label>
                        <Input
                          value={draft.terminal}
                          onChange={(e) => updateDraft(booking.id, "terminal", e.target.value)}
                          placeholder="2"
                        />
                      </div>
                      <div>
                        <Label>Boarding time</Label>
                        <Input
                          type="time"
                          value={draft.boardingTime}
                          onChange={(e) => updateDraft(booking.id, "boardingTime", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-4">
                        <Button size="sm" disabled={saving === booking.id} onClick={() => saveOperational(booking)}>
                          {saving === booking.id ? "Saving…" : "Save changes"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
