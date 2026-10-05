"use client";

import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import { getOne } from "@/lib/services/store";
import type { UserProfile } from "@/types";

const DEMO_SESSION_KEY = "skybook_demo_session";

export async function getSubscriptionAuthHeaders(): Promise<Record<string, string>> {
  if (isFirebaseConfigured && auth?.currentUser) {
    return { Authorization: `Bearer ${await auth.currentUser.getIdToken()}` };
  }
  if (typeof window === "undefined") return {};
  const uid = window.localStorage.getItem(DEMO_SESSION_KEY);
  if (!uid) return {};
  const profile = await getOne<UserProfile>("users", uid);
  return { "x-demo-uid": uid, "x-demo-email": profile?.email ?? "" };
}
