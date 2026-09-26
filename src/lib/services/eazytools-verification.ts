import type { Booking } from "@/types";

const DEFAULT_EAZYTOOLS_ORIGIN = "https://makeketplace.vercel.app";

export async function getEazyToolsVerificationBooking(
  reference: string,
  token: string,
): Promise<Booking | null> {
  if (!reference.trim() || !token.trim()) return null;
  const configured = process.env.NEXT_PUBLIC_EAZYTOOLS_ORIGIN?.trim();
  let origin = DEFAULT_EAZYTOOLS_ORIGIN;
  try {
    const parsed = new URL(configured || DEFAULT_EAZYTOOLS_ORIGIN);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") origin = parsed.origin;
  } catch {
    // Retain the production EazyTools origin.
  }

  const url = new URL("/api/airline/verification", origin);
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
