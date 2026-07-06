import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Scale, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";

const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/brands", label: "Brands" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];
const USER_NAV = [
  { to: "/account", label: "Profile" },
  { to: "/orders", label: "My Orders" },
  { to: "/track-order", label: "Track" },
  { to: "/reports", label: "Reports" },
];

export function Header() {
  const { cartCount, wishlist, compare } = useStore();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onS = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onS, { passive: true });
    onS();
    return () => window.removeEventListener("scroll", onS);
  }, []);

  useEffect(() => setOpen(false), [path]);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-border/60 backdrop-blur-2xl bg-background/70" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="group inline-flex items-center gap-2">
          <Logo size={30} wordmark={false} className="transition-transform duration-300 group-hover:scale-110" />
          <span className="font-display text-lg font-bold tracking-tight">
            PULSE<span className="text-accent">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            aria-label="Search"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-surface-2 transition-colors hover:border-accent hover:text-accent sm:inline-flex"
          >
            <Search className="h-4 w-4" />
          </button>
          <ThemeToggle />
          <Link
            to="/compare"
            aria-label="Compare"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-surface-2 transition-colors hover:border-accent hover:text-accent"
          >
            <Scale className="h-4 w-4" />
            {compare.length > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {compare.length}
              </span>
            )}
          </Link>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-surface-2 transition-colors hover:border-accent hover:text-accent"
          >
            <Heart className="h-4 w-4" />
            {wishlist.length > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-surface-2 transition-colors hover:border-accent hover:text-accent"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to={user ? "/account" : "/auth"}
            aria-label="Account"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-surface-2 transition-colors hover:border-accent hover:text-accent sm:inline-flex"
          >
            <User className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-surface-2 md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-2xl md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border/60" />
            {user ? (
              USER_NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                >
                  {n.label}
                </Link>
              ))
            ) : (
              <Link
                to="/auth"
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
