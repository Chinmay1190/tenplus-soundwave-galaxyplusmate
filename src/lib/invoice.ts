import { jsPDF } from "jspdf";

export type InvoiceItem = { name: string; qty: number; price?: number };
export type InvoiceData = {
  id: string;
  createdAt: string | Date;
  total: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  status?: string;
  paymentMethod?: string;
  items: InvoiceItem[];
  customer?: { name?: string; email?: string };
  shippingAddress?: Record<string, unknown> | null;
};

const inr = (n: number) =>
  "Rs. " + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Convert integer rupees to words (Indian numbering)
function amountInWords(num: number): string {
  const n = Math.round(num);
  if (n === 0) return "Zero Rupees Only";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (x: number): string =>
    x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? " " + a[x % 10] : "");
  const three = (x: number): string => {
    const h = Math.floor(x / 100);
    const r = x % 100;
    return (h ? a[h] + " Hundred" + (r ? " and " : "") : "") + (r ? two(r) : "");
  };
  let x = n;
  const parts: string[] = [];
  const crore = Math.floor(x / 10000000); x %= 10000000;
  const lakh = Math.floor(x / 100000); x %= 100000;
  const thousand = Math.floor(x / 1000); x %= 1000;
  const rest = x;
  if (crore) parts.push(three(crore) + " Crore");
  if (lakh) parts.push(three(lakh) + " Lakh");
  if (thousand) parts.push(three(thousand) + " Thousand");
  if (rest) parts.push(three(rest));
  return parts.join(" ") + " Rupees Only";
}

const ink: [number, number, number] = [17, 17, 19];
const sub: [number, number, number] = [60, 60, 68];
const muted: [number, number, number] = [120, 120, 128];
const hair: [number, number, number] = [225, 225, 230];
const accent: [number, number, number] = [225, 29, 47];
const accentDark: [number, number, number] = [170, 20, 36];
const tint: [number, number, number] = [250, 250, 252];
const success: [number, number, number] = [16, 128, 74];

