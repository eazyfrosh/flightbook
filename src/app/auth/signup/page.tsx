"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { signupSchema, type SignupValues } from "@/lib/validation/auth";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupValues) {
    setSubmitError(null);
    setLoading(true);
    try {
      await signUp(values.email, values.password, values.displayName);
      router.push("/auth/verify-email");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join SkyBook to save trips and manage bookings"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-brand-600 dark:text-brand-400">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Full name</Label>
          <Input {...register("displayName")} placeholder="Jane Doe" />
          <FieldError>{errors.displayName?.message}</FieldError>
        </div>
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
        <div>
          <Label>Confirm password</Label>
          <Input type="password" {...register("confirmPassword")} placeholder="••••••••" />
          <FieldError>{errors.confirmPassword?.message}</FieldError>
        </div>
        {submitError && <p className="text-sm font-medium text-red-500">{submitError}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Sign up"}
        </Button>
      </form>
    </AuthCard>
  );
}
