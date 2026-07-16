"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ticket, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAllBookings, deleteBooking, updateBooking } from "@/lib/services/bookings";
import { formatCurrency, formatDateLong } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");

  async function load() {
    const list = await getAllBookings();
    setBookings(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(booking: Booking, status: BookingStatus) {
    await updateBooking({ ...booking, status });
    toast.success(`Booking marked ${status}`);
    load();
  }

  async function handleDelete(id: string) {
    await deleteBooking(id);
    toast.success("Booking removed");
    load();
  }

  const shown = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Manage bookings</h1>
          <p className="mt-1 text-sm text-foreground/60">{bookings.length} total bookings across all users</p>
        </div>
        <div className="flex gap-1.5">
          {(["all", "confirmed", "completed", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                filter === f ? "bg-brand-600 text-white" : "bg-black/5 dark:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {shown.length === 0 ? (
          <EmptyState icon={<Ticket size={22} />} title="No bookings found" description="Try a different status filter." />
        ) : (
          shown.map((booking) => {
            const flight = booking.flights[0];
            return (
              <Card key={booking.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
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
                    <Badge tone={booking.status === "cancelled" ? "red" : booking.status === "completed" ? "neutral" : "green"}>
                      {booking.status}
                    </Badge>
                    <select
                      value={booking.status}
                      onChange={(e) => setStatus(booking, e.target.value as BookingStatus)}
                      className="rounded-lg border border-black/10 bg-transparent px-2 py-1 text-xs dark:border-white/15"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(booking.id)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
