"use client";

import { useState } from "react";
import { PlaneTakeoff, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { AirlineLogo } from "@/components/ui/airline-logo";
import { airlines } from "@/lib/data/airlines";
import { airports } from "@/lib/data/airports";
import { formatDateLong, formatTime, hashString, seedRandom } from "@/lib/utils";
import type { FlightStatusValue } from "@/types";

const STATUSES: FlightStatusValue[] = ["scheduled", "boarding", "departed", "landed", "delayed", "cancelled"];

const statusTone: Record<FlightStatusValue, "brand" | "gold" | "green" | "red" | "neutral"> = {
  scheduled: "brand",
  boarding: "gold",
  departed: "brand",
  landed: "green",
  delayed: "gold",
  cancelled: "red",
};

interface StatusResult {
  flightNumber: string;
  airline: (typeof airlines)[number];
  origin: (typeof airports)[number];
  destination: (typeof airports)[number];
  status: FlightStatusValue;
  departureTime: string;
  arrivalTime: string;
  gate: string;
  terminal: string;
}

function lookupFlight(flightNumber: string, date: string): StatusResult | null {
  const cleaned = flightNumber.trim().toUpperCase().replace(/\s+/g, "");
  if (!cleaned) return null;
  const codeMatch = cleaned.match(/^[A-Z]{2}/);
  const airline =
    (codeMatch && airlines.find((a) => a.code === codeMatch[0])) ||
    airlines[hashString(cleaned) % airlines.length];

  const rand = seedRandom(hashString(`${cleaned}-${date}`) || 1);
  const origin = airports[Math.floor(rand() * airports.length)];
  let destination = airports[Math.floor(rand() * airports.length)];
  if (destination.code === origin.code) destination = airports[(airports.indexOf(destination) + 1) % airports.length];

  const status = STATUSES[Math.floor(rand() * STATUSES.length)];
  const base = new Date(`${date}T00:00:00`);
  base.setHours(4 + Math.floor(rand() * 18), Math.floor(rand() * 12) * 5, 0, 0);
  const duration = 90 + Math.floor(rand() * 600);
  const arrival = new Date(base.getTime() + duration * 60000);

  return {
    flightNumber: cleaned,
    airline,
    origin,
    destination,
    status,
    departureTime: base.toISOString(),
    arrivalTime: arrival.toISOString(),
    gate: `${"ABCDEFG"[Math.floor(rand() * 7)]}${1 + Math.floor(rand() * 40)}`,
    terminal: String(1 + Math.floor(rand() * 5)),
  };
}

export default function FlightStatusPage() {
  const [flightNumber, setFlightNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState<StatusResult | null | undefined>(undefined);

  function handleSearch() {
    setResult(lookupFlight(flightNumber, date));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Flight status</h1>
        <p className="mt-1 text-sm text-foreground/60">Simulated status lookup — enter any flight number, e.g. AA123.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label>Flight number</Label>
          <Input value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} placeholder="AA123" />
        </div>
        <div>
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <Button onClick={handleSearch}>
          <Search size={16} /> Check status
        </Button>
      </div>

      {result === null && (
        <p className="mt-8 text-center text-sm text-foreground/50">Enter a flight number to see its status.</p>
      )}

      {result && (
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AirlineLogo airline={result.airline} />
                <div>
                  <p className="font-semibold">{result.airline.name}</p>
                  <p className="text-xs text-foreground/50">Flight {result.flightNumber} · {formatDateLong(result.departureTime)}</p>
                </div>
              </div>
              <Badge tone={statusTone[result.status]} className="capitalize">{result.status}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatTime(result.departureTime)}</p>
                <p className="text-sm text-foreground/60">{result.origin.city} ({result.origin.code})</p>
                <p className="text-xs text-foreground/40">Terminal {result.terminal} · Gate {result.gate}</p>
              </div>
              <PlaneTakeoff className="text-foreground/30" size={22} />
              <div className="text-right">
                <p className="text-2xl font-bold">{formatTime(result.arrivalTime)}</p>
                <p className="text-sm text-foreground/60">{result.destination.city} ({result.destination.code})</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
