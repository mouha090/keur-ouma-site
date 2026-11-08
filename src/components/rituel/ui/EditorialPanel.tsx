'use client';
/**
 * Bloc éditorial (HTML accessible) : signature, variété active, prix, appel à l'action,
 * progression 01 — 04, navigation précédent / suivant et invitation à défiler.
 */
import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { VARIETIES, formatPrice } from '../data/varieties';
import { rituel } from '../lib/store';

const pad = (n: number) => String(n).padStart(2, '0');

export function EditorialPanel({ active, scrolled }: { active: number; scrolled: boolean }) {
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const prev = useRef(active);
  const bar = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    items.current.forEach((el, i) => el && gsap.set(el.querySelectorAll('[data-line]'), { autoAlpha: i === active ? 1 : 0, y: 0 }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const from = prev.current;
    if (from === active) return;
    prev.current = active;
    const out = items.current[from]?.querySelectorAll('[data-line]');
    const inn = items.current[active]?.querySelectorAll('[data-line]');
    const dir = active > from ? 1 : -1;
    const reduced = rituel.reducedMotion;
    if (out) gsap.to(out, { autoAlpha: 0, y: reduced ? 0 : -16 * dir, duration: reduced ? 0.2 : 0.45, stagger: 0.03, ease: 'power2.in', overwrite: true });
    if (inn) gsap.fromTo(inn, { autoAlpha: 0, y: reduced ? 0 : 22 * dir }, {
      autoAlpha: 1, y: 0, duration: reduced ? 0.3 : 0.9, stagger: 0.07, delay: reduced ? 0.1 : 0.32, ease: 'power3.out', overwrite: true,
    });
  }, [active]);

  useEffect(() => {
    if (bar.current) gsap.to(bar.current, { scaleX: (active + 1) / VARIETIES.length, duration: 0.8, ease: 'power2.out' });
  }, [active]);

  const v = VARIETIES[active];
  return (
    <div className="rituel-panel">
      <header className="rituel-intro">
        <p className="rituel-house">KËR OUMA</p>
        <h2 className="rituel-title">Le Rituel des Senteurs</h2>
        <p className="rituel-tagline">« L’art de parfumer vos instants. »</p>
      </header>

      <div className="rituel-progress" aria-hidden>
        <span className="rituel-progress-num">{pad(active + 1)}</span>
        <span className="rituel-progress-track"><span ref={bar} className="rituel-progress-bar" /></span>
        <span className="rituel-progress-num is-total">{pad(VARIETIES.length)}</span>
      </div>

      <div className="rituel-stack">
        {VARIETIES.map((it, i) => (
          <div
            key={it.id}
            ref={(el) => { items.current[i] = el; }}
            className="rituel-item"
            aria-hidden={i !== active}
            inert={i !== active}
          >
            <p data-line className="rituel-matter">{it.matter}</p>
            <h3 data-line className="rituel-name">{it.name}</h3>
            <p data-line className="rituel-desc">{it.description}</p>
            <p data-line className="rituel-price">{formatPrice(it.price)}</p>
            <div data-line>
              <a className="rituel-cta" href={it.url}>
                <span>Découvrir ce Thiouraye</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="rituel-nav">
        <button
          type="button"
          className="rituel-arrow"
          onClick={() => rituel.goTo(active - 1)}
          disabled={active === 0}
          aria-label="Variété précédente"
        >
          <svg viewBox="0 0 24 24" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button
          type="button"
          className="rituel-arrow"
          onClick={() => rituel.goTo(active + 1)}
          disabled={active === VARIETIES.length - 1}
          aria-label="Variété suivante"
        >
          <svg viewBox="0 0 24 24" aria-hidden><path d="M9 5l7 7-7 7" /></svg>
        </button>
        <p className={`rituel-hint ${scrolled ? 'is-hidden' : ''}`} aria-hidden>
          <span className="rituel-hint-line" />
          Faites défiler pour tourner le plateau
        </p>
      </div>

      <p className="sr-only" aria-live="polite">
        Variété {active + 1} sur {VARIETIES.length} : {v.name}, {formatPrice(v.price)}
      </p>
    </div>
  );
}
