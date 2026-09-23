"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CalendarSearch, PlaneTakeoff, Ticket } from "lucide-react";

const steps = [
  {
    icon: CalendarSearch,
    eyebrow: "01 · Discover",
    title: "Search without limits",
    description: "Find any IATA airport, select your dates, and choose the exact airline you want.",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  },
  {
    icon: Ticket,
    eyebrow: "02 · Personalize",
    title: "Make the fare yours",
    description: "Set your cabin, passengers, extras, and preferred price in one simple flow.",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  },
  {
    icon: PlaneTakeoff,
    eyebrow: "03 · Travel",
    title: "Keep every detail close",
    description: "Download your full itinerary, access your boarding pass, and manage the booking anytime.",
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Simple by design</p>
          <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">From an idea to an itinerary in minutes.</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-foreground/55">Everything you need to shape, confirm, and revisit your journey in one place.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {steps.map((step, idx) => (
          <motion.article
            key={step.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: idx * 0.1 }}
            className="group relative overflow-hidden rounded-3xl border border-black/[0.07] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div className="flex items-start justify-between">
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${step.color}`}><step.icon size={22} /></span>
              <ArrowUpRight size={18} className="text-foreground/25 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-500" />
            </div>
            <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/40">{step.eyebrow}</p>
            <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
            <p className="mt-3 text-sm leading-6 text-foreground/55">{step.description}</p>
            <div className="absolute -bottom-12 -right-12 h-28 w-28 rounded-full bg-brand-500/5 transition group-hover:scale-150" />
          </motion.article>
        ))}
      </div>
    </section>
  );
}
