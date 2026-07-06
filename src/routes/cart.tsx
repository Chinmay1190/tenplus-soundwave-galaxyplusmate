import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { getProduct } from "@/data/products";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — PULSE" }, { name: "robots", content: "noindex" }] }),
  component: Cart,
});

function Cart() {
  const { cart, updateQty, removeFromCart } = useStore();
  const items = cart.map((c) => ({ ...c, product: getProduct(c.id)! })).filter((x) => x.product);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <div className="mono text-accent">— Cart</div>
        <h1 className="mt-3 font-display text-4xl font-bold">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Looks quiet in here. Let's fill it with sound.</p>
        <Link to="/shop" className="btn-magnetic mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background">
          <ShoppingBag className="h-4 w-4" /> Explore the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mono text-accent">— Cart</div>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Your bag</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
          {items.map((i) => (
            <div key={i.id} className="grid grid-cols-[88px_1fr_auto] items-center gap-4 p-5">
              <Link to="/product/$id" params={{ id: i.id }} className="overflow-hidden rounded-xl bg-surface">
                <img src={i.product.image} alt={i.product.name} className="aspect-square w-full object-cover" />
              </Link>
              <div className="min-w-0">
                <div className="mono text-muted-foreground">{i.product.brand}</div>
                <Link to="/product/$id" params={{ id: i.id }} className="font-display text-lg font-semibold leading-tight hover:text-accent">
                  {i.product.name}
                </Link>
                {i.color && <div className="mt-1 text-xs text-muted-foreground">Color: {i.color}</div>}
                <div className="mt-2 inline-flex items-center rounded-full border border-border bg-surface-2">
                  <button onClick={() => updateQty(i.id, i.qty - 1)} className="grid h-9 w-9 place-items-center" aria-label="Decrease">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm font-semibold tabular-nums">{i.qty}</span>
                  <button onClick={() => updateQty(i.id, i.qty + 1)} className="grid h-9 w-9 place-items-center" aria-label="Increase">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-lg font-bold">{inr(i.product.price * i.qty)}</div>
                <button onClick={() => removeFromCart(i.id)} className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent">
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-border/60 bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-bold">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <Row label="Subtotal" value={inr(subtotal)} />
            <Row label="Shipping" value={shipping === 0 ? "Free" : inr(shipping)} />
            <Row label="GST" value="Included" muted />
          </dl>
          <div className="my-5 border-t border-border/60" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-2xl font-bold">{inr(total)}</span>
          </div>
          <Link
            to="/checkout"
            className="btn-magnetic mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
          >
            Checkout securely
          </Link>
          <Link to="/shop" className="mt-3 block text-center text-xs text-muted-foreground hover:text-accent">
            ← Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${muted ? "text-muted-foreground" : ""}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
