import { createRemoteJWKSet, jwtVerify } from "jose";
import { adminAuth, adminDb, isAdminFirebaseConfigured } from "@/lib/firebase/admin";
import type { UserRole } from "@/types";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const googleJwks = projectId
  ? createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"))
  : null;

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
  if (!googleJwks || !projectId) return null;
  const { payload } = await jwtVerify(token, googleJwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  if (!payload.sub) return null;
  return { uid: payload.sub, email: typeof payload.email === "string" ? payload.email : "" };
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
