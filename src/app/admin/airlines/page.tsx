"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { AirlineLogo } from "@/components/ui/airline-logo";
import { airlines } from "@/lib/data/airlines";
import { getAll, upsert } from "@/lib/services/store";

interface AirlineOverlay {
  id: string;
  rating: number;
  carryOn: string;
  checked: string;
}

export default function AdminAirlinesPage() {
  const [overlays, setOverlays] = useState<Record<string, AirlineOverlay>>({});

  useEffect(() => {
    getAll<AirlineOverlay>("airline_overlays").then((list) => {
      setOverlays(Object.fromEntries(list.map((o) => [o.id, o])));
    });
  }, []);

  function fieldFor(airlineId: string) {
    const base = airlines.find((a) => a.id === airlineId)!;
    return (
      overlays[airlineId] ?? {
        id: airlineId,
        rating: base.rating,
        carryOn: base.baggageAllowance.carryOn,
        checked: base.baggageAllowance.checked,
      }
    );
  }

  async function save(airlineId: string) {
    const overlay = fieldFor(airlineId);
    await upsert("airline_overlays", overlay);
    setOverlays((prev) => ({ ...prev, [airlineId]: overlay }));
    toast.success("Airline details updated");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage airlines</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Edit rating and baggage details shown on the homepage. Search results always use the base catalog.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {airlines.map((airline) => {
          const overlay = fieldFor(airline.id);
          return (
            <Card key={airline.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-2.5">
                  <AirlineLogo airline={airline} />
                  <div>
                    <p className="font-semibold">{airline.name}</p>
                    <p className="text-xs text-foreground/50">{airline.code} · Hub: {airline.hubAirport}</p>
                  </div>
                </div>
                <div>
                  <Label>Rating</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={overlay.rating}
                    onChange={(e) =>
                      setOverlays((prev) => ({ ...prev, [airline.id]: { ...overlay, rating: Number(e.target.value) } }))
                    }
                  />
                </div>
                <div>
                  <Label>Carry-on allowance</Label>
                  <Input
                    value={overlay.carryOn}
                    onChange={(e) => setOverlays((prev) => ({ ...prev, [airline.id]: { ...overlay, carryOn: e.target.value } }))}
                  />
                </div>
                <div>
                  <Label>Checked baggage allowance</Label>
                  <Input
                    value={overlay.checked}
                    onChange={(e) => setOverlays((prev) => ({ ...prev, [airline.id]: { ...overlay, checked: e.target.value } }))}
                  />
                </div>
                <Button size="sm" onClick={() => save(airline.id)}>
                  <Save size={13} /> Save
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
