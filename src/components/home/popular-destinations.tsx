"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Heart, MapPin } from "lucide-react";
import { useSearchHistoryStore } from "@/lib/store/search-history-store";
import { DestinationArt } from "@/components/home/destination-art";
import { cn } from "@/lib/utils";

const destinations = [
  { code: "LHR", city: "London", country: "United Kingdom", price: 412, gradient: "from-slate-600 to-slate-800" },
  { code: "DXB", city: "Dubai", country: "United Arab Emirates", price: 589, gradient: "from-amber-500 to-orange-700" },
  { code: "NRT", city: "Tokyo", country: "Japan", gradient: "from-rose-500 to-pink-700", price: 720 },
  { code: "SIN", city: "Singapore", country: "Singapore", gradient: "from-emerald-500 to-teal-700", price: 655 },
  { code: "CDG", city: "Paris", country: "France", gradient: "from-indigo-500 to-violet-700", price: 388 },
  { code: "SYD", city: "Sydney", country: "Australia", gradient: "from-cyan-500 to-blue-700", price: 945 },
  { code: "BCN", city: "Barcelona", country: "Spain", gradient: "from-orange-400 to-red-600", price: 355 },
  { code: "DPS", city: "Bali", country: "Indonesia", gradient: "from-lime-500 to-emerald-700", price: 810 },
];

export function PopularDestinations() {
  const router = useRouter();
  const { favoriteDestinations, toggleFavorite } = useSearchHistoryStore();

  return (
    <section className="relative bg-[#eef4fb] py-20 dark:bg-white/[0.025] lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/70 to-transparent dark:from-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Handpicked escapes</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Go somewhere unforgettable.</h2>
            <p className="mt-2 text-sm text-foreground/55">Tap a destination to start planning your route.</p>
          </div>
          <Link href="/deals" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-500 dark:text-brand-300">
            View all deals <ArrowRight size={16} />
          </Link>
        </div>
        <div className="relative grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {destinations.map((d, idx) => {
            const isFav = favoriteDestinations.includes(d.code);
            return (
              <motion.div
                key={d.code}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: (idx % 8) * 0.04 }}
                className={cn(
                  "group relative h-60 cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-b text-white shadow-lg shadow-slate-900/10 ring-1 ring-white/25 transition duration-300 hover:-translate-y-1 hover:shadow-2xl sm:h-72",
                  d.gradient
                )}
                onClick={() =>
                  router.push(
                    `/search?tripType=round_trip&from=JFK&to=${d.code}&departureDate=${new Date(Date.now() + 12096e5).toISOString().slice(0, 10)}&returnDate=${new Date(Date.now() + 18144e5).toISOString().slice(0, 10)}&passengers=${encodeURIComponent(JSON.stringify({ adults: 1, children: 0, infants: 0 }))}&cabin=economy`
                  )
                }
              >
                <div className="pointer-events-none absolute -right-2 top-8 text-7xl font-black tracking-tighter text-white/[0.08] sm:text-8xl">{d.code}</div>
                <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(1.5px_1.5px_at_20%_20%,white,transparent),radial-gradient(1.5px_1.5px_at_60%_15%,white,transparent),radial-gradient(1px_1px_at_80%_30%,white,transparent),radial-gradient(1px_1px_at_35%_35%,white,transparent),radial-gradient(1.5px_1.5px_at_90%_10%,white,transparent)]" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 overflow-hidden transition-transform duration-500 group-hover:scale-105">
                  <DestinationArt city={d.code} />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(d.code);
                  }}
                  className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/15 backdrop-blur transition hover:scale-105 hover:bg-black/30"
                  aria-label="Toggle favorite"
                >
                  <Heart size={15} className={cn(isFav && "fill-red-500 text-red-500")} />
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent transition group-hover:from-black/75" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <p className="flex items-center gap-1 text-xs text-white/70">
                    <MapPin size={11} /> {d.country}
                  </p>
                  <div className="mt-1 flex items-end justify-between gap-2">
                    <div><p className="text-lg font-bold sm:text-xl">{d.city}</p><p className="mt-0.5 text-xs text-white/75">From ${d.price}</p></div>
                    <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 transition group-hover:rotate-12 sm:flex"><ArrowUpRight size={16} /></span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
