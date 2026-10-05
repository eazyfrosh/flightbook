import { NextResponse } from "next/server";
import { verifySubscriber } from "@/lib/subscriptions/auth";
import { activateSubscription } from "@/lib/subscriptions/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const caller = await verifySubscriber(request);
  if (!caller) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const reference = String(body?.reference ?? "");
  if (!reference) return NextResponse.json({ error: "Payment reference is missing." }, { status: 400 });
  try {
    return NextResponse.json({ subscription: await activateSubscription(caller.uid, reference) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Subscription activation failed." }, { status: 402 });
  }
}
