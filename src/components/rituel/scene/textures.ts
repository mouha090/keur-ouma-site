import * as THREE from 'three';

/** Configure une texture couleur (sRGB) ou de données (linéaire), répétée ou non. */
export function prepare(
  t: THREE.Texture,
  { color = false, repeat, aniso = 8 }: { color?: boolean; repeat?: [number, number]; aniso?: number } = {},
) {
  t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  t.anisotropy = aniso;
  t.needsUpdate = true;
  return t;
}

/** Dégradé radial en canvas (ombres de contact, halos). */
export function radialTexture(stops: [number, string][], size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
