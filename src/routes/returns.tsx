import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, Section } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Refunds — PULSE" },
      { name: "description", content: "15-day no-questions-asked returns with free reverse pickup across India." },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  return (
    <PolicyPage
      eyebrow="Returns & Refunds"
      title="Love it or send it back."
      intro="15-day no-questions-asked returns, free reverse pickup, and refunds processed within 5 business days of pickup."
    >
      <Section title="Eligibility">
        <ul className="list-disc space-y-2 pl-5">
          <li>Returns must be initiated within 15 days of delivery.</li>
          <li>Product, charging case, all accessories and original packaging must be intact.</li>
          <li>Earbud silicone tips must be unused for hygiene reasons (replacement tips ship in the box).</li>
        </ul>
      </Section>
      <Section title="How refunds are processed">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Prepaid orders:</strong> refunded to source within 5 business days of pickup.</li>
          <li><strong>UPI / Cards:</strong> typically reflects in 2–3 working days.</li>
          <li><strong>COD orders:</strong> refunded to your bank account via NEFT (you'll be asked for IFSC).</li>
        </ul>
      </Section>
      <Section title="Exchanges">
        <p>Need a different color or size? Mark "Exchange" instead of "Refund" while creating the return — the new item ships the same day pickup is verified.</p>
      </Section>
      <Section title="Damaged or wrong product">
        <p>Email <a className="text-accent underline" href="mailto:care@pulse.audio">care@pulse.audio</a> with a 30-second unboxing video within 48 hours of delivery — we'll dispatch a replacement immediately, no return required.</p>
      </Section>
    </PolicyPage>
  );
}