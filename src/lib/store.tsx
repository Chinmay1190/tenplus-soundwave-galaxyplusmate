import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type ItemId = string | number;
type CartItem = { id: ItemId; qty: number; color?: string };
type StoreState = {
  cart: CartItem[];
  wishlist: ItemId[];
  compare: ItemId[];
};

type StoreCtx = StoreState & {
  addToCart: (id: ItemId, qty?: number, color?: string) => void;
  removeFromCart: (id: ItemId) => void;
  updateQty: (id: ItemId, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: ItemId) => void;
  toggleCompare: (id: ItemId) => void;
  inWishlist: (id: ItemId) => boolean;
  inCompare: (id: ItemId) => boolean;
  cartCount: number;
};

const Ctx = createContext<StoreCtx | null>(null);
const KEY = "pulse-store-v1";

function load(): StoreState {
  if (typeof window === "undefined") return { cart: [], wishlist: [], compare: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { cart: [], wishlist: [], compare: [] };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>({ cart: [], wishlist: [], compare: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value: StoreCtx = {
    ...state,
    cartCount: state.cart.reduce((a, b) => a + b.qty, 0),
    addToCart: (id, qty = 1, color) =>
      setState((s) => {
        const existing = s.cart.find((c) => c.id === id);
        if (existing) {
          return { ...s, cart: s.cart.map((c) => (c.id === id ? { ...c, qty: c.qty + qty } : c)) };
        }
        return { ...s, cart: [...s.cart, { id, qty, color }] };
      }),
    removeFromCart: (id) => setState((s) => ({ ...s, cart: s.cart.filter((c) => c.id !== id) })),
    updateQty: (id, qty) =>
      setState((s) => ({
        ...s,
        cart: s.cart.map((c) => (c.id === id ? { ...c, qty: Math.max(1, qty) } : c)),
      })),
    clearCart: () => setState((s) => ({ ...s, cart: [] })),
    toggleWishlist: (id) =>
      setState((s) => ({
        ...s,
        wishlist: s.wishlist.includes(id) ? s.wishlist.filter((x) => x !== id) : [...s.wishlist, id],
      })),
    toggleCompare: (id) =>
      setState((s) => {
        if (s.compare.includes(id)) return { ...s, compare: s.compare.filter((x) => x !== id) };
        if (s.compare.length >= 4) return s;
        return { ...s, compare: [...s.compare, id] };
      }),
    inWishlist: (id) => state.wishlist.includes(id),
    inCompare: (id) => state.compare.includes(id),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
