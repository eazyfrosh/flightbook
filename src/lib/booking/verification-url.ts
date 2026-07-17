/**
 * Absolute URL to the public booking-verification page. Used as the QR
 * code payload so scanning it with any phone camera opens the page
 * directly, rather than encoding an app-internal string a camera app
 * wouldn't know what to do with. Includes the booking's verification
 * token so the link itself — not just the short, guessable reference —
 * authorizes access.
 */
export function getVerificationUrl(bookingReference: string, verificationToken: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const params = new URLSearchParams({ token: verificationToken });
  return `${origin}/verify/${encodeURIComponent(bookingReference)}?${params.toString()}`;
}
