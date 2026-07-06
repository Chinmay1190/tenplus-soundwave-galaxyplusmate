import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, Section } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — PULSE" },
      { name: "description", content: "Answers to the most common questions about PULSE products, orders, warranty and audio tech." },
    ],
  }),
  component: FaqPage,
});

const FAQS: { q: string; a: string }[] = [
  { q: "Are PULSE products genuine?", a: "Yes — every PULSE product ships directly from authorized brand warehouses with a full Indian warranty and a tamper-proof seal." },
  { q: "Do you offer EMI?", a: "3, 6, 9 and 12-month no-cost EMI is available on all leading credit cards and Bajaj Finserv at checkout for orders above ₹3,000." },
  { q: "How do I claim warranty?", a: "Open the order under My Orders → Request return → Warranty replacement. We pick up free and ship a replacement within 7 working days." },
  { q: "Will ANC work on all phones?", a: "Active Noise Cancellation runs entirely on the earbuds themselves — it works with any Bluetooth source (Android, iOS, laptop, console)." },
  { q: "Are these original or refurbished?", a: "Only brand-new, factory-sealed units. We never sell open-box or refurbished units on the main PULSE store." },
  { q: "How do I pair multipoint?", a: "Long-press the touch sensor for 5s with both ear-tips in the case — LED flashes blue, then pair from the first device, then second. Most models support 2 active devices at once." },
  { q: "Can I cancel an order?", a: "Yes — until the order moves to Shipped. After that, refuse delivery or create a return on receipt." },
  { q: "Do you ship to APO / NEFA / Andaman?", a: "Yes, via India Post and Blue Dart Premium. Expect 6–10 working days." },
];

function FaqPage() {
  return (
    <PolicyPage
      eyebrow="FAQ"
      title="Asked. Answered."
      intro="The most common questions about ordering, audio tech, warranty and our brand promise."
    >
      <Section title="Top questions">
        <div className="not-prose divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
          {FAQS.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer items-center justify-between font-display text-base font-semibold">
                {f.q}
                <span className="text-accent transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </PolicyPage>
  );
}