import { jsPDF } from "jspdf";
import { getProduct } from "@/data/products";

export type ReportOrder = {
  id: string;
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  status: string;
  created_at: string;
  items: { id?: string; name: string; qty: number; price?: number }[];
};

export type ReportReturn = {
  id: string;
  status: string;
  reason: string;
  created_at: string;
  items?: unknown;
};

export type Granularity = "day" | "week" | "month" | "quarter" | "year";

export type ReportSummary = {
  label: string;
  rangeLabel: string;
  from: Date;
  to: Date;
  totalRevenue: number;
  totalOrders: number;
  totalUnits: number;
  avgOrder: number;
  returnCount: number;
  returnRate: number;
  refundEstimate: number;
  series: { label: string; revenue: number; orders: number }[];
  byCategory: { name: string; revenue: number; units: number }[];
  topProducts: { name: string; units: number; revenue: number }[];
  returnReasons: { reason: string; count: number }[];
};

const inr = (n: number) =>
  "Rs. " + Math.round(n).toLocaleString("en-IN");

const fmt = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const inRange = (iso: string, from: Date, to: Date) => {
  const t = new Date(iso).getTime();
  return t >= from.getTime() && t <= to.getTime();
};

export function buildSummary(
  orders: ReportOrder[],
  returns: ReportReturn[],
  from: Date,
  to: Date,
  granularity: Granularity,
  label: string,
): ReportSummary {
  const inWindow = orders.filter((o) => inRange(o.created_at, from, to));
  const retWindow = returns.filter((r) => inRange(r.created_at, from, to));

  const totalRevenue = inWindow.reduce((s, o) => s + Number(o.total || 0), 0);
  const totalOrders = inWindow.length;
  const totalUnits = inWindow.reduce(
    (s, o) => s + o.items.reduce((a, b) => a + b.qty, 0),
    0,
  );
  const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;
  const returnCount = retWindow.length;
  const returnRate = totalOrders ? (returnCount / totalOrders) * 100 : 0;
  const refundEstimate = totalOrders
    ? (totalRevenue / totalOrders) * returnCount
    : 0;

  // Build time buckets
  const buckets = new Map<string, { revenue: number; orders: number; sort: number }>();
  const keyOf = (d: Date) => {
    if (granularity === "day")
      return d.toISOString().slice(0, 10);
    if (granularity === "week") {
      const monday = new Date(d);
      const day = (monday.getDay() + 6) % 7;
      monday.setDate(monday.getDate() - day);
      return monday.toISOString().slice(0, 10);
    }
    if (granularity === "month")
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (granularity === "quarter")
      return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
    return String(d.getFullYear());
  };
  const labelOf = (key: string) => {
    if (granularity === "day")
      return new Date(key).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (granularity === "week")
      return "Wk " + new Date(key).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (granularity === "month") {
      const [y, m] = key.split("-").map(Number);
      return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    }
    return key;
  };
  const sortOf = (key: string) => {
    if (granularity === "quarter") {
      const [y, q] = key.split("-Q").map(Number);
      return y * 10 + q;
    }
    if (granularity === "year") return Number(key);
    return new Date(key).getTime();
  };

  inWindow.forEach((o) => {
    const k = keyOf(new Date(o.created_at));
    const cur = buckets.get(k) ?? { revenue: 0, orders: 0, sort: sortOf(k) };
    cur.revenue += Number(o.total);
    cur.orders += 1;
    buckets.set(k, cur);
  });

  const series = Array.from(buckets.entries())
    .sort(([, a], [, b]) => a.sort - b.sort)
    .map(([k, v]) => ({ label: labelOf(k), revenue: v.revenue, orders: v.orders }));

  // Category & product breakdowns
  const catMap = new Map<string, { revenue: number; units: number }>();
  const prodMap = new Map<string, { units: number; revenue: number }>();
  inWindow.forEach((o) => {
    o.items.forEach((it) => {
      const p = it.id ? getProduct(it.id) : null;
      const cat = p?.category ? p.category : "other";
      const rev = (it.price ?? 0) * it.qty;
      const c = catMap.get(cat) ?? { revenue: 0, units: 0 };
      c.revenue += rev;
      c.units += it.qty;
      catMap.set(cat, c);

      const pr = prodMap.get(it.name) ?? { units: 0, revenue: 0 };
      pr.units += it.qty;
      pr.revenue += rev;
      prodMap.set(it.name, pr);
    });
  });

  const byCategory = Array.from(catMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  const topProducts = Array.from(prodMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 8);

  const reasonMap = new Map<string, number>();
  retWindow.forEach((r) => {
    reasonMap.set(r.reason, (reasonMap.get(r.reason) ?? 0) + 1);
  });
  const returnReasons = Array.from(reasonMap.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);

  return {
    label,
    rangeLabel: `${fmt(from)} — ${fmt(to)}`,
    from,
    to,
    totalRevenue,
    totalOrders,
    totalUnits,
    avgOrder,
    returnCount,
    returnRate,
    refundEstimate,
    series,
    byCategory,
    topProducts,
    returnReasons,
  };
}

// ────────────────────────────────────────────────────────────
// PDF
// ────────────────────────────────────────────────────────────
const ink: [number, number, number] = [17, 17, 19];
const sub: [number, number, number] = [70, 70, 78];
const muted: [number, number, number] = [130, 130, 138];
const hair: [number, number, number] = [225, 225, 230];
const accent: [number, number, number] = [225, 29, 47];
const accentDark: [number, number, number] = [170, 20, 36];
const tint: [number, number, number] = [250, 250, 252];

function drawLogoMark(doc: jsPDF, x: number, y: number, size: number) {
  const s = size;
  doc.setDrawColor(...accent);
  doc.setLineWidth(Math.max(0.8, s * 0.05));
  doc.roundedRect(x, y, s, s, s * 0.28, s * 0.28, "S");
  doc.setFillColor(...accent);
  const heights = [0.28, 0.55, 0.85, 0.55, 0.28];
  const bw = s * 0.09;
  const gap = (s - bw * 5) / 6;
  heights.forEach((h, i) => {
    const bh = s * h;
    const bx = x + gap + i * (bw + gap);
    const by = y + (s - bh) / 2;
    doc.roundedRect(bx, by, bw, bh, bw / 2, bw / 2, "F");
  });
}

export function downloadReportPDF(s: ReportSummary, customerName?: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;

  // ── HEADER BAND ──────────────────────────────────────────
  doc.setFillColor(...ink);
  doc.rect(0, 0, W, 42, "F");
  doc.setFillColor(30, 30, 34);
  doc.rect(W / 2, 0, W / 2, 42, "F");
  doc.setFillColor(...accent);
  doc.rect(0, 42, W, 2, "F");
  doc.setFillColor(...accentDark);
  doc.rect(0, 44, W, 1, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("PULSE · ANALYTICS SUITE", M, 26);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 220, 224);
  doc.text("Performance Report · www.pulse.audio", W - M, 26, { align: "right" });

  drawLogoMark(doc, M, 62, 34);
  doc.setTextColor(...ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("PULSE", M + 44, 82);
  doc.setTextColor(...accent);
  doc.text(".", M + 44 + doc.getTextWidth("PULSE"), 82);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...muted);
  doc.text("BUSINESS PERFORMANCE REPORT", M + 44, 96);

  // Right meta pill
  const pillW = 210;
  doc.setFillColor(...tint);
  doc.roundedRect(W - M - pillW, 62, pillW, 60, 8, 8, "F");
  doc.setDrawColor(...hair);
  doc.roundedRect(W - M - pillW, 62, pillW, 60, 8, 8, "S");
  doc.setFillColor(...accent);
  doc.rect(W - M - pillW, 62, 3, 60, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text("REPORT PERIOD", W - M - pillW + 14, 76);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...ink);
  doc.text(s.label.toUpperCase(), W - M - pillW + 14, 94);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...sub);
  doc.text(s.rangeLabel, W - M - pillW + 14, 108);
  if (customerName) {
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    doc.text(`Account: ${customerName}`, W - M - pillW + 14, 118);
  }

  doc.setDrawColor(...hair);
  doc.setLineWidth(0.6);
  doc.line(M, 138, W - M, 138);

  // ── EXECUTIVE SUMMARY ────────────────────────────────────
  let esY = 152;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...accent);
  doc.text("EXECUTIVE SUMMARY", M, esY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...sub);
  const bestCat = s.byCategory[0]?.name ?? "—";
  const bestProd = s.topProducts[0]?.name ?? "—";
  const peak = s.series.reduce(
    (best, cur) => (cur.revenue > best.revenue ? cur : best),
    { label: "—", revenue: 0, orders: 0 },
  );
  const summaryText =
    `During ${s.rangeLabel.toLowerCase()}, PULSE recorded ${inr(s.totalRevenue)} in gross revenue ` +
    `across ${s.totalOrders} order${s.totalOrders === 1 ? "" : "s"} and ${s.totalUnits} units. ` +
    `The strongest category was "${bestCat}", led by "${bestProd}". ` +
    `${s.returnCount > 0 ? `Returns landed at ${s.returnRate.toFixed(1)}% of orders.` : "No returns were recorded — a clean period."}`;
  const wrapped = doc.splitTextToSize(summaryText, W - 2 * M);
  wrapped.forEach((ln: string, i: number) => doc.text(ln, M, esY + 14 + i * 12));
  esY += 14 + wrapped.length * 12;


  // ── KPI CARDS ────────────────────────────────────────────
  let y = esY + 12;
  const cardW = (W - 2 * M - 24) / 4;
  const cards: [string, string, string][] = [
    ["REVENUE", inr(s.totalRevenue), `${s.totalOrders} orders`],
    ["AVG ORDER", inr(s.avgOrder), `${s.totalUnits} units sold`],
    ["RETURNS", String(s.returnCount), `${s.returnRate.toFixed(1)}% rate`],
    ["REFUND EST.", inr(s.refundEstimate), `Across ${s.returnCount} returns`],
  ];
  cards.forEach(([k, v, sub2], i) => {
    const x = M + i * (cardW + 8);
    doc.setFillColor(...tint);
    doc.rect(x, y, cardW, 78, "F");
    doc.setDrawColor(...hair);
    doc.rect(x, y, cardW, 78, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    doc.text(k, x + 14, y + 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...ink);
    doc.text(v, x + 14, y + 46);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...sub);
    doc.text(sub2, x + 14, y + 64);
  });

  // ── TREND CHART ──────────────────────────────────────────
  y += 100;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ink);
  doc.text("Revenue Trend", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text(`Bucketed by ${s.series.length} periods`, M, y + 12);

  y += 24;
  const chartH = 140;
  const chartW = W - 2 * M;
  doc.setDrawColor(...hair);
  doc.rect(M, y, chartW, chartH, "S");

  if (s.series.length > 0) {
    const maxRev = Math.max(...s.series.map((d) => d.revenue), 1);
    const bw = (chartW - 24) / s.series.length;
    s.series.forEach((d, i) => {
      const bh = (d.revenue / maxRev) * (chartH - 32);
      const bx = M + 12 + i * bw;
      const by = y + chartH - 18 - bh;
      doc.setFillColor(...ink);
      doc.rect(bx + 4, by, Math.max(2, bw - 8), bh, "F");
      doc.setFillColor(...accent);
      doc.rect(bx + 4, by, Math.max(2, bw - 8), Math.min(4, bh), "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...muted);
      doc.text(d.label, bx + bw / 2, y + chartH - 6, { align: "center" });
    });
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...muted);
    doc.text("No orders in this period.", W / 2, y + chartH / 2, { align: "center" });
  }

  // ── CATEGORY TABLE ───────────────────────────────────────
  y += chartH + 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ink);
  doc.text("By Category", M, y);

  y += 14;
  doc.setFillColor(...ink);
  doc.rect(M, y, chartW, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("CATEGORY", M + 12, y + 14);
  doc.text("UNITS", M + chartW - 160, y + 14, { align: "right" });
  doc.text("REVENUE", M + chartW - 12, y + 14, { align: "right" });
  y += 30;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (s.byCategory.length === 0) {
    doc.setTextColor(...muted);
    doc.text("—", M + 12, y);
    y += 18;
  } else {
    s.byCategory.slice(0, 6).forEach((c, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(...tint);
        doc.rect(M, y - 12, chartW, 20, "F");
      }
      doc.setTextColor(...ink);
      doc.text(c.name.toUpperCase(), M + 12, y);
      doc.text(String(c.units), M + chartW - 160, y, { align: "right" });
      doc.text(inr(c.revenue), M + chartW - 12, y, { align: "right" });
      y += 20;
    });
  }

  // Page break if needed
  if (y > H - 240) {
    doc.addPage();
    y = M + 20;
  }

  // ── TOP PRODUCTS ─────────────────────────────────────────
  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ink);
  doc.text("Top Products", M, y);
  y += 14;
  doc.setFillColor(...ink);
  doc.rect(M, y, chartW, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("PRODUCT", M + 12, y + 14);
  doc.text("UNITS", M + chartW - 160, y + 14, { align: "right" });
  doc.text("REVENUE", M + chartW - 12, y + 14, { align: "right" });
  y += 30;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (s.topProducts.length === 0) {
    doc.setTextColor(...muted);
    doc.text("—", M + 12, y);
    y += 18;
  } else {
    s.topProducts.forEach((p, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(...tint);
        doc.rect(M, y - 12, chartW, 20, "F");
      }
      doc.setTextColor(...ink);
      doc.text(doc.splitTextToSize(p.name, 320)[0], M + 12, y);
      doc.text(String(p.units), M + chartW - 160, y, { align: "right" });
      doc.text(inr(p.revenue), M + chartW - 12, y, { align: "right" });
      y += 20;
    });
  }

  // ── RETURNS ──────────────────────────────────────────────
  if (y > H - 180) {
    doc.addPage();
    y = M + 20;
  }
  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ink);
  doc.text("Returns Analysis", M, y);
  y += 14;
  doc.setFillColor(...ink);
  doc.rect(M, y, chartW, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("REASON", M + 12, y + 14);
  doc.text("COUNT", M + chartW - 12, y + 14, { align: "right" });
  y += 30;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (s.returnReasons.length === 0) {
    doc.setTextColor(...muted);
    doc.text("No returns in this period.", M + 12, y);
    y += 18;
  } else {
    s.returnReasons.forEach((r, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(...tint);
        doc.rect(M, y - 12, chartW, 20, "F");
      }
      doc.setTextColor(...ink);
      doc.text(r.reason, M + 12, y);
      doc.text(String(r.count), M + chartW - 12, y, { align: "right" });
      y += 20;
    });
  }

  // ── KEY INSIGHTS & RECOMMENDATIONS ───────────────────────
  if (y > H - 220) { doc.addPage(); y = M + 20; }
  y += 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ink);
  doc.text("Key Insights & Recommendations", M, y);
  y += 16;

  const insights: string[] = [];
  if (s.totalOrders > 0) {
    insights.push(`Average order value stands at ${inr(s.avgOrder)} — a healthy benchmark for premium audio SKUs.`);
  }
  if (s.byCategory[0]) {
    const share = (s.byCategory[0].revenue / Math.max(1, s.totalRevenue)) * 100;
    insights.push(`"${s.byCategory[0].name}" drives ${share.toFixed(0)}% of revenue — consider deepening inventory here.`);
  }
  if (s.topProducts[0]) {
    insights.push(`Top mover: "${s.topProducts[0].name}" at ${s.topProducts[0].units} units — bundle candidates.`);
  }
  if (peak.revenue > 0) {
    insights.push(`Peak period was "${peak.label}" with ${inr(peak.revenue)}. Align promos to repeat that spike.`);
  }
  if (s.returnRate > 5) {
    insights.push(`Return rate ${s.returnRate.toFixed(1)}% is above 5% — review packaging and product description accuracy.`);
  } else if (s.returnCount === 0 && s.totalOrders > 0) {
    insights.push(`Zero returns — customer satisfaction indicator is strong for this window.`);
  }
  if (insights.length === 0) {
    insights.push("Not enough activity in this window to generate meaningful insights.");
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  insights.forEach((t) => {
    doc.setTextColor(...accent);
    doc.text("▸", M + 4, y);
    doc.setTextColor(...sub);
    const lines = doc.splitTextToSize(t, W - 2 * M - 16);
    lines.forEach((ln: string, i: number) => doc.text(ln, M + 16, y + i * 11));
    y += lines.length * 11 + 6;
  });

  // Confidential band
  y += 6;
  doc.setFillColor(...tint);
  doc.rect(M, y, W - 2 * M, 26, "F");
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.8);
  doc.line(M, y, M, y + 26);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...accent);
  doc.text("CONFIDENTIAL", M + 12, y + 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...sub);
  doc.text(
    "This report is intended solely for the account holder. Do not redistribute without written consent.",
    M + 12,
    y + 22,
  );


  // Footer on each page
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setDrawColor(...hair);
    doc.line(M, H - 50, W - M, H - 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(`Generated ${fmt(new Date())} · PULSE Analytics`, M, H - 34);
    doc.text(`Page ${p} of ${total}`, W - M, H - 34, { align: "right" });
    doc.setTextColor(...accent);
    doc.text("www.pulse.audio", W / 2, H - 22, { align: "center" });
  }

  doc.save(`PULSE-Report-${s.label.replace(/\s+/g, "-")}-${s.from.toISOString().slice(0, 10)}.pdf`);
}
