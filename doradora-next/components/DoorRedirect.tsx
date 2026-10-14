"use client";

import { useEffect, useState } from "react";
import { store } from "@/lib/store";

/**
 * Global deep-link handler. Mounted once in the root layout so `#/r/<code>`
 * redirects work on a cold load — previously the only resolver lived inside
 * ShortenerStudio, which is gated behind the "Small Light" button. Opening a
 * short link therefore landed on the homepage and only hopped after the user
 * manually opened the lab (the reported "stays on the site + slow" bug).
 *
 * This runs on mount AND on every hashchange, resolves synchronously, bumps
 * the bell counter once, and leaves via window.location.replace (no history
 * entry, no render pass). Unknown/expired codes are left alone so the studio
 * can surface its friendly error notice.
 */
export default function DoorRedirect() {
  // Shown while the destination loads: the old page stays painted until the
  // new one arrives, so without this the hop feels stuck on our site.
  const [hopping, setHopping] = useState(false);

  useEffect(() => {
    const resolve = () => {
      const m = window.location.hash.match(/^#\/r\/(.+)$/);
      if (!m) return;
      let code = "";
      try {
        code = decodeURIComponent(m[1]);
      } catch {
        return;
      }
      const hit = store.getLinksSnapshot().find((l) => l.code === code);
      if (!hit) return;
      if (hit.expiresAt !== null && Date.now() > hit.expiresAt) return;
      store.setClicksStore(store.getClicksSnapshot() + 1);
      // Paint the overlay first so it covers the destination-load gap, then
      // leave on the next frame (no setState-in-effect: this runs in an event
      // callback, and the page unloads right after).
      setHopping(true);
      requestAnimationFrame(() => window.location.replace(hit.url));
    };
    resolve();
    window.addEventListener("hashchange", resolve);
    return () => window.removeEventListener("hashchange", resolve);
  }, []);

  if (!hopping) return null;
  return (
    <div
      role="status"
      aria-label="Opening the Anywhere Door"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center gap-2.5 bg-sky text-ink"
    >
      <p className="text-[12px] font-bold uppercase tracking-[0.22em] opacity-65">
        Opening the Anywhere Door
      </p>
      <p className="text-[14px] opacity-55">Hopping to your link…</p>
    </div>
  );
}
