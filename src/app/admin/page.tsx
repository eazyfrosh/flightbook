"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Ticket, TrendingUp, Users as UsersIcon, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getAllBookings } from "@/lib/services/bookings";
import { adminUsers } from "@/lib/services/admin";
import { cabinLabel, formatCurrency } from "@/lib/utils";
import type { Booking, UserProfile } from "@/types";

const COLORS = ["#1f83fb", "#f2c265", "#22c55e", "#ef4444", "#a855f7"];

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          {icon}
        </span>
        <div>
          <p className="text-xs text-foreground/50">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminOverviewPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    getAllBookings().then(setBookings);
    adminUsers.list().then(setUsers);
  }, []);

  const confirmedBookings = bookings.filter((b) => b.status !== "cancelled");
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  const cabinData = useMemo(() => {
    const counts: Record<string, number> = {};
    confirmedBookings.forEach((b) => {
      const cabin = b.flights[0]?.cabin ?? "economy";
      counts[cabin] = (counts[cabin] ?? 0) + 1;
    });
    return Object.entries(counts).map(([cabin, count]) => ({ name: cabinLabel(cabin), value: count }));
  }, [confirmedBookings]);

  const routeData = useMemo(() => {
    const counts: Record<string, number> = {};
    confirmedBookings.forEach((b) => {
      const flight = b.flights[0];
      if (!flight) return;
      const route = `${flight.segments[0].originCode}-${flight.segments[flight.segments.length - 1].destinationCode}`;
      counts[route] = (counts[route] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [confirmedBookings]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics overview</h1>
        <p className="mt-1 text-sm text-foreground/60">All figures are derived from simulated demo bookings.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Ticket size={18} />} label="Total bookings" value={String(bookings.length)} />
        <StatCard icon={<Wallet size={18} />} label="Total revenue" value={formatCurrency(totalRevenue)} />
        <StatCard icon={<UsersIcon size={18} />} label="Registered users" value={String(users.length)} />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Avg. booking value"
          value={formatCurrency(confirmedBookings.length ? totalRevenue / confirmedBookings.length : 0)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold">Top routes</h3>
          </CardHeader>
          <CardContent className="h-72">
            {routeData.length === 0 ? (
              <p className="pt-10 text-center text-sm text-foreground/40">No booking data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={routeData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="route" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1f83fb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold">Bookings by cabin</h3>
          </CardHeader>
          <CardContent className="h-72">
            {cabinData.length === 0 ? (
              <p className="pt-10 text-center text-sm text-foreground/40">No booking data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={cabinData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {cabinData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
