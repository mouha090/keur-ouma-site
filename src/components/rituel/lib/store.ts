/**
 * État partagé entre le contrôleur de scroll, la scène 3D et l'interface.
 * La scène lit `progress` à chaque image (aucun re-rendu React) ;
 * l'interface s'abonne uniquement aux changements de variété active.
 */
import { VARIETIES } from '../data/varieties';

export const STEPS = VARIETIES.length - 1; // 3 rotations de 90° pour 4 variétés

type Listener = (active: number) => void;

export const rituel = {
  /** position continue sur le plateau : 0 → STEPS (lissée par le scrub GSAP) */
  progress: 0,
  active: 0,
  reducedMotion: false,
  lowPower: false,
  /** pointeur normalisé (-1 → 1) pour la parallaxe */
  pointer: { x: 0, y: 0 },
  hoveredJar: -1 as number,
  goTo: (_i: number) => {},
  listeners: new Set<Listener>(),
  setProgress(p: number) {
    this.progress = p;
    const a = Math.round(p);
    if (a !== this.active) {
      this.active = a;
      this.listeners.forEach((l) => l(a));
    }
  },
  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  },
};

/**
 * Courbe « à paliers » : chaque variété marque un temps d'arrêt,
 * puis la rotation accélère et décélère vers la suivante.
 * Déterministe : même progression → même angle, aucune accumulation.
 */
export function stepEase(x: number) {
  const i = Math.min(Math.floor(x), STEPS - 1);
  const f = Math.min(1, Math.max(0, x - i));
  const t = Math.min(1, Math.max(0, (f - 0.14) / 0.72));
  const s = t * t * t * (t * (t * 6 - 15) + 10); // smootherstep
  return Math.max(0, i) + s;
}

/** fraction de la transition en cours (0 au repos, 1 en pleine rotation) */
export function motionAmount(x: number) {
  const s = stepEase(x);
  return Math.sin((s - Math.floor(s)) * Math.PI);
}
