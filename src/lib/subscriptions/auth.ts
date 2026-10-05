import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
import type { UserRole } from "@/types";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const googleJwks = projectId
  ? createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"))
  : null;

export interface AuthenticatedSubscriber {
  uid: string;
  email: string;
  role: UserRole;
}

async function verifyFirebaseToken(token: string) {
  const failures: string[] = [];
  if (googleJwks && projectId) {
    try {
      const { payload } = await jwtVerify(token, googleJwks, {
        issuer: `https://securetoken.google.com/${projectId}`,
        audience: projectId,
      });
      if (payload.sub) {
        return {
          uid: payload.sub,
          email: typeof payload.email === "string" ? payload.email : "",
        };
      }
    } catch (error) {
      failures.push(`jwks:${error instanceof Error ? error.message : "unknown"}`);
      // Fall through to Firebase Identity Toolkit for a final verification.
    }
  }
  if (!firebaseApiKey) {
    failures.push("identity-toolkit:missing-api-key");
    logRejectedToken(token, failures);
    return null;
  }
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: token }),
    cache: "no-store",
  });
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    failures.push(`identity-toolkit:${response.status}:${message.slice(0, 180)}`);
    logRejectedToken(token, failures);
    return null;
  }
  const payload = await response.json().catch(() => null);
  const user = payload?.users?.[0];
  if (!user?.localId) {
    failures.push("identity-toolkit:missing-user");
    logRejectedToken(token, failures);
    return null;
  }
  return { uid: user.localId as string, email: typeof user.email === "string" ? user.email : "" };
}

function logRejectedToken(token: string, failures: string[]) {
  let claims: { aud?: string | string[]; iss?: string; exp?: number } = {};
  try { claims = decodeJwt(token); } catch { failures.push("decode:invalid-jwt"); }
  console.warn("[subscription-auth] Firebase token rejected", {
    configuredProjectId: projectId ?? null,
    tokenAudience: claims.aud ?? null,
    tokenIssuer: claims.iss ?? null,
    tokenExpiresAt: claims.exp ?? null,
    failures,
  });
}

function resolveRole(email: string): UserRole {
  return email.toLowerCase() === "eazysample@gmail.com" ? "admin" : "user";
}

export async function verifySubscriber(request: Request): Promise<AuthenticatedSubscriber | null> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (projectId) {
    if (!token) return null;
    try {
      const identity = await verifyFirebaseToken(token);
      if (!identity) return null;
      return { ...identity, role: resolveRole(identity.email) };
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
