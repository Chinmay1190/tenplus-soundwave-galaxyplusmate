import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Search, ArrowUpRight, X } from "lucide-react";
import { BRANDS, PRODUCTS } from "@/data/products";
import { LogoMark } from "@/components/site/Logo";
import { brandLogoSources } from "@/lib/brand-logo";

const BRAND_TINT: Record<string, string> = {
  Apple: "#a1a1a6", Sony: "#111111", Bose: "#111111", Sennheiser: "#0033A0",
  JBL: "#FF6600", Beats: "#E61E26", Nothing: "#ff3b30", Samsung: "#1428A0",
  OnePlus: "#EB0028", Realme: "#FFC900", Jabra: "#FF8200", Skullcandy: "#111111",
  Soundcore: "#00AEEF", Marshall: "#c0392b", Audeze: "#8e44ad", Shure: "#00843d",
  AKG: "#003a70", Logitech: "#00B8FC", HyperX: "#e10600", Razer: "#44D62C",
  Bang: "#111111", "Bang & Olufsen": "#111111", Boat: "#e11d2f", Xiaomi: "#ff6900",
  Huawei: "#c7000b", Google: "#4285F4",
};

/**
 * Robust brand image:
 *   • Optional `url` prop for direct override.
 *   • Skeleton placeholder while loading.
 *   • Falls through the brandLogoSources chain on error — always renders SOMETHING.
 */
export function BrandImage({
  brand,
  alt,
  className,
  url,
  size = 256,
}: {
  brand: string;
  alt: string;
  className?: string;
  url?: string;
  size?: number;
}) {
  const sources = useMemo(() => {
    const chain = brandLogoSources(brand, size);
    return url ? [url, ...chain] : chain;
  }, [brand, size, url]);
  const idxRef = useRef(0);
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <span
          aria-hidden
          className="absolute inset-2 animate-pulse rounded-lg bg-black/5 dark:bg-white/5"
        />
      )}
      <img
        src={sources[0]}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={className}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          const el = e.currentTarget as HTMLImageElement;
          idxRef.current += 1;
          if (idxRef.current < sources.length) {
            el.src = sources[idxRef.current];
          } else {
            setLoaded(true);
          }
        }}
      />
    </>
  );
}

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Shop by Brand — PULSE" },
      { name: "description", content: "Browse premium audio brands — Apple, Sony, Bose, Sennheiser, JBL, Nothing and more, all in one place." },
      { property: "og:title", content: "Shop by Brand — PULSE" },
      { property: "og:description", content: "Curated brands. Iconic sound. Shop the names that shaped audio." },
    ],
    links: [{ rel: "canonical", href: "/brands" }],
  }),
  component: BrandsPage,
});

function BrandsPage() {
  const [q, setQ] = useState("");
  const featured = ["Apple", "Sony", "Bose", "Sennheiser", "JBL", "Nothing", "Beats", "Marshall"].filter((b) =>
    BRANDS.includes(b),
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return BRANDS;
    return BRANDS.filter((b) => b.toLowerCase().includes(needle));
  }, [q]);

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 460px at 50% -10%, oklch(0.65 0.24 25 / 0.18), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 sm:pt-24">
          <div className="flex items-center gap-3">
            <LogoMark size={28} animated />
            <div className="mono text-accent">— Brands</div>
          </div>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight sm:text-6xl">
            The labels that <span className="shimmer-text">shaped sound.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            {BRANDS.length} iconic audio brands, one storefront. Tap any tile to see the lineup.
          </p>

          {/* Search */}
          <div className="mt-8 flex max-w-md items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-2.5 backdrop-blur focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/25">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search brands…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Search brands"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Featured marquee */}
          <div className="relative mt-8 overflow-hidden rounded-2xl border border-border/60 bg-card/50 py-5 backdrop-blur">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
            <div className="flex items-center gap-10 overflow-x-auto px-8 sm:justify-center">
              {featured.map((brand) => (
                <Link
                  key={`f-${brand}`}
                  to="/shop"
                  search={{ brand }}
                  className="group flex shrink-0 items-center gap-2 opacity-80 transition-all hover:opacity-100"
                  title={brand}
                >
                  <div className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-white p-1.5 ring-1 ring-black/5">
                    <BrandImage brand={brand} alt={brand} className="h-full w-full object-contain" />
                  </div>
                  <span className="font-display text-sm font-bold tracking-tight">{brand}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="mono mb-4 flex items-center justify-between text-[10px] uppercase text-muted-foreground">
          <span>{filtered.length} of {BRANDS.length} brands</span>
          {q && <button onClick={() => setQ("")} className="text-accent">Reset</button>}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-10 text-center">
            <div className="font-display text-2xl font-bold">No matches</div>
            <p className="mt-2 text-sm text-muted-foreground">Try a different name — e.g. "Sony" or "Bose".</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((brand) => {
              const count = PRODUCTS.filter((p) => p.brand === brand).length;
              const tint = BRAND_TINT[brand] ?? "#e11d2f";
              return (
                <Link
                  key={brand}
                  to="/shop"
                  search={{ brand }}
                  className="group relative flex aspect-square flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--tint)]/50 hover:shadow-2xl"
                  style={{ ["--tint" as string]: tint } as React.CSSProperties}
                >
                  {/* tinted glow */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(500px 260px at 50% 0%, ${tint}33, transparent 70%)`,
                    }}
                  />
                  {/* bottom accent line on hover */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-px left-0 right-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: `linear-gradient(90deg, transparent, ${tint}, transparent)` }}
                  />
                  {/* arrow affordance */}
                  <span
                    aria-hidden
                    className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full border border-border/60 bg-background/60 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100"
                    style={{ color: tint }}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>

                  {/* logo plate */}
                  <div
                    className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:scale-110"
                    style={{ boxShadow: `0 10px 30px -12px ${tint}66` }}
                  >
                    <BrandImage brand={brand} alt={`${brand} logo`} className="relative z-10 h-full w-full object-contain" />
                  </div>

                  <div className="text-center">
                    <div className="font-display text-base font-bold tracking-tight transition-colors group-hover:text-[color:var(--tint)]">
                      {brand}
                    </div>
                    <div className="mono mt-0.5 text-[10px] text-muted-foreground">
                      {count} {count === 1 ? "product" : "products"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
