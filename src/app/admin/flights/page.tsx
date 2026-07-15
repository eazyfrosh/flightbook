"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminFlights } from "@/lib/services/admin";
import { airlines, findAirline } from "@/lib/data/airlines";
import { cabinLabel, formatCurrency } from "@/lib/utils";
import type { AdminFlightListing, CabinClass, FlightStatusValue } from "@/types";

const emptyFlight: Omit<AdminFlightListing, "id"> = {
  airlineId: airlines[0].id,
  flightNumber: "",
  originCode: "",
  destinationCode: "",
  departureTime: "",
  arrivalTime: "",
  cabin: "economy",
  price: 250,
  aircraft: airlines[0].aircraftTypes[0],
  status: "scheduled",
};

export default function AdminFlightsPage() {
  const [flights, setFlights] = useState<AdminFlightListing[]>([]);
  const [editing, setEditing] = useState<AdminFlightListing | (Omit<AdminFlightListing, "id"> & { id?: string }) | null>(null);

  async function load() {
    setFlights(await adminFlights.list());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    if (!editing) return;
    const record: AdminFlightListing = {
      id: editing.id ?? `af-${Date.now()}`,
      airlineId: editing.airlineId,
      flightNumber: editing.flightNumber,
      originCode: editing.originCode.toUpperCase(),
      destinationCode: editing.destinationCode.toUpperCase(),
      departureTime: editing.departureTime,
      arrivalTime: editing.arrivalTime,
      cabin: editing.cabin,
      price: Number(editing.price),
      aircraft: editing.aircraft,
      status: editing.status,
    };
    await adminFlights.save(record);
    toast.success(editing.id ? "Flight updated" : "Flight created");
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    await adminFlights.delete(id);
    toast.success("Flight deleted");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Manage flights</h1>
          <p className="mt-1 text-sm text-foreground/60">
            These curated listings are independent of the live search generator, for admin CRUD demonstration.
          </p>
        </div>
        <Button onClick={() => setEditing({ ...emptyFlight })}>
          <Plus size={16} /> New flight
        </Button>
      </div>

      {editing && (
        <Card>
          <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
            <div>
              <Label>Airline</Label>
              <Select
                value={editing.airlineId}
                onChange={(e) => setEditing({ ...editing, airlineId: e.target.value })}
              >
                {airlines.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Flight number</Label>
              <Input value={editing.flightNumber} onChange={(e) => setEditing({ ...editing, flightNumber: e.target.value })} placeholder="AA123" />
            </div>
            <div>
              <Label>Aircraft</Label>
              <Input value={editing.aircraft} onChange={(e) => setEditing({ ...editing, aircraft: e.target.value })} />
            </div>
            <div>
              <Label>Origin code</Label>
              <Input value={editing.originCode} onChange={(e) => setEditing({ ...editing, originCode: e.target.value })} placeholder="JFK" maxLength={3} />
            </div>
            <div>
              <Label>Destination code</Label>
              <Input value={editing.destinationCode} onChange={(e) => setEditing({ ...editing, destinationCode: e.target.value })} placeholder="LHR" maxLength={3} />
            </div>
            <div>
              <Label>Price (USD)</Label>
              <Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Departure</Label>
              <Input type="datetime-local" value={editing.departureTime} onChange={(e) => setEditing({ ...editing, departureTime: e.target.value })} />
            </div>
            <div>
              <Label>Arrival</Label>
              <Input type="datetime-local" value={editing.arrivalTime} onChange={(e) => setEditing({ ...editing, arrivalTime: e.target.value })} />
            </div>
            <div>
              <Label>Cabin</Label>
              <Select value={editing.cabin} onChange={(e) => setEditing({ ...editing, cabin: e.target.value as CabinClass })}>
                <option value="economy">Economy</option>
                <option value="premium_economy">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as FlightStatusValue })}>
                <option value="scheduled">Scheduled</option>
                <option value="delayed">Delayed</option>
                <option value="boarding">Boarding</option>
                <option value="departed">Departed</option>
                <option value="landed">Landed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
            <div className="flex items-end gap-2 sm:col-span-3">
              <Button onClick={handleSave}>Save flight</Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {flights.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/15 p-10 text-center text-sm text-foreground/50 dark:border-white/20">
            No admin-managed flights yet. Create one above.
          </p>
        ) : (
          flights.map((flight) => {
            const airline = findAirline(flight.airlineId);
            return (
              <Card key={flight.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">
                      {airline?.name} · {flight.flightNumber}{" "}
                      <span className="text-foreground/50">
                        {flight.originCode} → {flight.destinationCode}
                      </span>
                    </p>
                    <p className="text-xs text-foreground/50">
                      {cabinLabel(flight.cabin)} · {formatCurrency(flight.price)} · {flight.aircraft}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={flight.status === "cancelled" ? "red" : "brand"}>{flight.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => setEditing(flight)}>
                      <Pencil size={13} />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(flight.id)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
