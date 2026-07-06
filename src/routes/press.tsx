import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, Section } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/press")({
  head: () => ({ meta: [{ title: "Press — PULSE" }, { name: "description", content: "Press kit, brand assets and media inquiries for PULSE Audio Labs." }] }),
  component: PressPage,
});

const COVERAGE = [
  { src: "The Verge", quote: "PULSE has quietly become India's most thoughtful audio house." },
  { src: "WIRED", quote: "An obsessive attention to fit and finish — the AirWave 3 is best-in-class." },
  { src: "Forbes India", quote: "The Apple-of-audio reputation is well earned." },
  { src: "YourStory", quote: "A direct-to-consumer hardware story India desperately needed." },
];

function PressPage() {
  return (
    <PolicyPage
      eyebrow="Press"
      title="News, kits & media."
      intro="Brand assets, executive bios, product photography and high-resolution renders for editors and reporters."
    >
      <Section title="In the press">
        <div className="not-prose grid gap-4 sm:grid-cols-2">
          {COVERAGE.map((c) => (
            <figure key={c.src} className="rounded-2xl border border-border/60 bg-card p-5">
              <blockquote className="font-display text-lg leading-snug">"{c.quote}"</blockquote>
              <figcaption className="mono mt-3 text-xs text-accent">— {c.src}</figcaption>
            </figure>
          ))}
        </div>
      </Section>
      <Section title="Brand assets">
        <p>Logos (SVG / PNG), product photography, ambassador headshots and the official brand book are available on request.</p>
        <p>Email <a className="text-accent underline" href="mailto:press@pulse.audio">press@pulse.audio</a> with your publication, deadline and the specific asset you need — we reply within 24 hours.</p>
      </Section>
      <Section title="Media inquiries">
        <p>For interviews, product reviews and launch events, please contact our PR lead Anjali Mehta at <a className="text-accent underline" href="mailto:anjali@pulse.audio">anjali@pulse.audio</a>.</p>
      </Section>
    </PolicyPage>
  );
}