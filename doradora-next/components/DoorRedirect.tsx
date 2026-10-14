"use client";

import { useEffect } from "react";
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
      window.location.replace(hit.url);
    };
    resolve();
    window.addEventListener("hashchange", resolve);
    return () => window.removeEventListener("hashchange", resolve);
  }, []);

  return null;
}
