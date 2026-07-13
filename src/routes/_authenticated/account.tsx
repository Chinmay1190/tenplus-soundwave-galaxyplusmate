import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  Check,
  ChevronRight,
  Download,
  FileText,
  Heart,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Monitor,
  Moon,
  Package,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { inr } from "@/lib/format";
import { toast } from "sonner";
import { OrderTracking } from "@/components/site/OrderTracking";
import { downloadInvoice } from "@/lib/invoice";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Profile — PULSE" }, { name: "robots", content: "noindex" }] }),
  component: Account,
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

function Account() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview" | "returns" | "settings">("overview");

  const { data: orders } = useQuery({
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

  const { data: returns } = useQuery({
    queryKey: ["returns", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("returns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    toast("Signed out");
    navigate({ to: "/" });
  };

  const fullName =
    (user?.user_metadata?.full_name as string) ?? user?.email?.split("@")[0] ?? "Friend";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const totalSpend = (orders ?? []).reduce((s, o) => s + Number(o.total || 0), 0);
  const orderCount = orders?.length ?? 0;
  const returnCount = returns?.length ?? 0;
  const recentOrders = (orders ?? []).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* HERO BAND */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-8 sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="grid h-16 w-16 place-items-center rounded-full border border-accent/40 bg-accent/10 font-display text-xl font-bold text-accent">
              {initials}
            </div>
            <div>
              <div className="mono text-accent">— Profile</div>
              <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">
                Hi, {fullName.split(" ")[0]}.
              </h1>
              <div className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {user?.email}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="mono inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[10px] text-accent">
                  <Sparkles className="h-3 w-3" /> PULSE+ Member
                </span>
                {user?.created_at && (
                  <span className="mono inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[10px] text-muted-foreground">
                    Since {new Date(user.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </span>
                )}
                {user?.email_confirmed_at && (
                  <span className="mono inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] text-emerald-400">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <BarChart3 className="h-4 w-4" /> Reports
            </Link>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm hover:border-accent hover:text-accent"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="relative mt-8 grid gap-3 sm:grid-cols-4">
          <Stat icon={ShoppingBag} title="Orders" value={String(orderCount)} sub="lifetime" />
          <Stat icon={TrendingUp} title="Total spend" value={inr(totalSpend)} sub="all time" accent />
          <Stat icon={RotateCcw} title="Returns" value={String(returnCount)} sub="requests" />
          <Stat icon={Heart} title="Wishlist" value="—" sub="curated by you" />
        </div>
      </div>

      {/* QUICK ACCESS GRID */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickCard to="/orders" icon={Package} title="My orders" desc={`${orderCount} placed`} />
        <QuickCard to="/track-order" icon={ChevronRight} title="Track order" desc="Live shipment status" />
        <QuickCard to="/reports" icon={BarChart3} title="Analytics" desc="Daily · monthly · yearly" />
        <QuickCard to="/wishlist" icon={Heart} title="Wishlist" desc="Saved for later" />
      </div>

      {/* TABS */}
      <div className="mt-10 flex gap-1 border-b border-border/60">
        {([
          ["overview", "Overview"],
          ["returns", "Returns"],
          ["settings", "Settings"],
        ] as const).map(([t, l]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              tab === t ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Recent orders</h2>
              <Link to="/orders" className="mono text-[10px] text-muted-foreground hover:text-accent">
                See all →
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <EmptyOrders />
            ) : (
              recentOrders.map((o) => <OrderCard key={o.id} o={o} user={user} />)
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border/60 bg-card p-6">
              <div className="mono text-[10px] text-muted-foreground">— Pinned</div>
              <h3 className="mt-2 font-display text-lg font-bold">Need anything?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Track shipments, download invoices, or open a return — all in one place.
              </p>
              <div className="mt-4 space-y-2">
                <Link to="/track-order" className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm hover:border-accent hover:text-accent">
                  Track an order <ChevronRight className="h-4 w-4" />
                </Link>
                <Link to="/reports" className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm hover:border-accent hover:text-accent">
                  Open analytics <ChevronRight className="h-4 w-4" />
                </Link>
                <Link to="/contact" className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm hover:border-accent hover:text-accent">
                  Talk to care <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-accent/40 bg-accent/5 p-6">
              <Sparkles className="h-5 w-5 text-accent" />
              <h3 className="mt-2 font-display text-base font-bold">PULSE+ member</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Free express shipping, early access to drops and 3-year warranty.
              </p>
              <Link
                to="/shop"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
              >
                Explore benefits →
              </Link>
            </div>
          </aside>
        </div>
      )}

      {tab === "returns" && (
        <div className="mt-6 space-y-3">
          {!returns || returns.length === 0 ? (
            <div className="rounded-3xl border border-border/60 bg-card p-10 text-center">
              <RotateCcw className="mx-auto h-8 w-8 text-accent" />
              <h3 className="mt-3 font-display text-lg font-bold">No returns yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Start a return from any delivered order.</p>
            </div>
          ) : (
            returns.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border/60 bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="mono text-xs text-muted-foreground">
                      RETURN #{r.id.slice(0, 8).toUpperCase()} · {new Date(r.created_at).toLocaleDateString()}
                    </div>
                    <div className="mt-1 font-display text-base font-bold">{r.reason}</div>
                  </div>
                  <span className="mono rounded-full bg-accent/10 px-3 py-1 text-xs capitalize text-accent">
                    {r.status.replace("_", " ")}
                  </span>
                </div>
                {r.description && <p className="mt-3 text-sm text-muted-foreground">{r.description}</p>}
                <div className="mt-3">
                  <ReturnTimeline status={r.status as string} createdAt={r.created_at} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "settings" && <SettingsPanel />}
    </div>
  );
}

function SettingsPanel() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
    } else if (user) {
      setDisplayName(
        (user.user_metadata?.full_name as string) ?? user.email?.split("@")[0] ?? "",
      );
    }
  }, [profile, user]);

  const readPrefs = () => {
    if (typeof window === "undefined") return { marketing: true, orderUpdates: true, drops: false, gstin: "" };
    try {
      return {
        marketing: localStorage.getItem("pulse:pref:marketing") !== "0",
        orderUpdates: localStorage.getItem("pulse:pref:order-updates") !== "0",
        drops: localStorage.getItem("pulse:pref:drops") === "1",
        gstin: localStorage.getItem("pulse:pref:gstin") ?? "",
      };
    } catch {
      return { marketing: true, orderUpdates: true, drops: false, gstin: "" };
    }
  };
  const [prefs, setPrefs] = useState(readPrefs);
  const setPref = (k: keyof typeof prefs, v: boolean | string) => {
    setPrefs((p) => ({ ...p, [k]: v }));
    try {
      const map: Record<string, string> = {
        marketing: "pulse:pref:marketing",
        orderUpdates: "pulse:pref:order-updates",
        drops: "pulse:pref:drops",
        gstin: "pulse:pref:gstin",
      };
      const key = map[k as string];
      if (typeof v === "boolean") localStorage.setItem(key, v ? "1" : "0");
      else localStorage.setItem(key, v);
    } catch { /* ignore */ }
  };

  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("theme") as "light" | "dark" | "system") ?? "system";
  });
  const applyTheme = (t: "light" | "dark" | "system") => {
    setTheme(t);
    try {
      localStorage.setItem("theme", t);
      const root = document.documentElement;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = t === "dark" || (t === "system" && prefersDark);
      root.classList.toggle("dark", isDark);
    } catch { /* ignore */ }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: displayName || null, avatar_url: avatarUrl || null }, { onConflict: "id" });
    setSaving(false);
    if (error) {
      toast.error("Couldn't save profile", { description: error.message });
      return;
    }
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
    toast.success("Profile updated");
  };

  const sendPasswordReset = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent", { description: `Check ${user.email}` });
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-accent" />
            <h2 className="font-display text-lg font-bold">Personal information</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Shown on your orders, invoices, and reviews.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Labeled label="Display name">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </Labeled>
            <Labeled label="Email">
              <input
                value={user?.email ?? ""}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-border bg-surface-2/40 px-4 py-2.5 text-sm text-muted-foreground"
              />
            </Labeled>
            <Labeled label="Avatar URL (optional)">
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </Labeled>
            <Labeled label="GSTIN (for business invoices)">
              <input
                value={prefs.gstin}
                onChange={(e) => setPref("gstin", e.target.value.toUpperCase())}
                placeholder="29ABCDE1234F1Z5"
                maxLength={15}
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm uppercase focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </Labeled>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="btn-magnetic inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save changes
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-accent" />
            <h2 className="font-display text-lg font-bold">Email preferences</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Choose what lands in your inbox.</p>
          <div className="mt-4 space-y-2">
            <Toggle
              label="Order updates"
              desc="Shipping, delivery, and return notifications"
              on={prefs.orderUpdates}
              onChange={(v) => setPref("orderUpdates", v)}
            />
            <Toggle
              label="New drops & launches"
              desc="Early access to Series 03 and limited editions"
              on={prefs.drops}
              onChange={(v) => setPref("drops", v)}
            />
            <Toggle
              label="Deals & marketing"
              desc="Sale alerts, festive offers, and gift guides"
              on={prefs.marketing}
              onChange={(v) => setPref("marketing", v)}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-accent" />
            <h2 className="font-display text-lg font-bold">Appearance</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Match your device or pick a side.</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {([
              ["light", "Light", Sun],
              ["dark", "Dark", Moon],
              ["system", "System", Monitor],
            ] as const).map(([id, label, Ico]) => (
              <button
                key={id}
                onClick={() => applyTheme(id)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm transition-colors ${
                  theme === id
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-surface-2 hover:border-accent/50"
                }`}
              >
                <Ico className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <h2 className="font-display text-lg font-bold">Account security</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Manage your password and sessions.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              onClick={sendPasswordReset}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-left text-sm hover:border-accent hover:text-accent"
            >
              <KeyRound className="h-4 w-4 text-accent" />
              <div className="flex-1">
                <div className="font-semibold">Send password reset</div>
                <div className="text-xs text-muted-foreground">Emailed to {user?.email}</div>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                toast("Contact support to delete your account", {
                  description: "Write to care@pulse.audio with the subject 'Delete account'.",
                })
              }
              className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-left text-sm text-destructive hover:border-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <div className="flex-1">
                <div className="font-semibold">Delete account</div>
                <div className="text-xs text-destructive/80">Permanent — cannot be undone</div>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-border/60 bg-card p-6">
          <div className="mono text-[10px] text-muted-foreground">— Snapshot</div>
          <h3 className="mt-2 font-display text-lg font-bold">Your PULSE identity</h3>
          <div className="mt-4 flex items-center gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-12 w-12 rounded-full border border-border object-cover" />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-full border border-accent/40 bg-accent/10 font-display text-sm font-bold text-accent">
                {(displayName || user?.email || "P").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-semibold">{displayName || "—"}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {prefs.orderUpdates && <Chip icon={Check}>Order updates on</Chip>}
            {prefs.drops && <Chip icon={Check}>Drops on</Chip>}
            {prefs.marketing && <Chip icon={Check}>Marketing on</Chip>}
            {prefs.gstin && <Chip icon={FileText}>GST invoicing</Chip>}
          </div>
        </div>

        <div className="rounded-3xl border border-accent/40 bg-accent/5 p-6">
          <Sparkles className="h-5 w-5 text-accent" />
          <h3 className="mt-2 font-display text-base font-bold">Tip</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a GSTIN to receive business tax invoices on every order — automatically.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mono mb-1.5 block text-[10px] uppercase text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label, desc, on, onChange,
}: { label: string; desc: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="flex w-full items-center gap-4 rounded-xl border border-border bg-surface-2 px-4 py-3 text-left transition-colors hover:border-accent/40"
    >
      <div className="flex-1">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <span
        aria-hidden
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          on ? "bg-accent" : "bg-border"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function Chip({ icon: Icon, children }: { icon: typeof Check; children: React.ReactNode }) {
  return (
    <span className="mono inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/5 px-2 py-1 text-[10px] text-accent">
      <Icon className="h-3 w-3" />
      {children}
    </span>
  );
}

function Stat({
  icon: Icon, title, value, sub, accent,
}: {
  icon: typeof UserIcon; title: string; value: string; sub: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-accent/40 bg-accent/5" : "border-border/60 bg-surface-2"}`}>
      <div className="flex items-center justify-between">
        <span className="mono text-[10px] text-muted-foreground">{title}</span>
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <div className="mt-3 font-display text-2xl font-bold tracking-tight">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function QuickCard({
  to, icon: Icon, title, desc,
}: { to: string; icon: typeof Package; title: string; desc: string }) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:-translate-y-1 hover:border-accent/50"
    >
      <Icon className="h-5 w-5 text-accent" />
      <div className="mt-3 font-display text-base font-bold">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
      <ChevronRight className="absolute right-4 top-4 h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent" />
    </Link>
  );
}

function SettingRow({
  icon: Icon, title, desc,
}: { icon: typeof Settings; title: string; desc: string }) {
  return (
    <button className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 text-left transition-all hover:border-accent/40">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface-2 text-accent">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <div className="font-display text-base font-bold">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function EmptyOrders() {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-10 text-center">
      <Package className="mx-auto h-8 w-8 text-accent" />
      <h3 className="mt-3 font-display text-lg font-bold">No orders yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">When you place an order it'll appear here.</p>
      <Link to="/shop" className="mt-5 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">
        Start shopping
      </Link>
    </div>
  );
}

function OrderCard({ o, user }: { o: Order; user: ReturnType<typeof useAuth>["user"] }) {
  const [expand, setExpand] = useState(false);
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="mono text-[10px] text-muted-foreground">
            #{o.id.slice(0, 8).toUpperCase()} · {new Date(o.created_at).toLocaleDateString()}
          </div>
          <div className="mt-1 font-display text-xl font-bold">{inr(Number(o.total))}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {o.items.slice(0, 3).map((i) => `${i.name} × ${i.qty}`).join(" · ")}
            {o.items.length > 3 && ` +${o.items.length - 3} more`}
          </div>
        </div>
        <span className="mono rounded-full bg-accent/10 px-3 py-1 text-xs capitalize text-accent">
          {o.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setExpand((x) => !x)}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
        >
          <ChevronRight className={`h-3 w-3 transition-transform ${expand ? "rotate-90" : ""}`} />
          {expand ? "Hide tracking" : "Track"}
        </button>
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

      {expand && (
        <div className="mt-5 border-t border-border/60 pt-5">
          <OrderTracking createdAt={o.created_at} status={o.status} pincode={o.shipping_address?.pincode} compact />
        </div>
      )}
    </div>
  );
}

function ReturnTimeline({ status, createdAt }: { status: string; createdAt: string }) {
  const stages = ["requested", "approved", "picked_up", "refunded"] as const;
  const idx = status === "rejected" ? -1 : Math.max(0, stages.indexOf(status as typeof stages[number]));
  if (status === "rejected") {
    return <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
      Return rejected. Contact support for details.
    </div>;
  }
  return (
    <div className="relative">
      <div className="absolute left-3 right-3 top-3 h-px bg-border" />
      <div className="absolute left-3 top-3 h-px bg-accent" style={{ width: `calc((100% - 1.5rem) * ${idx / (stages.length - 1)})` }} />
      <ol className="relative flex justify-between">
        {stages.map((s, i) => (
          <li key={s} className="flex flex-col items-center gap-1">
            <span className={`relative z-10 h-6 w-6 rounded-full border ${i <= idx ? "border-accent bg-accent" : "border-border bg-background"}`} />
            <span className="mono text-[10px] capitalize text-muted-foreground">{s.replace("_", " ")}</span>
            {i === 0 && <span className="mono text-[9px] text-muted-foreground">{new Date(createdAt).toLocaleDateString()}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
