"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getSubscriptionAuthHeaders } from "@/lib/subscriptions/client-auth";
import { Button } from "@/components/ui/button";

export function SubscriptionCallback() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your Paystack payment securely…");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setState("error");
      setMessage("Please sign in with the account that started this subscription.");
      return;
    }
    const reference = params.get("reference") ?? params.get("trxref");
    if (!reference) {
      setState("error");
      setMessage("The Paystack callback is missing its payment reference.");
      return;
    }
    let active = true;
    (async () => {
      try {
        const headers = await getSubscriptionAuthHeaders();
        const response = await fetch("/api/subscriptions/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ reference }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error ?? "Paystack payment verification failed.");
        if (!active) return;
        setState("success");
        setMessage("Your SkyBook Unlimited subscription is active.");
        const requestedNext = params.get("next") ?? "/dashboard";
        const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";
        window.setTimeout(() => router.replace(next), 1000);
      } catch (error) {
        if (!active) return;
        setState("error");
        setMessage(error instanceof Error ? error.message : "We could not activate your subscription.");
      }
    })();
    return () => { active = false; };
  }, [authLoading, params, router, user]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl items-center px-4 py-20">
      <div className="w-full rounded-[2rem] border border-black/8 bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-white/[0.04] sm:p-12">
        {state === "loading" && <Loader2 className="mx-auto size-11 animate-spin text-brand-600" />}
        {state === "success" && <CheckCircle2 className="mx-auto size-12 text-emerald-500" />}
        {state === "error" && <XCircle className="mx-auto size-12 text-red-500" />}
        <h1 className="mt-5 text-2xl font-bold">{state === "success" ? "Subscription activated" : state === "error" ? "Activation needs attention" : "Confirming payment"}</h1>
        <p className="mt-3 text-sm leading-6 text-foreground/60">{message}</p>
        {state === "error" && <div className="mt-7 flex justify-center gap-3"><Link href="/pricing"><Button>Return to pricing</Button></Link><Link href="/dashboard/subscription"><Button variant="outline">Billing</Button></Link></div>}
      </div>
    </main>
  );
}
