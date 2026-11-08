'use client';
/**
 * Caméra : légèrement surélevée, elle accompagne la rotation (petit glissement latéral),
 * se rapproche à peine du pot actif au repos, et suit le pointeur avec une parallaxe discrète.
 * Sur grand écran, le cadrage décale la scène vers la droite pour laisser place au texte.
 */
import * as THREE from 'three';
import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { rituel, motionAmount } from '../lib/store';

export function CameraRig() {
  const { camera, size } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const state = useMemo(() => ({ px: 0, py: 0, dolly: 0 }), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const wide = size.width / size.height > 1.05;
    const m = rituel.reducedMotion ? 0 : 1;
    const k = 1 - Math.pow(0.001, dt); // lissage indépendant du nombre d'images par seconde
    state.px += (rituel.pointer.x - state.px) * k * 0.6;
    state.py += (rituel.pointer.y - state.py) * k * 0.6;
    const moving = motionAmount(rituel.progress);
    state.dolly += ((1 - moving) - state.dolly) * k;

    // distance calculée pour que le plateau (Ø 4,1) tienne dans la zone libre, quel que soit le format
    const fov = wide ? 30 : 34;
    const aspect = size.width / size.height;
    const halfTan = Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const fitDist = wide ? 2.7 / (halfTan * aspect * 0.6) : 2.45 / (halfTan * aspect);
    const dist = Math.max(wide ? 9.4 : 10, fitDist) - state.dolly * 0.3 * m;
    const elev = wide ? 0.3 : 0.34; // ~19° au-dessus de l'horizon
    const yaw = (state.px * 0.06 + moving * 0.05) * m;
    const pitch = elev - state.py * 0.025 * m;
    const target = look.set(0, wide ? 0.62 : 0.5, 0);
    cam.position.set(
      target.x + Math.sin(yaw) * Math.cos(pitch) * dist,
      target.y + Math.sin(pitch) * dist,
      target.z + Math.cos(yaw) * Math.cos(pitch) * dist,
    );
    cam.lookAt(target);
    cam.fov = fov;

    // décalage optique : le sujet glisse à droite (bureau) ou vers le haut (mobile)
    const w = size.width, h = size.height;
    if (wide) cam.setViewOffset(w, h, -w * 0.15, 0, w, h);
    else cam.setViewOffset(w, h, 0, h * 0.06, w, h);
    cam.updateProjectionMatrix();
  });
  return null;
}
