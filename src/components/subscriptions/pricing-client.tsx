"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Crown, Infinity, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { getSubscriptionAuthHeaders } from "@/lib/subscriptions/client-auth";
import type { SubscriptionPlan } from "@/types/subscription";
import { Button } from "@/components/ui/button";

export function PricingClient() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<Omit<SubscriptionPlan, "paystackPlanCode"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetch("/api/subscriptions/plan")
      .then((response) => response.json())
      .then((data) => setPlan(data.plan ?? null))
      .finally(() => setLoading(false));
  }, []);

  async function subscribe() {
    if (!user) return;
    setStarting(true);
    try {
      const headers = await getSubscriptionAuthHeaders();
      const response = await fetch("/api/subscriptions/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ next: searchParams.get("next") ?? "/dashboard" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Could not start Paystack checkout.");
      window.location.href = data.authorizationUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start Paystack checkout.");
      setStarting(false);
    }
  }

  return (
    <div className="relative overflow-hidden bg-[#071a36] px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-brand-500/25 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-gold-400/15 blur-[100px]" />
      </div>
      <div className="relative mx-auto max-w-5xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-200">
            <Crown size={13} /> SkyBook membership
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-[-0.05em] sm:text-6xl">Unlimited SkyBook access for $15 a month.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/65">Create, customize, manage, and download as many flight itineraries as you need.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="size-7 animate-spin text-brand-300" /></div>
        ) : plan ? (
          <article className="mx-auto mt-14 max-w-xl rounded-[2rem] border border-white/15 bg-white/[0.09] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-brand-200">{plan.name}</p>
                <div className="mt-3 flex items-end gap-2"><span className="text-6xl font-bold tracking-[-0.06em]">$15</span><span className="pb-2 text-white/55">USD / month</span></div>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500"><Infinity size={24} /></span>
            </div>
            <p className="mt-5 text-sm leading-6 text-white/60">{plan.description}</p>
            <ul className="mt-8 space-y-4">
              {plan.features.map((feature) => <li key={feature} className="flex items-start gap-3 text-sm text-white/85"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300"><Check size={12} /></span>{feature}</li>)}
            </ul>
            {user ? (
              <Button className="mt-9 w-full bg-white text-[#071a36] shadow-white/10 hover:bg-brand-50" size="lg" disabled={starting} onClick={subscribe}>
                {starting ? <Loader2 className="size-5 animate-spin" /> : <ShieldCheck size={18} />}
                {starting ? "Opening Paystack…" : "Subscribe securely with Paystack"}
              </Button>
            ) : (
              <Link href={`/auth/login?next=${encodeURIComponent(`/pricing?next=${searchParams.get("next") ?? "/dashboard"}`)}`} className="mt-9 block">
                <Button className="w-full bg-white text-[#071a36] shadow-white/10 hover:bg-brand-50" size="lg">Sign in to subscribe</Button>
              </Link>
            )}
            <p className="mt-4 text-center text-xs text-white/45">Renews monthly until cancelled. Payment is processed securely by Paystack.</p>
          </article>
        ) : null}
      </div>
    </div>
  );
}
