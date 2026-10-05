import { get, list, put } from "@vercel/blob";
import type { Subscription, SubscriptionPayment, SubscriptionPaymentIntent } from "@/types/subscription";

const ROOT = "skybook-subscriptions";
const SUBSCRIPTIONS = `${ROOT}/subscriptions`;
const PAYMENTS = `${ROOT}/payments`;
const INTENTS = `${ROOT}/intents`;
const EVENTS = `${ROOT}/paystack-events`;

// A connected Vercel Blob store exposes BLOB_READ_WRITE_TOKEN. Newer Vercel
// runtimes can also authenticate with OIDC when BLOB_STORE_ID is present.
export const isSubscriptionBackendDurable = Boolean(
  process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID,
);

declare global {
  var __skybookSubscriptions:
    | {
        subscriptions: Map<string, Subscription>;
        payments: Map<string, SubscriptionPayment>;
        intents: Map<string, SubscriptionPaymentIntent>;
        events: Set<string>;
      }
    | undefined;
}

function memoryStore() {
  if (!global.__skybookSubscriptions) {
    global.__skybookSubscriptions = {
      subscriptions: new Map(), payments: new Map(), intents: new Map(), events: new Set(),
    };
  }
  return global.__skybookSubscriptions;
}

function key(value: string) { return encodeURIComponent(value); }
function subscriptionPath(userId: string) { return `${SUBSCRIPTIONS}/${key(userId)}.json`; }
function paymentPath(id: string) { return `${PAYMENTS}/${key(id)}.json`; }
function intentPath(reference: string) { return `${INTENTS}/${key(reference)}.json`; }
function eventPath(id: string) { return `${EVENTS}/${key(id)}.json`; }

async function readJson<T>(pathname: string): Promise<T | null> {
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  return new Response(result.stream).json() as Promise<T>;
}

async function writeJson(pathname: string, value: unknown, allowOverwrite = true) {
  return put(pathname, JSON.stringify(value), {
    access: "private", addRandomSuffix: false, allowOverwrite,
    cacheControlMaxAge: 60, contentType: "application/json",
  });
}

async function readAll<T>(prefix: string): Promise<T[]> {
  const values: T[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: `${prefix}/`, cursor, limit: 1000 });
    const records = await Promise.all(page.blobs.map((blob) => readJson<T>(blob.pathname)));
    for (const record of records) {
      if (record !== null) values.push(record as T);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return values;
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  if (isSubscriptionBackendDurable) return readJson<Subscription>(subscriptionPath(userId));
  return memoryStore().subscriptions.get(userId) ?? null;
}

export async function saveSubscription(subscription: Subscription) {
  if (isSubscriptionBackendDurable) {
    await writeJson(subscriptionPath(subscription.userId), subscription);
    return;
  }
  memoryStore().subscriptions.set(subscription.userId, subscription);
}

export async function saveIntent(intent: SubscriptionPaymentIntent) {
  if (isSubscriptionBackendDurable) {
    await writeJson(intentPath(intent.reference), intent, false);
    return;
  }
  if (memoryStore().intents.has(intent.reference)) throw new Error("Payment reference already exists.");
  memoryStore().intents.set(intent.reference, intent);
}

export async function getIntent(reference: string): Promise<SubscriptionPaymentIntent | null> {
  if (isSubscriptionBackendDurable) return readJson<SubscriptionPaymentIntent>(intentPath(reference));
  return memoryStore().intents.get(reference) ?? null;
}

export async function markIntentFailed(reference: string) {
  const intent = await getIntent(reference);
  if (!intent || intent.status !== "pending") return;
  const updated = { ...intent, status: "failed" as const, updatedAt: new Date().toISOString() };
  if (isSubscriptionBackendDurable) await writeJson(intentPath(reference), updated);
  else memoryStore().intents.set(reference, updated);
}

