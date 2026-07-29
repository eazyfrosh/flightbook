"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Building2,
  MessageCircle,
  PlaneTakeoff,
  Tag,
  Ticket,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/flights", label: "Flights", icon: PlaneTakeoff },
  { href: "/admin/airlines", label: "Airlines", icon: Building2 },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
  { href: "/admin/chat", label: "Live Chat", icon: MessageCircle },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/promotions", label: "Promotions & Codes", icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/login?next=/admin");
      return;
    }
    if (profile && profile.role !== "admin") {
      router.replace("/");
    }
  }, [loading, user, profile, router]);

  if (loading || !user || !profile || profile.role !== "admin") return null;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
      <aside className="lg:w-56 lg:shrink-0">
        <div className="mb-4">
          <h2 className="text-lg font-bold">Admin Panel</h2>
          <p className="text-xs text-foreground/50">Manage SkyBook flights, bookings, and users</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-brand-600 text-white"
                    : "text-foreground/70 hover:bg-black/5 dark:hover:bg-white/10"
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
