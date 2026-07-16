"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SearchWidget } from "@/components/search/search-widget";
import { cn } from "@/lib/utils";

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
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-brand-800 to-brand-700 pb-28 pt-16 text-white sm:pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-400 blur-3xl animate-float-slow" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-gold-500/40 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
      </div>

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
      </div>
    </section>
  );
}
