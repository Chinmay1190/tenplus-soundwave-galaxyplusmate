import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Copy,
  PlayCircle,
  Download,
  MapPin,
  Package,
  Search,
  Sparkles,
  Truck,
  Share2,
  ShieldCheck,
  Phone,
  Mail,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import { estimateDelivery, formatEtaRange } from "@/lib/delivery";
import { toast } from "sonner";
import { OrderTracking } from "@/components/site/OrderTracking";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { inr } from "@/lib/format";
import { downloadInvoice } from "@/lib/invoice";
import { LogoMark } from "@/components/site/Logo";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track your order — PULSE" },
      {
        name: "description",
        content:
          "Look up any PULSE order with its order ID and email to see live shipment status and ETA.",
      },
      { property: "og:title", content: "Track your order — PULSE" },
    ],
  }),
  component: TrackOrderPage,
});

type Order = {
  id: string;
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  status: string;
  created_at: string;
  items: { id?: string; name: string; qty: number; price?: number }[];
  shipping_address: { name?: string; pincode?: string; city?: string; state?: string } | null;
  payment_method?: string;
};

function TrackOrderPage() {
  const { user } = useAuth();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setLoading(true);
    try {
      const id = orderId.trim();
      // Ensure the current session is loaded so RLS sees auth.uid()
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        setError(
          "Please sign in with the email used at checkout to view your order.",
        );
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .ilike("id", `${id.toLowerCase()}%`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        setError(
          "We couldn't find that order under this account. Check the order ID, or sign in with the email used at checkout.",
        );
      } else {
        setOrder(data as unknown as Order);
      }
    } catch {
      setError(
        "Something went wrong. Try again, or contact care@pulse.audio with this order ID.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-50"
          style={{
            background:
              "radial-gradient(900px 460px at 50% 0%, oklch(0.65 0.24 25 / 0.15), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-4xl px-4 pb-12 pt-20 sm:px-6 sm:pt-28">
          <div className="flex items-center gap-3">
            <LogoMark size={32} animated />
            <div className="mono text-accent">— Track</div>
          </div>
          <h1 className="mt-4 font-display text-5xl font-bold tracking-tight sm:text-6xl">
            Where's my <span className="shimmer-text">order</span>?
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Enter your order ID and the email used at checkout. Live shipment status updates the
            moment your courier scans the package.
          </p>

          <form
            onSubmit={lookup}
            className="mt-10 grid gap-3 rounded-3xl border border-border/60 bg-card p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <label className="block">
              <div className="mono mb-1.5 text-[10px] text-muted-foreground">Order ID</div>
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
                placeholder="e.g. A1B2C3D4"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </label>
            <label className="block">
              <div className="mono mb-1.5 text-[10px] text-muted-foreground">Email</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="btn-magnetic inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
            >
              <Search className="h-4 w-4" /> {loading ? "Looking…" : "Track"}
            </button>
          </form>

          {error && (
            <div className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Result */}
      {order && (
        <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
          <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mono flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>
                    ORDER #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(order.id);
                      toast.success("Order ID copied");
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] hover:border-accent hover:text-accent"
                    aria-label="Copy full order ID"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                </div>
                <div className="mt-1 font-display text-3xl font-bold tracking-tight">
                  {inr(Number(order.total))}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {order.items.map((i) => `${i.name} × ${i.qty}`).join(" · ")}
                </div>
                {order.shipping_address?.pincode && (() => {
                  const eta = estimateDelivery(order.shipping_address.pincode);
                  if (!eta.serviceable || order.status === "delivered") return null;
                  return (
                    <div className="mono mt-3 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[10px] text-accent">
                      <Truck className="h-3 w-3" /> ETA {formatEtaRange(eta, new Date(order.created_at))} · {eta.zone}
                    </div>
                  );
                })()}

                {order.shipping_address?.city && (
                  <div className="mono mt-3 inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {order.shipping_address.city},{" "}
                    {order.shipping_address.state} {order.shipping_address.pincode}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="mono rounded-full bg-accent/10 px-3 py-1 text-xs capitalize text-accent">
                  {order.status.replace(/_/g, " ")}
                </span>
                {(() => {
                  const flow = ["confirmed", "packed", "shipped", "out_for_delivery", "delivered"];
                  const idx = flow.indexOf(order.status);
                  const next = idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
                  if (!next) return null;
                  return (
                    <button
                      onClick={async () => {
                        // Guard: user must be the owner (RLS enforces, but we
                        // check up-front to give a clearer message).
                        const { data: sess } = await supabase.auth.getSession();
                        if (!sess.session) {
                          return toast.error("Please sign in to advance the tracker.");
                        }
                        const t = toast.loading(`Advancing → ${next.replace(/_/g, " ")}…`);
                        const { data: updated, error } = await supabase
                          .from("orders")
                          .update({ status: next })
                          .eq("id", order.id)
                          .select()
                          .maybeSingle();
                        if (error || !updated) {
                          toast.error("Couldn't advance status", {
                            id: t,
                            description: "You must be signed in as the order owner.",
                          });
                          return;
                        }
                        toast.success(`Order → ${next.replace(/_/g, " ")}`, {
                          id: t,
                          description: "Tracker updated in real-time.",
                        });
                        setOrder({ ...order, ...(updated as unknown as Order), status: next });
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-accent/50 bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:opacity-90"
                    >
                      <PlayCircle className="h-3 w-3" /> Simulate → {next.replace(/_/g, " ")}
                    </button>
                  );
                })()}
                <button
                  onClick={() => {
                    downloadInvoice({
                      id: order.id,
                      createdAt: order.created_at,
                      total: Number(order.total),
                      subtotal: order.subtotal,
                      tax: order.tax,
                      shipping: order.shipping,
                      status: order.status,
                      paymentMethod: order.payment_method,
                      items: order.items,
                      customer: { email },
                      shippingAddress: order.shipping_address as Record<string, unknown> | null,
                    });
                    toast("Invoice downloaded");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs text-accent hover:bg-accent hover:text-accent-foreground"
                >
                  <Download className="h-3 w-3" /> Invoice PDF
                </button>
              </div>
            </div>

            <div className="mt-8 border-t border-border/60 pt-8">
              <OrderTracking
                createdAt={order.created_at}
                status={order.status}
                pincode={order.shipping_address?.pincode}
              />
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      {!order && !error && (
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <div className="mono text-accent">— How tracking works</div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Four stages, zero guessing.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {[
              [Sparkles, "Confirmed", "Payment captured, order in queue."],
              [Package, "Packed", "Picked, packed, sealed in our warehouse."],
              [Truck, "Shipped", "On the road with live courier updates."],
              [MapPin, "Delivered", "Out for delivery → at your door."],
            ].map(([Ico, t, d], i) => {
              const Icon = Ico as typeof Sparkles;
              return (
                <div
                  key={t as string}
                  className="rounded-2xl border border-border/60 bg-card p-5"
                >
                  <div className="mono text-[10px] text-muted-foreground">STAGE 0{i + 1}</div>
                  <Icon className="mt-3 h-5 w-5 text-accent" />
                  <div className="mt-3 font-display text-lg font-bold">{t as string}</div>
                  <div className="text-sm text-muted-foreground">{d as string}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-surface-2 p-5">
              <div className="text-sm font-semibold">Already signed in?</div>
              <p className="mt-1 text-sm text-muted-foreground">
                See every order on one screen — with download invoices, return shortcuts, and live tracking.
              </p>
              <Link to="/orders" className="mt-3 inline-flex text-sm font-semibold text-accent hover:underline">
                Go to My Orders →
              </Link>
            </div>
            <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
              <div className="text-sm font-semibold">Need analytics?</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Daily, monthly, quarterly and yearly reports of your PULSE orders — exportable to PDF.
              </p>
              <Link to="/reports" className="mt-3 inline-flex text-sm font-semibold text-accent hover:underline">
                Open Reports →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
