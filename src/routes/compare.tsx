import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Scale, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { getProduct } from "@/data/products";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [{ title: "Compare — PULSE" }, { name: "robots", content: "noindex" }] }),
  component: Compare,
});

function Compare() {
  const { compare, toggleCompare, addToCart } = useStore();
  const items = compare.map((id) => getProduct(id)).filter(Boolean) as NonNullable<ReturnType<typeof getProduct>>[];

  const allSpecs = Array.from(
    new Set(items.flatMap((i) => Object.keys(i.specs))),
  );

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <Scale className="mx-auto h-8 w-8 text-accent" />
        <h1 className="mt-4 font-display text-4xl font-bold">Compare up to 4 products</h1>
        <p className="mt-3 text-muted-foreground">Add products from the shop to see them side by side.</p>
        <Link to="/shop" className="btn-magnetic mt-6 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">
          Browse collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mono text-accent">— Compare</div>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Side by side</h1>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[700px] border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="mono w-40 text-left text-muted-foreground" />
              {items.map((p) => (
                <th key={p.id} className="px-3 text-left align-top">
                  <div className="relative rounded-2xl border border-border/60 bg-card p-4">
                    <button
                      onClick={() => toggleCompare(p.id)}
                      className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full border border-border bg-surface-2 hover:text-accent"
                      aria-label="Remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <Link to="/product/$id" params={{ id: p.id }} className="block">
                      <img src={p.image} alt={p.name} className="mx-auto aspect-square w-40 rounded-xl object-cover" />
                      <div className="mt-3 mono text-muted-foreground">{p.brand}</div>
                      <div className="font-display text-base font-bold">{p.name}</div>
                      <div className="mt-1 font-display text-lg">{inr(p.price)}</div>
                    </Link>
                    <button
                      onClick={() => addToCart(p.id)}
                      className="mt-3 w-full rounded-full bg-foreground py-2 text-xs font-semibold text-background"
                    >
                      Add to cart
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            {allSpecs.map((spec) => (
              <tr key={spec}>
                <td className="mono py-3 text-muted-foreground">{spec}</td>
                {items.map((p) => (
                  <td key={p.id} className="rounded-xl bg-card px-3 py-3 align-top">
                    {p.specs[spec] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="mono py-3 text-muted-foreground">Features</td>
              {items.map((p) => (
                <td key={p.id} className="rounded-xl bg-card px-3 py-3 align-top">
                  <ul className="space-y-1">
                    {p.features.map((f) => (
                      <li key={f} className="inline-flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-accent" /> <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
