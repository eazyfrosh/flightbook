"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export default function VerifyEmailPage() {
  const { user, isDemoMode, sendVerification, markEmailVerifiedDemo } = useAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);

  return (
    <AuthCard title="Verify your email" subtitle="One last step to secure your account">
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          <MailCheck size={26} />
        </span>
        <p className="text-sm text-foreground/70">
          We&apos;ve sent a verification link to <strong>{user?.email ?? "your email"}</strong>.
          {isDemoMode && " In demo mode, no real email is sent — use the button below to simulate verification."}
        </p>

        {isDemoMode ? (
          <Button
            className="w-full"
            onClick={() => {
              markEmailVerifiedDemo();
              toast.success("Email verified (demo)");
              router.push("/dashboard");
            }}
          >
            Mark as verified (demo)
          </Button>
        ) : (
          <Button
            className="w-full"
            disabled={sending}
            onClick={async () => {
              setSending(true);
              try {
                await sendVerification();
                toast.success("Verification email sent");
              } finally {
                setSending(false);
              }
            }}
          >
            {sending ? "Sending…" : "Resend verification email"}
          </Button>
        )}
      </div>
    </AuthCard>
  );
}
