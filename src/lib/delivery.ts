// Pincode-based ETA + order tracking helpers (mock but deterministic).

export type DeliveryEstimate = {
  zone: string;
  minDays: number;
  maxDays: number;
  cod: boolean;
  serviceable: boolean;
};

const ZONES: { name: string; prefixes: string[]; min: number; max: number; cod: boolean }[] = [
  { name: "Metro Express", prefixes: ["11", "40", "56", "60", "70"], min: 1, max: 2, cod: true }, // Delhi, Mumbai, Bangalore, Chennai, Kolkata
  { name: "Tier-1 Cities", prefixes: ["12", "20", "38", "41", "50", "62", "68"], min: 2, max: 3, cod: true },
  { name: "Tier-2 / Tier-3", prefixes: ["1", "2", "3", "4", "5", "6", "7"], min: 3, max: 5, cod: true },
  { name: "Remote / North-East", prefixes: ["79", "78", "8"], min: 5, max: 8, cod: false },
];

export function estimateDelivery(pincode: string): DeliveryEstimate {
  const pin = (pincode || "").trim();
  if (!/^\d{6}$/.test(pin)) {
    return { zone: "—", minDays: 0, maxDays: 0, cod: false, serviceable: false };
  }
  for (const z of ZONES) {
    if (z.prefixes.some((p) => pin.startsWith(p))) {
      return { zone: z.name, minDays: z.min, maxDays: z.max, cod: z.cod, serviceable: true };
    }
  }
  return { zone: "Standard", minDays: 4, maxDays: 7, cod: true, serviceable: true };
}

export function formatEtaRange(e: DeliveryEstimate, from: Date = new Date()): string {
  if (!e.serviceable) return "Enter a valid 6-digit pincode";
  const min = new Date(from.getTime() + e.minDays * 86400000);
  const max = new Date(from.getTime() + e.maxDays * 86400000);
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  return `${fmt(min)} – ${fmt(max)}`;
}

// Order tracking timeline ---------------------------------------------------

export type TrackingStage = {
  key: "confirmed" | "packed" | "shipped" | "out_for_delivery" | "delivered";
  label: string;
  description: string;
  at: Date | null;
  reached: boolean;
  active: boolean;
};

const STAGE_OFFSETS: Record<TrackingStage["key"], number> = {
  confirmed: 0,
  packed: 0.5,
  shipped: 1,
  out_for_delivery: 2.5,
  delivered: 3,
};

export function buildTracking(
  createdAt: string | Date,
  status: string,
  pincode?: string,
): TrackingStage[] {
  const start = new Date(createdAt);
  const eta = pincode ? estimateDelivery(pincode) : null;
  const totalDays = eta?.serviceable ? eta.maxDays : 3;

  const stages: { key: TrackingStage["key"]; label: string; description: string }[] = [
    { key: "confirmed", label: "Order Confirmed", description: "We've received your order." },
    { key: "packed", label: "Packed", description: "Items packed & quality-checked." },
    { key: "shipped", label: "Shipped", description: "Handed to courier partner." },
    { key: "out_for_delivery", label: "Out for Delivery", description: "Arriving today." },
    { key: "delivered", label: "Delivered", description: "Enjoy your PULSE gear." },
  ];

  const order = ["confirmed", "packed", "shipped", "out_for_delivery", "delivered"] as const;
  const statusIdx = Math.max(0, order.indexOf(status as typeof order[number]));
  const now = Date.now();

  // Purely status-driven: each stage lights up only when its status is reached.
  // Timestamps are projected along the ETA window so the timeline still tells a story.
  return stages
    .map((s, i) => {
      const offset = (STAGE_OFFSETS[s.key] / 3) * totalDays;
      const projected = new Date(start.getTime() + offset * 86400000);
      const reached = i <= statusIdx;
      const at = reached
        ? i === 0
          ? start
          : new Date(Math.min(now, projected.getTime()))
        : projected;
      return { ...s, at, reached, active: false };
    })
    .map((s, i, arr) => {
      const lastReached = arr.reduce((acc, x, idx) => (x.reached ? idx : acc), 0);
      return { ...s, active: i === lastReached && i < arr.length - 1 };
    });
}