// Draws the PULSE waveform mark inside a rounded square.
function drawLogoMark(
  doc: jsPDF,
  x: number,
  y: number,
  size: number,
  onDark = false,
) {
  const s = size;
  const strokeCol = onDark ? [255, 255, 255] : accent;
  const barCol = onDark ? [255, 255, 255] : accent;
  doc.setDrawColor(strokeCol[0], strokeCol[1], strokeCol[2]);
  doc.setLineWidth(Math.max(0.8, s * 0.05));
  doc.roundedRect(x, y, s, s, s * 0.28, s * 0.28, "S");
  doc.setFillColor(barCol[0], barCol[1], barCol[2]);
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

export function downloadInvoice(data: InvoiceData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48; // page margin

  const shortId = data.id.slice(0, 8).toUpperCase();
  const created = new Date(data.createdAt);
  const due = new Date(created.getTime() + 7 * 86400000);
  const dateFmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  // ── HEADER BAND ──────────────────────────────────────────
  // Layered gradient effect using two rects
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
  doc.text("PULSE · AUDIO LABS · EST. 2021", M, 26);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 220, 224);
  doc.text("Experience Sound Beyond Reality · www.pulse.audio", W - M, 26, { align: "right" });

  // Vector logo mark + wordmark
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
  doc.text("TAX INVOICE  ·  BILL OF SUPPLY", M + 44, 96);

  // Right side: invoice meta
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...ink);
  doc.text("INVOICE", W - M, 80, { align: "right" });
  // meta pill
  const pillW = 168;
  doc.setFillColor(...tint);
  doc.roundedRect(W - M - pillW, 90, pillW, 46, 6, 6, "F");
  doc.setDrawColor(...hair);
  doc.roundedRect(W - M - pillW, 90, pillW, 46, 6, 6, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text("INVOICE NO.", W - M - pillW + 10, 102);
  doc.text("ISSUED", W - M - pillW + 10, 118);
  doc.text("DUE", W - M - pillW + 10, 132);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...ink);
  doc.text(`INV-${shortId}`, W - M - 10, 102, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(dateFmt(created), W - M - 10, 118, { align: "right" });
  doc.text(dateFmt(due), W - M - 10, 132, { align: "right" });

  // Hairline rule
  doc.setDrawColor(...hair);
  doc.setLineWidth(0.6);
  doc.line(M, 148, W - M, 148);

  // ── PARTIES ──────────────────────────────────────────────
  let y = 170;
  const colW = (W - 2 * M) / 3;

  const labelStyle = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
  };
  const bodyStyle = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...ink);
  };

  labelStyle();
  doc.text("FROM", M, y);
  doc.text("BILLED TO", M + colW, y);
  doc.text("SHIPPED TO", M + colW * 2, y);

  bodyStyle();
  const fromLines = [
    "PULSE Audio Pvt. Ltd.",
    "12, Innovation Park",
    "Bengaluru, KA 560001",
    "GSTIN: 29ABCDE1234F1Z5",
    "support@pulse.audio",
  ];
  fromLines.forEach((l, i) => doc.text(l, M, y + 16 + i * 13));

  const addr = (data.shippingAddress || {}) as Record<string, string>;
  const customerName = data.customer?.name || (addr.name as string) || "Valued Customer";
  const customerEmail = data.customer?.email || "";
  const billLines = [customerName, customerEmail].filter(Boolean) as string[];
  billLines.forEach((l, i) => doc.text(l, M + colW, y + 16 + i * 13));

  const shipLines = [
    addr.name as string,
    addr.line1 as string,
    [addr.city, addr.state, addr.pincode].filter(Boolean).join(", "),
    addr.phone ? `Tel: ${addr.phone}` : "",
  ].filter(Boolean) as string[];
  if (shipLines.length === 0) shipLines.push("Same as billing");
  shipLines.forEach((l, i) => doc.text(l, M + colW * 2, y + 16 + i * 13));

  // ── ITEMS TABLE ──────────────────────────────────────────
  y = 260;
  const tableX = M;
  const tableW = W - 2 * M;
  const colHsn = M + 280;
  const colQty = M + 340;
  const colUnit = M + 410;
  const colAmt = W - M;

  // Header band
  doc.setFillColor(...ink);
  doc.rect(tableX, y, tableW, 26, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("DESCRIPTION", tableX + 12, y + 17);
  doc.text("HSN", colHsn, y + 17);
  doc.text("QTY", colQty, y + 17, { align: "right" });
  doc.text("UNIT PRICE", colUnit, y + 17, { align: "right" });
  doc.text("AMOUNT", colAmt - 12, y + 17, { align: "right" });

  y += 36;

  // Compute totals
  const explicitSubtotal = data.subtotal && data.subtotal > 0 ? data.subtotal : 0;
  const itemsTotal = data.items.reduce(
    (sum, it) => sum + (it.price ?? 0) * it.qty,
    0,
  );
  const subtotal = explicitSubtotal || itemsTotal || data.total / 1.18;
  const tax = data.tax ?? Math.max(0, data.total - subtotal - (data.shipping ?? 0));
  const cgst = tax / 2;
  const sgst = tax / 2;
  const shipFee = data.shipping ?? 0;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  data.items.forEach((it, idx) => {
    const unit = it.price ?? subtotal / Math.max(1, data.items.reduce((a, b) => a + b.qty, 0));
    const amt = unit * it.qty;

    const nameLines = doc.splitTextToSize(it.name, 260) as string[];
    const rowH = Math.max(24, 14 + nameLines.length * 12);

    // Page-break guard so long orders don't crash into the footer/totals
    if (y + rowH > H - 320) {
      doc.addPage();
      y = M + 20;
      doc.setFillColor(...ink);
      doc.rect(tableX, y - 20, tableW, 26, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("DESCRIPTION (contd.)", tableX + 12, y - 3);
      doc.text("AMOUNT", colAmt - 12, y - 3, { align: "right" });
      y += 16;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(...tint);
      doc.rect(tableX, y - 14, tableW, rowH, "F");
    }
    doc.setTextColor(...ink);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    nameLines.forEach((ln, li) => doc.text(ln, tableX + 12, y + li * 12));
    doc.setTextColor(...sub);
    doc.setFontSize(9);
    doc.text("8518", colHsn, y);
    doc.text(String(it.qty), colQty, y, { align: "right" });
    doc.text(inr(unit), colUnit, y, { align: "right" });
    doc.setTextColor(...ink);
    doc.setFontSize(10);
    doc.text(inr(amt), colAmt - 12, y, { align: "right" });
    y += rowH;
  });

  // hairline under last row
  doc.setDrawColor(...hair);
  doc.setLineWidth(0.5);
  doc.line(tableX, y - 8, tableX + tableW, y - 8);


  // ── TOTALS ───────────────────────────────────────────────
  y += 14;
  const labelX = W - M - 200;
  const valueX = W - M;

  const row = (label: string, value: string, opts: { bold?: boolean; rule?: boolean } = {}) => {
    if (opts.rule) {
      doc.setDrawColor(...ink);
      doc.setLineWidth(0.8);
      doc.line(labelX, y - 10, valueX, y - 10);
    }
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.bold ? 12 : 10);
    doc.setTextColor(...(opts.bold ? ink : sub));
    doc.text(label, labelX, y);
    doc.setTextColor(...ink);
    doc.text(value, valueX, y, { align: "right" });
    y += opts.bold ? 22 : 16;
  };

  row("Subtotal", inr(subtotal));
  row("CGST (9%)", inr(cgst));
  row("SGST (9%)", inr(sgst));
  row("Shipping", shipFee === 0 ? "FREE" : inr(shipFee));
  row("Total (INR)", inr(data.total), { bold: true, rule: true });

  // Amount in words
  doc.setFillColor(...tint);
  doc.rect(M, y, W - 2 * M, 26, "F");
  doc.setDrawColor(...hair);
  doc.rect(M, y, W - 2 * M, 26, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...muted);
  doc.text("AMOUNT IN WORDS", M + 12, y + 11);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...ink);
  doc.text(amountInWords(data.total), M + 12, y + 22);
  y += 34;

  // Page-break guard before payment summary block
  if (y + 220 > H - 60) {
    doc.addPage();
    y = M + 20;
  }

  // ── PAYMENT SUMMARY ──────────────────────────────────────
  const isPaid =
    (data.paymentMethod || "").toLowerCase() !== "cod" &&
    (data.status || "confirmed").toLowerCase() !== "pending";
  doc.setFillColor(...tint);
  doc.rect(M, y, W - 2 * M, 64, "F");

  doc.setDrawColor(...hair);
  doc.rect(M, y, W - 2 * M, 64, "S");

  const blockW = (W - 2 * M) / 4;
  const blocks: [string, string][] = [
    ["ORDER ID", `#${shortId}`],
    ["STATUS", (data.status || "confirmed").replace(/_/g, " ").toUpperCase()],
    ["PAYMENT", (data.paymentMethod || "Prepaid").toUpperCase()],
    [isPaid ? "AMOUNT PAID" : "AMOUNT DUE", inr(data.total)],
  ];
  blocks.forEach(([k, v], i) => {
    const bx = M + i * blockW + 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    doc.text(k, bx, y + 22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...ink);
    doc.text(v, bx, y + 44);
  });

  // PAID / COD stamp — rotated
  const stampX = W - M - 60;
  const stampY = y + 8;
  const stampCol = isPaid ? success : accent;
  doc.setDrawColor(...stampCol);
  doc.setLineWidth(1.8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...stampCol);
  const label = isPaid ? "PAID" : "DUE";
  // faux rotated stamp: draw double border + label
  doc.roundedRect(stampX - 4, stampY - 4, 68, 40, 4, 4, "S");
  doc.setLineWidth(0.6);
  doc.roundedRect(stampX - 1, stampY - 1, 62, 34, 3, 3, "S");
  doc.text(label, stampX + 30, stampY + 22, { align: "center" });

  // Accent strip
  doc.setFillColor(...accent);
  doc.rect(M, y + 60, W - 2 * M, 4, "F");

  // ── VALUE-ADD BENEFITS BAR ───────────────────────────────
  y += 78;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...accent);
  doc.text("INCLUDED WITH YOUR ORDER", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...sub);
  const perks = [
    "✓  2-year manufacturer warranty",
    "✓  30-day no-questions returns",
    "✓  Free doorstep replacement in first 10 days",
    "✓  Priority customer care · 1800-PULSE-IN",
  ];
  perks.forEach((p, i) => {
    const col = i % 2;
    const rowIdx = Math.floor(i / 2);
    doc.text(p, M + col * ((W - 2 * M) / 2), y + 14 + rowIdx * 12);
  });

  // ── TERMS & SIGNATURE ────────────────────────────────────
  y += 46;
  if (y + 120 > H - 60) {
    doc.addPage();
    y = M + 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...ink);
  doc.text("TERMS & CONDITIONS", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...sub);
  const terms = [
    "1. Returns accepted within 30 days of delivery in original, unopened condition with all accessories.",
    "2. Warranty: 2 years on all PULSE audio products against manufacturing defects (accidental damage excluded).",
    "3. Prices are inclusive of all taxes. CGST + SGST as applicable under GST Act, 2017.",
    "4. Any dispute is subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.",
    "5. This is a computer-generated invoice; a digital signature is affixed in lieu of a physical one. E. & O. E.",
  ];
  terms.forEach((t, i) => doc.text(t, M, y + 14 + i * 11));

  // Signature box
  const sigX = W - M - 160;
  const sigY = y + 6;
  doc.setDrawColor(...hair);
  doc.setLineWidth(0.5);
  doc.line(sigX, sigY + 44, W - M, sigY + 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...muted);
  doc.text("For PULSE Audio Pvt. Ltd.", sigX + 80, sigY + 56, { align: "center" });
  doc.text("Authorised Signatory · Digitally signed", sigX + 80, sigY + 66, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(14);
  doc.setTextColor(...accent);
  doc.text("PULSE", sigX + 80, sigY + 38, { align: "center" });

  // ── FOOTER ───────────────────────────────────────────────
  doc.setDrawColor(...hair);
  doc.line(M, H - 58, W - M, H - 58);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...ink);
  doc.text("Thank you for choosing PULSE — where every beat matters.", M, H - 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...muted);
  doc.text(
    "Support · care@pulse.audio · 1800-PULSE-IN (toll-free)  ·  Track order at pulse.audio/track",
    M,
    H - 30,
  );
  doc.text(
    "PULSE Audio Pvt. Ltd. · CIN: U74999KA2021PTC145678 · GSTIN: 29ABCDE1234F1Z5",
    M,
    H - 20,
  );
  doc.setTextColor(...accent);
  doc.text("www.pulse.audio", W - M, H - 20, { align: "right" });

  doc.save(`PULSE-Invoice-${shortId}.pdf`);
}

