"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";

/** Client half of /r/<code>: localStorage lookup + instant hop. */
export default function RClient({ code }: { code: string }) {
  // Derive the outcome synchronously on mount (no setState-in-effect):
  // the effect below only performs the external navigation.
  const [state] = useState<"hopping" | "missing" | "expired">(() => {
    if (typeof window === "undefined") return "hopping";
    let needle = code;
    try {
      needle = decodeURIComponent(code);
    } catch {
      /* keep raw */
    }
    const hit = store.getLinksSnapshot().find((l) => l.code === needle);
    if (!hit) return "missing";
    if (hit.expiresAt !== null && Date.now() > hit.expiresAt) return "expired";
    return "hopping";
  });

  useEffect(() => {
    if (state !== "hopping") return;
    let needle = code;
    try {
      needle = decodeURIComponent(code);
    } catch {
      /* keep raw */
    }
    const hit = store.getLinksSnapshot().find((l) => l.code === needle);
    if (!hit) return;
    if (hit.expiresAt !== null && Date.now() > hit.expiresAt) return;
    store.setClicksStore(store.getClicksSnapshot() + 1);
    window.location.replace(hit.url);
  }, [code, state]);

  if (state === "hopping") {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-24 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dora-deep">
          Opening the Anywhere Door…
        </p>
        <p className="mt-3 font-code text-sm text-muted-ink">Hopping to “{code}”.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dora-deep">
        {state === "missing" ? "No such gadget" : "Furoshiki unwrapped"}
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold">
        {state === "missing" ? `No gadget by the name “${code}”.` : `Link “${code}” has expired.`}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-ink">
        {state === "missing"
          ? "It may live in another browser's pocket — short links are kept in the browser that made them."
          : "The Time Furoshiki has unwrapped this one. Mint a fresh link back home."}
      </p>
      <Link
        href="/"
        className="mt-7 rounded-full bg-dora px-7 py-3.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-white transition-all hover:-translate-y-0.5 hover:bg-dora-deep"
      >
        Back to the lab
      </Link>
    </main>
  );
}
