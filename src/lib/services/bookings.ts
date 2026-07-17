import { getAll, getOne, queryByField, remove, upsert } from "@/lib/services/store";
import type { Booking } from "@/types";

const COLLECTION = "bookings";

export function createBooking(booking: Booking) {
  return upsert(COLLECTION, booking);
}

export function getBooking(id: string) {
  return getOne<Booking>(COLLECTION, id);
}

export function getUserBookings(userId: string) {
  return queryByField<Booking>(COLLECTION, "userId", userId);
}

export function getAllBookings() {
  return getAll<Booking>(COLLECTION);
}

export function updateBooking(booking: Booking) {
  return upsert(COLLECTION, booking);
}

export function deleteBooking(id: string) {
  return remove(COLLECTION, id);
}

export function cancelBooking(booking: Booking) {
  return upsert(COLLECTION, { ...booking, status: "cancelled" as const });
}

export async function findBookingByReferenceAndName(
  reference: string,
  lastName: string
): Promise<Booking | null> {
  const ref = reference.trim().toUpperCase();
  const name = lastName.trim().toLowerCase();
  if (!ref || !name) return null;
  const all = await getAllBookings();
  return (
    all.find(
      (b) =>
        b.bookingReference.toUpperCase() === ref &&
        b.passengers.some((p) => p.lastName.trim().toLowerCase() === name)
    ) ?? null
  );
}

/**
 * Exact-match lookup by booking reference only, for the public QR
 * verification page. Never returns a list — only the single matching
 * booking (or null) — so no other booking is ever exposed to the caller.
 */
export async function getBookingByReference(reference: string): Promise<Booking | null> {
  const ref = reference.trim().toUpperCase();
  if (!ref) return null;
  const all = await getAllBookings();
  return all.find((b) => b.bookingReference.toUpperCase() === ref) ?? null;
}
