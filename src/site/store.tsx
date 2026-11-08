'use client';
/**
 * Routage par ancre (#thiouraye, #produit/gowe…) et panier (stocké dans le navigateur).
 * Le routage par ancre fonctionne sur n'importe quel hébergement statique ;
 * en production, ces vues peuvent devenir des routes Next.js classiques sans toucher aux composants.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { productBySlug } from './data';

export type Route =
  | { name: 'home' }
  | { name: 'universe'; slug: string }
  | { name: 'product'; slug: string }
  | { name: 'story' }
  | { name: 'help' };

/** null : ancre interne à la page (ex. #contenu), sans changement de vue */
export function parseHash(h: string): Route | null {
  const s = decodeURIComponent(h.replace(/^#\/?/, ''));
  if (!s || s === 'accueil') return { name: 'home' };
  if (s === 'histoire') return { name: 'story' };
  if (s === 'aide') return { name: 'help' };
  if (s.startsWith('produit-')) return { name: 'product', slug: s.slice(8) };
  if (s.startsWith('univers-')) return { name: 'universe', slug: s.slice(8) };
  if (s === 'thiouraye') return { name: 'universe', slug: 'thiouraye' };
  return null;
}

export const href = {
  home: '#accueil',
  universe: (slug: string) => (slug === 'thiouraye' ? '#thiouraye' : `#univers-${slug}`),
  product: (slug: string) => `#produit-${slug}`,
  story: '#histoire',
  help: '#aide',
};

export function useRoute() {
  const [route, setRoute] = useState<Route>({ name: 'home' });
  useEffect(() => {
    const on = () => {
      const r = parseHash(location.hash);
      if (!r) return;
      setRoute(r);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    on();
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return route;
}

/* ---------- panier ---------- */
type Line = { slug: string; qty: number };
type Cart = {
  lines: Line[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
};
const CartCtx = createContext<Cart | null>(null);
const KEY = 'kerouma-panier';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try { setLines((JSON.parse(localStorage.getItem(KEY) || '[]') as Line[]).filter((l) => productBySlug(l.slug))); } catch { /* stockage indisponible */ }
  }, []);
  const persist = (next: Line[]) => {
    setLines(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* stockage indisponible */ }
  };
  const add = useCallback((slug: string, qty = 1) => {
    setLines((cur) => {
      const ex = cur.find((l) => l.slug === slug);
      const next = ex ? cur.map((l) => (l.slug === slug ? { ...l, qty: l.qty + qty } : l)) : [...cur, { slug, qty }];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* */ }
      return next;
    });
    setOpen(true);
  }, []);
  const setQty = useCallback((slug: string, qty: number) => {
    persist(lines.map((l) => (l.slug === slug ? { ...l, qty } : l)).filter((l) => l.qty > 0));
  }, [lines]); // eslint-disable-line react-hooks/exhaustive-deps
  const value = useMemo<Cart>(() => {
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + (productBySlug(l.slug)?.price ?? 0) * l.qty, 0);
    return { lines, count, subtotal, open, setOpen, add, setQty };
  }, [lines, open, add, setQty]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error('CartProvider manquant');
  return c;
}
