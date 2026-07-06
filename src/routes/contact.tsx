import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LogoMark } from "@/components/site/Logo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Support — PULSE" },
      { name: "description", content: "Get in touch with PULSE for orders, warranty and product support." },
      { property: "og:title", content: "Contact — PULSE" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "Order help", message: "" });
  const [sending, setSending] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent", {
        description: "We'll get back within 24 hours to " + form.email,
      });
      setForm({ name: "", email: "", subject: "Order help", message: "" });
    }, 700);
  };

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px]"
        style={{
          background:
            "radial-gradient(900px 460px at 50% 0%, oklch(0.65 0.24 25 / 0.18), transparent 60%)",
        }}
      />
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="flex items-center gap-3">
          <LogoMark size={28} animated />
          <div className="mono text-accent">— Contact</div>
        </div>
        <h1 className="mt-4 font-display text-5xl font-bold tracking-tight sm:text-7xl">
          Say <span className="shimmer-text">hello</span>.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Questions about a product, an order, or a partnership? Indian customer
          care replies within 4 hours, 9 AM – 9 PM IST.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            ["/track-order", "Track my order"],
            ["/returns", "Start a return"],
            ["/warranty", "Warranty claim"],
            ["/faq", "Read the FAQ"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="mono rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[10px] uppercase text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
            >
              {label}
            </a>
          ))}
        </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_360px]">
        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
          <div>
            <h2 className="font-display text-2xl font-bold">Send us a note</h2>
            <p className="mt-1 text-sm text-muted-foreground">Aim for detail — order IDs, screenshots, or model numbers help us help you faster.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" value={form.name} on={(v) => setForm({ ...form, name: v })} />
            <Field label="Email" type="email" value={form.email} on={(v) => setForm({ ...form, email: v })} />
          </div>
          <label className="block">
            <span className="mono mb-1.5 block text-muted-foreground">Topic</span>
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {["Order help", "Warranty claim", "Product question", "Bulk / B2B", "Media & press", "Other"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mono mb-1.5 block text-muted-foreground">Message</span>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={6}
              required
              placeholder="How can we help?"
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="mono inline-flex items-center gap-2 text-[10px] text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-accent" /> Encrypted in transit · never shared
            </div>
            <button
              disabled={sending}
              className="btn-magnetic inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-60"
            >
              <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send message"}
            </button>
          </div>
        </form>

        <aside className="space-y-3">
          {[
            [Mail, "Email", "care@pulse.audio"],
            [Phone, "Toll free", "1800-PULSE-IN"],
            [MessageCircle, "WhatsApp", "+91 99999 88888"],
            [MapPin, "HQ", "Indiranagar, Bengaluru 560038"],
            [Clock, "Hours", "Mon–Sun · 9 AM – 9 PM IST"],
          ].map(([Ico, k, t]) => {
            const Icon = Ico as typeof Mail;
            return (
              <div key={t as string} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:border-accent/50">
                <div className="grid h-9 w-9 place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="mono text-[10px] uppercase text-muted-foreground">{k as string}</div>
                  <div className="text-sm font-semibold">{t as string}</div>
                </div>
              </div>
            );
          })}
          <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 text-sm">
            <div className="mono text-[10px] uppercase text-accent">Response time</div>
            <div className="mt-1 font-display text-2xl font-bold">≤ 4 hours</div>
            <p className="mt-1 text-xs text-muted-foreground">Weekdays · Indian customer care team.</p>
          </div>
        </aside>
      </div>
      </div>
    </div>
  );
}

function Field({ label, value, on, type = "text" }: { label: string; value: string; on: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mono mb-1.5 block text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => on(e.target.value)}
        className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
    </label>
  );
}
