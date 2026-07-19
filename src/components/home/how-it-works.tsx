"use client";

import { motion } from "framer-motion";
import { CalendarSearch, PlaneTakeoff, Ticket } from "lucide-react";

const steps = [
  {
    icon: CalendarSearch,
    title: "Search your route",
    description: "Pick your airports, dates, and cabin — compare fares across 15 airlines instantly.",
  },
  {
    icon: Ticket,
    title: "Book in minutes",
    description: "Add passenger details and extras, then confirm — no payment step, it's completely free.",
  },
  {
    icon: PlaneTakeoff,
    title: "Fly with confidence",
    description: "Get a QR-verified boarding pass, PDF itinerary, and manage or rebook anytime.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">How it works</h2>
        <p className="mt-2 text-foreground/60">From search to boarding pass in three simple steps</p>
      </div>

      <div className="relative grid grid-cols-1 gap-10 sm:grid-cols-3">
        <div className="pointer-events-none absolute left-0 right-0 top-8 hidden border-t-2 border-dashed border-black/10 dark:border-white/10 sm:block" />

        {steps.map((step, idx) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.12 }}
            className="relative flex flex-col items-center text-center"
          >
            <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand-600 shadow-md ring-1 ring-black/8 dark:bg-background dark:text-brand-400 dark:ring-white/10">
              <step.icon size={26} />
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-white shadow">
                {idx + 1}
              </span>
            </span>
            <h3 className="mt-4 font-semibold">{step.title}</h3>
            <p className="mt-1.5 max-w-xs text-sm text-foreground/60">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
