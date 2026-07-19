"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, MapPin } from "lucide-react";
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
    <section className="bg-black/[0.015] py-16 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Popular destinations</h2>
          <p className="mt-2 text-foreground/60">Fares shown are mock starting prices, round-trip</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
                  "group relative h-56 cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-b text-white shadow-md transition-shadow hover:shadow-xl",
                  d.gradient
                )}
                onClick={() =>
                  router.push(
                    `/search?tripType=round_trip&from=JFK&to=${d.code}&departureDate=${new Date(Date.now() + 12096e5).toISOString().slice(0, 10)}&returnDate=${new Date(Date.now() + 18144e5).toISOString().slice(0, 10)}&passengers=${encodeURIComponent(JSON.stringify({ adults: 1, children: 0, infants: 0 }))}&cabin=economy`
                  )
                }
              >
                <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(1.5px_1.5px_at_20%_20%,white,transparent),radial-gradient(1.5px_1.5px_at_60%_15%,white,transparent),radial-gradient(1px_1px_at_80%_30%,white,transparent),radial-gradient(1px_1px_at_35%_35%,white,transparent),radial-gradient(1.5px_1.5px_at_90%_10%,white,transparent)]" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 overflow-hidden transition-transform duration-500 group-hover:scale-105">
                  <DestinationArt city={d.code} />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(d.code);
                  }}
                  className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 backdrop-blur transition hover:bg-black/40"
                  aria-label="Toggle favorite"
                >
                  <Heart size={15} className={cn(isFav && "fill-red-500 text-red-500")} />
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent transition group-hover:from-black/60" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="flex items-center gap-1 text-xs text-white/70">
                    <MapPin size={11} /> {d.country}
                  </p>
                  <p className="text-lg font-bold">{d.city}</p>
                  <p className="mt-0.5 text-xs text-white/80">From ${d.price}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
