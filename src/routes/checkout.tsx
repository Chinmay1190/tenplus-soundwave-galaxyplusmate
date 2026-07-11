import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  ArrowRight,
  Banknote,
  Check,
  CreditCard,
  Lock,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  User as UserIcon,
} from "lucide-react";
import { Copy, Download, Mail, PartyPopper, Receipt, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";
import { getProduct } from "@/data/products";
import { inr } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { estimateDelivery, formatEtaRange } from "@/lib/delivery";
import { OrderTracking } from "@/components/site/OrderTracking";
import { downloadInvoice } from "@/lib/invoice";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — PULSE" }, { name: "robots", content: "noindex" }] }),
  component: Checkout,
});

const COD_FEE = 49;

const addressSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(60, "Name is too long")
    .regex(/^[A-Za-z][A-Za-z\s.'-]{1,}$/, "Only letters, spaces, . ' -"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile"),
  line1: z
    .string()
    .trim()
    .min(5, "Address is too short")
    .max(120, "Address is too long"),
  city: z.string().trim().min(2, "Enter a city").max(50),
  state: z.string().trim().min(2, "Enter a state").max(50),
  pincode: z.string().regex(/^\d{6}$/, "6-digit PIN required"),
});

type AddressErrors = Partial<Record<keyof typeof addressSchema.shape, string>>;

