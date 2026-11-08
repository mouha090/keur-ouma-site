'use client';
/**
 * Environnement architectural minimal : sol en pierre, mur enduit percé d'une niche en arc.
 * La lueur de la niche prend la couleur d'ambiance de la variété active.
 */
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { ASSETS } from '../data/varieties';
import { prepare } from './textures';
import { FLOOR_Y } from './Turntable';
import { atmosphereNow } from './Atmosphere';

const ARCH = { half: 1.8, spring: 1.25, front: -4.4, depth: 0.7 };

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 512;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(128, 300, 10, 128, 300, 300);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.55, 'rgba(255,255,255,0.45)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function Architecture() {
  const [plaster, plasterN, trav, travN] = useTexture([ASSETS.plaster, ASSETS.plasterNormal, ASSETS.travertine, ASSETS.travertineNormal]);
  const backMat = useRef<THREE.MeshStandardMaterial>(null!);

  const { wallGeo, wallMat, floorMat, nicheMat } = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-16, FLOOR_Y); shape.lineTo(16, FLOOR_Y); shape.lineTo(16, 14); shape.lineTo(-16, 14); shape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-ARCH.half, FLOOR_Y);
    hole.lineTo(ARCH.half, FLOOR_Y);
    hole.lineTo(ARCH.half, ARCH.spring);
    hole.absarc(0, ARCH.spring, ARCH.half, 0, Math.PI, false);
    hole.lineTo(-ARCH.half, FLOOR_Y);
    shape.holes.push(hole);
    const wallGeo = new THREE.ExtrudeGeometry(shape, { depth: ARCH.depth, bevelEnabled: false, curveSegments: 64 });

    const p = prepare(plaster.clone(), { color: true, repeat: [0.12, 0.12] });
    const pn = prepare(plasterN.clone(), { repeat: [0.12, 0.12] });
    const wallMat = new THREE.MeshStandardMaterial({ map: p, normalMap: pn, normalScale: new THREE.Vector2(0.6, 0.6), roughness: 0.92, color: '#efe4d3' });
    const nicheMat = new THREE.MeshStandardMaterial({
      map: prepare(plaster.clone(), { color: true, repeat: [0.5, 0.5] }), normalMap: pn, roughness: 0.95, color: '#e7d6bf',
      emissiveMap: glowTexture(), emissive: new THREE.Color('#f0cf95'), emissiveIntensity: 0.32,
    });
    // sol : pierre calme et uniforme, pour ne pas concurrencer le plateau ni le texte
    const tm = prepare(plaster.clone(), { color: true, repeat: [0.6, 0.6] });
    const tn = prepare(plasterN.clone(), { repeat: [0.6, 0.6] });
    const floorMat = new THREE.MeshStandardMaterial({ map: tm, normalMap: tn, normalScale: new THREE.Vector2(0.25, 0.25), roughness: 0.55, color: '#e4d5bf', envMapIntensity: 0.45 });
    return { wallGeo, wallMat, floorMat, nicheMat };
  }, [plaster, plasterN, trav, travN]);

  useFrame(() => {
    if (backMat.current) backMat.current.emissive.copy(atmosphereNow.glow);
  });

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={FLOOR_Y} material={floorMat} receiveShadow>
        <planeGeometry args={[60, 60]} />
      </mesh>
      <mesh geometry={wallGeo} material={wallMat} position-z={ARCH.front - ARCH.depth} receiveShadow />
      <mesh position={[0, (FLOOR_Y + ARCH.spring + ARCH.half) / 2, ARCH.front - ARCH.depth + 0.01]} receiveShadow>
        <planeGeometry args={[ARCH.half * 2 + 0.2, ARCH.spring + ARCH.half - FLOOR_Y + 0.2]} />
        <primitive object={nicheMat} attach="material" ref={backMat} />
      </mesh>
    </group>
  );
}
