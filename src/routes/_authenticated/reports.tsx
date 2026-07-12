import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar, Download, FileBarChart2, RotateCcw, ShoppingBag, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LogoMark } from "@/components/site/Logo";
import { useAuth } from "@/hooks/use-auth";
import { inr } from "@/lib/format";
import {
  type Granularity,
  type ReportOrder,
  type ReportReturn,
  buildSummary,
  downloadReportPDF,
} from "@/lib/reports";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics — PULSE" }, { name: "robots", content: "noindex" }] }),
  component: ReportsPage,
});

type Preset = "today" | "week" | "month" | "quarter" | "year" | "custom";

const PRESETS: { key: Preset; label: string; gran: Granularity }[] = [
  { key: "today", label: "Today", gran: "day" },
  { key: "week", label: "This Week", gran: "day" },
  { key: "month", label: "This Month", gran: "day" },
  { key: "quarter", label: "Quarter", gran: "week" },
  { key: "year", label: "Year", gran: "month" },
  { key: "custom", label: "Custom", gran: "day" },
];

function presetRange(preset: Preset): { from: Date; to: Date; label: string } {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date(to);
  from.setHours(0, 0, 0, 0);
  switch (preset) {
    case "today":
      return { from, to, label: "Daily Report" };
    case "week":
      from.setDate(from.getDate() - 6);
      return { from, to, label: "Weekly Report" };
    case "month":
      from.setDate(1);
      return { from, to, label: "Monthly Report" };
    case "quarter":
      from.setMonth(from.getMonth() - 2);
      from.setDate(1);
      return { from, to, label: "Quarterly Report" };
    case "year":
      from.setMonth(0, 1);
      return { from, to, label: "Yearly Report" };
    case "custom":
      from.setDate(from.getDate() - 30);
      return { from, to, label: "Custom Report" };
  }
}

