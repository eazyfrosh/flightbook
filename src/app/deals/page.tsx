"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Percent, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getAll } from "@/lib/services/store";
import { formatDateLong } from "@/lib/utils";
import type { DiscountCode, Promotion } from "@/types";

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

export default function DealsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>(defaultPromotions);
  const [codes, setCodes] = useState<DiscountCode[]>([]);

  useEffect(() => {
    getAll<Promotion>("promotions").then((items) => {
      const active = items.filter((p) => p.active);
      if (active.length > 0) setPromotions(active);
    });
    getAll<DiscountCode>("discount_codes").then((items) => setCodes(items.filter((c) => c.active)));
  }, []);

  function copy(code: string) {
    navigator.clipboard?.writeText(code).catch(() => {});
    toast.success(`Code ${code} copied`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Deals & discount codes</h1>
        <p className="mt-2 text-foreground/60">Simulated promotions — apply these codes at checkout for demo purposes.</p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-7 text-white shadow-lg ${promo.imageGradient}`}
          >
            <Tag size={100} className="absolute -bottom-6 -right-6 opacity-15" />
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              {promo.discountPercent}% OFF
            </span>
            <h3 className="mt-3 text-xl font-bold">{promo.title}</h3>
            <p className="mt-1 max-w-sm text-sm text-white/80">{promo.description}</p>
            <p className="mt-2 text-xs text-white/60">Valid until {formatDateLong(promo.validUntil)}</p>
            <button
              onClick={() => copy(promo.code)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-3.5 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
            >
              <Copy size={14} /> {promo.code}
            </button>
          </div>
        ))}
      </div>

      {codes.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">More discount codes</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {codes.map((c) => (
              <Card key={c.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <span className="flex items-center gap-2 text-sm">
                    <Percent size={15} className="text-brand-600 dark:text-brand-400" />
                    <code className="font-semibold">{c.code}</code> — {c.percentOff}% off
                  </span>
                  <button onClick={() => copy(c.code)} className="text-xs font-medium text-brand-600 dark:text-brand-400">
                    Copy
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
