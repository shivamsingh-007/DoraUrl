import {
  ArrowUpRight,
  Binary,
  Clock3,
  DatabaseZap,
  Hash,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Reveal from "./Reveal";

const steps = [
  {
    n: "01",
    icon: Clock3,
    title: "Snowflake ID",
    gadget: "Sewn by the Time Furoshiki",
    code: "(ts − epoch) << 22 | worker << 12 | seq",
    body: "A 64-bit, time-ordered identity. Worker IDs are range-checked 0–1023, the clock is guarded against moving backwards, and 16k concurrent IDs stay unique.",
    bg: "/dora-nap.jpg",
  },
  {
    n: "02",
    icon: Binary,
    title: "Base62 code",
    gadget: "Folded pocket-size",
    code: "encode(id) → [0-9A-Za-z]",
    body: "BigInt-safe encoding — never Number — so large IDs keep their precision. Auto codes take the last 7 characters with retry-on-collision.",
    bg: "/dora-run.jpg",
  },
  {
    n: "03",
    icon: Hash,
    title: "Alias or mint",
    gadget: "Named with Memory Bread",
    code: "alias ? reserve : generate",
    body: "Your gadget name is validated and reserved behind a uniqueness check; duplicates raise a conflict instead of silently overwriting.",
    bg: "/dorayaki.jpg",
  },
  {
    n: "04",
    icon: DatabaseZap,
    title: "Store, cache, pocket",
    gadget: "Filed in the 4D Pocket",
    code: "record + ttl cache + bloom.put(code)",
    body: "The record carries createdAt and expiresAt; the cache TTL mirrors it exactly. The Bloom filter learns each code for cheap negative lookups.",
    bg: "/dora-red.jpg",
  },
];

export function Method() {
  return (
    <section id="method" className="scroll-mt-20 border-y hairline bg-cloud/70">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-dora-deep">
            Inside the pocket — the method
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-balance text-4xl font-bold leading-tight sm:text-5xl">
            Four small steps <em className="aesthetic-em">through the Door.</em>
          </h2>
        </Reveal>
        <ol className="mt-10 grid gap-5 md:grid-cols-2">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 80} as="li">
              <article className="relative h-full overflow-hidden rounded-3xl border hairline bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(11,124,176,0.4)] sm:p-8">
                <Image
                  src={s.bg}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(max-width: 768px) 100vw, 560px"
                  className="object-cover"
                />
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-white/85" />
                <div className="relative">
                <span className="font-display text-[13px] font-bold text-dora">{s.n}</span>
                <span className="absolute right-7 top-7 flex h-10 w-10 items-center justify-center rounded-full bg-sky text-dora-deep">
                  <s.icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                <h3 className="mt-2 font-display text-2xl font-bold">{s.title}</h3>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-dorayaki">{s.gadget}</p>
                <p className="mt-2 inline-block rounded-lg bg-ink px-3 py-1.5 font-code text-[11.5px] text-bell-soft">
                  {s.code}
                </p>
                <p className="mt-3 text-[14px] font-light leading-[1.75] text-muted-ink">{s.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

const principles = [
  {
    icon: ShieldCheck,
    title: "Check the worker's badge",
    body: "Ten bits means 0–1023. Anything else is turned away at the Door — never silently overflows into the timestamp.",
  },
  {
    icon: Clock3,
    title: "No time travel",
    body: "If the clock moves backwards, ID minting stops instead of duplicating. Doraemon respects the timeline.",
  },
  {
    icon: Binary,
    title: "Never fold blindly",
    body: "Careless truncation destroyed uniqueness and could crash. Full codes by default; shortened only with collision retries.",
  },
  {
    icon: DatabaseZap,
    title: "Cache what you promise",
    body: "The cache TTL is cut from the same Furoshiki as the record — no stale ghosts lingering after expiry.",
  },
];

export function Principles() {
  return (
    <section id="principles" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
      <Reveal>
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-dora-deep">
          Pocket rules — lessons, kept
        </p>
        <h2 className="mt-4 max-w-2xl font-display text-balance text-4xl font-bold leading-tight sm:text-5xl">
          Ten compiler scoldings, five design traps — now <em className="aesthetic-em">house rules.</em>
        </h2>
        <p className="mt-4 max-w-xl text-[14.5px] font-light leading-[1.75] text-muted-ink">
          Every rule below was earned debugging the original Java service. They
          hang by the Door so the lab never repeats them.
        </p>
      </Reveal>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {principles.map((p, i) => (
          <Reveal key={p.title} delay={i * 80}>
            <article className="flex h-full gap-4 rounded-3xl border hairline bg-white/70 p-6 backdrop-blur transition-transform duration-200 hover:-translate-y-1 sm:p-7">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border hairline bg-sky">
                <p.icon className="h-4.5 w-4.5 text-dora" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-[22px] font-bold leading-snug">{p.title}</h3>
                <p className="mt-1.5 text-[13.5px] font-light leading-[1.7] text-muted-ink">{p.body}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <Reveal delay={120}>
        <a
          href="#studio"
          className="group mt-8 inline-flex cursor-pointer items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-dora-deep transition-colors duration-200 hover:text-ink"
        >
          Try the lab with these rules live
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </a>
      </Reveal>
    </section>
  );
}
