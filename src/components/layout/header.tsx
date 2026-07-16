"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Plane, User, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

const navLinks = [
  { href: "/search", label: "Search Flights" },
  { href: "/flight-status", label: "Flight Status" },
  { href: "/manage-booking", label: "Manage Booking" },
  { href: "/deals", label: "Deals" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, profile, logOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 glass border-b border-black/8 dark:border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Plane size={18} />
          </span>
          <span className="text-lg">
            Sky<span className="text-brand-600 dark:text-brand-400">Book</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                pathname === link.href
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-foreground/70 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <div className="group relative">
              <button className="flex items-center gap-2 rounded-full border border-black/10 py-1.5 pl-1.5 pr-3.5 text-sm font-medium transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                  <User size={13} />
                </span>
                {profile?.displayName || user.displayName || "Account"}
              </button>
              <div className="invisible absolute right-0 mt-1 w-52 translate-y-1 rounded-xl border border-black/8 bg-white p-1.5 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-white/10 dark:bg-neutral-900">
                <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
                  My Trips
                </Link>
                <Link href="/dashboard/profile" className="block rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
                  Profile
                </Link>
                {profile?.role === "admin" && (
                  <Link href="/admin" className="block rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={async () => {
                    await logOut();
                    router.push("/");
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-black/8 px-4 pb-4 pt-2 md:hidden dark:border-white/10">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-black/8 dark:bg-white/10" />
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10">
                  My Trips
                </Link>
                {profile?.role === "admin" && (
                  <Link href="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10">
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={async () => {
                    await logOut();
                    setOpen(false);
                    router.push("/");
                  }}
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="mt-1 flex gap-2">
                <Link href="/auth/login" className="flex-1" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/signup" className="flex-1" onClick={() => setOpen(false)}>
                  <Button className="w-full">Sign up</Button>
                </Link>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between px-3">
              <span className="text-sm text-foreground/60">Theme</span>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
