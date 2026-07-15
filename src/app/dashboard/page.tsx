"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlaneTakeoff, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { getUserBookings, cancelBooking } from "@/lib/services/bookings";
import { BookingCard } from "@/components/dashboard/booking-card";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/types";

type Tab = "upcoming" | "past" | "cancelled";

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [fetching, setFetching] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    const list = await getUserBookings(user.uid);
    setBookings(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setFetching(false);
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login?next=/dashboard");
      return;
    }
    load();
  }, [loading, user, router, load]);

  if (loading || !user) return null;

  const now = Date.now();
  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.flights[0].segments[0].departureTime).getTime() >= now
  );
  const past = bookings.filter(
    (b) => b.status !== "cancelled" && new Date(b.flights[0].segments[0].departureTime).getTime() < now
  );
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  const shown = tab === "upcoming" ? upcoming : tab === "past" ? past : cancelled;

  async function handleCancel(booking: Booking) {
    await cancelBooking(booking);
    toast.success(`Booking ${booking.bookingReference} cancelled`);
    load();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {profile?.displayName || user.displayName || "traveler"}</h1>
          <p className="mt-1 text-sm text-foreground/60">Manage your bookings and profile</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/profile">
            <Button variant="outline"><User size={15} /> Profile</Button>
          </Link>
          <Link href="/search">
            <Button><PlaneTakeoff size={15} /> Book a flight</Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-black/8 dark:border-white/10">
        {([
          { key: "upcoming", label: `Upcoming (${upcoming.length})` },
          { key: "past", label: `Past (${past.length})` },
          { key: "cancelled", label: `Cancelled (${cancelled.length})` },
        ] as { key: Tab; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              tab === t.key
                ? "border-brand-600 text-brand-600 dark:text-brand-400"
                : "border-transparent text-foreground/50 hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {fetching ? (
        <p className="py-16 text-center text-foreground/40">Loading bookings…</p>
      ) : shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 p-16 text-center dark:border-white/20">
          <p className="text-foreground/50">No {tab} trips yet.</p>
          <Link href="/search">
            <Button className="mt-4">Search flights</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onCancel={tab === "upcoming" ? handleCancel : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
