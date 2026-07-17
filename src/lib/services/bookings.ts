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
 * Exact-match lookup by booking reference AND verification token, for the
 * public QR verification page. Both must match — a reference alone (e.g.
 * guessed, or read off a boarding pass) is not sufficient. Never returns a
 * list — only the single matching booking (or null) — so no other booking
 * is ever exposed to the caller.
 */
export async function getBookingByReferenceAndToken(reference: string, token: string): Promise<Booking | null> {
  const ref = reference.trim().toUpperCase();
  const tok = token.trim();
  if (!ref || !tok) return null;
  const all = await getAllBookings();
  return all.find((b) => b.bookingReference.toUpperCase() === ref && b.verificationToken === tok) ?? null;
}
