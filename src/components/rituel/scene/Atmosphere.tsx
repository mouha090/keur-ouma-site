'use client';
/**
 * Éclairage et ambiance.
 * Chaque variété définit une atmosphère ; on interpole entre la variété courante et la suivante
 * avec la même courbe que la rotation, pour que lumière et mouvement restent synchrones.
 */
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { VARIETIES } from '../data/varieties';
import { rituel, stepEase } from '../lib/store';

const A = VARIETIES.map((v) => ({
  bg: new THREE.Color(v.atmosphere.bg),
  key: new THREE.Color(v.atmosphere.key),
  rim: new THREE.Color(v.atmosphere.rim),
  glow: new THREE.Color(v.atmosphere.glow),
  keyI: v.atmosphere.keyIntensity,
  rimI: v.atmosphere.rimIntensity,
  amb: v.atmosphere.ambient,
  h: v.atmosphere.keyHeight,
}));

/** Ambiance interpolée, lisible par les autres éléments de la scène. */
export const atmosphereNow = {
  bg: A[0].bg.clone(), key: A[0].key.clone(), rim: A[0].rim.clone(), glow: A[0].glow.clone(),
  keyI: A[0].keyI, rimI: A[0].rimI, amb: A[0].amb, h: A[0].h,
};

function blend(x: number) {
  const s = stepEase(x);
  const i = Math.min(Math.floor(s), A.length - 2);
  const f = s - i;
  const a = A[i], b = A[i + 1];
  const o = atmosphereNow;
  o.bg.copy(a.bg).lerp(b.bg, f);
  o.key.copy(a.key).lerp(b.key, f);
  o.rim.copy(a.rim).lerp(b.rim, f);
  o.glow.copy(a.glow).lerp(b.glow, f);
  o.keyI = THREE.MathUtils.lerp(a.keyI, b.keyI, f);
  o.rimI = THREE.MathUtils.lerp(a.rimI, b.rimI, f);
  o.amb = THREE.MathUtils.lerp(a.amb, b.amb, f);
  o.h = THREE.MathUtils.lerp(a.h, b.h, f);
}

export function Atmosphere({ low, onBackground }: { low: boolean; onBackground?: (hex: string) => void }) {
  const key = useRef<THREE.DirectionalLight>(null!);
  const rim = useRef<THREE.DirectionalLight>(null!);
  const hemi = useRef<THREE.HemisphereLight>(null!);
  const scene = useThree((s) => s.scene);
  const fog = useMemo(() => new THREE.Fog(A[0].bg, 11, 27), []);
  scene.fog = fog;
  let last = '';

  useFrame(({ clock, camera }) => {
    blend(rituel.progress);
    // le brouillard suit la distance de la caméra : il n'adoucit que le fond
    fog.near = camera.position.length() + 4;
    fog.far = fog.near + 18;
    const o = atmosphereNow;
    // très légère respiration de la lumière
    const breathe = rituel.reducedMotion ? 1 : 1 + Math.sin(clock.elapsedTime * 0.35) * 0.025;
    key.current.color.copy(o.key);
    key.current.intensity = o.keyI * 0.85 * breathe;
    key.current.position.set(-4.6, 2.6 + o.h * 5.2, 4.4);
    rim.current.color.copy(o.rim);
    rim.current.intensity = o.rimI;
    hemi.current.intensity = o.amb * 0.55;
    fog.color.copy(o.bg);
    const hex = '#' + o.bg.getHexString();
    if (hex !== last) { last = hex; onBackground?.(hex); }
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={['#fff6ea', '#cdb79a', 0.5]} />
      <directionalLight
        ref={key}
        castShadow
        position={[-4.6, 6, 4.4]}
        shadow-mapSize={low ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
        shadow-camera-left={-4.2}
        shadow-camera-right={4.2}
        shadow-camera-top={4.2}
        shadow-camera-bottom={-4.2}
        shadow-camera-near={1}
        shadow-camera-far={20}
      />
      <directionalLight ref={rim} position={[4.5, 3.6, -4.5]} />
      {/* reflets du verre et du couvercle : boîtes à lumière virtuelles, aucune image chargée */}
      <Environment resolution={low ? 128 : 256} frames={1} environmentIntensity={1}>
        <color attach="background" args={['#1c1612']} />
        <Lightformer form="rect" intensity={4} color="#fff0dc" scale={[4, 7, 1]} position={[-5, 3, 4]} target={[0, 0.5, 0]} />
        <Lightformer form="rect" intensity={3.2} color="#ffe2bd" scale={[0.8, 6, 1]} position={[4.5, 2.5, 2.5]} target={[0, 0.5, 0]} />
        <Lightformer form="rect" intensity={1.6} color="#f6e7d2" scale={[10, 3, 1]} position={[0, 6, 0]} rotation-x={Math.PI / 2} />
        {/* bandes verticales : les reflets nets visibles sur les pots des photos */}
        <Lightformer form="rect" intensity={7} color="#ffffff" scale={[0.35, 5, 1]} position={[-2.6, 2, 5.5]} target={[0, 0.6, 0]} />
        <Lightformer form="rect" intensity={5} color="#fff4e6" scale={[0.25, 5, 1]} position={[2.9, 2, 5.2]} target={[0, 0.6, 0]} />
        <Lightformer form="rect" intensity={6} color="#fff6ea" scale={[0.5, 6, 1]} position={[-4.6, 2, -0.8]} target={[0, 0.6, 0]} />
        <Lightformer form="rect" intensity={5} color="#ffe9cc" scale={[0.5, 6, 1]} position={[4.6, 2, -0.6]} target={[0, 0.6, 0]} />
        <Lightformer form="ring" intensity={1.2} color="#ffd7a3" scale={2.5} position={[2, 2, -5]} target={[0, 0.5, 0]} />
      </Environment>
    </>
  );
}
