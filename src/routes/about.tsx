import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Award, Cpu, Globe, Leaf, Quote, Sparkles, Users, Waves } from "lucide-react";
import { LogoMark } from "@/components/site/Logo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — PULSE" },
      { name: "description", content: "PULSE Audio Labs designs premium wireless earbuds engineered for sound purists." },
      { property: "og:title", content: "About — PULSE" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px]"
        style={{
          background:
            "radial-gradient(900px 460px at 50% 0%, oklch(0.65 0.24 25 / 0.20), transparent 60%)",
        }}
      />
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
        <div className="flex items-center gap-3">
          <LogoMark size={28} animated />
          <div className="mono text-accent">— Our story</div>
        </div>
        <h1 className="mt-4 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
          We build sound<br />
          you can <span className="shimmer-text">almost touch</span>.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          PULSE was founded in 2021 by a small group of engineers, audiophiles
          and industrial designers obsessed with one idea: the most personal
          piece of technology you own should feel like it. Today we ship to
          40+ countries and power the daily commute of 2M+ listeners.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {["Made in India", "Carbon-neutral shipping", "2-year warranty", "24×7 support"].map((t) => (
            <span key={t} className="mono rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-[10px] uppercase text-accent">
              {t}
            </span>
          ))}
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["2M+", "Listeners"],
            ["40+", "Countries"],
            ["150", "Products"],
            ["4.8★", "Avg. rating"],
          ].map(([k, v]) => (
            <div key={v} className="group rounded-2xl border border-border/60 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-accent/50">
              <dt className="font-display text-3xl font-bold text-accent transition-transform group-hover:scale-105">{k}</dt>
              <dd className="mono mt-1 text-[10px] uppercase text-muted-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mono text-accent">— What drives us</div>
        <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">Four pillars.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [Cpu, "Engineering", "8 acoustic patents and counting — in-house DSP, custom drivers, hybrid ANC arrays."],
          [Award, "Awards", "iF Design, Red Dot, EISA and CES Innovation winners three years running."],
          [Globe, "Global", "Shipping to 40+ countries. Local warranty support in 12 languages."],
          [Leaf, "Sustainability", "100% recycled aluminium. Carbon-neutral packaging by 2026."],
        ].map(([Ico, t, d]) => {
          const Icon = Ico as typeof Cpu;
          return (
            <div key={t as string} className="group rounded-2xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent/50">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent transition-transform group-hover:scale-110">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{t as string}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{d as string}</p>
            </div>
          );
        })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mono text-accent">— Milestones</div>
        <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">A short history.</h2>
        <div className="mt-10 grid gap-8 lg:grid-cols-4">
        {[
          ["2021", "Founded in Stockholm with a single product and a big idea."],
          ["2023", "Series 02 ships — sells out in 72 hours across 20 markets."],
          ["2025", "150-product catalogue partnership with 25 iconic audio brands."],
          ["2026", "Series 03 redefines transparent design with hybrid adaptive ANC."],
        ].map(([y, t]) => (
          <div key={y} className="relative rounded-2xl border border-border/60 bg-card p-6">
            <div className="absolute -top-3 left-6 rounded-full border border-accent bg-background px-2.5 py-0.5 mono text-[10px] text-accent">
              MILESTONE
            </div>
            <div className="font-display text-4xl font-bold text-accent">{y}</div>
            <p className="mt-3 text-sm text-muted-foreground">{t}</p>
          </div>
        ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mono text-accent">— From lab to ear</div>
        <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">How we build a PULSE product.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {[
            ["01", "Listen", "300+ hours of user interviews across commuters, athletes and studio pros."],
            ["02", "Prototype", "In-house acoustic chamber. 40+ driver revisions before a housing is frozen."],
            ["03", "Tune", "Golden-ear panels in Bengaluru, Tokyo and Berlin refine the signature."],
            ["04", "Test", "IP-rated drops, 500-hour battery cycling, sweat and salt-spray."],
            ["05", "Ship", "Carbon-neutral logistics, unboxing tuned for that first-listen moment."],
          ].map(([n, t, d]) => (
            <div key={n} className="group relative rounded-2xl border border-border/60 bg-card p-5 transition-all hover:-translate-y-1 hover:border-accent/50">
              <div className="mono text-[10px] text-accent">STEP {n}</div>
              <div className="mt-2 font-display text-lg font-bold">{t}</div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{d}</p>
              <div className="absolute right-4 top-4 font-display text-3xl font-bold text-accent/10 transition-colors group-hover:text-accent/30">{n}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-6 rounded-3xl border border-border/60 bg-card p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Quote className="h-8 w-8 text-accent" />
            <p className="mt-4 font-display text-2xl leading-tight sm:text-3xl">
              "PULSE is what happens when audio engineers and industrial
              designers refuse to make the usual compromises."
            </p>
            <div className="mono mt-4 text-xs text-muted-foreground">— WHAT HI-FI?, 2025 REVIEW</div>
          </div>
          <div className="flex gap-3">
            <Link to="/shop" className="btn-magnetic inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground">
              <Sparkles className="h-4 w-4" /> Explore the lineup
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-5 py-2.5 text-sm">
              <Users className="h-4 w-4" /> Talk to us
            </Link>
          </div>
        </div>
      </section>
      <Waves className="hidden" />
    </div>
  );
}
