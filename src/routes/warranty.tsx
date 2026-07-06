import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, Section } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/warranty")({
  head: () => ({
    meta: [
      { title: "Warranty — PULSE Audio Labs" },
      { name: "description", content: "1-year manufacturer warranty + 6-month accidental damage protection on all PULSE audio products." },
      { property: "og:title", content: "PULSE Warranty" },
      { property: "og:description", content: "1-year warranty + free pickup + replacement within 7 days." },
    ],
  }),
  component: WarrantyPage,
});

function WarrantyPage() {
  return (
    <PolicyPage
      eyebrow="Warranty"
      title="Built to last. Backed for longer."
      intro="Every product comes with a 1-year manufacturer warranty, plus optional PULSE Care+ for accidental damage and battery replacement."
    >
      <Section title="What's covered">
        <ul className="list-disc space-y-2 pl-5">
          <li>Manufacturing defects in materials and workmanship</li>
          <li>Battery capacity falling below 80% within 12 months</li>
          <li>Bluetooth, ANC, microphone and touch-control malfunction</li>
          <li>Charging case latch, hinge and contact failures</li>
        </ul>
      </Section>
      <Section title="What's not covered">
        <ul className="list-disc space-y-2 pl-5">
          <li>Cosmetic damage — scratches, dents, discoloration</li>
          <li>Damage from liquid beyond the IP rating</li>
          <li>Unauthorized repair, modification or third-party accessories</li>
          <li>Loss or theft</li>
        </ul>
      </Section>
      <Section title="How to claim">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Sign in and open the order from <em>My Orders</em>.</li>
          <li>Click <em>Request return</em> and choose <em>Warranty replacement</em>.</li>
          <li>We arrange a free pickup within 48 hours.</li>
          <li>A replacement ships within 7 working days of unit verification.</li>
        </ol>
      </Section>
      <Section title="PULSE Care+ (optional)">
        <p>Add Care+ at checkout for ₹999/year and get one accidental damage replacement, free battery replacement after 18 months, and priority support.</p>
      </Section>
    </PolicyPage>
  );
}