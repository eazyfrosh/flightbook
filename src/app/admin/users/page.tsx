"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { adminUsers } from "@/lib/services/admin";
import { formatDateLong } from "@/lib/utils";
import type { UserProfile } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);

  async function load() {
    setUsers(await adminUsers.list());
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleRole(user: UserProfile) {
    const nextRole = user.role === "admin" ? "user" : "admin";
    await adminUsers.save({ ...user, role: nextRole });
    toast.success(`${user.displayName || user.email} is now ${nextRole}`);
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage users</h1>
        <p className="mt-1 text-sm text-foreground/60">{users.length} registered users</p>
      </div>

      <div className="space-y-3">
        {users.length === 0 ? (
          <EmptyState icon={<Users size={22} />} title="No users yet" description="Registered users will appear here." />
        ) : (
          users.map((u) => (
            <Card key={u.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">{u.displayName || u.email}</p>
                  <p className="text-xs text-foreground/50">{u.email} · Joined {formatDateLong(u.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={u.role === "admin" ? "gold" : "neutral"}>{u.role}</Badge>
                  <Button size="sm" variant="outline" onClick={() => toggleRole(u)}>
                    <ShieldCheck size={13} /> {u.role === "admin" ? "Revoke admin" : "Make admin"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
