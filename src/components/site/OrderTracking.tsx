import { Check } from "lucide-react";
import { buildTracking, type TrackingStage } from "@/lib/delivery";

export function OrderTracking({
  createdAt,
  status,
  pincode,
  compact = false,
}: {
  createdAt: string | Date;
  status: string;
  pincode?: string;
  compact?: boolean;
}) {
  const stages = buildTracking(createdAt, status, pincode);
  const lastDone = stages.reduce((acc, s, i) => (s.reached ? i : acc), 0);
  const pct = (lastDone / (stages.length - 1)) * 100;

  return (
    <div className={compact ? "" : "rounded-2xl border border-border/60 bg-card p-5 sm:p-6"}>
      {!compact && <div className="mono mb-5 text-xs text-muted-foreground">— Tracking</div>}

      {/* Desktop horizontal */}
      <div className="relative hidden sm:block">
        <div className="absolute left-3 right-3 top-3 h-px bg-border" />
        <div
          className="absolute left-3 top-3 h-px bg-accent transition-all"
          style={{ width: `calc((100% - 1.5rem) * ${pct / 100})` }}
        />
        <ol className="relative flex justify-between gap-2">
          {stages.map((s) => <Stage key={s.key} s={s} vertical={false} />)}
        </ol>
      </div>

      {/* Mobile vertical */}
      <div className="relative sm:hidden">
        <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />
        <div
          className="absolute left-3 top-3 w-px bg-accent transition-all"
          style={{ height: `calc((100% - 1.5rem) * ${pct / 100})` }}
        />
        <ol className="relative flex flex-col gap-5">
          {stages.map((s) => <Stage key={s.key} s={s} vertical />)}
        </ol>
      </div>
    </div>
  );
}

function Stage({ s, vertical }: { s: TrackingStage; vertical: boolean }) {
  return (
    <li className={vertical ? "flex items-start gap-3" : "flex flex-col items-center text-center"}>
      <span
        className={`relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] font-bold transition ${
          s.reached
            ? "border-accent bg-accent text-accent-foreground shadow-[0_0_0_4px_oklch(0.65_0.24_25/0.15)]"
            : s.active
            ? "border-accent bg-background text-accent animate-pulse shadow-[0_0_0_4px_oklch(0.65_0.24_25/0.2)]"
            : "border-border bg-background text-muted-foreground"
        }`}
      >
        {s.reached ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      </span>
      <div className={vertical ? "flex-1" : "mt-2 max-w-[130px]"}>
        <div className={`text-sm font-semibold ${s.reached || s.active ? "text-foreground" : "text-muted-foreground"}`}>
          {s.label}
          {s.active && (
            <span className="mono ml-1.5 rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] text-accent">NOW</span>
          )}
        </div>
        <div className="mono mt-0.5 text-[10px] text-muted-foreground">
          {s.at
            ? s.at.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
              (s.reached
                ? " · " + s.at.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
                : "")
            : "—"}
        </div>
        <div className={`mt-0.5 text-[11px] text-muted-foreground ${vertical ? "" : "hidden sm:block"}`}>
          {s.description}
        </div>
      </div>
    </li>
  );
}
