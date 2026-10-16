import { NextResponse } from "next/server";
import { verifySubscriber } from "@/lib/subscriptions/auth";
import { itineraryEmailSubject, renderItineraryEmail } from "@/lib/email/itinerary-email";
import { consumeItineraryEmailAllowance } from "@/lib/email/rate-limit";
import type { Booking } from "@/types";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validBooking(value: unknown): value is Booking {
  if (!value || typeof value !== "object") return false;
  const booking = value as Partial<Booking>;
  return Boolean(
    typeof booking.id === "string" && booking.id.length <= 100 &&
    typeof booking.userId === "string" && booking.userId.length <= 128 &&
    typeof booking.bookingReference === "string" && /^[A-Z0-9-]{4,32}$/i.test(booking.bookingReference) &&
    typeof booking.totalPrice === "number" && Number.isFinite(booking.totalPrice) &&
    typeof booking.currency === "string" && /^[A-Z]{3}$/i.test(booking.currency) &&
    Array.isArray(booking.passengers) && booking.passengers.length > 0 && booking.passengers.length <= 12 &&
    Array.isArray(booking.flights) && booking.flights.length > 0 && booking.flights.length <= 8 &&
    booking.flights.every((flight) => Array.isArray(flight?.segments) && flight.segments.length > 0 && flight.segments.length <= 6)
  );
}

export async function POST(request: Request) {
  const caller = await verifySubscriber(request);
  if (!caller) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SKYBOOK_EMAIL_FROM;
  if (!apiKey || !from) {
    return NextResponse.json({ error: "Email delivery is not configured yet." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const recipient = typeof body?.recipient === "string" ? body.recipient.trim().toLowerCase() : "";
  const booking = body?.booking;
  if (!emailPattern.test(recipient) || recipient.length > 254) {
    return NextResponse.json({ error: "Enter a valid recipient email address." }, { status: 400 });
  }
  if (!validBooking(booking)) {
    return NextResponse.json({ error: "The itinerary details are incomplete." }, { status: 400 });
  }
  if (caller.role !== "admin" && booking.userId !== caller.uid) {
    return NextResponse.json({ error: "You do not have access to send this itinerary." }, { status: 403 });
  }

  const allowance = await consumeItineraryEmailAllowance(caller.uid);
  if (!allowance.allowed) {
    return NextResponse.json(
      { error: "Too many emails were sent. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(allowance.retryAfterSeconds) } },
    );
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || new URL(request.url).origin;
  const content = renderItineraryEmail(booking, origin);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [recipient],
      reply_to: process.env.SKYBOOK_EMAIL_REPLY_TO || undefined,
      subject: itineraryEmailSubject(booking),
      html: content.html,
      text: content.text,
      tags: [{ name: "booking_reference", value: booking.bookingReference }],
    }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("[email] Resend rejected itinerary email", { status: response.status, message: payload?.message ?? "unknown" });
    return NextResponse.json({ error: payload?.message ?? "The confirmation email could not be sent." }, { status: 502 });
  }
  return NextResponse.json({ sent: true, id: payload?.id ?? null });
}
