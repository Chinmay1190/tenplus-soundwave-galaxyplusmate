import { useEffect, useRef, useState } from "react";
import { RotateCw } from "lucide-react";

/** 4-frame 360° viewer driven by drag or auto-rotate. */
export function Product360({ frames, alt }: { frames: string[]; alt: string }) {
  const [frame, setFrame] = useState(0);
  const [auto, setAuto] = useState(true);
  const dragging = useRef<{ x: number; start: number } | null>(null);
  const len = frames.length;

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % len), 900);
    return () => clearInterval(id);
  }, [auto, len]);

  const onDown = (e: React.PointerEvent) => {
    setAuto(false);
    dragging.current = { x: e.clientX, start: frame };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const delta = e.clientX - dragging.current.x;
    const step = Math.floor(delta / 40);
    setFrame(((dragging.current.start + step) % len + len) % len);
  };
  const onUp = () => (dragging.current = null);

  return (
    <div className="relative">
      <div
        className="relative aspect-square cursor-grab overflow-hidden rounded-3xl border border-border/60 bg-surface active:cursor-grabbing"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        role="img"
        aria-label={`${alt} — 360 degree view`}
      >
        {frames.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            draggable={false}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
              i === frame ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-[10px] backdrop-blur">
          <RotateCw className={`h-3 w-3 ${auto ? "animate-spin text-accent" : ""}`} />
          <span className="mono">360° · Drag or auto-rotate</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {frames.map((_, i) => (
            <button
              key={i}
              onClick={() => { setAuto(false); setFrame(i); }}
              aria-label={`Frame ${i + 1}`}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                i === frame ? "bg-accent" : "bg-border hover:bg-border/80"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setAuto((a) => !a)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
        >
          <RotateCw className="h-3 w-3" /> {auto ? "Pause spin" : "Auto-rotate"}
        </button>
      </div>
    </div>
  );
}