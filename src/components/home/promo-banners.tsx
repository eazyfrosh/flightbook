"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Tag } from "lucide-react";
import { toast } from "sonner";
import { getAll } from "@/lib/services/store";
import type { Promotion } from "@/types";

const defaultPromotions: Promotion[] = [
  {
    id: "promo-1",
    title: "Summer Escape Sale",
    description: "Save on business class to Europe this season.",
    imageGradient: "from-brand-600 to-brand-900",
    discountPercent: 15,
    code: "SUMMER15",
    validUntil: new Date(Date.now() + 30 * 864e5).toISOString(),
    active: true,
  },
  {
    id: "promo-2",
    title: "First Class Flash Deal",
    description: "Limited-time savings on long-haul first class fares.",
    imageGradient: "from-gold-500 to-orange-700",
    discountPercent: 20,
    code: "FIRST20",
    validUntil: new Date(Date.now() + 20 * 864e5).toISOString(),
    active: true,
  },
];

export function PromoBanners() {
  const [promotions, setPromotions] = useState<Promotion[]>(defaultPromotions);

  useEffect(() => {
    getAll<Promotion>("promotions").then((items) => {
      const active = items.filter((p) => p.active);
      if (active.length > 0) setPromotions(active);
    });
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {promotions.map((promo, idx) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-7 text-white shadow-lg ${promo.imageGradient}`}
          >
            <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(1.5px_1.5px_at_15%_25%,white,transparent),radial-gradient(1.5px_1.5px_at_75%_20%,white,transparent),radial-gradient(1px_1px_at_45%_60%,white,transparent),radial-gradient(1px_1px_at_90%_70%,white,transparent)]" />
            <Tag size={100} className="absolute -bottom-6 -right-6 opacity-15" />
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              {promo.discountPercent}% OFF
            </span>
            <h3 className="mt-3 text-xl font-bold">{promo.title}</h3>
            <p className="mt-1 max-w-sm text-sm text-white/80">{promo.description}</p>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(promo.code).catch(() => {});
                toast.success(`Code ${promo.code} copied`);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-3.5 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
            >
              <Copy size={14} /> {promo.code}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
