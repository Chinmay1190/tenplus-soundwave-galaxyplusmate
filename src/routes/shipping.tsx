import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, Section } from "@/components/site/PolicyPage";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping — PULSE" },
      { name: "description", content: "Free express shipping across India. Same-day dispatch on orders before 4 PM IST." },
    ],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <PolicyPage
      eyebrow="Shipping"
      title="Free, fast, fully tracked."
      intro="We ship every order through tier-1 courier partners with real-time tracking and SMS / email / WhatsApp updates."
    >
      <Section title="Delivery timelines">
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Metro Express</strong> (Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad): 1–2 working days</li>
          <li><strong>Tier-1 cities:</strong> 2–3 working days</li>
          <li><strong>Tier-2 / Tier-3:</strong> 3–5 working days</li>
          <li><strong>North-East and remote pincodes:</strong> 5–8 working days</li>
        </ul>
      </Section>
      <Section title="Shipping charges">
        <ul className="list-disc space-y-2 pl-5">
          <li>Free shipping on all prepaid orders, no minimum.</li>
          <li>COD orders ₹999 and above: free. Below: ₹49 handling.</li>
          <li>Same-day dispatch on orders placed before 4 PM IST (Mon–Sat).</li>
        </ul>
      </Section>
      <Section title="Tracking your order">
        <p>You can track any order at <a className="text-accent underline" href="/track-order">/track-order</a> using your order ID and email. Live updates push the moment a shipment scans at every hub.</p>
      </Section>
      <Section title="International shipping">
        <p>We ship to UAE, Singapore, UK and Australia through DHL Express — calculated at checkout. Duties and taxes are borne by the customer.</p>
      </Section>
    </PolicyPage>
  );
}