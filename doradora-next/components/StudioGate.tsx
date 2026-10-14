"use client";

import { useEffect, useRef, useState } from "react";
import { Flashlight, FlashlightOff } from "lucide-react";
import Image from "next/image";
import ShortenerStudio from "./ShortenerStudio";
import Reveal from "./Reveal";

function isDoorHash(): boolean {
  return typeof window !== "undefined" && /^#\/r\/.+$/.test(window.location.hash);
}

export default function StudioGate() {
  // Deep links (#/r/<code>) auto-open the lab so unknown/expired codes show
  // their error notice instead of stranding the user on the homepage.
  // (Valid codes redirect away via DoorRedirect before this matters.)
  const [open, setOpen] = useState<boolean>(isDoorHash);
  const labRef = useRef<HTMLDivElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onHash = () => {
      if (isDoorHash()) setOpen(true);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function shine() {
    setOpen(true);
    requestAnimationFrame(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      labRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  }

  function putAway() {
    setOpen(false);
    requestAnimationFrame(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gateRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
  }

  return (
    <section id="studio" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 pb-4 sm:px-8">
      {!open ? (
        <Reveal>
          <div
            ref={gateRef}
            className="glass relative overflow-hidden rounded-[28px] px-7 py-12 text-center sm:px-14 sm:py-16"
          >
            {/* lineup backdrop — box only */}
            <Image
              src="/dora-lineup.jpg"
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 768px) 100vw, 1152px"
              className="object-cover object-center"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-white/80"
            />
            {/* small-light beam */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "conic-gradient(from 200deg at 50% -20%, rgba(255,201,7,0.28), transparent 30%), radial-gradient(50% 45% at 50% 0%, rgba(14,155,214,0.14), transparent 70%)",
              }}
            />
            <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-bell">
              <Flashlight className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="relative mx-auto mt-5 max-w-xl font-display text-balance text-3xl font-bold leading-tight sm:text-4xl">
              Got a long link? Shrink it with the <em className="aesthetic-em">Small Light.</em>
            </h2>
            <p className="relative mx-auto mt-3 max-w-md break-all font-code text-[12.5px] leading-relaxed text-muted-ink">
              https://example.com/a/very/long/path/you-do-not-want-to-share
              <span aria-hidden className="mx-2 text-dora">→</span>
              <span className="font-semibold text-dora-deep">dora.ly/7chars</span>
            </p>
            <button
              type="button"
              onClick={shine}
              aria-expanded={open}
              aria-controls="gadget-lab"
              className="relative mt-7 inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-bell px-8 py-4 text-[12.5px] font-bold uppercase tracking-[0.16em] text-ink-deep transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink hover:text-bell hover:shadow-[0_20px_50px_-16px_rgba(11,46,68,0.55)]"
            >
              <Flashlight className="h-4 w-4" aria-hidden />
              Use Small Light to Make Short URL
            </button>
          </div>
        </Reveal>
      ) : (
        <div ref={labRef} id="gadget-lab" className="lab-enter scroll-mt-24">
          <ShortenerStudio />
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={putAway}
              className="inline-flex cursor-pointer items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-ink transition-colors duration-200 hover:text-ink"
            >
              <FlashlightOff className="h-3.5 w-3.5" aria-hidden />
              Put the Small Light away
            </button>
          </div>
        </div>
      )}
      <p className="mt-4 text-center text-[12px] uppercase tracking-[0.18em] text-muted-ink">
        Snowflake IDs · Base62 · Furoshiki TTL · Pocket guard — running entirely in your browser
      </p>
    </section>
  );
}
