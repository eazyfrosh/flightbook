import { adminDb, isAdminFirebaseConfigured } from "@/lib/firebase/admin";
import type { Subscription, SubscriptionPayment, SubscriptionPaymentIntent } from "@/types/subscription";

const SUBSCRIPTIONS = "skybookSubscriptions";
const PAYMENTS = "skybookSubscriptionPayments";
const INTENTS = "skybookSubscriptionIntents";
const EVENTS = "skybookPaystackEvents";

export const isSubscriptionBackendDurable = isAdminFirebaseConfigured;

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
      subscriptions: new Map(),
      payments: new Map(),
      intents: new Map(),
      events: new Set(),
    };
  }
  return global.__skybookSubscriptions;
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  if (adminDb) {
    const snapshot = await adminDb.collection(SUBSCRIPTIONS).doc(userId).get();
    return snapshot.exists ? snapshot.data() as Subscription : null;
  }
  return memoryStore().subscriptions.get(userId) ?? null;
}

export async function saveSubscription(subscription: Subscription) {
  if (adminDb) {
    await adminDb.collection(SUBSCRIPTIONS).doc(subscription.userId).set(subscription, { merge: true });
    return;
  }
  memoryStore().subscriptions.set(subscription.userId, subscription);
}

export async function saveIntent(intent: SubscriptionPaymentIntent) {
  if (adminDb) {
    await adminDb.collection(INTENTS).doc(intent.reference).create(intent);
    return;
  }
  if (memoryStore().intents.has(intent.reference)) throw new Error("Payment reference already exists.");
  memoryStore().intents.set(intent.reference, intent);
}

export async function getIntent(reference: string): Promise<SubscriptionPaymentIntent | null> {
  if (adminDb) {
    const snapshot = await adminDb.collection(INTENTS).doc(reference).get();
    return snapshot.exists ? snapshot.data() as SubscriptionPaymentIntent : null;
  }
  return memoryStore().intents.get(reference) ?? null;
}

export async function markIntentFailed(reference: string) {
  const intent = await getIntent(reference);
  if (!intent || intent.status !== "pending") return;
  const updated = { ...intent, status: "failed" as const, updatedAt: new Date().toISOString() };
  if (adminDb) await adminDb.collection(INTENTS).doc(reference).set(updated, { merge: true });
  else memoryStore().intents.set(reference, updated);
}

export async function commitPayment(input: {
  intent: SubscriptionPaymentIntent;
  subscription: Subscription;
  payment: SubscriptionPayment;
}) {
  if (adminDb) {
    const intentRef = adminDb.collection(INTENTS).doc(input.intent.reference);
    const subscriptionRef = adminDb.collection(SUBSCRIPTIONS).doc(input.subscription.userId);
    const paymentRef = adminDb.collection(PAYMENTS).doc(input.payment.id);
    return adminDb.runTransaction(async (transaction) => {
      const [intentSnapshot, paymentSnapshot] = await Promise.all([
        transaction.get(intentRef),
        transaction.get(paymentRef),
      ]);
      if (!intentSnapshot.exists) throw new Error("Subscription payment request not found.");
      if (paymentSnapshot.exists || intentSnapshot.data()?.status === "paid") return false;
      if (intentSnapshot.data()?.status !== "pending") throw new Error("This payment is no longer pending.");
      transaction.set(subscriptionRef, input.subscription, { merge: true });
      transaction.create(paymentRef, input.payment);
      transaction.update(intentRef, {
        status: "paid",
        providerTransactionId: input.payment.providerTransactionId,
        updatedAt: input.payment.updatedAt,
      });
      return true;
    });
  }
  const store = memoryStore();
  if (store.payments.has(input.payment.id) || store.intents.get(input.intent.reference)?.status === "paid") return false;
  store.subscriptions.set(input.subscription.userId, input.subscription);
  store.payments.set(input.payment.id, input.payment);
  store.intents.set(input.intent.reference, {
    ...input.intent,
    status: "paid",
    providerTransactionId: input.payment.providerTransactionId,
    updatedAt: input.payment.updatedAt,
  });
  return true;
}

export async function recordRenewal(subscription: Subscription, payment: SubscriptionPayment) {
  if (adminDb) {
    const paymentRef = adminDb.collection(PAYMENTS).doc(payment.id);
    const subscriptionRef = adminDb.collection(SUBSCRIPTIONS).doc(subscription.userId);
    return adminDb.runTransaction(async (transaction) => {
      if ((await transaction.get(paymentRef)).exists) return false;
      transaction.set(subscriptionRef, subscription, { merge: true });
      transaction.create(paymentRef, payment);
      return true;
    });
  }
  const store = memoryStore();
  if (store.payments.has(payment.id)) return false;
  store.subscriptions.set(subscription.userId, subscription);
  store.payments.set(payment.id, payment);
  return true;
}

export async function listPayments(userId: string): Promise<SubscriptionPayment[]> {
  if (adminDb) {
    const snapshot = await adminDb.collection(PAYMENTS).where("userId", "==", userId).get();
    return snapshot.docs.map((document) => document.data() as SubscriptionPayment)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return [...memoryStore().payments.values()]
    .filter((payment) => payment.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markPaymentRefunded(reference: string) {
  if (adminDb) {
    const matches = await adminDb.collection(PAYMENTS).where("reference", "==", reference).limit(1).get();
    if (matches.empty) return false;
    const payment = matches.docs[0].data() as SubscriptionPayment;
    const paymentRef = matches.docs[0].ref;
    const subscriptionRef = adminDb.collection(SUBSCRIPTIONS).doc(payment.userId);
    await adminDb.runTransaction(async (transaction) => {
      const paymentSnapshot = await transaction.get(paymentRef);
      if (!paymentSnapshot.exists || paymentSnapshot.data()?.status === "refunded") return;
      const now = new Date().toISOString();
      transaction.update(paymentRef, { status: "refunded", updatedAt: now });
      transaction.set(subscriptionRef, { status: "cancelled", nextBillingAt: null, updatedAt: now }, { merge: true });
    });
    return true;
  }
  const store = memoryStore();
  const payment = [...store.payments.values()].find((item) => item.reference === reference);
  if (!payment) return false;
  const now = new Date().toISOString();
  store.payments.set(payment.id, { ...payment, status: "refunded", updatedAt: now });
  const subscription = store.subscriptions.get(payment.userId);
  if (subscription) store.subscriptions.set(payment.userId, { ...subscription, status: "cancelled", nextBillingAt: null, updatedAt: now });
  return true;
}

export async function findSubscriptionByProvider(input: { email?: string; customerCode?: string; subscriptionCode?: string }) {
  const subscriptions = adminDb
    ? (await adminDb.collection(SUBSCRIPTIONS).get()).docs.map((document) => document.data() as Subscription)
    : [...memoryStore().subscriptions.values()];
  return subscriptions.find((subscription) =>
    Boolean(input.subscriptionCode && subscription.paystackSubscriptionCode === input.subscriptionCode) ||
    Boolean(input.customerCode && subscription.paystackCustomerCode === input.customerCode) ||
    Boolean(input.email && subscription.email.toLowerCase() === input.email.toLowerCase())
  ) ?? null;
}

export async function hasEvent(id: string) {
  if (adminDb) return (await adminDb.collection(EVENTS).doc(id).get()).exists;
  return memoryStore().events.has(id);
}

export async function recordEvent(id: string, name: string, reference: string | null) {
  if (adminDb) {
    await adminDb.collection(EVENTS).doc(id).set({ id, name, reference, processedAt: new Date().toISOString() });
    return;
  }
  memoryStore().events.add(id);
}
