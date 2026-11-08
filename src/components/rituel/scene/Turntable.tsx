'use client';
/**
 * Socle fixe + plateau tournant en travertin, quatre pots posés à 90°.
 * La rotation est une fonction pure de la progression du scroll (stepEase) :
 * réversible et sans dérive.
 */
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { ASSETS, VARIETIES } from '../data/varieties';
import { prepare } from './textures';
import { JarPhoto } from './JarPhoto';
import { rituel, stepEase } from '../lib/store';

export const PLATE = { r: 2.05, thick: 0.16, ring: 1.22 };
export const FLOOR_Y = -1.32;

function useTravertine(repeat: [number, number]) {
  const [map, normal, rough] = useTexture([ASSETS.travertine, ASSETS.travertineNormal, ASSETS.travertineRough]);
  return useMemo(() => {
    const m = prepare(map.clone(), { color: true, repeat, aniso: 16 });
    const n = prepare(normal.clone(), { repeat, aniso: 16 });
    const r = prepare(rough.clone(), { repeat, aniso: 8 });
    return new THREE.MeshStandardMaterial({
      map: m, normalMap: n, normalScale: new THREE.Vector2(0.7, 0.7), roughnessMap: r, roughness: 1,
      envMapIntensity: 0.55, color: '#e8dccb',
    });
  }, [map, normal, rough, repeat[0], repeat[1]]);
}

export function Turntable({ low }: { low: boolean }) {
  const plate = useRef<THREE.Group>(null!);
  const topMat = useTravertine([1, 1]);
  const rimMat = useTravertine([6, 0.12]);
  const socleMat = useTravertine([3, 0.7]);
  const seg = low ? 72 : 160;

  const geo = useMemo(() => {
    const top = new THREE.CircleGeometry(PLATE.r - 0.02, seg);
    top.rotateX(-Math.PI / 2);
    const rim = new THREE.LatheGeometry(
      [
        [PLATE.r - 0.4, -PLATE.thick], [PLATE.r - 0.02, -PLATE.thick], [PLATE.r, -PLATE.thick + 0.02],
        [PLATE.r + 0.004, -0.03], [PLATE.r - 0.008, -0.004], [PLATE.r - 0.02, 0],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      seg,
    );
    const socle = new THREE.LatheGeometry(
      [
        [0.0, FLOOR_Y], [1.45, FLOOR_Y], [1.45, FLOOR_Y + 0.06], [1.36, FLOOR_Y + 0.09],
        [1.12, FLOOR_Y + 0.14], [1.08, -PLATE.thick - 0.1], [1.22, -PLATE.thick - 0.05],
        [1.24, -PLATE.thick - 0.004], [0.0, -PLATE.thick - 0.004],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      seg,
    );
    return { top, rim, socle };
  }, [seg]);

  useFrame(() => {
    plate.current.rotation.y = -stepEase(rituel.progress) * (Math.PI / 2);
  });

  return (
    <group>
      <mesh geometry={geo.socle} material={socleMat} castShadow receiveShadow />
      <group ref={plate}>
        <mesh geometry={geo.top} material={topMat} receiveShadow />
        <mesh geometry={geo.rim} material={rimMat} castShadow receiveShadow />
        {VARIETIES.map((v, i) => {
          const a = (i * Math.PI) / 2;
          return (
            <JarPhoto
              key={v.id}
              variety={v}
              index={i}
              position={[Math.sin(a) * PLATE.ring, 0, Math.cos(a) * PLATE.ring]}
              rotation-y={a}
            />
          );
        })}
      </group>
    </group>
  );
}
