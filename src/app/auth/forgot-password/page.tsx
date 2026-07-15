"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validation/auth";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordValues) {
    setSubmitError(null);
    setLoading(true);
    try {
      await resetPassword(values.email);
      setSent(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="We'll send you a link to reset it"
      footer={
        <Link href="/auth/login" className="font-medium text-brand-600 dark:text-brand-400">
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="text-emerald-500" size={32} />
          <p className="text-sm text-foreground/70">
            If an account exists for that email, a password reset link has been sent (simulated in demo mode).
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email")} placeholder="you@example.com" />
            <FieldError>{errors.email?.message}</FieldError>
          </div>
          {submitError && <p className="text-sm font-medium text-red-500">{submitError}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
