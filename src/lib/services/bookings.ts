import { getAll, getOne, queryByField, remove, upsert } from "@/lib/services/store";
import { generateVerificationToken } from "@/lib/utils";
import type { Booking } from "@/types";

const COLLECTION = "bookings";

export function createBooking(booking: Booking) {
  return upsert(COLLECTION, booking);
}

/**
 * Bookings created before verificationToken existed were saved without one.
 * Backfill and persist a token the first time such a booking is read, so
 * QR codes/links generated from it are valid from then on instead of
 * silently embedding a missing token that can never match on verification.
 */
async function withVerificationToken(booking: Booking): Promise<Booking> {
  if (booking.verificationToken) return booking;
  const patched: Booking = { ...booking, verificationToken: generateVerificationToken() };
  await upsert(COLLECTION, patched);
  return patched;
}

export async function getBooking(id: string): Promise<Booking | null> {
  const booking = await getOne<Booking>(COLLECTION, id);
  return booking ? withVerificationToken(booking) : null;
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const items = await queryByField<Booking>(COLLECTION, "userId", userId);
  return Promise.all(items.map(withVerificationToken));
}

export async function getAllBookings(): Promise<Booking[]> {
  const items = await getAll<Booking>(COLLECTION);
  return Promise.all(items.map(withVerificationToken));
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
