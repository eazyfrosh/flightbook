/**
 * Absolute URL to the public booking-verification page. Used as the QR
 * code payload so scanning it with any phone camera opens the page
 * directly, rather than encoding an app-internal string a camera app
 * wouldn't know what to do with.
 */
export function getVerificationUrl(bookingReference: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/verify/${encodeURIComponent(bookingReference)}`;
}