function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useStore();
  const { user, loading } = useAuth();
  const items = cart
    .map((c) => ({ ...c, product: getProduct(c.id)! }))
    .filter((x) => x.product);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState<null | {
    id: string;
    createdAt: string;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  }>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    line1: "",
    city: "",
    pincode: "",
    state: "",
  });
  const [payment, setPayment] = useState<"upi" | "card" | "cod">("upi");
  const [errors, setErrors] = useState<AddressErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateAll = () => {
    const res = addressSchema.safeParse(form);
    if (res.success) {
      setErrors({});
      return true;
    }
    const next: AddressErrors = {};
    res.error.issues.forEach((i) => {
      const k = i.path[0] as keyof typeof addressSchema.shape;
      if (!next[k]) next[k] = i.message;
    });
    setErrors(next);
    return false;
  };

  const updateField = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (touched[k]) {
      const single = addressSchema.shape[k].safeParse(v);
      setErrors((e) => ({ ...e, [k]: single.success ? undefined : single.error.issues[0].message }));
    }
  };
  const markTouched = (k: keyof typeof form) => setTouched((t) => ({ ...t, [k]: true }));

  useEffect(() => {
    if (user && !form.name && user.user_metadata?.full_name) {
      setForm((f) => ({ ...f, name: user.user_metadata.full_name as string }));
    }
  }, [user, form.name]);

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const codFee = payment === "cod" ? COD_FEE : 0;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax + codFee;

  const eta = useMemo(() => estimateDelivery(form.pincode), [form.pincode]);
  const etaText = useMemo(() => formatEtaRange(eta), [eta]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/checkout" } });
  }, [user, loading, navigate]);

  if (items.length === 0 && !placed) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty.</h1>
        <p className="mt-3 text-muted-foreground">Add something to checkout.</p>
        <Link
          to="/shop"
          className="mt-6 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  const placeOrder = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: user!.id,
          items: items.map((i) => ({
            id: i.id,
            name: i.product.name,
            qty: i.qty,
            price: i.product.price,
            color: i.color,
          })),
          subtotal,
          shipping: shipping + codFee,
          tax,
          total,
          status: "confirmed",
          shipping_address: form,
          payment_method: payment,
        })
        .select("id, created_at")
        .single();
      if (error) throw error;
      setPlaced({
        id: data.id,
        createdAt: data.created_at,
        subtotal,
        tax,
        shipping: shipping + codFee,
        total,
      });
      clearCart();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setBusy(false);
    }
  };

  if (placed) {
    return (
      <div className="relative mx-auto max-w-4xl overflow-hidden px-4 py-16 sm:px-6">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(700px 320px at 50% 10%, oklch(0.65 0.24 25 / 0.28), transparent 60%), radial-gradient(500px 280px at 50% 100%, oklch(0.65 0.24 25 / 0.15), transparent 70%)",
          }}
        />

        {/* Confetti */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 overflow-hidden">
          {Array.from({ length: 32 }).map((_, i) => {
            const left = (i * 97) % 100;
            const delay = (i % 8) * 0.15;
            const dur = 2.4 + ((i * 13) % 18) / 10;
            const hue = i % 3 === 0 ? "oklch(0.78 0.2 25)" : i % 3 === 1 ? "oklch(0.85 0.15 90)" : "oklch(0.7 0.18 200)";
            const size = 6 + (i % 4) * 2;
            return (
              <span
                key={i}
                className="confetti"
                style={{
                  left: `${left}%`,
                  width: size,
                  height: size * 0.4,
                  background: hue,
                  animationDelay: `${delay}s`,
                  animationDuration: `${dur}s`,
                }}
              />
            );
          })}
        </div>

        {/* Hero */}
        <div className="text-center">
          <div className="celebrate mx-auto grid h-20 w-20 place-items-center rounded-full border border-accent bg-accent/10 text-accent shadow-[0_0_60px_oklch(0.65_0.24_25/0.45)]">
            <Check className="h-10 w-10" strokeWidth={3} />
          </div>
          <div className="mono mt-6 inline-flex items-center gap-2 text-accent">
            <PartyPopper className="h-3.5 w-3.5" /> ORDER CONFIRMED
          </div>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight sm:text-6xl">
            Thank you, <span className="shimmer-text">{form.name.split(" ")[0] || "friend"}</span>.
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
            Your order is in the queue. We've emailed the receipt to{" "}
            <strong className="text-foreground">{user?.email ?? "your inbox"}</strong>.
          </p>

          {/* Copyable order id */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(placed.id);
              toast.success("Order ID copied");
            }}
            className="mono mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2 text-xs hover:border-accent hover:text-accent"
          >
            <Receipt className="h-3.5 w-3.5" />
            ORDER · {placed.id.slice(0, 8).toUpperCase()}
            <Copy className="h-3 w-3 opacity-60" />
          </button>
        </div>

        {/* Summary strip */}
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="mono text-[10px] text-muted-foreground">TOTAL PAID</div>
            <div className="mt-1 font-display text-2xl font-bold">{inr(placed.total)}</div>
            <div className="mono mt-1 text-[10px] uppercase text-muted-foreground">
              {payment === "cod" ? "Cash on delivery" : payment === "upi" ? "UPI" : "Card"}
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="mono text-[10px] text-muted-foreground">ETA</div>
            <div className="mt-1 font-display text-lg font-bold leading-tight">
              {eta.serviceable ? etaText : "3–5 days"}
            </div>
            <div className="mono mt-1 text-[10px] uppercase text-muted-foreground">
              {eta.serviceable ? eta.zone : "Standard shipping"}
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="mono text-[10px] text-muted-foreground">SHIP TO</div>
            <div className="mt-1 text-sm font-semibold leading-tight">{form.name}</div>
            <div className="mono mt-1 text-[10px] uppercase text-muted-foreground">
              {form.city}, {form.state} · {form.pincode}
            </div>
          </div>
        </div>

        {/* Tracking */}
        <div className="mt-8">
          <OrderTracking
            createdAt={placed.createdAt}
            status="confirmed"
            pincode={form.pincode}
          />
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() =>
              downloadInvoice({
                id: placed.id,
                createdAt: placed.createdAt,
                total: placed.total,
                subtotal: placed.subtotal,
                tax: placed.tax,
                shipping: placed.shipping,
                status: "confirmed",
                paymentMethod: payment,
                items: items.map((i) => ({
                  id: i.id,
                  name: i.product.name,
                  qty: i.qty,
                  price: i.product.price,
                })),
                customer: { name: form.name, email: user?.email },
                shippingAddress: form,
              })
            }
            className="btn-magnetic inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            <Download className="h-4 w-4" /> Invoice PDF
          </button>
          <Link
            to="/orders"
            className="btn-magnetic inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
          >
            <Receipt className="h-4 w-4" /> View orders
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-5 py-2.5 text-sm hover:border-accent"
          >
            <ShoppingBag className="h-4 w-4" /> Keep shopping
          </Link>
        </div>

        {/* Support strip */}
        <div className="mt-10 rounded-2xl border border-border/60 bg-surface-2 p-4 text-center text-xs text-muted-foreground">
          <Mail className="mr-1.5 inline h-3.5 w-3.5 text-accent" />
          Questions? Email <span className="font-semibold text-foreground">care@pulse.audio</span> with your order ID and we'll respond within 24 hours.
        </div>

        <style>{`
          .confetti {
            position: absolute; top: -20px; border-radius: 2px;
            animation: confetti-fall linear forwards;
            opacity: 0.9;
          }
          @keyframes confetti-fall {
            0%   { transform: translateY(-40px) rotate(0deg); opacity: 0; }
            10%  { opacity: 1; }
            100% { transform: translateY(260px) rotate(540deg); opacity: 0; }
          }
          .celebrate {
            animation: celebrate-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          @keyframes celebrate-pop {
            0%   { transform: scale(0.3); opacity: 0; }
            60%  { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(1); }
          }
          @media (prefers-reduced-motion: reduce) {
            .confetti, .celebrate { animation: none !important; }
          }
        `}</style>
      </div>
    );
  }

  const step1Valid = addressSchema.safeParse(form).success && eta.serviceable;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mono text-accent">— Checkout</div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Almost yours.
          </h1>
        </div>
        <div className="mono inline-flex items-center gap-2 text-[10px] text-muted-foreground">
          <Lock className="h-3 w-3" /> 256-bit secure checkout
        </div>
      </div>

      {/* Steps */}
      <ol className="mt-8 flex flex-wrap items-center gap-3 text-xs">
        {["Address", "Payment", "Review"].map((s, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          const active = step === n;
          const done = step > n;
          return (
            <li key={s} className="flex items-center gap-3">
              <span
                className={`grid h-7 w-7 place-items-center rounded-full border text-[10px] font-bold ${
                  active
                    ? "border-accent bg-accent text-accent-foreground"
                    : done
                    ? "border-accent text-accent"
                    : "border-border text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : n}
              </span>
              <span className={`mono ${active ? "text-foreground" : "text-muted-foreground"}`}>
                {s}
              </span>
              {i < 2 && <span className="mx-1 h-px w-8 bg-border" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold">Shipping address</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We'll deliver to this address. Save it to your profile for faster checkout.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <In icon={UserIcon} label="Full name" placeholder="Aarav Sharma"
                  v={form.name} err={errors.name}
                  on={(v) => updateField("name", v)}
                  onBlur={() => markTouched("name")} />
                <In icon={Phone} label="Phone" placeholder="9876543210" inputMode="numeric"
                  v={form.phone} err={errors.phone}
                  on={(v) => updateField("phone", v.replace(/\D/g, "").slice(0, 10))}
                  onBlur={() => markTouched("phone")} />
                <div className="sm:col-span-2">
                  <In icon={MapPin} label="Street address" placeholder="Flat / House no, Street, Landmark"
                    v={form.line1} err={errors.line1}
                    on={(v) => updateField("line1", v)}
                    onBlur={() => markTouched("line1")} />
                </div>
                <In label="City" placeholder="Bengaluru"
                  v={form.city} err={errors.city}
                  on={(v) => updateField("city", v)}
                  onBlur={() => markTouched("city")} />
                <In label="State" placeholder="Karnataka"
                  v={form.state} err={errors.state}
                  on={(v) => updateField("state", v)}
                  onBlur={() => markTouched("state")} />
                <In label="PIN code" placeholder="560001" inputMode="numeric"
                  v={form.pincode} err={errors.pincode}
                  on={(v) => updateField("pincode", v.replace(/\D/g, "").slice(0, 6))}
                  onBlur={() => markTouched("pincode")} />
              </div>
              {form.pincode.length === 6 && (
                <div
                  className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${
                    eta.serviceable
                      ? "border-accent/40 bg-accent/5"
                      : "border-destructive/40 bg-destructive/5 text-destructive"
                  }`}
                >
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {eta.serviceable ? (
                    <div>
                      <div className="font-semibold">Delivery by {etaText}</div>
                      <div className="mono mt-0.5 text-[11px] text-muted-foreground">
                        {eta.zone} · {eta.minDays}–{eta.maxDays} business days ·{" "}
                        {eta.cod ? "COD available" : "Prepaid only"}
                      </div>
                    </div>
                  ) : (
                    <div>Enter a valid 6-digit pincode to see delivery options.</div>
                  )}
                </div>
              )}
              <button
                onClick={() => {
                  // mark all touched + validate
                  const all = Object.fromEntries(Object.keys(form).map((k) => [k, true]));
                  setTouched(all);
                  if (validateAll() && eta.serviceable) setStep(2);
                }}
                disabled={items.length === 0}
                className="btn-magnetic group mt-2 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background disabled:opacity-50"
              >
                Continue to payment <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              {!step1Valid && Object.keys(touched).length > 0 && (
                <div className="mono text-[10px] text-destructive">
                  Please complete all fields correctly to continue.
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold">Payment method</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  All payments are encrypted. Demo checkout — no real charge.
                </p>
              </div>
              <div className="grid gap-2">
                {([
                  ["upi", Smartphone, "UPI", "GPay · PhonePe · Paytm", "Instant", true],
                  ["card", CreditCard, "Credit / Debit Card", "Visa · Mastercard · Rupay · Amex", "Secure", false],
                  ["cod", Banknote, "Cash on Delivery", `Extra ₹${COD_FEE} handling fee`, eta.cod ? "Available" : "Not in this PIN", !eta.cod],
                ] as const).map(([v, Ico, l, d, badge, disabled]) => (
                  <label
                    key={v}
                    className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors ${
                      payment === v
                        ? "border-accent bg-accent/5"
                        : "border-border bg-surface-2 hover:border-accent/60"
                    } ${disabled ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <input
                      type="radio"
                      name="pay"
                      checked={payment === v}
                      onChange={() => setPayment(v as typeof payment)}
                      className="accent-accent"
                    />
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-accent">
                      <Ico className="h-4 w-4" />
                    </span>
                    <span className="flex-1">
                      <div className="text-sm font-semibold">{l}</div>
                      <div className="text-xs text-muted-foreground">{d}</div>
                    </span>
                    <span className="mono rounded-full bg-card px-3 py-1 text-[10px] text-muted-foreground">
                      {badge}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-full border border-border bg-surface-2 px-5 py-2.5 text-sm"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="btn-magnetic group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background"
                >
                  Review order{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold">Review & place order</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Quick sanity check before we ship.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ReviewBlock label="Shipping to">
                  <div className="font-semibold">{form.name}</div>
                  <div className="mt-1 text-muted-foreground">
                    {form.line1}
                    <br />
                    {form.city}, {form.state} — {form.pincode}
                    <br />
                    Tel {form.phone}
                  </div>
                </ReviewBlock>
                <ReviewBlock label="Payment">
                  <div className="font-semibold uppercase">{payment}</div>
                  <div className="mt-1 text-muted-foreground">
                    {payment === "upi" && "Pay on next screen via UPI"}
                    {payment === "card" && "Card details captured securely"}
                    {payment === "cod" && `Pay ₹${total} on delivery`}
                  </div>
                </ReviewBlock>
              </div>

              <div className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-surface-2">
                {items.map((i) => (
                  <div key={i.id} className="flex items-center gap-4 p-4">
                    <img
                      src={i.product.image}
                      alt={i.product.name}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{i.product.name}</div>
                      <div className="mono text-[10px] text-muted-foreground">
                        QTY {i.qty}
                        {i.color ? ` · ${i.color}` : ""}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">{inr(i.product.price * i.qty)}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={placeOrder}
                disabled={busy}
                className="btn-magnetic flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />{" "}
                {busy ? "Placing order…" : `Place order · ${inr(total)}`}
              </button>
              <div className="mono inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Lock className="h-3 w-3" /> Demo checkout — no real charge.
              </div>
            </div>
          )}
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-border/60 bg-card p-6">
            <h3 className="font-display text-lg font-bold">Summary</h3>
            <div className="mt-4 space-y-3 text-sm">
              <Line label={`Items (${items.reduce((a, b) => a + b.qty, 0)})`} value={inr(subtotal)} />
              <Line label="GST (18%)" value={inr(tax)} />
              <Line label="Shipping" value={shipping === 0 ? "Free" : inr(shipping)} />
              {codFee > 0 && <Line label="COD handling" value={inr(codFee)} />}
            </div>
            <div className="my-4 border-t border-border/60" />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-display text-3xl font-bold tracking-tight">{inr(total)}</span>
            </div>
            <div className="mono mt-2 text-right text-[10px] text-muted-foreground">
              Incl. all taxes
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-surface-2 p-5">
            <div className="mono text-[10px] text-muted-foreground">— Why PULSE</div>
            <ul className="mt-3 space-y-2.5 text-sm">
              {[
                [ShieldCheck, "2-year warranty", "On every product"],
                [Truck, "Free shipping", "On orders over ₹999"],
                [Sparkles, "30-day returns", "No questions asked"],
                [Lock, "Secure payments", "PCI-DSS compliant"],
              ].map(([Ico, t, d]) => {
                const Icon = Ico as typeof ShieldCheck;
                return (
                  <li key={t as string} className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-accent/30 bg-accent/10 text-accent">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <div className="text-sm font-semibold text-foreground">{t as string}</div>
                      <div className="mono text-[10px] text-muted-foreground">{d as string}</div>
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex items-center justify-center gap-3 border-t border-border/60 pt-3">
              <span className="mono text-[9px] text-muted-foreground">VISA</span>
              <span className="mono text-[9px] text-muted-foreground">•</span>
              <span className="mono text-[9px] text-muted-foreground">MC</span>
              <span className="mono text-[9px] text-muted-foreground">•</span>
              <span className="mono text-[9px] text-muted-foreground">UPI</span>
              <span className="mono text-[9px] text-muted-foreground">•</span>
              <span className="mono text-[9px] text-muted-foreground">RUPAY</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function In({
  label, v, on, icon: Icon, err, placeholder, inputMode, onBlur,
}: {
  label: string;
  v: string;
  on: (v: string) => void;
  icon?: typeof MapPin;
  err?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  onBlur?: () => void;
}) {
  return (
    <label className="block">
      <span className="mono mb-1.5 block text-[10px] text-muted-foreground">{label}</span>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <input
          value={v}
          placeholder={placeholder}
          inputMode={inputMode}
          onChange={(e) => on(e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!err}
          className={`w-full rounded-xl border bg-surface-2 py-2.5 text-sm focus:outline-none focus:ring-2 ${
            err
              ? "border-destructive/70 focus:border-destructive focus:ring-destructive/30"
              : "border-border focus:border-accent focus:ring-accent/30"
          } ${Icon ? "pl-10 pr-3" : "px-4"}`}
        />
      </div>
      {err && (
        <span className="mono mt-1 block text-[10px] text-destructive">{err}</span>
      )}
    </label>
  );
}

function ReviewBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-2 p-4 text-sm">
      <div className="mono text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
