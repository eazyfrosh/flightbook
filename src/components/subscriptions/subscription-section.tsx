import Link from "next/link";
import { ArrowRight, Check, Crown, Infinity, ShieldCheck, Sparkles } from "lucide-react";

const features = [
  "Unlimited flight searches and bookings",
  "Choose any airline and set your own price",
  "Custom departure, arrival, return, and duration times",
  "Unlimited PDF itineraries and boarding passes",
];

export function SubscriptionSection() {
  return (
    <section className="relative overflow-hidden bg-[#06152d] py-20 text-white sm:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-brand-500/20 blur-[100px]" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-gold-400/15 blur-[90px]" />
      </div>
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-200">
            <Sparkles size={13} /> SkyBook Unlimited
          </span>
          <h2 className="mt-6 max-w-2xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            Every trip tool. One simple monthly plan.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
            Build as many itineraries as you need, customize every flight detail, and download polished travel documents whenever you want.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-start gap-3 text-sm text-white/80">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                  <Check size={12} />
                </span>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/15 bg-white/[0.08] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/30">
              <Crown size={23} />
            </span>
            <span className="rounded-full bg-gold-400/15 px-3 py-1 text-xs font-semibold text-gold-400">Unlimited access</span>
          </div>
          <div className="mt-8 flex items-end gap-2">
            <span className="text-6xl font-bold tracking-[-0.06em]">$15</span>
            <span className="pb-2 text-white/55">USD / month</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/60">Recurring monthly payment secured by Paystack. Cancel future renewal from your account.</p>
          <Link href="/pricing" className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-[#071a36] transition hover:-translate-y-0.5 hover:bg-brand-50">
            Get unlimited access <ArrowRight size={16} />
          </Link>
          <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-white/45">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} /> Paystack secured</span>
            <span className="inline-flex items-center gap-1.5"><Infinity size={13} /> No usage limits</span>
          </div>
        </div>
      </div>
    </section>
  );
}
