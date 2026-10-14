/* Server-side link store on Upstash Redis / Vercel KV via plain REST fetch.
 * No SDK needed: GET {url}/get|set|incr/... with `Authorization: Bearer`.
 * ONLY import from server components and route handlers — never from client.
 * When no credentials are configured every helper degrades to null/false and
 * the app falls back to its original localStorage-only mode.
 */

export interface StoredLink {
  url: string;
  createdAt: number;
  expiresAt: number | null;
}

const KEY_PREFIX = "dora:url:";
const BYURL_PREFIX = "dora:byurl:";
const CLICKS_PREFIX = "dora:clicks:";

function creds(): { url: string; token: string } | null {
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

export function isServerStoreEnabled(): boolean {
  return creds() !== null;
}

async function call<T>(path: string): Promise<T | null> {
  const c = creds();
  if (!c) return null;
  try {
    const res = await fetch(`${c.url}${path}`, {
      headers: { Authorization: `Bearer ${c.token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { result?: T };
    return body.result ?? null;
  } catch {
    return null;
  }
}

function byUrlKey(url: string): string {
  // Raw URL as key suffix (URL-encoded at call time). Redis handles long
  // keys fine, and this avoids hashing dependencies on any runtime.
  return BYURL_PREFIX + url;
}

function parseRecord(raw: unknown): StoredLink | null {
  try {
    const rec =
      typeof raw === "string" ? (JSON.parse(raw) as StoredLink) : (raw as StoredLink);
    if (!rec || typeof rec.url !== "string") return null;
    if (rec.expiresAt !== null && Date.now() > rec.expiresAt) return null;
    return rec;
  } catch {
    return null;
  }
}

export async function getLinkRecord(code: string): Promise<StoredLink | null> {
  if (!creds()) return null;
  const raw = await call<unknown>(`/get/${encodeURIComponent(KEY_PREFIX + code)}`);
  if (raw === null || raw === undefined) return null;
  return parseRecord(raw);
}

export async function findCodeByUrl(url: string): Promise<string | null> {
  if (!creds()) return null;
  const code = await call<string>(`/get/${encodeURIComponent(byUrlKey(url))}`);
  if (!code) return null;
  // The mapping may outlive the record (Redis TTL removed it): verify.
  const rec = await getLinkRecord(code);
  return rec ? code : null;
}

/** SET NX (+EX on TTL). True when the code was claimed, false on conflict. */
export async function claimCode(
  code: string,
  rec: StoredLink,
  ttlSeconds: number | null,
): Promise<boolean> {
  if (!creds()) return false;
  const value = encodeURIComponent(JSON.stringify(rec));
  const opts =
    ttlSeconds !== null ? `?nx=true&ex=${ttlSeconds}` : "?nx=true";
  const result = await call<string>(
    `/set/${encodeURIComponent(KEY_PREFIX + code)}/${value}${opts}`,
  );
  return result === "OK";
}

export async function rememberUrl(url: string, code: string): Promise<void> {
  if (!creds()) return;
  await call<string>(
    `/set/${encodeURIComponent(byUrlKey(url))}/${encodeURIComponent(code)}?nx=true`,
  );
}

export async function countServerClick(code: string): Promise<void> {
  if (!creds()) return;
  await call<number>(`/incr/${encodeURIComponent(CLICKS_PREFIX + code)}`);
}
