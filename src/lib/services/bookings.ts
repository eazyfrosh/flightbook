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
