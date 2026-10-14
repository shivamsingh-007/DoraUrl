import { NextResponse } from "next/server";
import {
  Snowflake,
  encodeBase62,
  isValidAlias,
  isValidUrl,
} from "@/lib/shortener";
import {
  claimCode,
  findCodeByUrl,
  isServerStoreEnabled,
  rememberUrl,
  type StoredLink,
} from "@/lib/server-store";

/**
 * POST /api/links { longUrl, alias?, ttlSeconds? }
 * Server-backed creation so short links resolve in ANY browser/device.
 * 503 NO_STORE when Redis/KV isn't configured (client falls back to local).
 */
export async function POST(req: Request) {
  if (!isServerStoreEnabled()) {
    return NextResponse.json(
      { error: "NO_STORE", message: "Server store is not configured." },
      { status: 503 },
    );
  }

  let body: { longUrl?: unknown; alias?: unknown; ttlSeconds?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const longUrl = typeof body.longUrl === "string" ? body.longUrl.trim() : "";
  if (!longUrl || longUrl.length > 2048 || !isValidUrl(longUrl)) {
    return NextResponse.json(
      { error: "BAD_URL", message: "Please enter a valid http(s) URL." },
      { status: 400 },
    );
  }

  const alias = typeof body.alias === "string" ? body.alias.trim() : "";
  let ttl: number | null = null;
  if (body.ttlSeconds !== null && body.ttlSeconds !== undefined) {
    const n =
      typeof body.ttlSeconds === "number"
        ? body.ttlSeconds
        : parseInt(String(body.ttlSeconds), 10);
    if (!Number.isFinite(n) || n < 60) {
      return NextResponse.json(
        {
          error: "BAD_TTL",
          message: "The Furoshiki needs at least 60 seconds, or leave it off.",
        },
        { status: 400 },
      );
    }
    ttl = Math.floor(n);
  }

  const now = Date.now();
  const existing = await findCodeByUrl(longUrl);
  if (existing) {
    return NextResponse.json({ code: existing, reused: true });
  }

  const snow = new Snowflake(BigInt(Math.floor(Math.random() * 1024)));
  const makeRecord = (): StoredLink => ({
    url: longUrl,
    createdAt: now,
    expiresAt: ttl !== null ? now + ttl * 1000 : null,
  });

  if (alias) {
    if (!isValidAlias(alias)) {
      return NextResponse.json(
        {
          error: "BAD_ALIAS",
          message: "Alias must be 1–16 chars: letters, numbers, _ or -.",
        },
        { status: 400 },
      );
    }
    const ok = await claimCode(alias, makeRecord(), ttl);
    if (!ok) {
      return NextResponse.json(
        {
          error: "CONFLICT",
          message: `Code already taken: ${alias}. That gadget name is taken — try another.`,
        },
        { status: 409 },
      );
    }
    await rememberUrl(longUrl, alias);
    return NextResponse.json({ code: alias, reused: false });
  }

  // Auto codes: last 7 of Base62(Snowflake-id), fresh id per collision —
  // same scheme as the local generator, claimed atomically via SET NX.
  for (let i = 0; i < 20; i++) {
    const full = encodeBase62(snow.nextId());
    const code = full.length > 7 ? full.slice(-7) : full;
    if (await claimCode(code, makeRecord(), ttl)) {
      await rememberUrl(longUrl, code);
      return NextResponse.json({ code, reused: false });
    }
  }
  return NextResponse.json(
    { error: "BUSY", message: "The pocket is jammed — try again." },
    { status: 503 },
  );
}
