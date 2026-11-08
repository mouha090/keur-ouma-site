'use client';
/**
 * Pot présenté par sa vraie photo (détourée) : un plan toujours tourné vers la caméra,
 * posé sur le plateau. Les photos produit étant prises de face, le pot reste fidèle sous tous les angles du plateau.
 * Les pots éloignés de l'avant sont très légèrement assombris pour la profondeur.
 */
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import type { Variety } from '../data/varieties';
import { radialTexture } from './textures';
import { rituel } from '../lib/store';

// proportions mesurées sur les photos : largeur / hauteur = 694 / 900
export const PHOTO_JAR = { h: 1.62, w: 1.62 * (694 / 900) };

let shadowTex: THREE.Texture | null = null;
const v = new THREE.Vector3();

export function JarPhoto({ variety, index, ...group }: { variety: Variety; index: number } & ThreeElements['group']) {
  const root = useRef<THREE.Group>(null!);
  const card = useRef<THREE.Mesh>(null!);
  const tex = useTexture(variety.cutout);
  const mat = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: true, alphaTest: 0.02 });
  }, [tex]);
  shadowTex ??= radialTexture([[0, 'rgba(30,18,10,0.6)'], [0.45, 'rgba(30,18,10,0.3)'], [1, 'rgba(30,18,10,0)']]);

  useFrame(({ camera }) => {
    root.current.getWorldPosition(v);
    // face caméra (rotation autour de l'axe vertical uniquement, le pot reste droit)
    const yaw = Math.atan2(camera.position.x - v.x, camera.position.z - v.z);
    const parentYaw = root.current.parent ? root.current.parent.rotation.y : 0;
    card.current.rotation.y = yaw - parentYaw - (root.current.rotation.y || 0);
    // profondeur : légère pénombre pour les pots à l'arrière
    const front = THREE.MathUtils.clamp((v.z + 1.3) / 2.6, 0, 1);
    const k = 0.72 + 0.28 * front;
    mat.color.setRGB(k, k * 0.985, k * 0.97);
  });

  return (
    <group
      ref={root}
      {...group}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = ''; }}
      onClick={(e) => { e.stopPropagation(); rituel.goTo(index); }}
    >
      <mesh ref={card} material={mat} position-y={PHOTO_JAR.h / 2} renderOrder={3}>
        <planeGeometry args={[PHOTO_JAR.w, PHOTO_JAR.h]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.004} renderOrder={1}>
        <planeGeometry args={[1.7, 1.25]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}
