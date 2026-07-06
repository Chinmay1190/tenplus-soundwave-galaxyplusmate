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
        className={`relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${
          s.reached
            ? "border-accent bg-accent text-accent-foreground"
            : s.active
            ? "border-accent bg-background text-accent"
            : "border-border bg-background text-muted-foreground"
        }`}
      >
        {s.reached ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      </span>
      <div className={vertical ? "" : "mt-2 max-w-[110px]"}>
        <div className={`text-sm font-semibold ${s.reached || s.active ? "text-foreground" : "text-muted-foreground"}`}>
          {s.label}
        </div>
        <div className="mono mt-0.5 text-[10px] text-muted-foreground">
          {s.at ? s.at.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
        </div>
        {!vertical && (
          <div className="mt-0.5 text-[11px] text-muted-foreground">{s.description}</div>
        )}
      </div>
    </li>
  );
}
