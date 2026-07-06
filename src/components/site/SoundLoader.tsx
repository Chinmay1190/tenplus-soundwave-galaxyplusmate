import { LogoMark } from "./Logo";

export function SoundLoader({ label = "Tuning the experience" }: { label?: string }) {
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-background/85 backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(800px 420px at 50% 50%, oklch(0.65 0.24 25 / 0.22), transparent 70%), conic-gradient(from 0deg at 50% 50%, transparent 0deg, oklch(0.65 0.24 25 / 0.08) 90deg, transparent 180deg, oklch(0.65 0.24 25 / 0.08) 270deg, transparent 360deg)",
        }}
      />
      {/* drifting particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="sl-particle" style={{
            left: `${(i * 73) % 100}%`,
            top: `${(i * 37) % 100}%`,
            animationDelay: `${(i % 7) * 0.4}s`,
            animationDuration: `${4 + (i % 5)}s`,
          }} />
        ))}
      </div>
      <div className="relative flex flex-col items-center gap-8">
        <div className="sl-orbit" aria-hidden>
          <span className="sl-dot sl-dot-a" />
          <span className="sl-dot sl-dot-b" />
          <span className="sl-dot sl-dot-c" />
        </div>
        <div className="sl-scene">
          <div className="sl-cube">
            <span className="sl-face sl-front" />
            <span className="sl-face sl-back" />
            <span className="sl-face sl-right" />
            <span className="sl-face sl-left" />
            <span className="sl-face sl-top" />
            <span className="sl-face sl-bottom" />
          </div>
          <div className="sl-ring sl-ring-a" />
          <div className="sl-ring sl-ring-b" />
          <div className="sl-ring sl-ring-c" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center gap-3 rounded-2xl border border-accent/30 bg-background/70 px-5 py-3 shadow-[0_0_60px_oklch(0.65_0.24_25/0.4)] backdrop-blur">
            <span aria-hidden className="absolute inset-0 rounded-2xl opacity-60"
              style={{ background: "linear-gradient(120deg, transparent 30%, oklch(0.65 0.24 25 / 0.18) 50%, transparent 70%)", backgroundSize: "200% 100%", animation: "sl-shimmer 3s linear infinite" }} />
            <LogoMark size={44} animated />
            <span className="font-display text-3xl font-black tracking-tight text-foreground">
              PULSE<span className="text-accent">.</span>
            </span>
          </div>
          <div className="flex items-end gap-1" aria-hidden>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <span key={i} className="sl-bar" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
          <div className="mono text-xs tracking-[0.4em] text-muted-foreground sl-shimmer">{label.toUpperCase()}</div>
          <div className="mono text-[10px] tracking-[0.3em] text-accent/70">PULSE · AUDIO LABS · EST. 2021</div>
        </div>
      </div>

      <style>{`
        .sl-orbit {
          position: absolute; left: 50%; top: 50%; width: 260px; height: 260px;
          margin-left: -130px; margin-top: -130px; pointer-events: none;
          animation: sl-orbit-spin 6s linear infinite;
        }
        .sl-dot {
          position: absolute; width: 8px; height: 8px; border-radius: 999px;
          background: oklch(0.65 0.24 25);
          box-shadow: 0 0 18px oklch(0.65 0.24 25 / 0.9);
        }
        .sl-dot-a { top: -4px; left: 50%; margin-left: -4px; }
        .sl-dot-b { bottom: -4px; left: 50%; margin-left: -4px; opacity: 0.7; }
        .sl-dot-c { top: 50%; right: -4px; margin-top: -4px; opacity: 0.5; }

        .sl-scene { position: relative; width: 140px; height: 140px; perspective: 800px; }
        .sl-cube {
          position: absolute; inset: 30px; transform-style: preserve-3d;
          animation: sl-spin 4s linear infinite;
        }
        .sl-face {
          position: absolute; inset: 0; border: 1px solid oklch(0.65 0.24 25 / 0.6);
          background:
            linear-gradient(135deg, oklch(0.65 0.24 25 / 0.28), oklch(0.65 0.24 25 / 0.04)),
            radial-gradient(circle at 30% 30%, oklch(0.65 0.24 25 / 0.4), transparent 60%);
          box-shadow: 0 0 30px oklch(0.65 0.24 25 / 0.35) inset;
          border-radius: 14px;
          backdrop-filter: blur(4px);
        }
        .sl-front  { transform: translateZ(40px); }
        .sl-back   { transform: rotateY(180deg) translateZ(40px); }
        .sl-right  { transform: rotateY(90deg)  translateZ(40px); }
        .sl-left   { transform: rotateY(-90deg) translateZ(40px); }
        .sl-top    { transform: rotateX(90deg)  translateZ(40px); }
        .sl-bottom { transform: rotateX(-90deg) translateZ(40px); }

        .sl-ring {
          position: absolute; left: 50%; top: 50%;
          border: 1px solid oklch(0.65 0.24 25 / 0.5);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: sl-pulse 2.4s ease-out infinite;
        }
        .sl-ring-a { width: 90px; height: 90px; }
        .sl-ring-b { width: 90px; height: 90px; animation-delay: 0.8s; }
        .sl-ring-c { width: 90px; height: 90px; animation-delay: 1.6s; }

        .sl-bar {
          display: inline-block; width: 4px; height: 22px; border-radius: 999px;
          background: linear-gradient(180deg, oklch(0.78 0.2 25), oklch(0.55 0.24 25 / 0.4));
          box-shadow: 0 0 8px oklch(0.65 0.24 25 / 0.6);
          animation: sl-eq 1s ease-in-out infinite;
        }
        .sl-particle {
          position: absolute; width: 3px; height: 3px; border-radius: 999px;
          background: oklch(0.65 0.24 25 / 0.7);
          animation: sl-float linear infinite;
        }
        .sl-shimmer {
          background: linear-gradient(90deg, oklch(0.5 0 0 / 0.7), oklch(0.78 0.2 25), oklch(0.5 0 0 / 0.7));
          background-size: 200% 100%;
          -webkit-background-clip: text; background-clip: text;
          color: transparent;
          animation: sl-shimmer 2.4s linear infinite;
        }

        @keyframes sl-spin {
          0%   { transform: rotateX(0)    rotateY(0); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }
        @keyframes sl-orbit-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes sl-pulse {
          0%   { width: 70px; height: 70px; opacity: 0.9; }
          100% { width: 180px; height: 180px; opacity: 0; }
        }
        @keyframes sl-eq {
          0%, 100% { transform: scaleY(0.3); }
          50%      { transform: scaleY(1.8); }
        }
        @keyframes sl-float {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translateY(-160px) scale(0.4); opacity: 0; }
        }
        @keyframes sl-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .sl-cube, .sl-ring, .sl-bar, .sl-orbit, .sl-particle, .sl-shimmer { animation: none !important; }
        }
      `}</style>
    </div>
  );
}