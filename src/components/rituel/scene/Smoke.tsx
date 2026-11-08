'use client';
/**
 * Fumée d'encens.
 * Choix : shader procédural sur quelques plans orientés vers la caméra.
 *  - particules : réalistes de près mais coûteuses (tri, overdraw) et granuleuses en filet fin ;
 *  - textures animées (flipbook) : lourdes à charger, boucle visible ;
 *  - shader (bruit fractal déformé) : filet continu, organique, quasi gratuit en mémoire, réglable en temps réel.
 * La fumée sort uniquement du brûleur.
 */
import * as THREE from 'three';
import type { ThreeElements } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { rituel } from '../lib/store';

const frag = /* glsl */ `
uniform float uTime, uOpacity, uSeed, uSwirl, uSpread; uniform vec3 uColor; varying vec2 vUv;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}
void main(){
  vec2 uv=vUv; float y=uv.y; float t=uTime*0.06+uSeed*7.;
  // trois filets qui s'enroulent en S, puis se dispersent en volutes
  float d=0.;
  for(int k=0;k<3;k++){
    float fk=float(k);
    float ph=uSeed*2.3+fk*2.1;
    float amp=uSwirl*(0.1+0.16*y)*sqrt(y);
    float cx=0.5 + amp*sin(y*(6.0+fk*1.1)-t*(1.1+fk*0.25)+ph)
               + (fbm(vec2(y*1.6-t*0.5, ph))-0.5)*0.7*uSwirl*y;
    float w=mix(0.005,0.045*uSpread,pow(y,0.9))*(1.0+0.5*fk);
    float x=uv.x-cx;
    float filament=exp(-x*x/(w*w));
    d+=filament*(1.0-fk*0.28);
  }
  vec2 q=vec2((uv.x-0.5)*4.0/(0.25+y), y*3.2-t*1.8);
  vec2 wq=vec2(fbm(q+vec2(0.,t*.35)),fbm(q+vec2(5.2,1.3)));
  float n=fbm(q*1.2+2.4*wq);
  float wisp=smoothstep(0.38,0.8,n);
  d*=mix(1.0,0.35+wisp*1.4,smoothstep(0.1,0.55,y));
  d*=smoothstep(0.0,0.03,y)*(1.-smoothstep(0.5,1.0,y))*mix(0.55,1.0,smoothstep(0.0,0.2,y));
  gl_FragColor=vec4(uColor*(0.86+0.28*n), clamp(d*0.85,0.,1.)*uOpacity);
  #include <colorspace_fragment>
}`;

export type SmokeHandle = { setOpacity: (o: number) => void };

export function Smoke({ height = 3.4, width = 1.5, layers = 3, opacity = 0.5, swirl = 1, spread = 1, color = '#f8f2ea', opacityRef, ...group }: {
  height?: number; width?: number; layers?: number; opacity?: number; swirl?: number; spread?: number; color?: string;
  /** opacité pilotée de l'extérieur (0–1), lue à chaque image */
  opacityRef?: { current: number };
} & ThreeElements['group']) {
  const root = useRef<THREE.Group>(null!);
  const n = rituel.lowPower ? Math.max(1, layers - 1) : layers;
  const mats = useMemo(
    () => Array.from({ length: n }, (_, i) => new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 }, uOpacity: { value: opacity * (1 - i * 0.22) }, uSeed: { value: 1.3 + i * 2.17 },
        uSwirl: { value: swirl }, uSpread: { value: spread }, uColor: { value: new THREE.Color(color) },
      },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: frag,
    })),
    [n, opacity, swirl, spread, color],
  );
  const geo = useMemo(() => new THREE.PlaneGeometry(width, height), [width, height]);
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime * (rituel.reducedMotion ? 0.4 : 1);
    root.current.getWorldPosition(v);
    root.current.rotation.y = Math.atan2(camera.position.x - v.x, camera.position.z - v.z);
    const k = opacityRef ? opacityRef.current : 1;
    mats.forEach((m, i) => { m.uniforms.uTime.value = t; m.uniforms.uOpacity.value = opacity * (1 - i * 0.22) * k; });
  });

  return (
    <group ref={root} {...group}>
      {mats.map((m, i) => (
        <mesh key={i} geometry={geo} material={m} position={[0, height / 2, i * 0.03]} renderOrder={10} />
      ))}
    </group>
  );
}
