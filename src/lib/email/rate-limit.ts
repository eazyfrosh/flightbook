import { get, put } from "@vercel/blob";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_SENDS = 5;
const memory = new Map<string, number[]>();

function pathname(userId: string) {
  return `skybook-email-rate-limits/${encodeURIComponent(userId)}.json`;
}

async function readTimestamps(userId: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    return memory.get(userId) ?? [];
  }
  const result = await get(pathname(userId), { access: "private", useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return [];
  const value = await new Response(result.stream).json().catch(() => []);
  return Array.isArray(value) ? value.filter((item): item is number => typeof item === "number") : [];
}

export async function consumeItineraryEmailAllowance(userId: string) {
  const now = Date.now();
  const recent = (await readTimestamps(userId)).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= MAX_SENDS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((recent[0] + WINDOW_MS - now) / 1000));
    return { allowed: false as const, retryAfterSeconds };
  }
  const updated = [...recent, now];
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
    await put(pathname(userId), JSON.stringify(updated), {
      access: "private", addRandomSuffix: false, allowOverwrite: true,
      cacheControlMaxAge: 60, contentType: "application/json",
    });
  } else {
    memory.set(userId, updated);
  }
  return { allowed: true as const, retryAfterSeconds: 0 };
}
