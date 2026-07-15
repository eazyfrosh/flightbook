"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { promotions, discountCodes } from "@/lib/services/admin";
import type { DiscountCode, Promotion } from "@/types";

const gradients = [
  "from-brand-600 to-brand-900",
  "from-gold-500 to-orange-700",
  "from-emerald-500 to-teal-700",
  "from-rose-500 to-pink-700",
];

export default function AdminPromotionsPage() {
  const [promoList, setPromoList] = useState<Promotion[]>([]);
  const [codeList, setCodeList] = useState<DiscountCode[]>([]);
  const [newPromo, setNewPromo] = useState({ title: "", description: "", discountPercent: 10, code: "" });
  const [newCode, setNewCode] = useState({ code: "", percentOff: 10, maxUses: 100 });

  async function load() {
    setPromoList(await promotions.list());
    setCodeList(await discountCodes.list());
  }

  useEffect(() => {
    load();
  }, []);

  async function addPromo() {
    if (!newPromo.title || !newPromo.code) return;
    await promotions.save({
      id: `promo-${Date.now()}`,
      title: newPromo.title,
      description: newPromo.description,
      imageGradient: gradients[promoList.length % gradients.length],
      discountPercent: Number(newPromo.discountPercent),
      code: newPromo.code.toUpperCase(),
      validUntil: new Date(Date.now() + 30 * 864e5).toISOString(),
      active: true,
    });
    toast.success("Promotion banner created");
    setNewPromo({ title: "", description: "", discountPercent: 10, code: "" });
    load();
  }

  async function togglePromo(promo: Promotion) {
    await promotions.save({ ...promo, active: !promo.active });
    load();
  }

  async function deletePromo(id: string) {
    await promotions.delete(id);
    toast.success("Promotion removed");
    load();
  }

  async function addCode() {
    if (!newCode.code) return;
    await discountCodes.save({
      id: `dc-${Date.now()}`,
      code: newCode.code.toUpperCase(),
      percentOff: Number(newCode.percentOff),
      maxUses: Number(newCode.maxUses),
      usedCount: 0,
      active: true,
      expiresAt: new Date(Date.now() + 60 * 864e5).toISOString(),
    });
    toast.success("Discount code created");
    setNewCode({ code: "", percentOff: 10, maxUses: 100 });
    load();
  }

  async function deleteCode(id: string) {
    await discountCodes.delete(id);
    toast.success("Discount code removed");
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Promotions & discount codes</h1>
        <p className="mt-1 text-sm text-foreground/60">Active promotions appear on the homepage.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-semibold">Create promotional banner</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Title</Label>
            <Input value={newPromo.title} onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })} placeholder="Summer Escape Sale" />
          </div>
          <div>
            <Label>Discount %</Label>
            <Input type="number" value={newPromo.discountPercent} onChange={(e) => setNewPromo({ ...newPromo, discountPercent: Number(e.target.value) })} />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Input value={newPromo.description} onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })} placeholder="Save on business class to Europe" />
          </div>
          <div>
            <Label>Promo code</Label>
            <Input value={newPromo.code} onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })} placeholder="SUMMER15" />
          </div>
          <div className="flex items-end">
            <Button onClick={addPromo}><Plus size={15} /> Create banner</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {promoList.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-black/8 bg-white p-3.5 text-sm dark:border-white/10 dark:bg-white/[0.03]">
            <span>
              <strong>{p.title}</strong> — {p.discountPercent}% off, code <code>{p.code}</code>
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => togglePromo(p)} className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-black/10 dark:bg-white/10"}`}>
                {p.active ? "Active" : "Inactive"}
              </button>
              <button onClick={() => deletePromo(p.id)} className="text-red-500 hover:text-red-600">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-semibold">Create discount code</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label>Code</Label>
            <Input value={newCode.code} onChange={(e) => setNewCode({ ...newCode, code: e.target.value })} placeholder="WELCOME10" />
          </div>
          <div>
            <Label>Percent off</Label>
            <Input type="number" value={newCode.percentOff} onChange={(e) => setNewCode({ ...newCode, percentOff: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Max uses</Label>
            <Input type="number" value={newCode.maxUses} onChange={(e) => setNewCode({ ...newCode, maxUses: Number(e.target.value) })} />
          </div>
          <div className="sm:col-span-3">
            <Button onClick={addCode}><Plus size={15} /> Create code</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {codeList.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-black/8 bg-white p-3.5 text-sm dark:border-white/10 dark:bg-white/[0.03]">
            <span>
              <code className="font-semibold">{c.code}</code> — {c.percentOff}% off · {c.usedCount}/{c.maxUses} used
            </span>
            <button onClick={() => deleteCode(c.id)} className="text-red-500 hover:text-red-600">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
