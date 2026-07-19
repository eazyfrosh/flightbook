"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PlaneTakeoff, ShieldCheck, Sparkles, Users } from "lucide-react";
import { SearchWidget } from "@/components/search/search-widget";
import { cn } from "@/lib/utils";

const stats = [
  { icon: PlaneTakeoff, label: "15 partner airlines" },
  { icon: Sparkles, label: "500+ routes worldwide" },
  { icon: ShieldCheck, label: "Free cancellation on most fares" },
  { icon: Users, label: "Trusted by demo travelers everywhere" },
];

export function Hero() {
  const searchRef = useRef<HTMLDivElement>(null);
  const [highlighted, setHighlighted] = useState(false);

  useEffect(() => {
    if (window.location.hash === "#search-widget") {
      searchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlighted(true);
      const timeout = setTimeout(() => setHighlighted(false), 1800);
      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-brand-800 to-brand-700 pb-24 pt-16 text-white sm:pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-400 blur-3xl animate-float-slow" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-gold-500/40 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(1.5px_1.5px_at_10%_20%,white,transparent),radial-gradient(1.5px_1.5px_at_85%_15%,white,transparent),radial-gradient(1px_1px_at_70%_40%,white,transparent),radial-gradient(1px_1px_at_25%_55%,white,transparent),radial-gradient(1.5px_1.5px_at_50%_12%,white,transparent),radial-gradient(1px_1px_at_92%_50%,white,transparent)]" />

      <svg
        viewBox="0 0 800 260"
        className="pointer-events-none absolute inset-x-0 top-4 mx-auto hidden w-full max-w-5xl opacity-[0.35] sm:block"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M60 190 C 260 30, 540 30, 740 150"
          stroke="white"
          strokeWidth="2"
          strokeDasharray="2 10"
          strokeLinecap="round"
        />
        <circle cx="60" cy="190" r="5" fill="white" />
        <circle cx="740" cy="150" r="5" fill="white" />
        <g transform="translate(400, 70) rotate(18)">
          <path
            d="M0 0 L26 3 L34 0 L26 -3 Z M14 -1 L14 -14 L18 -14 L20 -1 Z M14 1 L14 14 L18 14 L20 1 Z M-4 0 L-14 -6 L-14 6 Z"
            fill="white"
          />
        </g>
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white/90">
            ✦ Portfolio demo — simulated bookings only
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Fly further, for less.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/70 sm:text-lg">
            Search hundreds of routes across 15 world-class airlines and book your next trip in minutes.
          </p>
        </motion.div>

        <motion.div
          id="search-widget"
          ref={searchRef}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className={cn(
            "mx-auto mt-10 max-w-5xl scroll-mt-28 rounded-3xl text-left transition-shadow duration-700",
            highlighted && "ring-4 ring-gold-400/70"
          )}
        >
          <SearchWidget />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-4 text-sm text-white/75 sm:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="flex items-center justify-center gap-2 sm:justify-start">
              <s.icon size={16} className="shrink-0 text-gold-400" />
              <span>{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
