/* DoraDoraUrl core — TypeScript port of DoraDoraUrl.java.
 * Snowflake IDs (10-bit worker, 12-bit sequence) + Base62 + TTL.
 * BigInt is used throughout: Snowflake IDs exceed Number.MAX_SAFE_INTEGER,
 * so Number % 62 would lose precision and cause code collisions.
 * Note: BigInt() calls (not `n` literals) keep this valid on any TS target.
 */

export const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const ZERO = BigInt(0);
const ONE = BigInt(1);

export const EPOCH = BigInt(1700000000000);
export const WORKER_BITS = BigInt(10);
export const SEQUENCE_BITS = BigInt(12);
export const MAX_WORKER_ID = (ONE << WORKER_BITS) - ONE; // 1023
const MAX_SEQUENCE = (ONE << SEQUENCE_BITS) - ONE;

export interface ShortLink {
  code: string;
  url: string;
  createdAt: number;
  expiresAt: number | null;
}

export function encodeBase62(value: bigint): string {
  if (value === ZERO) return "0";
  const base = BigInt(62);
  let v = value;
  let out = "";
  while (v > ZERO) {
    out = ALPHABET[Number(v % base)] + out;
    v = v / base;
  }
  return out;
}

/** Snowflake generator mirroring the Java implementation, with range + clock guards. */
export class Snowflake {
  private sequence = ZERO;
  private lastTimestamp = BigInt(-1);

  constructor(private readonly workerId: bigint) {
    if (workerId < ZERO || workerId > MAX_WORKER_ID) {
      throw new RangeError(`workerId must be 0..${MAX_WORKER_ID}, got ${workerId}`);
    }
  }

  nextId(now: number = Date.now()): bigint {
    let ts = BigInt(now);
    if (ts < this.lastTimestamp) {
      throw new Error("Clock moved backwards. Refusing to generate id.");
    }
    if (ts === this.lastTimestamp) {
      this.sequence = (this.sequence + ONE) & MAX_SEQUENCE;
      if (this.sequence === ZERO) {
        let t = BigInt(Date.now());
        while (t <= this.lastTimestamp) t = BigInt(Date.now());
        ts = t;
      }
    } else {
      this.sequence = ZERO;
    }
    this.lastTimestamp = ts;
    return (
      ((ts - EPOCH) << (WORKER_BITS + SEQUENCE_BITS)) |
      (this.workerId << SEQUENCE_BITS) |
      this.sequence
    );
  }
}

export function isValidUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidAlias(alias: string): boolean {
  return /^[0-9A-Za-z_-]{1,16}$/.test(alias);
}

/**
 * Auto codes use the last 7 chars of Base62(Snowflake-id).
 * Truncation raises collision risk vs the full code, so callers
 * must retry with a fresh id on collision (see createShortLink).
 */
export function generateCode(
  snowflake: Snowflake,
  taken: (code: string) => boolean,
): string {
  for (let i = 0; i < 20; i++) {
    const full = encodeBase62(snowflake.nextId());
    const code = full.length > 7 ? full.slice(-7) : full;
    if (!taken(code)) return code;
  }
  const fallback = encodeBase62(BigInt(Date.now()) * BigInt(1000) + BigInt(Math.floor(Math.random() * 1000)));
  return fallback.length > 7 ? fallback.slice(-7) : fallback;
}

export class ShortCodeConflictError extends Error {
  constructor(code: string) {
    super(`Code already taken: ${code}`);
    this.name = "ShortCodeConflictError";
  }
}

export function createShortLink(
  links: ShortLink[],
  snowflake: Snowflake,
  longUrl: string,
  alias: string | null,
  ttlSeconds: number | null,
  now: number = Date.now(),
): { links: ShortLink[]; code: string; reused: boolean } {
  const url = longUrl.trim();
  if (!url || !isValidUrl(url)) {
    throw new Error("Please enter a valid http(s) URL.");
  }
  const existing = links.find((l) => l.url === url);
  if (existing) return { links, code: existing.code, reused: true };

  const cleanAlias = alias?.trim() ?? "";
  let code: string;
  if (cleanAlias) {
    if (!isValidAlias(cleanAlias)) {
      throw new Error("Alias must be 1–16 chars: letters, numbers, _ or -.");
    }
    code = cleanAlias;
  } else {
    code = generateCode(snowflake, (c) => links.some((l) => l.code === c));
  }

  if (links.some((l) => l.code === code)) {
    throw new ShortCodeConflictError(code);
  }

  const record: ShortLink = {
    code,
    url,
    createdAt: now,
    expiresAt:
      ttlSeconds !== null && !Number.isNaN(ttlSeconds) ? now + ttlSeconds * 1000 : null,
  };
  return { links: [...links, record], code, reused: false };
}

export function isActive(link: ShortLink, now: number = Date.now()): boolean {
  return link.expiresAt === null || now < link.expiresAt;
}

const STORE_KEY = "doradora_links_v2";
const CLICKS_KEY = "doradora_clicks_v2";

export function loadLinks(): ShortLink[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ShortLink[]) : [];
  } catch {
    return [];
  }
}

export function saveLinks(links: ShortLink[]): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(links));
  } catch {
    /* storage full or private mode — keep in-memory */
  }
}

export function loadClicks(): number {
  const n = parseInt(localStorage.getItem(CLICKS_KEY) ?? "0", 10);
  return Number.isNaN(n) ? 0 : n;
}

export function saveClicks(n: number): void {
  try {
    localStorage.setItem(CLICKS_KEY, String(n));
  } catch {
    /* ignore */
  }
}

/** Short URLs resolve locally: <page-url>/#/r/code — works on any host. */
export function shortUrlFor(code: string): string {
  const url = new URL(window.location.href);
  url.hash = "";
  url.search = "";
  const base = url.toString().replace(/\/$/, "");
  return `${base}/#/r/${encodeURIComponent(code)}`;
}
