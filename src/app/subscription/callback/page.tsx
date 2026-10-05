import { Suspense } from "react";
import { SubscriptionCallback } from "@/components/subscriptions/subscription-callback";

export default function SubscriptionCallbackPage() {
  return <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-sm text-foreground/60">Loading payment confirmation…</div>}><SubscriptionCallback /></Suspense>;
}
