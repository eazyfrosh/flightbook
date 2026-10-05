import type { SubscriptionPlan } from "@/types/subscription";

export const SKYBOOK_PLAN: SubscriptionPlan = {
  id: "skybook-unlimited",
  name: "SkyBook Unlimited",
  description: "Unlimited access to SkyBook flight planning, booking tools, itineraries, and future member features.",
  priceCents: 1500,
  currency: "USD",
  paystackAmountSubunit: 2_000_000,
  paystackCurrency: "NGN",
  interval: "monthly",
  paystackPlanCode: process.env.PAYSTACK_SKYBOOK_MONTHLY_PLAN_CODE ?? null,
  features: [
    "Unlimited flight searches and bookings",
    "Custom airlines, prices, dates, and times",
    "Downloadable PDF itineraries and boarding passes",
    "Flight status and booking management",
    "All future SkyBook member features",
  ],
};