const CHART_COLORS = ["#e11d2f", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6", "#f97316"];

function ReportsPage() {
  const { user } = useAuth();
  const [preset, setPreset] = useState<Preset>("month");
  const [gran, setGran] = useState<Granularity>("day");
  const [customFrom, setCustomFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [customTo, setCustomTo] = useState<string>(new Date().toISOString().slice(0, 10));

  const { data: orders } = useQuery({
    queryKey: ["reports-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,total,subtotal,tax,shipping,status,created_at,items")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as ReportOrder[];
    },
  });

  const { data: returns } = useQuery({
    queryKey: ["reports-returns", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("returns")
        .select("id,status,reason,created_at,items")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as ReportReturn[];
    },
  });

  const range = useMemo(() => {
    if (preset === "custom") {
      const from = new Date(customFrom);
      from.setHours(0, 0, 0, 0);
      const to = new Date(customTo);
      to.setHours(23, 59, 59, 999);
      return { from, to, label: "Custom Report" };
    }
    return presetRange(preset);
  }, [preset, customFrom, customTo]);

  const summary = useMemo(
    () => buildSummary(orders ?? [], returns ?? [], range.from, range.to, gran, range.label),
    [orders, returns, range, gran],
  );

  const customerName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-accent/5 p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.65 0.24 25 / 0.35), transparent 70%)" }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark size={30} />
              <div className="mono text-accent">— Reports & Analytics</div>
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Your sound, in numbers.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Daily, monthly, quarterly and yearly views of your orders, returns and category mix.
              Export anything to a print-ready PDF.
            </p>
          </div>
          <button
            onClick={() => downloadReportPDF(summary, customerName)}
            className="btn-magnetic inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/30"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Range picker */}
      <div className="mt-8 rounded-3xl border border-border/60 bg-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => {
                setPreset(p.key);
                setGran(p.gran);
              }}
              className={`mono rounded-full border px-4 py-2 text-[11px] transition-colors ${
                preset === p.key
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-surface-2 hover:border-accent hover:text-accent"
              }`}
            >
              {p.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{summary.rangeLabel}</span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <label className="block">
            <span className="mono mb-1.5 block text-[10px] text-muted-foreground">From</span>
            <input
              type="date"
              value={preset === "custom" ? customFrom : range.from.toISOString().slice(0, 10)}
              disabled={preset !== "custom"}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm disabled:opacity-60"
            />
          </label>
          <label className="block">
            <span className="mono mb-1.5 block text-[10px] text-muted-foreground">To</span>
            <input
              type="date"
              value={preset === "custom" ? customTo : range.to.toISOString().slice(0, 10)}
              disabled={preset !== "custom"}
              onChange={(e) => setCustomTo(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm disabled:opacity-60"
            />
          </label>
          <label className="block">
            <span className="mono mb-1.5 block text-[10px] text-muted-foreground">Group by</span>
            <select
              value={gran}
              onChange={(e) => setGran(e.target.value as Granularity)}
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
              <option value="year">Year</option>
            </select>
          </label>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPI icon={TrendingUp} label="Revenue" value={inr(summary.totalRevenue)} sub={`${summary.totalOrders} orders`} spark={summary.series.map((d) => d.revenue)} />
        <KPI icon={ShoppingBag} label="Avg Order" value={inr(summary.avgOrder)} sub={`${summary.totalUnits} units`} spark={summary.series.map((d) => d.orders)} />
        <KPI icon={RotateCcw} label="Returns" value={String(summary.returnCount)} sub={`${summary.returnRate.toFixed(1)}% rate`} tone={summary.returnRate > 5 ? "warn" : "ok"} />
        <KPI icon={FileBarChart2} label="Refund Est." value={inr(summary.refundEstimate)} sub="lifetime value at risk" />
      </div>


      {/* Trend */}
      <Section title="Revenue trend" subtitle={`Grouped by ${gran}`}>
        {summary.series.length === 0 ? (
          <Empty msg="No orders in this period." />
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.series} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.08)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "oklch(0.65 0 0)" }} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.65 0 0)" }} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.11 0 0)",
                    border: "1px solid oklch(1 0 0 / 0.12)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number, name) => (name === "revenue" ? inr(v) : v)}
                />
                <Line type="monotone" dataKey="revenue" stroke="#e11d2f" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="orders" stroke="oklch(0.85 0 0)" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Section title="By category" subtitle="Revenue share">
          {summary.byCategory.length === 0 ? (
            <Empty msg="No category data." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-[1fr_180px] sm:items-center">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.byCategory}
                      dataKey="revenue"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {summary.byCategory.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.11 0 0)",
                        border: "1px solid oklch(1 0 0 / 0.12)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => inr(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2 text-sm">
                {summary.byCategory.slice(0, 6).map((c, i) => (
                  <li key={c.name} className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="capitalize">{c.name}</span>
                    </span>
                    <span className="mono text-xs text-muted-foreground">{inr(c.revenue)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        <Section title="Top products" subtitle="By units sold">
          {summary.topProducts.length === 0 ? (
            <Empty msg="Nothing sold yet." />
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.topProducts} layout="vertical" margin={{ left: 10, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.08)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "oklch(0.65 0 0)" }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "oklch(0.65 0 0)" }}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.11 0 0)",
                      border: "1px solid oklch(1 0 0 / 0.12)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="units" fill="#e11d2f" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Section>
      </div>

      {/* Returns */}
      <Section title="Returns analytics" subtitle={`${summary.returnCount} returns · ${summary.returnRate.toFixed(1)}% of orders`}>
        {summary.returnReasons.length === 0 ? (
          <Empty msg="No returns in this period." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.returnReasons} margin={{ top: 10, right: 12, left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.08)" />
                  <XAxis dataKey="reason" tick={{ fontSize: 11, fill: "oklch(0.65 0 0)" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "oklch(0.65 0 0)" }} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.11 0 0)",
                      border: "1px solid oklch(1 0 0 / 0.12)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2 self-center text-sm">
              {summary.returnReasons.map((r) => (
                <li key={r.reason} className="flex items-center justify-between rounded-xl border border-border/60 bg-surface-2 px-4 py-2.5">
                  <span>{r.reason}</span>
                  <span className="mono text-xs text-accent">×{r.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>
    </div>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  sub,
  spark,
  tone,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  sub: string;
  spark?: number[];
  tone?: "ok" | "warn";
}) {
  const max = spark && spark.length ? Math.max(...spark, 1) : 1;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card to-surface-2 p-5 transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-40"
        style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
      />
      <div className="relative flex items-center justify-between">
        <span className="mono text-[10px] text-muted-foreground">{label}</span>
        <span
          className={`grid h-8 w-8 place-items-center rounded-full border ${
            tone === "warn"
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-accent/30 bg-accent/10 text-accent"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="relative mt-3 font-display text-2xl font-bold tracking-tight">{value}</div>
      <div className="relative mt-0.5 text-xs text-muted-foreground">{sub}</div>
      {spark && spark.length > 1 ? (
        <div className="relative mt-3 flex h-6 items-end gap-0.5">
          {spark.slice(-16).map((v, i) => (
            <span
              key={i}
              className="flex-1 rounded-sm bg-accent/60"
              style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
            />
          ))}
        </div>
      ) : (
        <div className="relative mt-3 h-0.5 w-8 rounded-full bg-gradient-to-r from-accent to-transparent" />
      )}
    </div>
  );
}


function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-3xl border border-border/60 bg-card p-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="mono mt-0.5 text-[10px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-border bg-surface-2 px-6 py-12 text-sm text-muted-foreground">
      {msg}
    </div>
  );
}
