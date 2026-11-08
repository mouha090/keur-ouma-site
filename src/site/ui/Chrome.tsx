'use client';
/** En-tête, menu, recherche, panier latéral et pied de page. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { PRODUCTS, UNIVERSES, SHOP, fmt, productBySlug } from '../data';
import { href, useCart } from '../store';

export const Icon = {
  menu: <svg viewBox="0 0 24 24" aria-hidden><path d="M3 7h18M3 12h18M3 17h12" /></svg>,
  close: <svg viewBox="0 0 24 24" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>,
  search: <svg viewBox="0 0 24 24" aria-hidden><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>,
  bag: <svg viewBox="0 0 24 24" aria-hidden><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6.5a3 3 0 016 0V8" /></svg>,
  arrow: <svg viewBox="0 0 24 24" aria-hidden><path d="M4 12h15M13 6l6 6-6 6" /></svg>,
  minus: <svg viewBox="0 0 24 24" aria-hidden><path d="M6 12h12" /></svg>,
  plus: <svg viewBox="0 0 24 24" aria-hidden><path d="M12 6v12M6 12h12" /></svg>,
};

function useEscape(open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && close();
    addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [open, close]);
}

export function Logo() {
  return (
    <a className="logo" href={href.home} aria-label="Kër Ouma, accueil">
      <span className="logo-main">KËR</span>
      <span className="logo-sub">OUMA</span>
    </a>
  );
}

export function Header() {
  const cart = useCart();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [bump, setBump] = useState(false);
  const prev = useRef(cart.count);
  useEffect(() => {
    if (cart.count > prev.current) { setBump(true); setTimeout(() => setBump(false), 500); }
    prev.current = cart.count;
  }, [cart.count]);
  useEffect(() => {
    const close = () => { setMenu(false); setSearch(false); };
    addEventListener('hashchange', close);
    return () => removeEventListener('hashchange', close);
  }, []);

  return (
    <>
      <p className="announce">{SHOP.announce} <a href={href.help}>Conditions</a></p>
      <header className="header">
        <div className="header-left">
          <button className="icon-btn only-mobile" onClick={() => setMenu(true)} aria-label="Ouvrir le menu">{Icon.menu}</button>
          <nav className="nav-desktop" aria-label="Univers">
            {UNIVERSES.map((u) => (
              <a key={u.slug} href={href.universe(u.slug)} className={u.slug === 'thiouraye' ? 'is-featured' : ''}>{u.name}</a>
            ))}
          </nav>
        </div>
        <Logo />
        <div className="header-right">
          <a className="nav-text only-desktop" href={href.story}>Notre histoire</a>
          <button className="icon-btn" onClick={() => setSearch(true)} aria-label="Rechercher">{Icon.search}</button>
          <button className={`icon-btn cart-btn ${bump ? 'is-bump' : ''}`} onClick={() => cart.setOpen(true)} aria-label={`Panier, ${cart.count} article${cart.count > 1 ? 's' : ''}`}>
            {Icon.bag}
            {cart.count > 0 && <span className="cart-count">{cart.count}</span>}
          </button>
        </div>
      </header>
      <MenuDrawer open={menu} onClose={() => setMenu(false)} />
      <SearchOverlay open={search} onClose={() => setSearch(false)} />
      <CartDrawer />
    </>
  );
}

function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEscape(open, onClose);
  return (
    <div className={`drawer drawer-left ${open ? 'is-open' : ''}`} aria-hidden={!open} inert={!open}>
      <button className="scrim" onClick={onClose} aria-label="Fermer le menu" tabIndex={-1} />
      <aside className="drawer-panel" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="drawer-head">
          <Logo />
          <button className="icon-btn" onClick={onClose} aria-label="Fermer">{Icon.close}</button>
        </div>
        <nav className="menu-list">
          {UNIVERSES.map((u) => (
            <a key={u.slug} href={href.universe(u.slug)}>
              <span className="menu-kicker">{u.kicker}</span>
              <span className="menu-name">{u.name}</span>
            </a>
          ))}
        </nav>
        <div className="menu-foot">
          <a href={href.story}>Notre histoire</a>
          <a href={href.help}>Livraison et aide</a>
        </div>
      </aside>
    </div>
  );
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEscape(open, onClose);
  useEffect(() => { if (open) setTimeout(() => input.current?.focus(), 60); else setQ(''); }, [open]);
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const res = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return { products: PRODUCTS, universes: [] as typeof UNIVERSES };
    return {
      products: PRODUCTS.filter((p) => norm(`${p.name} ${p.matter} ${p.description}`).includes(n)),
      universes: UNIVERSES.filter((u) => norm(`${u.name} ${u.kicker} ${u.categories.map((c) => c.name).join(' ')}`).includes(n)),
    };
  }, [q]);
  return (
    <div className={`search ${open ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Recherche" aria-hidden={!open} inert={!open}>
      <div className="search-bar">
        <span className="search-icon">{Icon.search}</span>
        <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un thiouraye, un univers…" aria-label="Rechercher" />
        <button className="icon-btn" onClick={onClose} aria-label="Fermer la recherche">{Icon.close}</button>
      </div>
      <div className="search-results">
        {res.universes.length > 0 && (
          <div className="search-group">
            <p className="eyebrow">Univers</p>
            {res.universes.map((u) => <a key={u.slug} className="search-uni" href={href.universe(u.slug)}>{u.name}<span>{u.kicker}</span></a>)}
          </div>
        )}
        <div className="search-group">
          <p className="eyebrow">{q ? 'Produits' : 'Suggestions'}</p>
          {res.products.length ? (
            <div className="search-products">
              {res.products.map((p) => (
                <a key={p.slug} href={href.product(p.slug)} className="search-product">
                  <img src={p.photo} alt="" width={540} height={757} />
                  <span><b>{p.name}</b>{fmt(p.price ?? 0)}</span>
                </a>
              ))}
            </div>
          ) : <p className="muted">Aucun résultat pour « {q} ». Essayez « thiouraye » ou « encens ».</p>}
        </div>
      </div>
    </div>
  );
}

function CartDrawer() {
  const cart = useCart();
  const close = () => cart.setOpen(false);
  useEscape(cart.open, close);
  const [note, setNote] = useState(false);
  const left = Math.max(0, SHOP.freeShippingFrom - cart.subtotal);
  return (
    <div className={`drawer drawer-right ${cart.open ? 'is-open' : ''}`} aria-hidden={!cart.open} inert={!cart.open}>
      <button className="scrim" onClick={close} aria-label="Fermer le panier" tabIndex={-1} />
      <aside className="drawer-panel cart" role="dialog" aria-modal="true" aria-label="Panier">
        <div className="drawer-head">
          <h2 className="drawer-title">Votre panier</h2>
          <button className="icon-btn" onClick={close} aria-label="Fermer">{Icon.close}</button>
        </div>
        {cart.lines.length === 0 ? (
          <div className="cart-empty">
            <p>Votre panier est vide.</p>
            <a className="btn" href="#thiouraye" onClick={close}>Découvrir les thiouraye</a>
          </div>
        ) : (
          <>
            <div className="ship">
              <p>{left > 0 ? <>Plus que <b>{fmt(left)}</b> pour la livraison offerte.</> : <>La livraison vous est offerte.</>}</p>
              <span className="ship-track"><i style={{ transform: `scaleX(${Math.min(1, cart.subtotal / SHOP.freeShippingFrom)})` }} /></span>
            </div>
            <ul className="cart-lines">
              {cart.lines.map((l) => {
                const p = productBySlug(l.slug)!;
                return (
                  <li key={l.slug}>
                    <a href={href.product(p.slug)} onClick={close}><img src={p.photo} alt="" width={540} height={757} /></a>
                    <div>
                      <a className="cart-name" href={href.product(p.slug)} onClick={close}>{p.name}</a>
                      <p className="muted">{fmt(p.price ?? 0)}</p>
                      <Qty value={l.qty} onChange={(v) => cart.setQty(l.slug, v)} label={p.name} min={0} />
                    </div>
                    <p className="cart-line-total">{fmt((p.price ?? 0) * l.qty)}</p>
                  </li>
                );
              })}
            </ul>
            <div className="cart-foot">
              <p className="row"><span>Sous-total</span><b>{fmt(cart.subtotal)}</b></p>
              <p className="muted small">Taxes incluses. Frais de livraison calculés à la commande.</p>
              <button className="btn btn-full" onClick={() => setNote(true)}>Passer la commande</button>
              {note && <p className="small note" role="status">Maquette front : le paiement se branche sur le tunnel de commande actuel de keur-ouma.com.</p>}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export function Qty({ value, onChange, label, min = 1 }: { value: number; onChange: (v: number) => void; label: string; min?: number }) {
  return (
    <div className="qty" role="group" aria-label={`Quantité, ${label}`}>
      <button onClick={() => onChange(Math.max(min, value - 1))} aria-label="Retirer un">{Icon.minus}</button>
      <output>{value}</output>
      <button onClick={() => onChange(value + 1)} aria-label="Ajouter un">{Icon.plus}</button>
    </div>
  );
}

export function Footer() {
  const [sent, setSent] = useState(false);
  return (
    <footer className="footer">
      <section className="newsletter" aria-labelledby="nl-title">
        <p className="eyebrow">Le journal de Kër Ouma</p>
        <h2 id="nl-title" className="display-md">Entrez dans la maison.</h2>
        <p className="muted-inv">Nos histoires, nos découvertes et nos invitations, avec parcimonie.</p>
        <form className="nl-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <label className="sr-only" htmlFor="nl-mail">Votre adresse e-mail</label>
          <input id="nl-mail" type="email" required placeholder="Votre adresse e-mail" autoComplete="email" />
          <button type="submit" aria-label="S’inscrire">{Icon.arrow}</button>
        </form>
        <p className="small muted-inv" role="status">
          {sent ? 'Merci, votre inscription est bien prise en compte.' : 'En vous inscrivant, vous acceptez notre politique de confidentialité.'}
        </p>
      </section>
      <div className="footer-grid">
        <div>
          <Logo />
          <p className="muted-inv footer-pitch">Une maison de découvertes inspirée par le Sénégal, ses gestes et ses élégances.</p>
        </div>
        <nav aria-label="Les univers">
          <p className="eyebrow">Les univers</p>
          {UNIVERSES.map((u) => <a key={u.slug} href={href.universe(u.slug)}>{u.name}</a>)}
        </nav>
        <nav aria-label="La maison">
          <p className="eyebrow">La maison</p>
          <a href={href.story}>Notre histoire</a>
          <a href={href.story}>Nos engagements</a>
        </nav>
        <nav aria-label="À votre service">
          <p className="eyebrow">À votre service</p>
          <a href={href.help}>Livraison</a>
          <a href={href.help}>Retours et remboursements</a>
          <a href={href.help}>Aide et contact</a>
        </nav>
      </div>
      <div className="footer-base">
        <span>© 2026 Kër Ouma</span>
        <span>Mentions légales · Confidentialité · CGV</span>
        <span>Instagram · Pinterest</span>
      </div>
    </footer>
  );
}
