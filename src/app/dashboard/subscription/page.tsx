"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, Crown, Loader2, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { getSubscriptionAuthHeaders } from "@/lib/subscriptions/client-auth";
import type { Subscription, SubscriptionPayment } from "@/types/subscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BillingData {
  subscription: Subscription | null;
  payments: SubscriptionPayment[];
  active: boolean;
  administrator: boolean;
}

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  async function load() {
    const headers = await getSubscriptionAuthHeaders();
    const response = await fetch("/api/subscriptions/me", { headers });
    if (!response.ok) throw new Error("Could not load subscription details.");
    setData(await response.json());
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/auth/login?next=/dashboard/subscription");
      return;
    }
    load().catch((error) => toast.error(error.message)).finally(() => setLoading(false));
  }, [authLoading, router, user]);

  async function cancelRenewal() {
    setCancelling(true);
    try {
      const headers = await getSubscriptionAuthHeaders();
      const response = await fetch("/api/subscriptions/cancel", { method: "POST", headers });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? "Could not cancel renewal.");
      await load();
      toast.success("Automatic renewal has been cancelled. Your access continues through the current billing period.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not cancel renewal.");
    } finally {
      setCancelling(false);
    }
  }

  if (authLoading || loading || !user) return <div className="flex min-h-[55vh] items-center justify-center"><Loader2 className="size-7 animate-spin text-brand-600" /></div>;
  const subscription = data?.subscription;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">Account billing</p><h1 className="mt-2 text-3xl font-bold">Subscription</h1><p className="mt-2 text-sm text-foreground/60">Manage SkyBook Unlimited and review Paystack payments.</p></div>
        <Link href="/pricing"><Button><Crown size={16} /> {data?.active ? "View plan" : "Subscribe for $15"}</Button></Link>
      </div>

      <div className="mt-9 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <section className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
          <div className="flex items-start justify-between gap-4"><div><p className="text-sm text-foreground/50">Current plan</p><h2 className="mt-2 text-3xl font-bold">{data?.administrator ? "Administrator" : subscription ? "SkyBook Unlimited" : "Free access"}</h2></div><Badge tone={data?.active ? "green" : "neutral"}>{data?.active ? "Active" : "Inactive"}</Badge></div>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            <div><p className="text-xs text-foreground/50">Price</p><p className="mt-1 font-semibold">{data?.administrator ? "Included" : subscription ? "$15 / month" : "—"}</p></div>
            <div><p className="text-xs text-foreground/50">Status</p><p className="mt-1 font-semibold capitalize">{subscription?.status.replace("_", " ") ?? (data?.administrator ? "active" : "not subscribed")}</p></div>
            <div><p className="text-xs text-foreground/50">Access through</p><p className="mt-1 font-semibold">{subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : data?.administrator ? "Unlimited" : "—"}</p></div>
          </div>
          {data?.active && <div className="mt-7 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"><CheckCircle2 size={17} /> Unlimited booking and itinerary access is enabled.</div>}
          {subscription?.status === "active" && <Button className="mt-7" variant="outline" disabled={cancelling} onClick={cancelRenewal}>{cancelling && <Loader2 className="size-4 animate-spin" />}Cancel future renewal</Button>}
          {subscription?.status === "non_renewing" && <p className="mt-7 text-sm text-foreground/60">Renewal is cancelled. Your access remains active until {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : "the end of the billing period"}.</p>}
        </section>

        <section className="rounded-[2rem] bg-[#071a36] p-6 text-white sm:p-8"><CreditCard className="text-brand-300" size={24} /><h2 className="mt-5 text-xl font-bold">Secure billing</h2><p className="mt-3 text-sm leading-6 text-white/60">Your recurring payment is processed by Paystack. SkyBook never stores your card details.</p><div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/50">Monthly renewal · USD $15</div></section>
      </div>

      <section className="mt-7 rounded-[2rem] border border-black/8 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"><ReceiptText size={18} /></span><div><h2 className="font-bold">Payment history</h2><p className="text-xs text-foreground/50">Verified Paystack subscription charges</p></div></div>
        {!data?.payments.length ? <p className="mt-7 text-sm text-foreground/50">No subscription payments yet.</p> : <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="text-xs uppercase tracking-wide text-foreground/45"><tr><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium">Reference</th><th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Status</th></tr></thead><tbody>{data.payments.map((payment) => <tr key={payment.id} className="border-t border-black/8 dark:border-white/10"><td className="py-4">{new Date(payment.createdAt).toLocaleDateString()}</td><td className="py-4 font-mono text-xs">{payment.reference}</td><td className="py-4 font-semibold">$15.00</td><td className="py-4 capitalize text-emerald-600 dark:text-emerald-400">{payment.status}</td></tr>)}</tbody></table></div>}
      </section>
    </main>
  );
}
