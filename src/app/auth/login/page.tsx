"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { logIn, isDemoMode } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setSubmitError(null);
    setLoading(true);
    try {
      await logIn(values.email, values.password);
      toast.success("Welcome back!");
      router.push(params.get("next") || "/dashboard");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to manage your bookings"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium text-brand-600 dark:text-brand-400">
            Sign up
          </Link>
        </>
      }
    >
      {isDemoMode && (
        <div className="mb-4 rounded-lg bg-brand-50 p-3 text-xs text-brand-800 dark:bg-brand-500/10 dark:text-brand-300">
          No authentication provider is connected in this environment. Use the account below to continue: <br />
          <code>admin@skybook.com</code> / <code>admin123</code>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input type="email" {...register("email")} placeholder="you@example.com" />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" {...register("password")} placeholder="••••••••" />
          <FieldError>{errors.password?.message}</FieldError>
        </div>
        {submitError && <p className="text-sm font-medium text-red-500">{submitError}</p>}
        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-sm font-medium text-brand-600 dark:text-brand-400">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
