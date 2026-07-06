import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function PolicyPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mono text-accent">— {eyebrow}</div>
      <h1 className="mt-3 font-display text-5xl font-bold tracking-tight sm:text-6xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{intro}</p>
      <div className="mt-12 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-10">{children}</div>
        <aside className="rounded-3xl border border-border/60 bg-card p-6">
          <div className="mono text-xs text-muted-foreground">Need help?</div>
          <h3 className="mt-2 font-display text-xl font-bold">We reply within 4 hours.</h3>
          <p className="mt-2 text-sm text-muted-foreground">Indian customer care, every day 9 AM – 9 PM IST.</p>
          <Link to="/contact" className="mt-5 inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background">
            Contact support →
          </Link>
          <div className="mt-5 space-y-1.5 text-xs text-muted-foreground">
            <div>📞 1800-PULSE-IN (toll-free)</div>
            <div>✉️ care@pulse.audio</div>
            <div>💬 WhatsApp: +91 99999 88888</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <div className="prose-pulse mt-3 space-y-3 text-[15px] leading-7 text-foreground/80">{children}</div>
    </section>
  );
}