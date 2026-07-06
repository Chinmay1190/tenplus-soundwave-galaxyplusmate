import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, Section } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/careers")({
  head: () => ({ meta: [{ title: "Careers — PULSE" }, { name: "description", content: "Help us build India's most loved audio brand. Open roles across design, engineering and operations." }] }),
  component: CareersPage,
});

const ROLES = [
  { title: "Senior Acoustic Engineer", team: "R&D · Bangalore", type: "Full-time" },
  { title: "Industrial Designer", team: "Design · Stockholm / Remote", type: "Full-time" },
  { title: "Firmware Engineer (BLE / Audio DSP)", team: "Hardware · Bangalore", type: "Full-time" },
  { title: "Senior Brand Manager", team: "Marketing · Mumbai", type: "Full-time" },
  { title: "Retail Experience Lead", team: "Retail · Delhi", type: "Full-time" },
  { title: "Customer Care Specialist", team: "Support · Remote (India)", type: "Full-time" },
  { title: "Supply Chain Analyst", team: "Operations · Bangalore", type: "Full-time" },
];

function CareersPage() {
  return (
    <PolicyPage
      eyebrow="Careers"
      title="Hear the future. Help build it."
      intro="We're a small team of designers, audio engineers and operators obsessed with one thing — the most rewarding hour anyone spends with sound."
    >
      <Section title="Open roles">
        <div className="not-prose grid gap-3">
          {ROLES.map((r) => (
            <div key={r.title} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-5">
              <div>
                <div className="font-display text-lg font-bold">{r.title}</div>
                <div className="mono mt-1 text-xs text-muted-foreground">{r.team} · {r.type}</div>
              </div>
              <a href="mailto:careers@pulse.audio" className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background">Apply →</a>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Benefits">
        <ul className="list-disc space-y-2 pl-5">
          <li>Equity for every full-time hire</li>
          <li>Comprehensive health cover for you, your partner, kids and parents</li>
          <li>Annual hardware budget — pick any audio gear, ours or anyone's</li>
          <li>4-day workweek, every alternate week</li>
        </ul>
      </Section>
    </PolicyPage>
  );
}