import { NextResponse } from "next/server";
import { verifySubscriber } from "@/lib/subscriptions/auth";
import { SKYBOOK_PLAN } from "@/lib/subscriptions/plan";
import { hasActiveSubscription } from "@/lib/subscriptions/server";
import { getSubscription, listPayments } from "@/lib/subscriptions/store";

export async function GET(request: Request) {
  const caller = await verifySubscriber(request);
  if (!caller) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const subscription = await getSubscription(caller.uid);
  return NextResponse.json({
    subscription,
    payments: await listPayments(caller.uid),
    plan: { ...SKYBOOK_PLAN, paystackPlanCode: undefined },
    active: caller.role === "admin" || hasActiveSubscription(subscription),
    administrator: caller.role === "admin",
  });
}
