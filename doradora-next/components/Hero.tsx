import {
  ArrowDown,
  Brain,
  DoorOpen,
  Hourglass,
  Package,
  Sparkles,
  Timer,
} from "lucide-react";
import Image from "next/image";
import Reveal from "./Reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 0%, rgba(14,155,214,0.16), transparent 70%), radial-gradient(40% 30% at 85% 20%, rgba(255,201,7,0.16), transparent 70%)",
        }}
      />
      {/* pocket ring accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-16 hidden h-72 w-72 rounded-full border-[22px] border-dora/10 lg:block"
      />
      <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-16 sm:px-8 sm:pt-24">
        <Reveal>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-dora-deep sm:tracking-[0.26em]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Fresh from the 4D pocket · gadget-powered links
          </p>
        </Reveal>
        <Reveal delay={90}>
          <h1 className="mt-6 max-w-3xl font-display text-balance text-[clamp(2.9rem,8vw,5.5rem)] font-bold leading-[1.0] tracking-tight">
            An <em className="aesthetic-em">Anywhere Door</em>
            <br />
            for your links.
          </h1>
        </Reveal>
        <Reveal delay={180}>
          <p className="mt-6 max-w-xl text-[15.5px] font-light leading-[1.75] text-muted-ink">
            Step through with any long URL and come out the other side with a
            short one — Snowflake IDs, Base62 codes, Memory-Bread dedup and
            Time-Furoshiki expiry. Dorayaki optional, delight guaranteed.
          </p>
        </Reveal>
        <Reveal delay={260}>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#studio"
              className="cursor-pointer rounded-full bg-dora px-7 py-3.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-dora-deep hover:shadow-[0_18px_40px_-14px_rgba(14,155,214,0.7)]"
            >
              Open the Anywhere Door
            </a>
            <a
              href="#method"
              className="cursor-pointer rounded-full border hairline bg-white/70 px-7 py-3.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-ink backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-dora/50"
            >
              Peek in the pocket
            </a>
          </div>
        </Reveal>
        <Reveal delay={340}>
          <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t hairline pt-7">
            {[
              { icon: DoorOpen, v: "Anywhere Door", s: "Instant hops" },
              { icon: Brain, v: "Memory Bread", s: "Smart dedup" },
              { icon: Timer, v: "Time Furoshiki", s: "Honest expiry" },
            ].map((f) => (
              <div key={f.s} className="flex items-start gap-3">
                <f.icon className="mt-1 h-4 w-4 flex-none text-dora" aria-hidden />
                <div>
                  <dt className="font-code text-[13px] font-semibold">{f.v}</dt>
                  <dd className="mt-0.5 text-[12px] uppercase tracking-[0.12em] text-muted-ink">{f.s}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Reveal>
        <a
          href="#studio"
          aria-label="Scroll to the gadget lab"
          className="mt-12 inline-flex cursor-pointer items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-ink transition-colors duration-200 hover:text-ink"
        >
          <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden /> Take the Take-copter down
        </a>
      </div>
    </section>
  );
}

const crafts = [
  {
    icon: DoorOpen,
    title: "Anywhere Door hops",
    body: "Every short code opens straight onto its long URL — one click, no maze. Deep links resolve locally and count a bell-ring on arrival.",
    bg: "/dora-wave.jpg",
  },
  {
    icon: Brain,
    title: "Memory Bread dedup",
    body: "Feed the lab a URL it has already memorized and it recalls the same code instead of minting a twin. One URL, one name — like it studied overnight.",
    bg: "/dora-red.jpg",
  },
  {
    icon: Hourglass,
    title: "Time Furoshiki expiry",
    body: "Wrap a link in a TTL and it ages exactly on schedule. Record and cache share the same lifetime, so nothing lingers past its time.",
    bg: "/dorami.jpg",
  },
  {
    icon: Package,
    title: "4D Pocket guard",
    body: "A 1M-entry Bloom filter fronts the store: unknown codes are turned away at the pocket mouth, and every claimed hit is verified inside.",
    bg: "/dora-sleepy.jpg",
  },
];

export function Craft() {
  return (
    <section id="craft" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
      <Reveal>
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-dora-deep">Gadget shelf — the lineup</p>
        <h2 className="mt-4 max-w-xl font-display text-balance text-4xl font-bold leading-tight sm:text-5xl">
          Four gadgets, <em className="aesthetic-em">zero filler.</em>
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {crafts.map((c, i) => (
          <Reveal key={c.title} delay={i * 80}>
            <article className="glass group relative h-full overflow-hidden rounded-3xl p-7 transition-transform duration-200 hover:-translate-y-1 sm:p-8">
              <Image
                src={c.bg}
                alt=""
                aria-hidden
                fill
                sizes="(max-width: 640px) 100vw, 560px"
                className="object-cover"
              />
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-white/85" />
              <div className="relative">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-dora text-white transition-colors duration-200 group-hover:bg-ink">
                <c.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold">{c.title}</h3>
              <p className="mt-2.5 text-[14px] font-light leading-[1.75] text-muted-ink">{c.body}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
