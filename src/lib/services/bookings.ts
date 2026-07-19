import { getAll, getOne, queryByField, remove, upsert } from "@/lib/services/store";
import { generateVerificationToken } from "@/lib/utils";
import type { Booking } from "@/types";

const COLLECTION = "bookings";
const LOOKUP_COLLECTION = "bookingLookup";
const VERIFICATION_COLLECTION = "bookingVerification";

function lookupId(booking: Booking) {
  return booking.bookingReference.trim().toUpperCase();
}

function verificationId(booking: Booking) {
  return `${lookupId(booking)}_${booking.verificationToken}`;
}

/**
 * The private `bookings` collection is owner/admin-only under real Firestore
 * rules. These two mirrors exist purely so the app's unauthenticated lookup
 * flows — /manage-booking (reference + last name) and the QR verification
 * page (reference + token) — can fetch a single booking by its exact
 * document ID, without ever needing list/read access to the private
 * collection. Knowing only a reference (or only a token) can never resolve
 * a document in bookingVerification; knowing neither resolves nothing in
 * either mirror. Both mirrors disallow listing, so no endpoint can ever
 * enumerate other bookings.
 */
async function syncPublicMirrors(booking: Booking): Promise<void> {
  await Promise.all([
    upsert(LOOKUP_COLLECTION, { ...booking, id: lookupId(booking) }),
    upsert(VERIFICATION_COLLECTION, { ...booking, id: verificationId(booking) }),
  ]);
}

async function saveBooking(booking: Booking): Promise<void> {
  await upsert(COLLECTION, booking);
  await syncPublicMirrors(booking);
}

export function createBooking(booking: Booking) {
  return saveBooking(booking);
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
  await saveBooking(patched);
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
  return saveBooking(booking);
}

export async function deleteBooking(id: string): Promise<void> {
  const booking = await getOne<Booking>(COLLECTION, id);
  await remove(COLLECTION, id);
  if (booking) {
    await Promise.all([
      remove(LOOKUP_COLLECTION, lookupId(booking)),
      remove(VERIFICATION_COLLECTION, verificationId(booking)),
    ]);
  }
}

export function cancelBooking(booking: Booking) {
  return saveBooking({ ...booking, status: "cancelled" as const });
}

/**
 * Public lookup by reference + last name, for the self-service
 * /manage-booking page, which explicitly requires no sign-in. Reads the
 * bookingLookup mirror directly by reference — a single document get, never
 * a scan of every booking — and still checks the last name before
 * returning anything.
 */
export async function findBookingByReferenceAndName(
  reference: string,
  lastName: string
): Promise<Booking | null> {
  const ref = reference.trim().toUpperCase();
  const name = lastName.trim().toLowerCase();
  if (!ref || !name) return null;
  const booking = await getOne<Booking>(LOOKUP_COLLECTION, ref);
  if (!booking) return null;
  return booking.passengers.some((p) => p.lastName.trim().toLowerCase() === name) ? booking : null;
}

/**
 * Exact-match lookup by booking reference AND verification token, for the
 * public QR verification page. Reads the bookingVerification mirror
 * directly by the compound reference_token key, so a reference alone (e.g.
 * guessed, or read off a boarding pass) can never resolve a document, and
 * there is no way to list this collection — no other booking is ever
 * exposed to the caller.
 */
export async function getBookingByReferenceAndToken(reference: string, token: string): Promise<Booking | null> {
  const ref = reference.trim().toUpperCase();
  const tok = token.trim();
  if (!ref || !tok) return null;
  return getOne<Booking>(VERIFICATION_COLLECTION, `${ref}_${tok}`);
}
