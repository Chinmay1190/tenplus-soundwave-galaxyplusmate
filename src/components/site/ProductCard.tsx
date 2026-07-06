import { Link } from "@tanstack/react-router";
import { Check, Heart, Scale, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/data/products";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/format";
import { toast } from "sonner";
import { brandLogo } from "@/lib/brand-logo";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, toggleCompare, inWishlist, inCompare } = useStore();
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[var(--shadow-card)]">
      <Link to="/product/$id" params={{ id: product.id }} className="relative block aspect-square overflow-hidden bg-surface">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {off > 0 && (
            <span className="mono rounded-full bg-accent px-2 py-1 text-[10px] text-accent-foreground">
              −{off}%
            </span>
          )}
          {product.isNew && (
            <span className="mono rounded-full border border-border/60 bg-background/80 px-2 py-1 text-[10px] backdrop-blur">
              New
            </span>
          )}
          {product.isBestSeller && (
            <span className="mono rounded-full border border-border/60 bg-background/80 px-2 py-1 text-[10px] backdrop-blur">
              Best Seller
            </span>
          )}
        </div>

        {/* quick actions */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.preventDefault();
              const wasIn = inWishlist(product.id);
              toggleWishlist(product.id);
              if (wasIn) {
                toast("Removed from wishlist", { description: product.name, icon: <Heart className="h-4 w-4" /> });
              } else {
                toast.success("Saved to wishlist", {
                  description: product.name,
                  icon: <Heart className="h-4 w-4 fill-current" />,
                  action: { label: "View", onClick: () => (window.location.href = "/wishlist") },
                });
              }
            }}
            aria-label="Wishlist"
            className={`grid h-8 w-8 place-items-center rounded-full border border-border/60 bg-background/80 backdrop-blur transition-colors hover:border-accent hover:text-accent ${
              inWishlist(product.id) ? "text-accent" : ""
            }`}
          >
            <Heart className="h-3.5 w-3.5" fill={inWishlist(product.id) ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              const wasIn = inCompare(product.id);
              toggleCompare(product.id);
              if (wasIn) {
                toast("Removed from compare", { description: product.name, icon: <Scale className="h-4 w-4" /> });
              } else {
                toast.success("Added to compare", {
                  description: `${product.brand} · ${product.name}`,
                  icon: <Scale className="h-4 w-4" />,
                  action: { label: "Compare", onClick: () => (window.location.href = "/compare") },
                });
              }
            }}
            aria-label="Compare"
            className={`grid h-8 w-8 place-items-center rounded-full border border-border/60 bg-background/80 backdrop-blur transition-colors hover:border-accent hover:text-accent ${
              inCompare(product.id) ? "text-accent" : ""
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5">
            <span className="grid h-5 w-5 place-items-center rounded-sm bg-white p-0.5">
              <img
                src={brandLogo(product.brand, 40)}
                alt={`${product.brand} logo`}
                loading="lazy"
                className="h-full w-full object-contain"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
              />
            </span>
            <span className="mono text-muted-foreground">{product.brand}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-accent text-accent" />
            {product.rating.toFixed(1)} <span className="opacity-60">({product.reviews})</span>
          </span>
        </div>
        <Link to="/product/$id" params={{ id: product.id }}>
          <h3 className="font-display text-base font-semibold leading-tight">{product.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{product.tagline}</p>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <div className="font-display text-lg font-bold">{inr(product.price)}</div>
            {off > 0 && (
              <div className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</div>
            )}
          </div>
          <button
            onClick={() => {
              addToCart(product.id);
              toast.success("Added to cart", {
                description: `${product.name} · ${inr(product.price)}`,
                icon: <Check className="h-4 w-4" />,
                action: { label: "View cart", onClick: () => (window.location.href = "/cart") },
              });
            }}
            aria-label="Add to cart"
            className="btn-magnetic inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-3 text-xs font-semibold text-background"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
