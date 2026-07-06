import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useStore } from "@/lib/store";
import { getProduct } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — PULSE" }, { name: "robots", content: "noindex" }] }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist } = useStore();
  const items = wishlist.map((id) => getProduct(id)).filter(Boolean) as ReturnType<typeof getProduct>[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mono text-accent">— Wishlist</div>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Saved for later</h1>

      {items.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-border/60 bg-card p-16 text-center">
          <Heart className="mx-auto h-8 w-8 text-accent" />
          <h2 className="mt-4 font-display text-xl font-bold">Nothing saved yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Tap the heart on any product to save it here.</p>
          <Link to="/shop" className="btn-magnetic mt-6 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">
            Browse the collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => p && <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
