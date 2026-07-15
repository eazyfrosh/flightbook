import type { ReactNode } from "react";
import Link from "next/link";
import { Plane } from "lucide-react";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-6 flex justify-center">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Plane size={18} />
          </span>
          <span className="text-lg">
            Sky<span className="text-brand-600 dark:text-brand-400">Book</span>
          </span>
        </Link>
      </div>
      <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/[0.03]">
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-foreground/60">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-5 text-center text-sm text-foreground/60">{footer}</div>}
    </div>
  );
}
