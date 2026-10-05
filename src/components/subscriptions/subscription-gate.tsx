"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Crown, Loader2, LockKeyhole } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getSubscriptionAuthHeaders } from "@/lib/subscriptions/client-auth";
import { Button } from "@/components/ui/button";

export function SubscriptionGate({ children, nextPath }: { children: ReactNode; nextPath: string }) {
  const { user, profile, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setChecking(false);
      return;
    }
    if (profile?.role === "admin") {
      setAllowed(true);
      setChecking(false);
      return;
    }
    let active = true;
    getSubscriptionAuthHeaders()
      .then((headers) => fetch("/api/subscriptions/me", { headers }))
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active) setAllowed(Boolean(data?.active)); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [authLoading, profile?.role, user]);

  if (authLoading || checking) return <div className="flex min-h-[45vh] items-center justify-center"><Loader2 className="size-7 animate-spin text-brand-600" /></div>;
  if (allowed) return children;

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center px-4 py-16">
      <div className="w-full rounded-[2rem] border border-brand-500/20 bg-white p-8 text-center shadow-xl shadow-brand-500/5 dark:bg-white/[0.04] sm:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"><LockKeyhole size={25} /></span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">SkyBook Unlimited</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Subscribe to continue your booking</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-foreground/60">Get unlimited booking access, itinerary customization, and PDF downloads for $15 USD per month.</p>
        {user ? (
          <Link href={`/pricing?next=${encodeURIComponent(nextPath)}`} className="mt-7 inline-block"><Button size="lg"><Crown size={18} /> Get unlimited access</Button></Link>
        ) : (
          <Link href={`/auth/login?next=${encodeURIComponent(`/pricing?next=${nextPath}`)}`} className="mt-7 inline-block"><Button size="lg">Sign in to subscribe</Button></Link>
        )}
      </div>
    </main>
  );
}
