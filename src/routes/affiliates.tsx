import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, Section } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/affiliates")({
  head: () => ({ meta: [{ title: "Affiliates — PULSE" }, { name: "description", content: "Earn 8–12% lifetime commission on every PULSE order through our affiliate program." }] }),
  component: AffiliatesPage,
});

function AffiliatesPage() {
  return (
    <PolicyPage
      eyebrow="Affiliates"
      title="Sound recommendations, paid."
      intro="The PULSE Affiliate Program rewards creators, reviewers and audio enthusiasts who introduce people to better gear."
    >
      <Section title="What you earn">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>8%</strong> base commission on every order — paid monthly</li>
          <li><strong>12%</strong> on flagship and luxury categories</li>
          <li><strong>+2%</strong> performance bonus once monthly attributed revenue crosses ₹2L</li>
          <li>60-day cookie window. First-touch attribution.</li>
        </ul>
      </Section>
      <Section title="What we provide">
        <ul className="list-disc space-y-2 pl-5">
          <li>Custom UTM-linked store and discount code</li>
          <li>Real-time dashboard with clicks, conversions and earnings</li>
          <li>Editorial-grade product imagery, lifestyle videos and review samples</li>
          <li>A dedicated partner manager once you cross ₹1L / month</li>
        </ul>
      </Section>
      <Section title="Apply">
        <p>Email <a className="text-accent underline" href="mailto:partners@pulse.audio">partners@pulse.audio</a> with your channel, audience size and the categories you typically cover. We approve qualifying applications within 48 hours.</p>
      </Section>
    </PolicyPage>
  );
}