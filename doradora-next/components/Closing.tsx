import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Reveal from "./Reveal";
import { FaqAccordion } from "./ui/faq-accordion";

const faqs = [
  {
    q: "Where do my links live?",
    a: "In this browser's own little 4D pocket (localStorage) — no account, no tracking. In production the same service fronts a database with a UNIQUE constraint on the code plus a Redis cache.",
  },
  {
    q: "Why 7 characters for auto codes?",
    a: "Seven Base62 characters give about 3.5 trillion combinations — short enough to say out loud, large enough to stay safe. Because folding raises collision risk, the lab retries with a fresh Snowflake ID whenever a code is taken.",
  },
  {
    q: "What does the Furoshiki timer do?",
    a: "It wraps the link in a TTL: expiresAt on the record and the identical TTL on the cache entry. After unwrapping, the code shows an ‘expired’ notice instead of a stale redirect.",
  },
  {
    q: "What is the 4D Pocket guard?",
    a: "A 1M-entry Bloom filter with ~1% false positives that answers ‘definitely never seen’ without touching the database. Claimed hits are always verified against the store — a guard, never the source of truth.",
  },
  {
    q: "Can I name my own gadget?",
    a: "Yes — 1–16 characters of letters, numbers, _ or -. Taken names raise a clear conflict so nothing is ever overwritten, the way Nobita's homework never should be.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t hairline bg-cloud/70">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <Reveal>
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-dora-deep">
              Asked at the Door
            </p>
            <h2 className="mt-4 font-display text-balance text-4xl font-bold leading-tight sm:text-5xl">
              Questions, <em className="aesthetic-em">answered kindly.</em>
            </h2>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute -left-2 top-1/2 z-10 hidden w-32 -translate-y-1/2 -rotate-6 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-[0_16px_36px_-16px_rgba(11,46,68,0.45)] xl:block"
            >
              <Image src="/dora-wave.jpg" alt="" width={128} height={160} className="h-auto w-full object-cover" />
            </span>
            <span
              aria-hidden
              className="pointer-events-none absolute -right-2 top-1/2 z-10 hidden w-32 -translate-y-1/2 rotate-6 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-[0_16px_36px_-16px_rgba(11,46,68,0.45)] xl:block"
            >
              <Image src="/dorami.jpg" alt="" width={128} height={160} className="h-auto w-full object-cover" />
            </span>
            <FaqAccordion
              title=""
              items={faqs.map((f) => ({ question: f.q, answer: f.a }))}
              className="max-w-3xl"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <Reveal>
        <div className="glass-dark relative overflow-hidden rounded-[32px] px-7 py-14 text-center sm:px-14 sm:py-20">
          <Image
            src="/dora-broom.jpg"
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 768px) 100vw, 1152px"
            className="object-cover object-[70%_center]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-deep/70 via-ink-deep/55 to-ink-deep/80"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(55% 60% at 50% 110%, rgba(255,201,7,0.3), transparent 70%), radial-gradient(30% 30% at 50% 0%, rgba(14,155,214,0.4), transparent 70%)",
            }}
          />
          {/* bell emblem */}
          <div aria-hidden className="relative mx-auto mb-6 h-14 w-14">
            <span className="bell-dot absolute inset-0 rounded-full border-4 border-white/25" />
            <span className="absolute left-1/2 top-full h-3 w-1 -translate-x-1/2 rounded-full bg-white/40" />
          </div>
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.26em] text-bell">
            The finale
          </p>
          <h2 className="relative mx-auto mt-4 max-w-2xl font-display text-balance text-4xl font-bold leading-[1.05] text-white sm:text-6xl">
            Your <em className="aesthetic-em-light">Anywhere Door</em> is waiting.
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-[14px] font-light leading-relaxed text-sky-200/70">
            Push a long link through, name it like a gadget, and share
            something as delightful as where it leads.
          </p>
          <a
            href="#studio"
            className="relative mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-bell px-8 py-4 text-[12.5px] font-bold uppercase tracking-[0.16em] text-ink-deep transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_20px_50px_-16px_rgba(255,201,7,0.55)]"
          >
            Ring the bell <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </Reveal>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t hairline">
      <Image
        src="/dora-footer.jpg"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="object-cover object-center saturate-[1.3] contrast-[1.08]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-white/50" />
      <div className="gold-rule relative" aria-hidden />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <span className="block size-10 overflow-hidden rounded-full border-2 border-white bg-white shadow-md">
            <Image src="/dora-icon.jpg" alt="DoraDoraUrl icon" width={40} height={40} className="h-full w-full object-cover" />
          </span>
          <div>
            <p className="font-display text-2xl font-bold">DoraDoraUrl</p>
            <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-muted-ink">
              Gadget Lab · Snowflake · Base62 · Furoshiki
            </p>
          </div>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            ["Gadget Lab", "#studio"],
            ["Gadgets", "#craft"],
            ["Method", "#method"],
            ["Pocket Rules", "#principles"],
            ["FAQ", "#faq"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="cursor-pointer text-[12px] font-medium uppercase tracking-[0.14em] text-muted-ink transition-colors duration-200 hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>
        <p className="text-[12.5px] text-muted-ink">© 2026 DoraDoraUrl. Powered by dorayaki.</p>
      </div>
    </footer>
  );
}
