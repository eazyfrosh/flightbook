const COMPLIMENTARY_ACCESS_EMAILS = new Set([
  "eazysample@gmail.com",
]);

export function hasComplimentaryAccess(email: string | null | undefined) {
  return COMPLIMENTARY_ACCESS_EMAILS.has(email?.trim().toLowerCase() ?? "");
}
