import { Suspense } from "react";
import type { Metadata } from "next";
import { PricingClient } from "@/components/subscriptions/pricing-client";

export const metadata: Metadata = {
  title: "SkyBook Unlimited — $15 Monthly",
  description: "Get unlimited SkyBook access for $15 USD per month with secure recurring payments through Paystack.",
};

export default function PricingPage() {
  return <Suspense fallback={<div className="min-h-[60vh] bg-[#071a36]" />}><PricingClient /></Suspense>;
}
