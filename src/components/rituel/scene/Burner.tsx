'use client';
/**
 * Brûleur d'encens doré, inspiré de celui des photos Kër Ouma :
 * pied tourné, coupe, dôme ajouré en moucharabieh, fleuron.
 * Les ajours sont de vraies découpes (alphaTest) ; une braise éclaire l'intérieur.
 */
import * as THREE from 'three';
import type { ThreeElements } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Smoke } from './Smoke';
import { rituel } from '../lib/store';

export function latticeAlpha() {
  const W = 1024, H = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#fff';
  const cols = 10, cell = W / cols;
  for (let y = -1; y < H / cell + 2; y++) {
    for (let x = -1; x <= cols + 1; x++) {
      const cx = x * cell + (y % 2 ? cell / 2 : 0), cy = y * cell * 0.86;
      g.lineWidth = cell * 0.13;
      g.beginPath(); g.arc(cx, cy, cell * 0.5, 0, Math.PI * 2); g.stroke();
      g.lineWidth = cell * 0.09;
      g.beginPath(); g.arc(cx, cy, cell * 0.22, 0, Math.PI * 2); g.stroke();
    }
  }
  // bandeaux pleins en haut et en bas du dôme
  g.fillStyle = '#fff';
  g.fillRect(0, 0, W, H * 0.07);
  g.fillRect(0, H * 0.9, W, H * 0.1);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

const v2 = (pts: number[][]) => pts.map(([x, y]) => new THREE.Vector2(x, y));

export function Burner({ smoke = true, ...props }: { smoke?: boolean } & ThreeElements['group']) {
  const ember = useRef<THREE.PointLight>(null!);
  const glow = useRef<THREE.MeshBasicMaterial>(null!);
  const seg = rituel.lowPower ? 40 : 80;
  const { gold, dome, geo } = useMemo(() => {
    const gold = new THREE.MeshPhysicalMaterial({ color: '#D6AC58', metalness: 1, roughness: 0.24, clearcoat: 0.3, envMapIntensity: 1.3 });
    const dome = new THREE.MeshPhysicalMaterial({
      color: '#D6AC58', metalness: 1, roughness: 0.26, alphaMap: latticeAlpha(), alphaTest: 0.5, side: THREE.DoubleSide,
      envMapIntensity: 1.3,
    });
    const body = new THREE.LatheGeometry(v2([
      [0.0, 0], [0.3, 0], [0.32, 0.02], [0.29, 0.05], [0.16, 0.1], [0.085, 0.18], [0.07, 0.3],
      [0.1, 0.34], [0.07, 0.38], [0.075, 0.46], [0.14, 0.5], [0.3, 0.56], [0.36, 0.63], [0.37, 0.68],
      [0.35, 0.7], [0.0, 0.7],
    ]), seg);
    const domePts: number[][] = [];
    for (let i = 0; i <= 28; i++) {
      const a = (i / 28) * Math.PI * 0.5;
      const r = 0.35 * Math.cos(a) * (1 + 0.1 * Math.sin(a * 2));
      domePts.push([Math.max(0.001, r), 0.7 + Math.sin(a) * 0.48 + (i === 28 ? 0 : 0)]);
    }
    const domeGeo = new THREE.LatheGeometry(v2(domePts), seg);
    const finial = new THREE.LatheGeometry(v2([
      [0.0, 1.16], [0.07, 1.17], [0.09, 1.21], [0.05, 1.26], [0.065, 1.31], [0.035, 1.37], [0.012, 1.46], [0.0, 1.48],
    ]), seg / 2);
    return { gold, dome, geo: { body, domeGeo, finial } };
  }, [seg]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const f = 0.85 + Math.sin(t * 6.1) * 0.07 + Math.sin(t * 11.7) * 0.05;
    ember.current.intensity = 1.6 * f;
    glow.current.opacity = 0.85 * f;
  });

  return (
    <group {...props}>
      <mesh geometry={geo.body} material={gold} castShadow receiveShadow />
      <mesh geometry={geo.domeGeo} material={dome} castShadow />
      <mesh geometry={geo.finial} material={gold} castShadow />
      <mesh position-y={0.74}>
        <sphereGeometry args={[0.12, 20, 12]} />
        <meshBasicMaterial ref={glow} color="#ff8a3d" transparent toneMapped={false} />
      </mesh>
      <pointLight ref={ember} position-y={0.85} color="#ff8a3d" distance={1.4} decay={2} />
      {smoke && <Smoke position-y={1.47} height={3.6} width={1.5} layers={3} opacity={0.55} />}
    </group>
  );
}
