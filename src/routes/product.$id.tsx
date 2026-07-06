import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Heart, Minus, Plus, Scale, Share2, Shield, ShoppingBag, Star, Truck } from "lucide-react";
import { useState } from "react";
import { PRODUCTS, getProduct, type Product } from "@/data/products";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/format";
import { ProductCard } from "@/components/site/ProductCard";
import { toast } from "sonner";
import { Product360 } from "@/components/site/Product360";
import { brandLogo } from "@/lib/brand-logo";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }): { product: Product } => {
    const p = getProduct(params.id);
    if (!p) throw notFound();
    return { product: p };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "Product — PULSE" }] };
    return {
      meta: [
        { title: `${p.name} — ${p.brand} | PULSE` },
        { name: "description", content: p.tagline },
        { property: "og:title", content: `${p.name} — PULSE` },
        { property: "og:description", content: p.tagline },
        { property: "og:image", content: p.image },
        { property: "og:url", content: `/product/${p.id}` },
        { property: "og:type", content: "product" },
      ],
      links: [{ rel: "canonical", href: `/product/${p.id}` }],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-3xl font-bold">Product not found</h1>
      <Link to="/shop" className="mt-6 inline-block text-accent">← Back to shop</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const [active, setActive] = useState(0);
  const [view, setView] = useState<"photo" | "360">("photo");
  const [color, setColor] = useState(product.colors[0].name);
  const [qty, setQty] = useState(1);
  const { addToCart, toggleWishlist, toggleCompare, inWishlist, inCompare } = useStore();
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const related = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link to="/shop" className="mono text-muted-foreground hover:text-accent">← Back to shop</Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {(["photo", "360"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`mono rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  view === v
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-surface-2 hover:border-accent hover:text-accent"
                }`}
              >
                {v === "photo" ? "Photos" : "360° View"}
              </button>
            ))}
          </div>
          {view === "360" ? (
            <Product360 frames={product.gallery} alt={product.name} />
          ) : (
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-border/60 bg-surface">
            <img
              src={product.gallery[active]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute left-4 top-4 flex flex-col gap-1.5">
              {off > 0 && <span className="mono rounded-full bg-accent px-2 py-1 text-[10px] text-accent-foreground">−{off}%</span>}
              {product.isNew && <span className="mono rounded-full border border-border bg-background/80 px-2 py-1 text-[10px] backdrop-blur">New Launch</span>}
            </div>
          </div>
          )}
          {view === "photo" && (
          <div className="grid grid-cols-4 gap-3">
            {product.gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`aspect-square overflow-hidden rounded-xl border-2 bg-surface transition-all ${
                  active === i ? "border-accent" : "border-border/40 hover:border-border"
                }`}
              >
                <img src={g} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mono text-muted-foreground">
            <span className="grid h-6 w-6 place-items-center rounded-sm bg-white p-0.5">
              <img src={brandLogo(product.brand, 60)} alt={`${product.brand} logo`} className="h-full w-full object-contain" />
            </span>
            {product.brand}
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-3 text-base text-muted-foreground">{product.tagline}</p>

          <div className="mt-4 inline-flex items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              {product.rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">· {product.reviews} reviews</span>
            <span className="text-muted-foreground">·</span>
            <span className="mono text-accent">In Stock</span>
          </div>

          <div className="mt-6 flex items-end gap-3">
            <div className="font-display text-4xl font-bold">{inr(product.price)}</div>
            {off > 0 && (
              <>
                <div className="pb-1 text-base text-muted-foreground line-through">{inr(product.mrp)}</div>
                <div className="mono pb-1 text-accent">SAVE {inr(product.mrp - product.price)}</div>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            or 3 EMI of {inr(Math.round(product.price / 3))}/month · GST included
          </p>

          {/* Color */}
          <div className="mt-8">
            <div className="mono mb-3 text-muted-foreground">Color · {color}</div>
            <div className="flex gap-2.5">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  aria-label={c.name}
                  onClick={() => setColor(c.name)}
                  className={`h-10 w-10 rounded-full border-2 transition-all ${
                    color === c.name ? "border-accent ring-2 ring-accent/30" : "border-border"
                  }`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Qty + actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="inline-flex items-center rounded-full border border-border bg-surface-2">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center text-muted-foreground hover:text-accent" aria-label="Decrease">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-semibold tabular-nums">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="grid h-11 w-11 place-items-center text-muted-foreground hover:text-accent" aria-label="Increase">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => {
                addToCart(product.id, qty, color);
                toast("Added to cart", { description: `${product.name} × ${qty}` });
              }}
              className="btn-magnetic inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background sm:flex-none"
            >
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </button>
            <Link
              to="/checkout"
              onClick={() => addToCart(product.id, qty, color)}
              className="btn-magnetic inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground"
            >
              Buy now
            </Link>
            <button
              onClick={() => { toggleWishlist(product.id); toast(inWishlist(product.id) ? "Removed from wishlist" : "Saved to wishlist"); }}
              className={`grid h-11 w-11 place-items-center rounded-full border border-border bg-surface-2 transition-colors hover:border-accent hover:text-accent ${inWishlist(product.id) ? "text-accent" : ""}`}
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4" fill={inWishlist(product.id) ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => { toggleCompare(product.id); toast(inCompare(product.id) ? "Removed from compare" : "Added to compare"); }}
              className={`grid h-11 w-11 place-items-center rounded-full border border-border bg-surface-2 transition-colors hover:border-accent hover:text-accent ${inCompare(product.id) ? "text-accent" : ""}`}
              aria-label="Compare"
            >
              <Scale className="h-4 w-4" />
            </button>
            <button className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface-2 hover:border-accent hover:text-accent" aria-label="Share">
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Perks */}
          <ul className="mt-8 grid gap-2 text-sm sm:grid-cols-2">
            {[
              [Truck, "Free shipping & 30-day returns"],
              [Shield, "2-year manufacturer warranty"],
              [Check, "Authentic — sold by PULSE"],
              [Check, "EMI starting at 0% interest"],
            ].map(([Ico, t], i) => {
              const Icon = Ico as typeof Truck;
              return (
                <li key={i} className="inline-flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4 text-accent" /> {t as string}
                </li>
              );
            })}
          </ul>

          {/* Features */}
          <div className="mt-10">
            <div className="mono mb-3 text-muted-foreground">Highlights</div>
            <div className="flex flex-wrap gap-2">
              {product.features.map((f) => (
                <span key={f} className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Specs + Description */}
      <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="font-display text-2xl font-bold">About this product</h2>
          <p className="mt-4 text-muted-foreground">{product.description}</p>
          <p className="mt-3 text-muted-foreground">
            Each unit ships with custom silicone tips in 4 sizes, USB-C cable,
            quick-start guide, and a 24-month international warranty card.
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h3 className="font-display text-lg font-bold">Specifications</h3>
          <dl className="mt-4 divide-y divide-border/60 text-sm">
            {Object.entries(product.specs).map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-8 font-display text-3xl font-bold tracking-tight">You may also like</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
