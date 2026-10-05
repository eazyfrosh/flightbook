import crypto from "node:crypto";

export interface VerifiedPaystackTransaction {
  id?: number;
  status?: string;
  amount?: number;
  currency?: string;
  reference?: string;
  paid_at?: string;
  metadata?: Record<string, unknown>;
  plan?: string | { plan_code?: string };
  subscription_code?: string;
  email_token?: string;
  customer?: { email?: string; customer_code?: string };
}

export function verifyPaystackSignature(rawBody: string, signature: string, secret: string) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  const actual = signature.trim().toLowerCase();
  return actual.length === expected.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export async function verifyPaystackTransaction(reference: string, secret: string): Promise<VerifiedPaystackTransaction> {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.status || !payload.data) throw new Error("Paystack payment verification failed.");
  return payload.data as VerifiedPaystackTransaction;
}
