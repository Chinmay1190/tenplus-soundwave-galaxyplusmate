import { Link } from "@tanstack/react-router";
import { Github, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full border border-accent/60 bg-accent/10 text-accent">
                <span className="h-2 w-2 rounded-full bg-accent" />
              </div>
              <span className="font-display text-xl font-bold">
                PULSE<span className="text-accent">.</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              The world's most premium wireless earbuds — engineered for music,
              calls, gaming, fitness and everyday luxury.
            </p>
            <div className="mt-6 flex gap-2">
              {[Instagram, Twitter, Youtube, Github].map((Ico, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-surface-2 transition-colors hover:border-accent hover:text-accent"
                  aria-label="social"
                >
                  <Ico className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Shop" links={[
            ["New Arrivals", "/shop"],
            ["Best Sellers", "/shop"],
            ["Premium ANC", "/shop?cat=anc"],
            ["Gaming Buds", "/shop?cat=gaming"],
            ["Limited Edition", "/shop?cat=luxury"],
          ]} />
          <FooterCol title="Support" links={[
            ["Contact", "/contact"],
            ["Warranty", "/warranty"],
            ["Returns & Refunds", "/returns"],
            ["Shipping", "/shipping"],
            ["FAQ", "/faq"],
            ["Track Order", "/track-order"],
          ]} />
          <FooterCol title="Company" links={[
            ["About", "/about"],
            ["Press", "/press"],
            ["Sustainability", "/sustainability"],
            ["Careers", "/careers"],
            ["Affiliates", "/affiliates"],
          ]} />
          <FooterCol title="Account" links={[
            ["Sign in", "/auth"],
            ["My orders", "/orders"],
            ["Wishlist", "/wishlist"],
            ["Compare", "/compare"],
            ["Cart", "/cart"],
          ]} />
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <div className="mono">© {new Date().getFullYear()} PULSE AUDIO LABS</div>
          <div className="mono">DESIGNED IN STOCKHOLM · ASSEMBLED IN INDIA</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="md:col-span-2">
      <div className="mono mb-4 text-muted-foreground">{title}</div>
      <ul className="space-y-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link to={href} className="text-sm text-foreground/80 hover:text-accent">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
