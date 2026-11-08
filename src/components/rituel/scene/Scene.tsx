'use client';
/** Assemblage de la scène 3D du Rituel des Senteurs. */
import * as THREE from 'three';
import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { SoftShadows, useTexture } from '@react-three/drei';
import { Atmosphere } from './Atmosphere';
import { Architecture } from './Architecture';
import { Turntable, FLOOR_Y } from './Turntable';
import { Burner } from './Burner';
import { CameraRig } from './CameraRig';
import { ASSETS } from '../data/varieties';
import { prepare } from './textures';

function BurnerPlinth() {
  const map = useTexture(ASSETS.travertine);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: prepare(map.clone(), { color: true, repeat: [0.6, 0.5] }), roughness: 0.6 }),
    [map],
  );
  return (
    <mesh material={mat} position={[0, FLOOR_Y + 0.42, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.46, 0.5, 0.84, 64]} />
    </mesh>
  );
}

export default function Scene({ low, active, onBackground }: {
  low: boolean; active: boolean; onBackground: (hex: string) => void;
}) {
  return (
    <Canvas
      shadows
      dpr={low ? [1, 1.4] : [1, 2]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 30, near: 0.1, far: 60, position: [0, 2.6, 7] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.92;
      }}
      aria-hidden
    >
      {!low && <SoftShadows size={22} samples={12} focus={0.6} />}
      <Suspense fallback={null}>
        <Atmosphere low={low} onBackground={onBackground} />
        <Architecture />
        <Turntable low={low} />
        <group position={[3.05, 0, -2.75]}>
          <BurnerPlinth />
          <Burner position-y={FLOOR_Y + 0.84} scale={1.15} />
        </group>
        <CameraRig />
      </Suspense>
    </Canvas>
  );
}