export async function commitPayment(input: {
  intent: SubscriptionPaymentIntent; subscription: Subscription; payment: SubscriptionPayment;
}) {
  if (isSubscriptionBackendDurable) {
    const [currentIntent, existingPayment] = await Promise.all([
      getIntent(input.intent.reference), readJson<SubscriptionPayment>(paymentPath(input.payment.id)),
    ]);
    if (!currentIntent) throw new Error("Subscription payment request not found.");
    if (existingPayment || currentIntent.status === "paid") return false;
    if (currentIntent.status !== "pending") throw new Error("This payment is no longer pending.");
    const paidIntent: SubscriptionPaymentIntent = {
      ...currentIntent, status: "paid", providerTransactionId: input.payment.providerTransactionId,
      updatedAt: input.payment.updatedAt,
    };
    await Promise.all([
      writeJson(subscriptionPath(input.subscription.userId), input.subscription),
      writeJson(paymentPath(input.payment.id), input.payment, false),
      writeJson(intentPath(input.intent.reference), paidIntent),
    ]);
    return true;
  }
  const store = memoryStore();
  if (store.payments.has(input.payment.id) || store.intents.get(input.intent.reference)?.status === "paid") return false;
  store.subscriptions.set(input.subscription.userId, input.subscription);
  store.payments.set(input.payment.id, input.payment);
  store.intents.set(input.intent.reference, {
    ...input.intent, status: "paid", providerTransactionId: input.payment.providerTransactionId,
    updatedAt: input.payment.updatedAt,
  });
  return true;
}

export async function recordRenewal(subscription: Subscription, payment: SubscriptionPayment) {
  if (isSubscriptionBackendDurable) {
    if (await readJson<SubscriptionPayment>(paymentPath(payment.id))) return false;
    await Promise.all([
      writeJson(subscriptionPath(subscription.userId), subscription),
      writeJson(paymentPath(payment.id), payment, false),
    ]);
    return true;
  }
  const store = memoryStore();
  if (store.payments.has(payment.id)) return false;
  store.subscriptions.set(subscription.userId, subscription);
  store.payments.set(payment.id, payment);
  return true;
}

export async function listPayments(userId: string): Promise<SubscriptionPayment[]> {
  const payments = isSubscriptionBackendDurable
    ? await readAll<SubscriptionPayment>(PAYMENTS) : [...memoryStore().payments.values()];
  return payments.filter((payment) => payment.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markPaymentRefunded(reference: string) {
  const payments = isSubscriptionBackendDurable
    ? await readAll<SubscriptionPayment>(PAYMENTS) : [...memoryStore().payments.values()];
  const payment = payments.find((item) => item.reference === reference);
  if (!payment) return false;
  const now = new Date().toISOString();
  const refunded = { ...payment, status: "refunded" as const, updatedAt: now };
  const subscription = await getSubscription(payment.userId);
  const cancelled = subscription
    ? { ...subscription, status: "cancelled" as const, nextBillingAt: null, updatedAt: now } : null;
  if (isSubscriptionBackendDurable) {
    await Promise.all([
      writeJson(paymentPath(payment.id), refunded),
      cancelled ? writeJson(subscriptionPath(cancelled.userId), cancelled) : Promise.resolve(),
    ]);
  } else {
    memoryStore().payments.set(payment.id, refunded);
    if (cancelled) memoryStore().subscriptions.set(cancelled.userId, cancelled);
  }
  return true;
}

export async function findSubscriptionByProvider(input: { email?: string; customerCode?: string; subscriptionCode?: string }) {
  const subscriptions = isSubscriptionBackendDurable
    ? await readAll<Subscription>(SUBSCRIPTIONS) : [...memoryStore().subscriptions.values()];
  return subscriptions.find((subscription) =>
    Boolean(input.subscriptionCode && subscription.paystackSubscriptionCode === input.subscriptionCode) ||
    Boolean(input.customerCode && subscription.paystackCustomerCode === input.customerCode) ||
    Boolean(input.email && subscription.email.toLowerCase() === input.email.toLowerCase())
  ) ?? null;
}

export async function hasEvent(id: string) {
  if (isSubscriptionBackendDurable) return Boolean(await readJson(eventPath(id)));
  return memoryStore().events.has(id);
}

export async function recordEvent(id: string, name: string, reference: string | null) {
  if (isSubscriptionBackendDurable) {
    await writeJson(eventPath(id), { id, name, reference, processedAt: new Date().toISOString() });
    return;
  }
  memoryStore().events.add(id);
}
