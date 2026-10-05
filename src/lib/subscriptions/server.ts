import { SKYBOOK_PLAN } from "@/lib/subscriptions/plan";
import { verifyPaystackTransaction } from "@/lib/subscriptions/paystack";
import {
  commitPayment,
  findSubscriptionByProvider,
  getIntent,
  getSubscription,
  recordRenewal,
  saveSubscription,
} from "@/lib/subscriptions/store";
import type { Subscription, SubscriptionPayment } from "@/types/subscription";

const secret = process.env.PAYSTACK_SECRET_KEY;

function addMonth(date: Date) {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + 1);
  return next;
}

function providerPlanCode(value: string | { plan_code?: string } | undefined) {
  return typeof value === "string" ? value : value?.plan_code;
}

function makePayment(subscription: Subscription, reference: string, transactionId: string, paidAt: string): SubscriptionPayment {
  const now = new Date().toISOString();
  return {
    id: `paystack_${transactionId}`,
    subscriptionId: subscription.id,
    userId: subscription.userId,
    amountCents: SKYBOOK_PLAN.paystackAmountSubunit,
    currency: SKYBOOK_PLAN.paystackCurrency,
    reference,
    providerTransactionId: transactionId,
    status: "paid",
    paidAt,
    createdAt: now,
    updatedAt: now,
  };
}

export function hasActiveSubscription(subscription: Subscription | null) {
  if (!subscription || !["active", "non_renewing"].includes(subscription.status)) return false;
  return !subscription.expiresAt || new Date(subscription.expiresAt).getTime() >= Date.now();
}

export async function activateSubscription(userId: string, reference: string) {
  if (!secret) throw new Error("Paystack is not configured.");
  const intent = await getIntent(reference);
  if (!intent || intent.userId !== userId) throw new Error("Subscription payment request not found.");
  if (intent.status === "paid") return getSubscription(userId);
  if (intent.status !== "pending") throw new Error("This subscription payment is no longer pending.");

  const verified = await verifyPaystackTransaction(reference, secret);
  const verifiedPlan = providerPlanCode(verified.plan);
  if (
    verified.status !== "success" ||
    verified.reference !== intent.reference ||
    verified.amount !== intent.amountCents ||
    verified.currency !== intent.currency ||
    verified.metadata?.purpose !== "skybook_subscription" ||
    verified.metadata?.userId !== intent.userId ||
    (verifiedPlan && SKYBOOK_PLAN.paystackPlanCode && verifiedPlan !== SKYBOOK_PLAN.paystackPlanCode)
  ) {
    throw new Error("Verified Paystack details do not match this SkyBook subscription.");
  }

  const paidAt = new Date(verified.paid_at ?? Date.now());
  const expiresAt = addMonth(paidAt).toISOString();
  const previous = await getSubscription(userId);
  const now = new Date().toISOString();
  const subscription: Subscription = {
    id: previous?.id ?? `sub_${crypto.randomUUID()}`,
    userId,
    email: intent.email,
    planId: SKYBOOK_PLAN.id,
    status: "active",
    startedAt: previous?.startedAt ?? paidAt.toISOString(),
    nextBillingAt: expiresAt,
    expiresAt,
    paystackCustomerCode: verified.customer?.customer_code ?? previous?.paystackCustomerCode ?? null,
    paystackSubscriptionCode: verified.subscription_code ?? previous?.paystackSubscriptionCode ?? null,
    paystackEmailToken: verified.email_token ?? previous?.paystackEmailToken ?? null,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };
  const payment = makePayment(subscription, reference, String(verified.id ?? reference), paidAt.toISOString());
  await commitPayment({ intent, subscription, payment });
  return getSubscription(userId);
}

export async function processRenewal(reference: string) {
  if (!secret) throw new Error("Paystack is not configured.");
  const verified = await verifyPaystackTransaction(reference, secret);
  if (
    verified.status !== "success" ||
    verified.reference !== reference ||
    verified.amount !== SKYBOOK_PLAN.paystackAmountSubunit ||
    verified.currency !== SKYBOOK_PLAN.paystackCurrency
  ) {
    throw new Error("Paystack renewal verification failed.");
  }
  const subscription = await findSubscriptionByProvider({
    email: verified.customer?.email,
    customerCode: verified.customer?.customer_code,
    subscriptionCode: verified.subscription_code,
  });
  if (!subscription) return false;
  const verifiedPlan = providerPlanCode(verified.plan);
  if (verifiedPlan && SKYBOOK_PLAN.paystackPlanCode && verifiedPlan !== SKYBOOK_PLAN.paystackPlanCode) {
    throw new Error("Paystack renewal plan does not match SkyBook Unlimited.");
  }
  const paidAt = new Date(verified.paid_at ?? Date.now());
  const expiresAt = addMonth(paidAt).toISOString();
  const updated: Subscription = {
    ...subscription,
    status: "active",
    nextBillingAt: expiresAt,
    expiresAt,
    updatedAt: new Date().toISOString(),
  };
  return recordRenewal(updated, makePayment(updated, reference, String(verified.id ?? reference), paidAt.toISOString()));
}

export async function updateSubscriptionFromPaystack(input: {
  email?: string;
  customerCode?: string;
  subscriptionCode?: string;
  emailToken?: string;
  nextBillingAt?: string;
  status: Subscription["status"];
}) {
  const subscription = await findSubscriptionByProvider(input);
  if (!subscription) return false;
  await saveSubscription({
    ...subscription,
    status: input.status,
    paystackCustomerCode: input.customerCode ?? subscription.paystackCustomerCode,
    paystackSubscriptionCode: input.subscriptionCode ?? subscription.paystackSubscriptionCode,
    paystackEmailToken: input.emailToken ?? subscription.paystackEmailToken,
    nextBillingAt: input.nextBillingAt ?? subscription.nextBillingAt,
    updatedAt: new Date().toISOString(),
  });
  return true;
}
