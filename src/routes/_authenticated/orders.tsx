import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PlayCircle } from "lucide-react";

const FLOW = ["confirmed", "packed", "shipped", "out_for_delivery", "delivered"] as const;
export function nextStatus(s: string): string | null {
  const i = FLOW.indexOf(s as typeof FLOW[number]);
  if (i < 0 || i >= FLOW.length - 1) return null;
  return FLOW[i + 1];
}
import {
  BarChart3,
  ChevronRight,
  Download,
  FileText,
  Package,
  RotateCcw,
  Search,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { inr } from "@/lib/format";
import { OrderTracking } from "@/components/site/OrderTracking";
import { downloadInvoice } from "@/lib/invoice";
import { LogoMark } from "@/components/site/Logo";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "My Orders — PULSE" }, { name: "robots", content: "noindex" }] }),
  component: OrdersPage,
});

type Order = {
  id: string;
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  status: string;
  created_at: string;
  items: { id?: string; name: string; qty: number; price?: number; color?: string }[];
  shipping_address: { name?: string; pincode?: string; city?: string; state?: string } | null;
  payment_method?: string;
};

const STATUSES = ["all", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"] as const;

function OrdersPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<typeof STATUSES[number]>("all");
  const [search, setSearch] = useState("");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Order[];
    },
  });

  const stats = useMemo(() => {
    const arr = orders ?? [];
    const total = arr.reduce((s, o) => s + Number(o.total || 0), 0);
    const units = arr.reduce((s, o) => s + o.items.reduce((a, b) => a + b.qty, 0), 0);
    const delivered = arr.filter((o) => o.status === "delivered").length;
    return { total, units, delivered, count: arr.length };
  }, [orders]);

  const filtered = (orders ?? []).filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (
      search &&
      !o.id.toLowerCase().includes(search.toLowerCase()) &&
      !o.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    )
      return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-accent/5 p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.65 0.24 25 / 0.3), transparent 70%)" }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark size={30} />
              <div className="mono text-accent">— My Orders</div>
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Every order, on one wall.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Track, download invoices and open returns. Click any order to expand a live timeline.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/track-order"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm hover:border-accent hover:text-accent"
            >
              Track by ID →
            </Link>
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <BarChart3 className="h-4 w-4" /> Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="mt-8 grid gap-3 sm:grid-cols-4">
        <StatTile icon={ShoppingBag} label="Orders" value={String(stats.count)} />
        <StatTile icon={TrendingUp} label="Total spend" value={inr(stats.total)} accent />
        <StatTile icon={Package} label="Units" value={String(stats.units)} />
        <StatTile icon={FileText} label="Delivered" value={String(stats.delivered)} />
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by order ID or product"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`mono rounded-full border px-3 py-1.5 text-[11px] capitalize transition-colors ${
                filter === s
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card hover:border-accent hover:text-accent"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {isLoading ? (
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-border/60 bg-card p-12 text-center">
            <Package className="mx-auto h-8 w-8 text-accent" />
            <h3 className="mt-3 font-display text-lg font-bold">No matching orders</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try changing the filter or clearing search.</p>
            <Link to="/shop" className="mt-5 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">
              Continue shopping
            </Link>
          </div>
        ) : (
          filtered.map((o) => <OrderRow key={o.id} o={o} user={user} />)
        )}
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon, label, value, accent,
}: { icon: typeof Package; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-accent/40 bg-accent/5" : "border-border/60 bg-card"}`}>
      <div className="flex items-center justify-between">
        <span className="mono text-[10px] text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <div className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function OrderRow({ o, user }: { o: Order; user: ReturnType<typeof useAuth>["user"] }) {
  const [expand, setExpand] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const qc = useQueryClient();
  const itemsCount = o.items.reduce((a, b) => a + b.qty, 0);
  const next = nextStatus(o.status);

  const simulate = async () => {
    if (!next) return;
    setSimulating(true);
    const { error } = await supabase.from("orders").update({ status: next }).eq("id", o.id);
    setSimulating(false);
    if (error) {
      toast.error("Couldn't advance status");
      return;
    }
    toast.success(`Order → ${next.replace(/_/g, " ")}`);
    setExpand(true);
    qc.invalidateQueries({ queryKey: ["orders"] });
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card transition-all hover:border-accent/40">
      <div className="grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mono text-[10px] text-muted-foreground">
              #{o.id.slice(0, 8).toUpperCase()}
            </span>
            <span className="mono text-[10px] text-muted-foreground">·</span>
            <span className="mono text-[10px] text-muted-foreground">
              {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="mono ml-1 rounded-full bg-accent/10 px-3 py-1 text-[10px] capitalize text-accent">
              {o.status.replace(/_/g, " ")}
            </span>
          </div>
          <div className="mt-2 font-display text-2xl font-bold tracking-tight">{inr(Number(o.total))}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {itemsCount} {itemsCount === 1 ? "item" : "items"} ·{" "}
            {o.items.slice(0, 2).map((i) => `${i.name} × ${i.qty}`).join(" · ")}
            {o.items.length > 2 && ` +${o.items.length - 2} more`}
          </div>
          {o.shipping_address?.city && (
            <div className="mono mt-2 text-[10px] text-muted-foreground">
              SHIP TO · {o.shipping_address.city}, {o.shipping_address.state} {o.shipping_address.pincode}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
          <button
            onClick={() => setExpand((x) => !x)}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
          >
            <ChevronRight className={`h-3 w-3 transition-transform ${expand ? "rotate-90" : ""}`} />
            {expand ? "Hide" : "Track"}
          </button>
          {next ? (
            <button
              onClick={simulate}
              disabled={simulating}
              className="inline-flex items-center gap-1 rounded-full border border-accent/50 bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
              title={`Advance to ${next.replace(/_/g, " ")}`}
            >
              <PlayCircle className="h-3 w-3" />
              {simulating ? "…" : `Simulate → ${next.replace(/_/g, " ")}`}
            </button>
          ) : (
            <span className="mono rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[10px] text-muted-foreground">
              DELIVERED
            </span>
          )}
          <Link
            to="/returns/new"
            search={{ order: o.id }}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
          >
            <RotateCcw className="h-3 w-3" /> Return
          </Link>
          <button
            onClick={() => {
              downloadInvoice({
                id: o.id,
                createdAt: o.created_at,
                total: Number(o.total),
                subtotal: o.subtotal,
                tax: o.tax,
                shipping: o.shipping,
                status: o.status,
                paymentMethod: o.payment_method,
                items: o.items,
                customer: { name: user?.user_metadata?.full_name as string, email: user?.email },
                shippingAddress: o.shipping_address as Record<string, unknown> | null,
              });
              toast("Invoice downloaded");
            }}
            className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs text-accent hover:bg-accent hover:text-accent-foreground"
          >
            <Download className="h-3 w-3" /> Invoice
          </button>
        </div>
      </div>
      {expand && (
        <div className="border-t border-border/60 bg-surface-2/40 p-6">
          <OrderTracking createdAt={o.created_at} status={o.status} pincode={o.shipping_address?.pincode} compact />
        </div>
      )}
    </div>
  );
}
