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

export function downloadInvoice(data: InvoiceData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();   // 595
  const H = doc.internal.pageSize.getHeight();  // 842
  const M = 40;

  const shortId = data.id.slice(0, 8).toUpperCase();
  const created = new Date(data.createdAt);
  const due = new Date(created.getTime() + 7 * 86400000);
  const dateFmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  // ── HEADER BAND ──────────────────────────────────────────
  doc.setFillColor(...ink);
  doc.rect(0, 0, W, 34, "F");
  doc.setFillColor(30, 30, 34);
  doc.rect(W / 2, 0, W / 2, 34, "F");
  doc.setFillColor(...accent);
  doc.rect(0, 34, W, 2, "F");
  doc.setFillColor(...accentDark);
  doc.rect(0, 36, W, 1, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("PULSE · AUDIO LABS · EST. 2021", M, 22);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 220, 224);
  doc.text("Experience Sound Beyond Reality · www.pulse.audio", W - M, 22, { align: "right" });

  // Logo & wordmark
  drawLogoMark(doc, M, 50, 28);
  doc.setTextColor(...ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("PULSE", M + 36, 70);
  doc.setTextColor(...accent);
  doc.text(".", M + 36 + doc.getTextWidth("PULSE"), 70);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text("TAX INVOICE · BILL OF SUPPLY", M + 36, 82);

  // INVOICE title + meta pill
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...ink);
  doc.text("INVOICE", W - M, 66, { align: "right" });

  const pillW = 200;
  const pillH = 58;
  const pillX = W - M - pillW;
  const pillY = 74;
  doc.setFillColor(...tint);
  doc.roundedRect(pillX, pillY, pillW, pillH, 5, 5, "F");
  doc.setDrawColor(...hair);
  doc.roundedRect(pillX, pillY, pillW, pillH, 5, 5, "S");

  const irnSeed = Array.from(data.id).reduce((a, c) => (a * 131 + c.charCodeAt(0)) >>> 0, 7);
  const irn = irnSeed.toString(16).padStart(8, "0") + (irnSeed ^ 0xa5a5a5a5).toString(16).padStart(8, "0");
  const ackNo = (240000000000 + (irnSeed % 89999999999)).toString();

  const metaRows: [string, string, "normal" | "mono"][] = [
    ["INVOICE NO.", `INV-${shortId}`, "normal"],
    ["ISSUED", dateFmt(created), "normal"],
    ["DUE", dateFmt(due), "normal"],
    ["IRN", irn.slice(0, 16).toUpperCase(), "mono"],
    ["ACK NO.", ackNo, "mono"],
  ];
  metaRows.forEach(([k, v, style], i) => {
    const ry = pillY + 11 + i * 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...muted);
    doc.text(k, pillX + 8, ry);
    if (style === "mono") {
      doc.setFont("courier", "bold");
      doc.setFontSize(7);
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
    }
    doc.setTextColor(...ink);
    doc.text(v, pillX + pillW - 8, ry, { align: "right" });
  });

  // ── PARTIES ──────────────────────────────────────────────
  let y = 148;
  doc.setDrawColor(...hair);
  doc.setLineWidth(0.5);
  doc.line(M, y - 8, W - M, y - 8);

  const colW = (W - 2 * M) / 3;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text("FROM", M, y);
  doc.text("BILLED TO", M + colW, y);
  doc.text("SHIPPED TO", M + colW * 2, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...ink);

  const addr = (data.shippingAddress || {}) as Record<string, string>;
  const customerName = data.customer?.name || (addr.name as string) || "Valued Customer";
  const customerEmail = data.customer?.email || "";
  const pos = (addr.state as string) || "Karnataka";

  const fromLines = [
    "PULSE Audio Pvt. Ltd.",
    "12 Innovation Park, Bengaluru, KA 560001",
    "GSTIN: 29ABCDE1234F1Z5  ·  support@pulse.audio",
  ];
  const billLines = [customerName, customerEmail].filter(Boolean) as string[];
  const shipLines = [
    addr.name as string,
    addr.line1 as string,
    [addr.city, addr.state, addr.pincode].filter(Boolean).join(", "),
    addr.phone ? `Tel: ${addr.phone}` : "",
  ].filter(Boolean) as string[];
  if (shipLines.length === 0) shipLines.push("Same as billing");

  const write = (lines: string[], x: number, maxW: number) => {
    lines.forEach((l, i) => {
      const wrapped = doc.splitTextToSize(l, maxW) as string[];
      wrapped.slice(0, 2).forEach((w, j) => doc.text(w, x, y + 12 + i * 11 + j * 10));
    });
  };
  write(fromLines, M, colW - 8);
  write(billLines, M + colW, colW - 8);
  write(shipLines, M + colW * 2, colW - 8);

  // Place of supply row
  y = 208;
  doc.setFillColor(...tint);
  doc.rect(M, y, W - 2 * M, 20, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...muted);
  doc.text("PLACE OF SUPPLY", M + 8, y + 8);
  doc.text("REVERSE CHARGE", M + colW, y + 8);
  doc.text("CURRENCY", M + colW * 2, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...ink);
  doc.text(pos, M + 8, y + 17);
  doc.text("No", M + colW, y + 17);
  doc.text("INR (Indian Rupee)", M + colW * 2, y + 17);

  // ── ITEMS TABLE ──────────────────────────────────────────
  y = 238;
  const tableX = M;
  const tableW = W - 2 * M;
  const colHsn = M + 260;
  const colQty = M + 320;
  const colUnit = M + 390;
  const colAmt = W - M;

  doc.setFillColor(...ink);
  doc.rect(tableX, y, tableW, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("DESCRIPTION", tableX + 10, y + 13);
  doc.text("HSN", colHsn, y + 13);
  doc.text("QTY", colQty, y + 13, { align: "right" });
  doc.text("UNIT PRICE", colUnit, y + 13, { align: "right" });
  doc.text("AMOUNT", colAmt - 10, y + 13, { align: "right" });

  y += 26;

  const explicitSubtotal = data.subtotal && data.subtotal > 0 ? data.subtotal : 0;
  const itemsTotal = data.items.reduce((sum, it) => sum + (it.price ?? 0) * it.qty, 0);
  const subtotal = explicitSubtotal || itemsTotal || data.total / 1.18;
  const tax = data.tax ?? Math.max(0, data.total - subtotal - (data.shipping ?? 0));
  const cgst = tax / 2;
  const sgst = tax / 2;
  const shipFee = data.shipping ?? 0;

  // Budget: table body max ~130pt. Cap displayed items to keep it single-page.
  const MAX_ROWS = 6;
  const displayItems = data.items.slice(0, MAX_ROWS);
  const hiddenCount = data.items.length - displayItems.length;

  displayItems.forEach((it, idx) => {
    const unit = it.price ?? subtotal / Math.max(1, data.items.reduce((a, b) => a + b.qty, 0));
    const amt = unit * it.qty;
    const nameLines = (doc.splitTextToSize(it.name, 245) as string[]).slice(0, 2);
    const rowH = Math.max(18, 10 + nameLines.length * 10);

    if (idx % 2 === 1) {
      doc.setFillColor(...tint);
      doc.rect(tableX, y - 10, tableW, rowH, "F");
    }
    doc.setTextColor(...ink);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    nameLines.forEach((ln, li) => doc.text(ln, tableX + 10, y + li * 10));
    doc.setTextColor(...sub);
    doc.setFontSize(8);
    doc.text("8518", colHsn, y);
    doc.text(String(it.qty), colQty, y, { align: "right" });
    doc.text(inr(unit), colUnit, y, { align: "right" });
    doc.setTextColor(...ink);
    doc.setFontSize(9);
    doc.text(inr(amt), colAmt - 10, y, { align: "right" });
    y += rowH;
  });

  if (hiddenCount > 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(`… and ${hiddenCount} more item(s) — see order confirmation email.`, tableX + 10, y);
    y += 12;
  }

  doc.setDrawColor(...hair);
  doc.setLineWidth(0.5);
  doc.line(tableX, y - 6, tableX + tableW, y - 6);

  // ── HSN TAX SUMMARY (compact 1-row) ──────────────────────
  y += 6;
  doc.setFillColor(245, 245, 248);
  doc.rect(tableX, y, tableW, 32, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...muted);
  const hsnHeaders: [string, number, "left" | "right"][] = [
    ["HSN/SAC", tableX + 10, "left"],
    ["TAXABLE VALUE", tableX + 170, "right"],
    ["CGST %", tableX + 230, "right"],
    ["CGST AMT", tableX + 300, "right"],
    ["SGST %", tableX + 360, "right"],
    ["SGST AMT", tableX + 430, "right"],
    ["TOTAL TAX", tableX + tableW - 10, "right"],
  ];
  hsnHeaders.forEach(([l, x, a]) => doc.text(l, x, y + 10, { align: a }));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...ink);
  doc.text("8518", tableX + 10, y + 24);
  doc.text(inr(subtotal), tableX + 170, y + 24, { align: "right" });
  doc.text("9%", tableX + 230, y + 24, { align: "right" });
  doc.text(inr(cgst), tableX + 300, y + 24, { align: "right" });
  doc.text("9%", tableX + 360, y + 24, { align: "right" });
  doc.text(inr(sgst), tableX + 430, y + 24, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text(inr(cgst + sgst), tableX + tableW - 10, y + 24, { align: "right" });
  y += 40;

  // ── TOTALS + AMOUNT IN WORDS (side-by-side) ─────────────
  const totalsX = W - M - 200;
  const wordsW = totalsX - M - 12;

  // Amount in words card (left)
  doc.setFillColor(...tint);
  doc.rect(M, y, wordsW, 86, "F");
  doc.setDrawColor(...hair);
  doc.rect(M, y, wordsW, 86, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text("AMOUNT IN WORDS", M + 10, y + 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...ink);
  const wordsLines = doc.splitTextToSize(amountInWords(data.total), wordsW - 20) as string[];
  wordsLines.slice(0, 3).forEach((l, i) => doc.text(l, M + 10, y + 26 + i * 11));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...accent);
  doc.text("INCLUDED WITH YOUR ORDER", M + 10, y + 66);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...sub);
  doc.text("2-yr warranty  ·  30-day returns  ·  Free replacement (10d)  ·  1800-PULSE-IN", M + 10, y + 78);

  // Totals column (right)
  let ty = y + 10;
  const totRow = (label: string, value: string, opts: { bold?: boolean; rule?: boolean } = {}) => {
    if (opts.rule) {
      doc.setDrawColor(...ink);
      doc.setLineWidth(0.8);
      doc.line(totalsX, ty - 6, W - M, ty - 6);
    }
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.bold ? 11 : 9);
    doc.setTextColor(...(opts.bold ? ink : sub));
    doc.text(label, totalsX, ty);
    doc.setTextColor(...ink);
    doc.text(value, W - M, ty, { align: "right" });
    ty += opts.bold ? 18 : 13;
  };
  totRow("Subtotal", inr(subtotal));
  totRow("CGST (9%)", inr(cgst));
  totRow("SGST (9%)", inr(sgst));
  totRow("Shipping", shipFee === 0 ? "FREE" : inr(shipFee));
  totRow("Total (INR)", inr(data.total), { bold: true, rule: true });

  y += 96;

  // ── PAYMENT SUMMARY ──────────────────────────────────────
  const isPaid =
    (data.paymentMethod || "").toLowerCase() !== "cod" &&
    (data.status || "confirmed").toLowerCase() !== "pending";

  doc.setFillColor(...tint);
  doc.rect(M, y, W - 2 * M, 46, "F");
  doc.setDrawColor(...hair);
  doc.rect(M, y, W - 2 * M, 46, "S");

  const blockW = (W - 2 * M - 80) / 4;
  const blocks: [string, string][] = [
    ["ORDER ID", `#${shortId}`],
    ["STATUS", (data.status || "confirmed").replace(/_/g, " ").toUpperCase()],
    ["PAYMENT", (data.paymentMethod || "Prepaid").toUpperCase()],
    [isPaid ? "AMOUNT PAID" : "AMOUNT DUE", inr(data.total)],
  ];
  blocks.forEach(([k, v], i) => {
    const bx = M + i * blockW + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...muted);
    doc.text(k, bx, y + 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...ink);
    doc.text(v, bx, y + 32);
  });

  // PAID / DUE stamp
  const stampX = W - M - 66;
  const stampY = y + 8;
  const stampCol = isPaid ? success : accent;
  doc.setDrawColor(...stampCol);
  doc.setLineWidth(1.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...stampCol);
  const stampLabel = isPaid ? "PAID" : "DUE";
  doc.roundedRect(stampX, stampY, 56, 30, 3, 3, "S");
  doc.setLineWidth(0.5);
  doc.roundedRect(stampX + 2, stampY + 2, 52, 26, 2, 2, "S");
  doc.text(stampLabel, stampX + 28, stampY + 20, { align: "center" });

  doc.setFillColor(...accent);
  doc.rect(M, y + 44, W - 2 * M, 2, "F");
  y += 54;

  // ── TXN REF STRIP ────────────────────────────────────────
  const txnHash = Array.from(data.id).reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 5381);
  const txnRef = "TXN" + txnHash.toString(36).toUpperCase().padStart(10, "0").slice(0, 10);
  const utrRef = "UTR" + ((txnHash ^ 0x9e3779b9) >>> 0).toString().padStart(12, "0").slice(0, 12);
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...hair);
  doc.rect(M, y, W - 2 * M, 22, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...muted);
  doc.text("TXN REF", M + 8, y + 9);
  doc.text("UTR / BANK REF", M + 180, y + 9);
  doc.text("SETTLED ON", M + 360, y + 9);
  doc.setFont("courier", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...ink);
  doc.text(txnRef, M + 8, y + 18);
  doc.text(utrRef, M + 180, y + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(dateFmt(created), M + 360, y + 18);
  y += 28;

  // Payment instructions when DUE (compact)
  if (!isPaid) {
    doc.setFillColor(255, 248, 240);
    doc.setDrawColor(...accent);
    doc.setLineWidth(0.5);
    doc.rect(M, y, W - 2 * M, 32, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...accent);
    doc.text("PAYMENT INSTRUCTIONS · SETTLE BY " + dateFmt(due).toUpperCase(), M + 8, y + 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...ink);
    doc.text("HDFC Bank · A/C 5010 0234 5678 90 · IFSC HDFC0001234", M + 8, y + 22);
    doc.setFont("courier", "bold");
    doc.setTextColor(...accentDark);
    doc.text(`UPI: pulse@hdfcbank · Ref INV-${shortId}`, W - M - 8, y + 22, { align: "right" });
    y += 38;
  }

  // ── TERMS + SIGNATURE / QR ───────────────────────────────
  const bottomY = H - 78; // reserve for footer
  y = Math.min(y + 4, bottomY - 86);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...ink);
  doc.text("TERMS & CONDITIONS", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...sub);
  const terms = [
    "1. Returns within 30 days in original, unopened condition with accessories.",
    "2. 2-year warranty on manufacturing defects (accidental damage excluded).",
    "3. Prices inclusive of GST (CGST + SGST) as per GST Act, 2017.",
    "4. Disputes subject to exclusive jurisdiction of courts in Bengaluru.",
    "5. Computer-generated invoice; digitally signed. E. & O. E.",
  ];
  terms.forEach((t, i) => doc.text(t, M, y + 10 + i * 9));

  // QR + signature (right side)
  const qrSize = 46;
  const qrX = W - M - qrSize - 132;
  const qrY = y - 2;
  const grid = 11;
  const cell = qrSize / grid;
  doc.setFillColor(255, 255, 255);
  doc.rect(qrX, qrY, qrSize, qrSize, "F");
  doc.setDrawColor(...hair);
  doc.rect(qrX, qrY, qrSize, qrSize, "S");
  doc.setFillColor(...ink);
  const finder = (fx: number, fy: number) => {
    doc.rect(fx, fy, cell * 3, cell * 3, "F");
    doc.setFillColor(255, 255, 255);
    doc.rect(fx + cell * 0.5, fy + cell * 0.5, cell * 2, cell * 2, "F");
    doc.setFillColor(...ink);
    doc.rect(fx + cell, fy + cell, cell, cell, "F");
  };
  finder(qrX, qrY);
  finder(qrX + qrSize - cell * 3, qrY);
  finder(qrX, qrY + qrSize - cell * 3);
  let seed = Array.from(data.id).reduce((a, c) => (a * 1103515245 + c.charCodeAt(0)) >>> 0, 1);
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0xffffffff; };
  for (let gx = 0; gx < grid; gx++) {
    for (let gy = 0; gy < grid; gy++) {
      const inFinder = (gx < 3 && gy < 3) || (gx > grid - 4 && gy < 3) || (gx < 3 && gy > grid - 4);
      if (inFinder) continue;
      if (rnd() > 0.52) doc.rect(qrX + gx * cell, qrY + gy * cell, cell, cell, "F");
    }
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(...muted);
  doc.text("SCAN TO VERIFY", qrX + qrSize / 2, qrY + qrSize + 7, { align: "center" });

  // Signature block
  const sigX = qrX + qrSize + 14;
  const sigW = W - M - sigX;
  doc.setDrawColor(...hair);
  doc.setLineWidth(0.5);
  doc.line(sigX, qrY + 32, sigX + sigW, qrY + 32);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(12);
  doc.setTextColor(...accent);
  doc.text("PULSE", sigX + sigW / 2, qrY + 26, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...muted);
  doc.text("For PULSE Audio Pvt. Ltd.", sigX + sigW / 2, qrY + 42, { align: "center" });
  doc.text("Authorised Signatory · Digitally signed", sigX + sigW / 2, qrY + 51, { align: "center" });

  // ── FOOTER (watermark + fine print) ──────────────────────
  // Diagonal watermark
  doc.saveGraphicsState?.();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(90);
  const GS = (doc as unknown as { GState?: new (o: { opacity: number }) => unknown; setGState?: (s: unknown) => void });
  if (GS.GState && GS.setGState) GS.setGState(new GS.GState({ opacity: 0.04 }));
  doc.setTextColor(...ink);
  doc.text("PULSE", W / 2, H / 2, { align: "center", angle: -28 });
  if (GS.GState && GS.setGState) GS.setGState(new GS.GState({ opacity: 1 }));
  doc.restoreGraphicsState?.();

  doc.setDrawColor(...hair);
  doc.line(M, H - 58, W - M, H - 58);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...ink);
  doc.text("Thank you for choosing PULSE — where every beat matters.", M, H - 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text(
    "Support · care@pulse.audio · 1800-PULSE-IN · Track at pulse.audio/track/" + shortId,
    M, H - 32,
  );
  doc.text(
    "PULSE Audio Pvt. Ltd. · CIN U74999KA2021PTC145678 · GSTIN 29ABCDE1234F1Z5",
    M, H - 22,
  );
  doc.setTextColor(...accent);
  doc.text("www.pulse.audio", W - M, H - 22, { align: "right" });
  doc.setTextColor(...muted);
  doc.text("Page 1 of 1", W / 2, H - 22, { align: "center" });

  doc.save(`PULSE-Invoice-${shortId}.pdf`);
}
