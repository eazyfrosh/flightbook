import { adminAuth, adminDb, isAdminFirebaseConfigured } from "@/lib/firebase/admin";
import type { UserRole } from "@/types";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export interface AuthenticatedSubscriber {
  uid: string;
  email: string;
  role: UserRole;
}

async function verifyFirebaseToken(token: string) {
  if (isAdminFirebaseConfigured && adminAuth) {
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? "" };
  }
  if (!firebaseApiKey) return null;
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: token }),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload = await response.json().catch(() => null);
  const user = payload?.users?.[0];
  if (!user?.localId) return null;
  return { uid: user.localId as string, email: typeof user.email === "string" ? user.email : "" };
}

async function resolveRole(uid: string): Promise<UserRole> {
  if (!adminDb) return "user";
  const profile = await adminDb.collection("users").doc(uid).get();
  return profile.data()?.role === "admin" ? "admin" : "user";
}

export async function verifySubscriber(request: Request): Promise<AuthenticatedSubscriber | null> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (projectId) {
    if (!token) return null;
    try {
      const identity = await verifyFirebaseToken(token);
      if (!identity) return null;
      return { ...identity, role: await resolveRole(identity.uid) };
    } catch {
      return null;
    }
  }

  const uid = request.headers.get("x-demo-uid");
  if (!uid) return null;
  return {
    uid,
    email: request.headers.get("x-demo-email") ?? "",
    role: uid === "demo-admin-uid" ? "admin" : "user",
  };
}
