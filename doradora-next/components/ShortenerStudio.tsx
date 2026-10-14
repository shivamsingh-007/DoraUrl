"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  BellRing,
  Check,
  Copy,
  DoorOpen,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import {
  Snowflake,
  ShortCodeConflictError,
  createShortLink,
  isActive,
  shortPathUrlFor,
} from "@/lib/shortener";
import { store } from "@/lib/store";

const worker = new Snowflake(BigInt(Math.floor(Math.random() * 1024)));

function subscribeNoop(): () => void {
  return () => {};
}

function formatExpiry(exp: number | null, now: number): string {
  if (exp === null) return "Furoshiki-free · lives on";
  const ms = exp - now;
  if (ms <= 0) return "Furoshiki unwrapped · expired";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `Unwraps in ${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `Unwraps in ${hrs}h`;
  return `Unwraps in ${Math.round(hrs / 24)}d`;
}

export default function ShortenerStudio() {
  const links = useSyncExternalStore(
    store.subscribe,
    store.getLinksSnapshot,
    store.getLinksServerSnapshot,
  );
  const clicks = useSyncExternalStore(
    store.subscribe,
    store.getClicksSnapshot,
    store.getClicksServerSnapshot,
  );
  const mounted = useSyncExternalStore(
    subscribeNoop,
    store.getMountedSnapshot,
    store.getMountedServerSnapshot,
  );
  const now = useSyncExternalStore(
    store.subscribeTicker,
    store.getTickSnapshot,
    store.getTickServerSnapshot,
  );

  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [ttl, setTtl] = useState("");
  const [notice, setNotice] = useState<{ kind: "ok" | "err" | "info"; text: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  // Error-only listener for #/r/<code> deep links. Successful hops are owned
  // by <DoorRedirect /> (layout-level: pre-hydration script + hashchange),
  // so this effect only surfaces "unknown / expired" notices and never
  // redirects or counts clicks itself — otherwise one hop rings the bell twice.
  useEffect(() => {
    const check = () => {
      const m = window.location.hash.match(/^#\/r\/(.+)$/);
      if (!m) return;
      let code = "";
      try {
        code = decodeURIComponent(m[1]);
      } catch {
        return;
      }
      const hit = store.getLinksSnapshot().find((l) => l.code === code);
      if (!hit) {
        setNotice({ kind: "err", text: `No gadget by the name “${code}”. It may live in another browser's pocket.` });
        return;
      }
      if (hit.expiresAt !== null && Date.now() > hit.expiresAt) {
        setNotice({ kind: "err", text: `The Furoshiki has unwrapped — link “${code}” has expired.` });
      }
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  const stats = {
    total: links.length,
    active: now === 0 ? links.length : links.filter((l) => isActive(l, now)).length,
    clicks,
  };

  async function onShorten(e: React.FormEvent) {
    e.preventDefault();
    const ttlNum = ttl.trim() === "" ? null : parseInt(ttl, 10);
    if (ttl.trim() !== "" && (Number.isNaN(ttlNum) || (ttlNum as number) < 60)) {
      setNotice({ kind: "err", text: "The Furoshiki needs at least 60 seconds, or leave it off." });
      return;
    }
    const longUrl = url.trim();
    // Server-first: minted links resolve in ANY browser/device once the
    // server store is configured. 503 / network failure falls through to
    // the original local-only mode below.
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          longUrl,
          alias: alias.trim() || null,
          ttlSeconds: ttlNum,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { code: string; reused: boolean };
        const nowMs = Date.now();
        const mirrored =
          links.some((l) => l.code === data.code || l.url === longUrl)
            ? links
            : [
                ...links,
                {
                  code: data.code,
                  url: longUrl,
                  createdAt: nowMs,
                  expiresAt:
                    ttlNum !== null && !Number.isNaN(ttlNum)
                      ? nowMs + (ttlNum as number) * 1000
                      : null,
                },
              ];
        store.setLinksStore(mirrored);
        const share = shortPathUrlFor(data.code);
        setNotice({
          kind: data.reused ? "info" : "ok",
          text: data.reused
            ? `Memory Bread remembers — reusing “${data.code}”. Works everywhere: ${share}`
            : `“${data.code}” hopped out of the Door. Works everywhere: ${share}`,
        });
        setUrl("");
        setAlias("");
        return;
      }
      if (res.status !== 503) {
        let msg = "Could not create the link — try again.";
        try {
          const j = (await res.json()) as { message?: unknown };
          if (typeof j?.message === "string") msg = j.message;
        } catch {
          /* keep default */
        }
        setNotice({ kind: "err", text: msg });
        return;
      }
      // 503 NO_STORE → local-only fallback below.
    } catch {
      // Network failure → local-only fallback below.
    }
    try {
      const { links: next, code, reused } = createShortLink(
        links,
        worker,
        longUrl,
        alias || null,
        ttlNum,
      );
      store.setLinksStore(next);
      setNotice({
        kind: reused ? "info" : "ok",
        text: reused
          ? `Memory Bread remembers — reusing “${code}” (this browser only — server store is off).`
          : `“${code}” hopped out of the Door (this browser only — server store is off).`,
      });
      setUrl("");
      setAlias("");
    } catch (err) {
      if (err instanceof ShortCodeConflictError) {
        setNotice({ kind: "err", text: `${err.message}. That gadget name is taken — try another.` });
      } else if (err instanceof Error) {
        setNotice({ kind: "err", text: err.message });
      }
    }
  }

  async function copy(code: string) {
    try {
      // Path-style links resolve everywhere (server) and fall back to the
      // local pocket (RClient) where the server has no record.
      await navigator.clipboard.writeText(shortPathUrlFor(code));
      setCopied(code);
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 1400);
    } catch {
      setNotice({ kind: "err", text: "Copy was blocked by the browser — select the link manually." });
    }
  }

  function reset() {
    store.setLinksStore([]);
    store.setClicksStore(0);
    if (typeof window !== "undefined") window.history.replaceState(null, "", window.location.pathname);
    setNotice({ kind: "info", text: "Pocket emptied. A tidy pocket is a happy pocket." });
    urlRef.current?.focus();
  }

  return (
    <div className="glass-dark overflow-hidden rounded-[28px] text-sky-50">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-9">
        <div className="flex items-center gap-3.5">
          <span aria-hidden className="bell-dot h-9 w-9 flex-none rounded-full border-2 border-white/30" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-bell">
              The Gadget Lab
            </p>
            <h2 className="mt-1 font-display text-balance text-3xl font-bold text-white">
              Open the <em className="aesthetic-em-light">Anywhere Door</em>
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-100/80 transition-colors duration-200 hover:border-white/40 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Empty pocket
        </button>
      </div>

      <form onSubmit={onShorten} className="grid gap-5 px-6 py-7 sm:px-9">
        <div>
          <label htmlFor="long-url" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200/70">
            Long URL — where should the Door lead?
          </label>
          <input
            id="long-url"
            ref={urlRef}
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder="https://example.com/essays/on-dorayaki"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3.5 font-code text-[16px] text-white sm:text-[14px] placeholder:text-sky-200/40 focus:border-bell/60 focus:bg-white/[0.1]"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="alias" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200/70">
              Gadget name <span className="font-normal normal-case tracking-normal text-sky-200/50">— optional alias</span>
            </label>
            <input
              id="alias"
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="dorayaki-run"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3.5 font-code text-[16px] text-white sm:text-[14px] placeholder:text-sky-200/40 focus:border-bell/60 focus:bg-white/[0.1]"
            />
          </div>
          <div>
            <label htmlFor="ttl" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200/70">
              Furoshiki timer <span className="font-normal normal-case tracking-normal text-sky-200/50">— TTL seconds, optional</span>
            </label>
            <input
              id="ttl"
              type="number"
              min={60}
              step={1}
              placeholder="3600"
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3.5 font-code text-[16px] text-white sm:text-[14px] placeholder:text-sky-200/40 focus:border-bell/60 focus:bg-white/[0.1]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-bell px-6 py-4 text-[13px] font-bold uppercase tracking-[0.16em] text-ink-deep transition-all duration-200 hover:-translate-y-px hover:bg-white hover:shadow-[0_18px_44px_-16px_rgba(255,201,7,0.6)] active:translate-y-0"
        >
          <DoorOpen className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" aria-hidden />
          Open the Anywhere Door
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
        </button>

        <div aria-live="polite" className="min-h-6 text-[13.5px] leading-relaxed">
          {notice && (
            <p
              className={
                notice.kind === "err"
                  ? "text-red-300"
                  : notice.kind === "ok"
                    ? "text-emerald-300"
                    : "text-bell-soft"
              }
            >
              {notice.text}
            </p>
          )}
        </div>

        <dl className="grid grid-cols-3 gap-3">
          {[
            { v: stats.total, l: "Gadgets" },
            { v: stats.clicks, l: "Bell rings" },
            { v: stats.active, l: "In pocket" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-center">
              <dt className="order-2 mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-200/60">
                {s.l}
              </dt>
              <dd className="tnum font-display text-3xl font-bold text-white">{s.v}</dd>
            </div>
          ))}
        </dl>
      </form>

      <div className="border-t border-white/10 px-6 py-6 sm:px-9">
        <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200/60">
          <BellRing className="h-3.5 w-3.5" aria-hidden /> Fresh from the pocket
        </h3>
        {!mounted ? (
          <p className="mt-3 text-sm text-sky-200/50">Reaching into the pocket…</p>
        ) : links.length === 0 ? (
          <p className="mt-3 max-w-md text-sm leading-relaxed text-sky-200/60">
            The pocket is empty. Send a long URL through the Door above — it will
            be kept in this browser, bell rings and all.
          </p>
        ) : (
          <ul className="mt-4 flex max-h-72 flex-col gap-2.5 overflow-auto pr-1">
            {[...links].reverse().map((l) => (
              <li
                key={l.code}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-3 transition-colors duration-200 hover:border-bell/40 hover:bg-white/[0.08]"
              >
                <a
                  href={`/r/${encodeURIComponent(l.code)}`}
                  title={`Step through (counts a bell ring)`}
                  className="flex cursor-pointer items-center gap-1.5 font-code text-[13px] font-semibold text-bell-soft hover:text-white"
                >
                  {l.code}
                  <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
                </a>
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-sky-200/60" title={l.url}>
                  {l.url} · {formatExpiry(l.expiresAt, now)}
                </span>
                <button
                  type="button"
                  onClick={() => copy(l.code)}
                  className="flex flex-none cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-sky-50 transition-colors duration-200 hover:border-bell hover:bg-bell hover:text-ink-deep"
                >
                  {copied === l.code ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                  {copied === l.code ? "Copied" : "Copy"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
