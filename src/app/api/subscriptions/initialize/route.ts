import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { verifySubscriber } from "@/lib/subscriptions/auth";
import { SKYBOOK_PLAN } from "@/lib/subscriptions/plan";
import { isSubscriptionBackendDurable, markIntentFailed, saveIntent } from "@/lib/subscriptions/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const caller = await verifySubscriber(request);
  if (!caller) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!isSubscriptionBackendDurable) {
    return NextResponse.json({ error: "Subscription storage is not configured. Connect a private Vercel Blob store to this project." }, { status: 503 });
  }
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Paystack is not configured." }, { status: 503 });
  if (!SKYBOOK_PLAN.paystackPlanCode) {
    return NextResponse.json({ error: "The SkyBook Paystack monthly plan code is not configured." }, { status: 503 });
  }

  const reference = `SKY-SUB-${Date.now()}-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
  const now = new Date().toISOString();
  try {
    await saveIntent({
      id: reference,
      userId: caller.uid,
      email: caller.email,
      amountCents: SKYBOOK_PLAN.paystackAmountSubunit,
      currency: SKYBOOK_PLAN.paystackCurrency,
      reference,
      status: "pending",
      providerTransactionId: null,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error("[subscriptions] Unable to save payment intent", error);
    return NextResponse.json({ error: "Subscription storage could not be reached. Check the Vercel Blob connection." }, { status: 503 });
  }

  try {
    const body = await request.json().catch(() => null);
    const requestedNext = typeof body?.next === "string" ? body.next : "/dashboard";
    const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";
    const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || new URL(request.url).origin;
    const callback = new URL(`${origin}/subscription/callback`);
    callback.searchParams.set("next", next);
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: caller.email,
        amount: SKYBOOK_PLAN.paystackAmountSubunit,
        currency: SKYBOOK_PLAN.paystackCurrency,
        plan: SKYBOOK_PLAN.paystackPlanCode,
        reference,
        callback_url: callback.toString(),
        metadata: { purpose: "skybook_subscription", userId: caller.uid, planId: SKYBOOK_PLAN.id },
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.data?.authorization_url) {
      await markIntentFailed(reference);
      return NextResponse.json({ error: payload?.message ?? "Paystack could not initialize checkout." }, { status: 502 });
    }
    return NextResponse.json({ reference, authorizationUrl: payload.data.authorization_url });
  } catch (error) {
    await markIntentFailed(reference);
    console.error("[subscriptions] Paystack initialization failed", error);
    return NextResponse.json({ error: "Paystack could not initialize checkout." }, { status: 502 });
  }
}
