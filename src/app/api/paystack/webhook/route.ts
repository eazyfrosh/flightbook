import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/subscriptions/paystack";
import { activateSubscription, processRenewal, updateSubscriptionFromPaystack } from "@/lib/subscriptions/server";
import { getIntent, hasEvent, markIntentFailed, markPaymentRefunded, recordEvent } from "@/lib/subscriptions/store";

export const runtime = "nodejs";

interface PaystackEvent {
  event?: string;
  data?: {
    reference?: string;
    status?: string;
    paid?: boolean;
    metadata?: Record<string, unknown>;
    customer?: { email?: string; customer_code?: string };
    subscription_code?: string;
    email_token?: string;
    next_payment_date?: string;
    transaction?: { reference?: string };
    subscription?: {
      subscription_code?: string;
      email_token?: string;
      next_payment_date?: string;
      customer?: { email?: string; customer_code?: string };
    };
  };
}

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Paystack webhook is not configured." }, { status: 503 });
  const rawBody = await request.text();
  if (!verifyPaystackSignature(rawBody, request.headers.get("x-paystack-signature") ?? "", secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }
  let payload: PaystackEvent;
  try { payload = JSON.parse(rawBody) as PaystackEvent; }
  catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const name = payload.event ?? "unknown";
  const data = payload.data ?? {};
  const reference = data.reference ?? data.transaction?.reference ?? null;
  const eventId = crypto.createHash("sha256").update(rawBody).digest("hex");
  if (await hasEvent(eventId)) return NextResponse.json({ received: true, duplicate: true });

  try {
    if (name === "charge.success" && reference) {
      const intent = await getIntent(reference);
      if (intent) await activateSubscription(intent.userId, reference);
      else await processRenewal(reference);
    } else if (name === "charge.failed" && reference) {
      await markIntentFailed(reference);
    } else if (["subscription.create", "subscription.disable", "subscription.not_renew", "invoice.payment_failed", "invoice.update"].includes(name)) {
      const nested = data.subscription;
      const status = ["subscription.disable", "subscription.not_renew"].includes(name)
        ? "non_renewing"
        : name === "invoice.payment_failed" ? "past_due" : "active";
      if (name !== "invoice.update" || data.paid === true || data.status === "success") {
        await updateSubscriptionFromPaystack({
          email: data.customer?.email ?? nested?.customer?.email,
          customerCode: data.customer?.customer_code ?? nested?.customer?.customer_code,
          subscriptionCode: data.subscription_code ?? nested?.subscription_code,
          emailToken: data.email_token ?? nested?.email_token,
          nextBillingAt: data.next_payment_date ?? nested?.next_payment_date,
          status,
        });
      }
    } else if (name === "refund.processed" && reference) {
      await markPaymentRefunded(reference);
    }
    await recordEvent(eventId, name, reference);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[paystack-webhook] Processing failed", { name, reference, error });
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
