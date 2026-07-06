import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Headphones, Play, Shield, Sparkles, Truck, Zap } from "lucide-react";
import hero from "@/assets/hero-earbuds.jpg";
import { PRODUCTS, CATEGORIES, BRANDS } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";
import { BrandLogo } from "@/components/site/BrandLogo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PULSE — Experience Sound Beyond Reality" },
      {
        name: "description",
        content:
          "Premium wireless earbuds, ANC headphones, gaming and sports audio — cinematic sound and luxury design from PULSE.",
      },
      { property: "og:title", content: "PULSE — Experience Sound Beyond Reality" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const trending = PRODUCTS.slice(0, 8);
  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 4);
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-40" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" aria-hidden />
        {/* animated red glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-1/4 h-[600px] w-[600px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
        />

        <div className="relative mx-auto grid min-h-[100svh] max-w-7xl items-center gap-8 px-4 pb-16 pt-28 sm:px-6 md:grid-cols-12 md:gap-12 md:pt-24">
          {/* Left copy */}
          <div className="md:col-span-6 lg:col-span-5">
            <div className="rise flex items-center gap-2">
              <span className="chip">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> New Series 03
              </span>
              <span className="mono text-muted-foreground">/ 2026 LINEUP</span>
            </div>
            <h1 className="rise mt-6 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Sound{" "}
              <span className="shimmer-text">beyond</span>
              <br />
              reality.
            </h1>
            <p className="rise mt-6 max-w-md text-base text-muted-foreground sm:text-lg">
              Cinematic audio, hybrid adaptive ANC and a transparent design philosophy.
              Engineered for music, calls, gaming and everyday luxury.
            </p>

            <div className="rise mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="btn-magnetic group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background"
              >
                Shop Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="btn-magnetic inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-6 py-3 text-sm font-semibold">
                <Play className="h-3.5 w-3.5 fill-current" /> Watch Demo
              </button>
              <div className="ml-2 flex items-center gap-0.5" aria-hidden>
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
              </div>
            </div>

            {/* meta strip */}
            <dl className="rise mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-border/60 pt-6 text-xs">
              {[
                ["−45dB", "Hybrid ANC"],
                ["40h", "Total Battery"],
                ["55ms", "Game Mode"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-display text-xl font-bold">{k}</dt>
                  <dd className="mono text-muted-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right hero image */}
          <div className="relative md:col-span-6 lg:col-span-7">
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl sm:h-[420px] sm:w-[420px]"
              style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
            />
            <div className="float-y relative mx-auto aspect-square w-full max-w-xl">
              <img
                src={hero}
                alt="Premium wireless earbuds with transparent design and charging case"
                width={1600}
                height={1200}
                className="h-full w-full object-contain drop-shadow-[0_30px_80px_oklch(0.65_0.24_25_/_0.45)]"
              />
              {/* Pulse ring */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/40"
              />
              <div
                aria-hidden
                className="pulse-ring pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/60"
              />
            </div>

            {/* Floating spec chips */}
            <div className="absolute -left-2 top-12 hidden md:block">
              <SpecChip label="Driver" value="11mm" />
            </div>
            <div className="absolute right-0 top-1/3 hidden md:block">
              <SpecChip label="Codec" value="LDAC" />
            </div>
            <div className="absolute bottom-12 left-10 hidden md:block">
              <SpecChip label="ANC" value="−45dB" />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <a
          href="#categories"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground"
          aria-label="Scroll"
        >
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </a>
      </section>

      {/* MARQUEE */}
      <section className="relative border-y border-border/60 bg-surface py-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-surface to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-surface to-transparent"
        />
        <div className="relative flex overflow-hidden">
          <div className="animate-marquee flex shrink-0 items-center gap-14 pr-14">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <Link
                to="/shop"
                search={{ brand: b }}
                key={`${b}-${i}`}
                className="group inline-flex items-center gap-3 whitespace-nowrap text-muted-foreground transition-colors hover:text-accent"
                title={b}
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-110">
                  <img
                    src={brandLogo(b)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                </span>
                <span className="mono text-sm">{b.toUpperCase()}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="mono text-accent">— Collections</div>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Find your sound.
            </h2>
          </div>
          <Link to="/shop" className="hidden text-sm text-muted-foreground hover:text-accent sm:inline-flex">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c) => {
            const pick = PRODUCTS.find((p) => p.category === c.slug);
            return (
              <Link
              key={c.slug}
              to="/shop"
              search={{ cat: c.slug }}
              className="group relative aspect-[5/4] overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:-translate-y-1 hover:border-accent/50"
            >
              {pick && (
                <img
                  src={pick.image}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-25 transition-all duration-700 group-hover:scale-110 group-hover:opacity-40"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/0 to-accent/0 transition-colors group-hover:from-accent/15" />
              <div className="relative flex h-full flex-col justify-between">
                <span className="mono text-muted-foreground">{c.slug.toUpperCase()}</span>
                <div>
                  <div className="font-display text-xl font-bold leading-tight">{c.name}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    Explore <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* TRENDING */}
      <section className="bg-surface py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <div className="mono text-accent">— Trending now</div>
              <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Hand-picked.
              </h2>
            </div>
            <Link to="/shop" className="text-sm text-muted-foreground hover:text-accent">
              See all products →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Zap, "Adaptive ANC", "Hybrid 6-mic system cancels up to 45dB across 240 environments."],
            [Sparkles, "Spatial Audio", "Head-tracked 360° immersion engineered for cinematic music."],
            [Headphones, "Hi-Res Wireless", "LDAC + LHDC certified for studio-grade detail wherever you go."],
            [Truck, "Lightning Delivery", "Free same-day in metros · 30-day returns · 2-year warranty."],
          ].map(([Ico, t, d]) => {
            const Icon = Ico as typeof Zap;
            return (
              <div key={t as string} className="group rounded-2xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent/40">
                <div className="grid h-10 w-10 place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold">{t as string}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* NEW LAUNCH BANNER */}
      {newArrivals.length > 0 && (
        <section className="relative overflow-hidden bg-surface">
          <div className="absolute inset-0 dot-grid opacity-30" aria-hidden />
          <div
            aria-hidden
            className="absolute -left-32 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
          />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-24 sm:px-6 md:grid-cols-2 md:items-center">
            <div>
              <div className="mono text-accent">— New launch</div>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-6xl">
                Made to be<br />heard, not seen.
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                The new Series 03 pushes acoustic design into transparent territory.
                Smaller. Lighter. Astonishingly loud.
              </p>
              <Link
                to="/shop"
                className="btn-magnetic mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
              >
                Explore new arrivals <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {newArrivals.slice(0, 2).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TRUST */}
      <section className="mx-auto max-w-7xl border-t border-border/60 px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-6 text-sm text-muted-foreground">
          <div className="inline-flex items-center gap-2"><Shield className="h-4 w-4 text-accent" /> 2-year warranty</div>
          <div className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-accent" /> Free shipping over ₹999</div>
          <div className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> Lifetime support</div>
          <div className="inline-flex items-center gap-2"><Zap className="h-4 w-4 text-accent" /> 30-day no-questions returns</div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mono text-accent">— By the numbers</div>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">Sound loved everywhere.</h2>
          <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["2M+", "Listeners worldwide"],
              ["150", "Products in catalogue"],
              ["25", "Iconic audio brands"],
              ["4.8★", "Average rating"],
            ].map(([k, v]) => (
              <div key={v} className="rounded-2xl border border-border/60 bg-card p-6">
                <dt className="font-display text-5xl font-bold text-accent">{k}</dt>
                <dd className="mono mt-2 text-[10px] uppercase text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* BEST SELLERS */}
      {bestSellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <div className="mono text-accent">— Best sellers</div>
              <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">Fan favourites.</h2>
            </div>
            <Link to="/shop" className="text-sm text-muted-foreground hover:text-accent">
              Shop all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mono text-accent">— Voices</div>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">Reviewers agree.</h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {[
              ["\"Studio-grade tuning at consumer prices — the ANC is genuinely uncanny.\"", "WHAT HI-FI?", "★★★★★"],
              ["\"PULSE has cracked the wireless earbud category open.\"", "T3 MAGAZINE", "★★★★★"],
              ["\"The transparent design language is a masterclass.\"", "WIRED", "★★★★★"],
            ].map(([q, s, r]) => (
              <figure key={s} className="rounded-2xl border border-border/60 bg-card p-6">
                <div className="mono text-accent">{r}</div>
                <blockquote className="mt-3 font-display text-lg leading-snug">{q}</blockquote>
                <figcaption className="mono mt-4 text-[10px] uppercase text-muted-foreground">{s}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(700px 320px at 50% 100%, oklch(0.65 0.24 25 / 0.25), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <div className="mono text-accent">— Stay tuned</div>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            First drops, first offers.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join 80,000 audiophiles who get PULSE launches, in-depth reviews and members-only deals.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem("email") as HTMLInputElement);
              if (input?.value) {
                input.value = "";
                import("sonner").then(({ toast }) =>
                  toast.success("You're on the list", { description: "Welcome to PULSE Insider." })
                );
              }
            }}
            className="mx-auto mt-8 flex max-w-md gap-2 rounded-full border border-border bg-card p-1.5"
          >
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="flex-1 rounded-full bg-transparent px-4 py-2 text-sm outline-none"
            />
            <button className="btn-magnetic inline-flex items-center gap-1 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground">
              Subscribe <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function SpecChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl px-4 py-2.5">
      <div className="mono text-[10px] text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-bold leading-none">{value}</div>
    </div>
  );
}
