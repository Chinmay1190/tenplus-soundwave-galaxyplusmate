import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, Section } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/sustainability")({
  head: () => ({ meta: [{ title: "Sustainability — PULSE" }, { name: "description", content: "Carbon-neutral shipping, recycled plastic enclosures, and an end-to-end take-back program." }] }),
  component: SustainabilityPage,
});

function SustainabilityPage() {
  return (
    <PolicyPage
      eyebrow="Sustainability"
      title="Sound choices for the planet."
      intro="Audio gear has a real environmental footprint. We're working to shrink ours — measurably and transparently."
    >
      <Section title="Materials">
        <ul className="list-disc space-y-2 pl-5">
          <li>100% recycled aluminium in all premium charging cases.</li>
          <li>Post-consumer recycled (PCR) plastic ≥ 60% across all earbud bodies.</li>
          <li>FSC-certified, plastic-free packaging — every box, sleeve and divider.</li>
        </ul>
      </Section>
      <Section title="Carbon">
        <p>Every order ships <strong>carbon-neutral</strong> through verified Gold-Standard offsets covering inbound logistics, warehousing and last-mile delivery. We publish an annual emissions report in our investor section.</p>
      </Section>
      <Section title="Take-back & repair">
        <p>Send back any PULSE product at end-of-life — we cover the freight. Working units are refurbished and donated to schools; the rest are responsibly recycled via E-Parisaraa (BIS-licensed).</p>
        <p>Battery replacements are available for all over-ear models at 30% of the original product price.</p>
      </Section>
      <Section title="Our 2030 targets">
        <ul className="list-disc space-y-2 pl-5">
          <li>Net-zero Scope 1 + 2 emissions</li>
          <li>90% recycled or bio-based materials by mass</li>
          <li>Zero virgin plastic in packaging</li>
        </ul>
      </Section>
    </PolicyPage>
  );
}