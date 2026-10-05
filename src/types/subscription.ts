export type SubscriptionStatus = "active" | "non_renewing" | "past_due" | "cancelled" | "expired";
export type SubscriptionPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface SubscriptionPlan {
  id: "skybook-unlimited";
  name: string;
  description: string;
  priceCents: number;
  currency: "USD";
  interval: "monthly";
  paystackPlanCode: string | null;
  features: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  email: string;
  planId: SubscriptionPlan["id"];
  status: SubscriptionStatus;
  startedAt: string;
  nextBillingAt: string | null;
  expiresAt: string | null;
  paystackCustomerCode: string | null;
  paystackSubscriptionCode: string | null;
  paystackEmailToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  userId: string;
  amountCents: number;
  currency: "USD";
  reference: string;
  providerTransactionId: string;
  status: SubscriptionPaymentStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPaymentIntent {
  id: string;
  userId: string;
  email: string;
  amountCents: number;
  currency: "USD";
  reference: string;
  status: SubscriptionPaymentStatus;
  providerTransactionId: string | null;
  createdAt: string;
  updatedAt: string;
}
