'use client';
/**
 * Section « Le Rituel des Senteurs ».
 * Contrôleur de scroll : la section est épinglée pendant 3 hauteurs d'écran.
 * Une tween GSAP scrubée porte la progression 0 → 3 (inertie naturelle) ;
 * le snap ramène doucement sur une variété quand le défilement s'arrête, sans bloquer la molette.
 *
 * Intégration : <RituelDesSenteurs /> dans n'importe quelle page React (Next.js ou Vite).
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useProgress } from '@react-three/drei';
import { rituel, STEPS } from './lib/store';
import { EditorialPanel } from './ui/EditorialPanel';
import { StaticFallback } from './ui/StaticFallback';

const Scene = dynamic(() => import('./scene/Scene'), { ssr: false });

gsap.registerPlugin(ScrollTrigger);
// tests automatisés uniquement : navigateur logiciel très lent
if (typeof window !== 'undefined' && (window as unknown as { __testNoLag?: boolean }).__testNoLag) gsap.ticker.lagSmoothing(0);

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function RituelDesSenteurs() {
  const section = useRef<HTMLElement>(null);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [low, setLow] = useState(false);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const { progress, active: loading } = useProgress();
  const ready = webgl === true && !loading && progress === 100;

  // capacités de l'appareil
  useEffect(() => {
    rituel.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lp = matchMedia('(max-width: 820px), (pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4;
    rituel.lowPower = lp;
    setLow(lp);
    setWebgl(hasWebGL());
    const off = rituel.subscribe((a) => { setActive(a); if (a > 0) setScrolled(true); });
    return () => { off(); };
  }, []);

  // contrôleur de scroll
  useLayoutEffect(() => {
    if (!webgl || !section.current) return;
    const reduced = rituel.reducedMotion;
    const proxy = { p: 0 };
    const ctx = gsap.context(() => {
      const tween = gsap.to(proxy, {
        p: STEPS,
        ease: 'none',
        onUpdate: () => rituel.setProgress(proxy.p),
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => '+=' + Math.round(window.innerHeight * STEPS),
          pin: true,
          scrub: reduced ? true : 1.1,
          invalidateOnRefresh: true,
          snap: reduced
            ? undefined
            : {
                // sans élan : on se pose toujours sur la variété la plus proche, jamais au-delà
                snapTo: (_v: number, self?: ScrollTrigger) => Math.round((self?.progress ?? _v) * STEPS) / STEPS,
                inertia: false, duration: { min: 0.5, max: 1.2 }, delay: 0.15, ease: 'power2.inOut',
              },
          onUpdate: (self) => { if (self.progress > 0.02) setScrolled(true); },
        },
      });
      rituel.goTo = (i: number) => {
        const st = tween.scrollTrigger!;
        const k = Math.max(0, Math.min(STEPS, i));
        window.scrollTo({ top: st.start + (k / STEPS) * (st.end - st.start), behavior: reduced ? 'auto' : 'smooth' });
      };
    }, section);
    return () => ctx.revert();
  }, [webgl]);

  // pause du rendu hors écran, parallaxe au pointeur, clavier
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '100px' });
    io.observe(el);
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      rituel.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      rituel.pointer.y = (e.clientY / innerHeight) * 2 - 1;
    };
    const key = (e: KeyboardEvent) => {
      if (!el.contains(document.activeElement)) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); rituel.goTo(rituel.active + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); rituel.goTo(rituel.active - 1); }
    };
    el.addEventListener('pointermove', move);
    addEventListener('keydown', key);
    return () => { io.disconnect(); el.removeEventListener('pointermove', move); removeEventListener('keydown', key); };
  }, [webgl]);

  if (webgl === false) {
    return (
      <section className="rituel rituel--static" aria-labelledby="rituel-title">
        <StaticFallback />
      </section>
    );
  }

  return (
    <section ref={section} id="rituel" className="rituel" aria-label="Le Rituel des Senteurs" aria-roledescription="carrousel">
      <div className="rituel-canvas">
        {webgl && (
          <Scene
            low={low}
            active={visible}
            onBackground={(hex) => section.current?.style.setProperty('--rituel-bg', hex)}
          />
        )}
      </div>
      <div className={`rituel-veil ${ready ? 'is-ready' : ''}`} aria-hidden>
        <span className="rituel-veil-mark">Kër Ouma</span>
        <span className="rituel-veil-line"><i style={{ transform: `scaleX(${progress / 100})` }} /></span>
      </div>
      <EditorialPanel active={active} scrolled={scrolled} />
    </section>
  );
}
