import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Filter, X } from "lucide-react";
import { BRANDS, CATEGORIES, PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";

const searchSchema = z.object({
  cat: z.string().optional(),
  brand: z.string().optional(),
  sort: z.enum(["new", "low", "high", "rating"]).optional(),
});

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All Earbuds & Headphones — PULSE" },
      { name: "description", content: "Browse premium wireless earbuds, ANC headphones, gaming and sports audio." },
      { property: "og:title", content: "Shop All — PULSE" },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  validateSearch: searchSchema,
  component: Shop,
});

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    let l = [...PRODUCTS];
    if (search.cat) l = l.filter((p) => p.category === search.cat);
    if (search.brand) l = l.filter((p) => p.brand === search.brand);
    switch (search.sort) {
      case "low": l.sort((a, b) => a.price - b.price); break;
      case "high": l.sort((a, b) => b.price - a.price); break;
      case "rating": l.sort((a, b) => b.rating - a.rating); break;
      case "new":
      default:
        l.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    }
    return l;
  }, [search]);

  const update = (k: keyof typeof search, v: string | undefined) =>
    navigate({ to: "/shop", search: { ...search, [k]: v || undefined } });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mono text-accent">— Shop</div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            The collection.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {list.length} products · curated for sound purists.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={search.sort ?? "new"}
            onChange={(e) => update("sort", e.target.value)}
            className="h-10 rounded-full border border-border bg-surface-2 px-4 text-sm"
          >
            <option value="new">Newest</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface-2 px-4 text-sm lg:hidden"
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside
          className={`${
            open ? "block" : "hidden"
          } space-y-8 rounded-2xl border border-border/60 bg-card p-5 lg:block lg:sticky lg:top-24 lg:self-start`}
        >
          <FilterGroup
            title="Category"
            current={search.cat}
            options={CATEGORIES.map((c) => ({ value: c.slug, label: c.name }))}
            onSelect={(v) => update("cat", v)}
          />
          <FilterGroup
            title="Brand"
            current={search.brand}
            options={BRANDS.map((b) => ({ value: b, label: b }))}
            onSelect={(v) => update("brand", v)}
          />
          {(search.cat || search.brand) && (
            <button
              onClick={() => navigate({ to: "/shop", search: {} })}
              className="mono inline-flex items-center gap-1 text-xs text-accent"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </aside>

        {/* Grid */}
        <div>
          {list.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card p-12 text-center text-muted-foreground">
              No products match these filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  current,
  options,
  onSelect,
}: {
  title: string;
  current?: string;
  options: { value: string; label: string }[];
  onSelect: (v: string | undefined) => void;
}) {
  return (
    <div>
      <div className="mono mb-3 text-muted-foreground">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = current === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onSelect(active ? undefined : o.value)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                active
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-surface-2 hover:border-accent/60 hover:text-accent"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
