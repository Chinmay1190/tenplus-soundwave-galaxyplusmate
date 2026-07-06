import { cn } from "@/lib/utils";

/**
 * PULSE brand mark — a stylized soundwave inside a lozenge, paired with the wordmark.
 * Renders crisp at any size. Uses currentColor + the --color-accent token so it
 * automatically respects light/dark themes and hover states.
 */
export function LogoMark({
  className,
  animated = false,
  size = 32,
}: {
  className?: string;
  animated?: boolean;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width={size}
      height={size}
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="pulseMarkGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.2 25)" />
          <stop offset="100%" stopColor="oklch(0.55 0.24 25)" />
        </linearGradient>
        <radialGradient id="pulseMarkGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.65 0.24 25 / 0.55)" />
          <stop offset="100%" stopColor="oklch(0.65 0.24 25 / 0)" />
        </radialGradient>
      </defs>

      {/* soft glow behind the mark */}
      <circle cx="20" cy="20" r="18" fill="url(#pulseMarkGlow)" />

      {/* outer lozenge */}
      <rect
        x="3"
        y="3"
        width="34"
        height="34"
        rx="11"
        fill="none"
        stroke="url(#pulseMarkGrad)"
        strokeWidth="2"
      />

      {/* inner soundwave bars */}
      <g fill="url(#pulseMarkGrad)">
        <rect x="9"  y="17" width="3" height="6"  rx="1.5">
          {animated && <animate attributeName="height" values="6;14;6" dur="1.2s" repeatCount="indefinite" />}
          {animated && <animate attributeName="y"      values="17;13;17" dur="1.2s" repeatCount="indefinite" />}
        </rect>
        <rect x="14" y="12" width="3" height="16" rx="1.5">
          {animated && <animate attributeName="height" values="16;8;16" dur="1.2s" repeatCount="indefinite" begin="0.15s" />}
          {animated && <animate attributeName="y"      values="12;16;12" dur="1.2s" repeatCount="indefinite" begin="0.15s" />}
        </rect>
        <rect x="19" y="8"  width="3" height="24" rx="1.5">
          {animated && <animate attributeName="height" values="24;12;24" dur="1.2s" repeatCount="indefinite" begin="0.3s" />}
          {animated && <animate attributeName="y"      values="8;14;8"   dur="1.2s" repeatCount="indefinite" begin="0.3s" />}
        </rect>
        <rect x="24" y="12" width="3" height="16" rx="1.5">
          {animated && <animate attributeName="height" values="16;6;16"  dur="1.2s" repeatCount="indefinite" begin="0.45s" />}
          {animated && <animate attributeName="y"      values="12;17;12" dur="1.2s" repeatCount="indefinite" begin="0.45s" />}
        </rect>
        <rect x="29" y="17" width="3" height="6"  rx="1.5">
          {animated && <animate attributeName="height" values="6;10;6"   dur="1.2s" repeatCount="indefinite" begin="0.6s" />}
          {animated && <animate attributeName="y"      values="17;15;17" dur="1.2s" repeatCount="indefinite" begin="0.6s" />}
        </rect>
      </g>
    </svg>
  );
}

export function Logo({
  className,
  size = 32,
  wordmark = true,
  animated = false,
}: {
  className?: string;
  size?: number;
  wordmark?: boolean;
  animated?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} animated={animated} />
      {wordmark && (
        <span className="font-display text-lg font-bold tracking-tight">
          PULSE<span className="text-accent">.</span>
        </span>
      )}
    </span>
  );
}
