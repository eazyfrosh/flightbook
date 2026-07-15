import { getAll, remove, upsert } from "@/lib/services/store";
import type { AdminFlightListing, DiscountCode, Promotion, UserProfile } from "@/types";

export const adminFlights = {
  list: () => getAll<AdminFlightListing>("admin_flights"),
  save: (flight: AdminFlightListing) => upsert("admin_flights", flight),
  delete: (id: string) => remove("admin_flights", id),
};

export const promotions = {
  list: () => getAll<Promotion>("promotions"),
  save: (promo: Promotion) => upsert("promotions", promo),
  delete: (id: string) => remove("promotions", id),
};

export const discountCodes = {
  list: () => getAll<DiscountCode>("discount_codes"),
  save: (code: DiscountCode) => upsert("discount_codes", code),
  delete: (id: string) => remove("discount_codes", id),
};

export const adminUsers = {
  list: () => getAll<UserProfile>("users"),
  save: (profile: UserProfile) => upsert("users", profile),
};
