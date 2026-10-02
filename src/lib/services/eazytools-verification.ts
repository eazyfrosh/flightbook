import type { Booking, BookingStatusSummary } from "@/types";

const DEFAULT_EAZYTOOLS_ORIGIN = "https://makeketplace.vercel.app";

function getEazyToolsOrigin() {
  const configured = process.env.NEXT_PUBLIC_EAZYTOOLS_ORIGIN?.trim();
  try {
    const parsed = new URL(configured || DEFAULT_EAZYTOOLS_ORIGIN);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") return parsed.origin;
  } catch {
    // Retain the production EazyTools origin.
  }
  return DEFAULT_EAZYTOOLS_ORIGIN;
}

export async function getEazyToolsVerificationBooking(
  reference: string,
  token: string,
): Promise<Booking | null> {
  if (!reference.trim() || !token.trim()) return null;
  const url = new URL("/api/airline/verification", getEazyToolsOrigin());
  url.searchParams.set("reference", reference.trim().toUpperCase());
  url.searchParams.set("token", token.trim());
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const data = (await response.json()) as { booking?: Booking };
    return data.booking ?? null;
  } catch {
    return null;
  }
}

export async function getEazyToolsBookingStatus(
  reference: string,
): Promise<BookingStatusSummary | null> {
  const ref = reference.trim().toUpperCase();
  if (!/^[A-Z0-9-]{4,32}$/.test(ref)) return null;
  const url = new URL("/api/airline/bookings/status", getEazyToolsOrigin());
  url.searchParams.set("reference", ref);
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const data = (await response.json()) as { booking?: BookingStatusSummary };
    return data.booking ?? null;
  } catch {
    return null;
  }
}
