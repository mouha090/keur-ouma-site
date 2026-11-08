'use client';
/**
 * Hero « Thiouraye — L'Art de Parfumer » : l'image de la marque, à l'identique,
 * dont seule la fumée au-dessus du pot est animée.
 *
 * Principe : l'image est séparée en deux calques (préparés une fois, hors ligne) :
 *  - hero-plate : l'image sans la fumée (fond reconstitué derrière la fumée) ;
 *  - hero-smoke : la fumée seule, sur fond transparent (zone au-dessus du pot).
 * Un shader WebGL recompose l'image à chaque image : la fumée monte (flux en deux phases
 * croisées, sans saut) et ondule (champ de bruit qui monte), en restant ancrée sur le couvercle.
 * Sans WebGL ou avec « animations réduites », l'image originale s'affiche, immobile.
 */
import { useEffect, useRef, useState } from 'react';
import { ASSETS } from '../rituel/data/varieties';

type Box = { x: number; y: number; w: number; h: number };
type HeroConfig = { img: string; plate: string; smoke: string; size: { w: number; h: number }; roi: Box; cta: Box };

// Pour chaque format : dimensions de l'image, zone de fumée et position du bouton (pixels de l'image)
const DESKTOP: HeroConfig = {
  img: ASSETS.heroImage, plate: ASSETS.heroPlate, smoke: ASSETS.heroSmoke,
  size: { w: 1456, h: 819 }, roi: { x: 700, y: 0, w: 490, h: 244 }, cta: { x: 169, y: 474, w: 309, h: 57 },
};
const MOBILE: HeroConfig = {
  img: ASSETS.heroImageM, plate: ASSETS.heroPlateM, smoke: ASSETS.heroSmokeM,
  size: { w: 1086, h: 1448 }, roi: { x: 450, y: 330, w: 486, h: 360 }, cta: { x: 327, y: 523, w: 433, h: 75 },
};
const MOBILE_QUERY = '(max-width: 760px), (max-aspect-ratio: 4/5)';

const VERT = `
attribute vec2 aPos; varying vec2 vUv;
void main(){ vUv = vec2(aPos.x*0.5+0.5, 0.5-aPos.y*0.5); gl_Position = vec4(aPos,0.,1.); }`;

const FRAG = `
precision highp float;
uniform sampler2D uPlate, uSmoke; uniform float uTime; uniform vec4 uRoi; varying vec2 vUv;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
vec4 smokeAt(vec2 l){ return (l.x<0.||l.x>1.||l.y<0.||l.y>1.) ? vec4(0.) : texture2D(uSmoke, l); }
void main(){
  vec4 base = texture2D(uPlate, vUv);
  vec2 l = (vUv - uRoi.xy) / uRoi.zw;
  if (l.x < -0.02 || l.x > 1.02 || l.y < 0. || l.y > 1.) { gl_FragColor = base; return; }
  float h = 1.0 - l.y;                    // 0 au couvercle, 1 en haut
  float k = smoothstep(0.0, 0.3, h);       // la base reste accrochée au pot
  float t = uTime;
  // ondulation : champ de bruit qui monte
  vec2 p = vec2(l.x*2.6, l.y*1.8 + t*0.16);
  vec2 d = vec2(fbm(p) - 0.5, fbm(p + vec2(4.1, 1.7)) - 0.5) * vec2(0.075, 0.035) * k;
  d.x += sin(h*5.0 - t*0.7) * 0.012 * k;
  // montée continue : deux phases décalées, fondues pour masquer le retour
  float ph1 = fract(t * 0.07), ph2 = fract(t * 0.07 + 0.5);
  float flow = 0.06 * k;
  vec4 s1 = smokeAt(l + d + vec2(0., ph1 * flow));
  vec4 s2 = smokeAt(l + d + vec2(0., ph2 * flow));
  float w1 = 1.0 - abs(2.0 * ph1 - 1.0);
  vec4 s = s1 * w1 + s2 * (1.0 - w1);
  // respiration légère de la densité
  float a = s.a * (0.9 + 0.1 * sin(t * 0.45 + h * 2.0));
  // bords latéraux adoucis
  a *= smoothstep(0.0, 0.03, l.x) * smoothstep(1.0, 0.97, l.x);
  gl_FragColor = vec4(mix(base.rgb, s.rgb, a), 1.0);
}`;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

function startSmoke(canvas: HTMLCanvasElement, plate: HTMLImageElement, smoke: HTMLImageElement, cfg: HeroConfig) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: false });
  if (!gl) return null;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = (img: HTMLImageElement, unit: number) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };
  tex(plate, 0); tex(smoke, 1);
  gl.uniform1i(gl.getUniformLocation(prog, 'uPlate'), 0);
  gl.uniform1i(gl.getUniformLocation(prog, 'uSmoke'), 1);
  const { roi, size } = cfg;
  gl.uniform4f(gl.getUniformLocation(prog, 'uRoi'), roi.x / size.w, roi.y / size.h, roi.w / size.w, roi.h / size.h);
  const uTime = gl.getUniformLocation(prog, 'uTime');

  let raf = 0, running = true;
  const t0 = performance.now();
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  addEventListener('resize', resize);
  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (!running) return;
    // vitesse de la fumée (1 = lente, 2.2 = vive)
    gl.uniform1f(uTime, ((performance.now() - t0) / 1000) * 2.2 + 3.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  raf = requestAnimationFrame(frame);
  return {
    setRunning(v: boolean) { running = v; },
    dispose() { cancelAnimationFrame(raf); removeEventListener('resize', resize); },
  };
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export default function HeroImage({ ctaHref = '#thiouraye' }: { ctaHref?: string }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [cfg, setCfg] = useState<HeroConfig>(DESKTOP);
  const [live, setLive] = useState(false);

  // choix du format selon l'écran
  useEffect(() => {
    const mq = matchMedia(MOBILE_QUERY);
    const pick = () => setCfg(mq.matches ? MOBILE : DESKTOP);
    pick();
    mq.addEventListener('change', pick);
    return () => mq.removeEventListener('change', pick);
  }, []);

  useEffect(() => {
    setLive(false);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ctl: ReturnType<typeof startSmoke> = null;
    let io: IntersectionObserver | null = null;
    let cancelled = false;
    Promise.all([loadImage(cfg.plate), loadImage(cfg.smoke)])
      .then(([plate, smoke]) => {
        if (cancelled || !canvas.current) return;
        try { ctl = startSmoke(canvas.current, plate, smoke, cfg); } catch (e) { console.warn(e); ctl = null; }
        if (!ctl) return;
        setLive(true);
        io = new IntersectionObserver(([e]) => ctl?.setRunning(e.isIntersecting));
        if (root.current) io.observe(root.current);
      })
      .catch(() => {});
    return () => { cancelled = true; io?.disconnect(); ctl?.dispose(); };
  }, [cfg]);

  const { size, cta } = cfg;
  return (
    <section
      ref={root}
      className="hero-img"
      style={{ aspectRatio: `${size.w} / ${size.h}` }}
      aria-labelledby="hero-img-title"
    >
      <picture>
        <source media={MOBILE_QUERY} srcSet={MOBILE.img} />
        <img
          className="hero-img-still"
          src={DESKTOP.img}
          alt="Pot de Thiouraye Kër Ouma sur une dalle de marbre, fumée d’encens, brûleur doré et fleur d’hibiscus"
          fetchPriority="high"
        />
      </picture>
      {/* remonté à chaque changement de format : un contexte WebGL neuf */}
      <canvas key={cfg.img} ref={canvas} className={`hero-img-canvas ${live ? 'is-live' : ''}`} aria-hidden />

      <div className="sr-only">
        <h1 id="hero-img-title">Kër Ouma — Thiouraye, l’Art de Parfumer</h1>
        <p>Un encens d’exception pour sublimer vos espaces. Authentique, raffiné, apaisant.</p>
      </div>

      <a
        className="hero-img-cta"
        href={ctaHref}
        style={{ left: pct(cta.x, size.w), top: pct(cta.y, size.h), width: pct(cta.w, size.w), height: pct(cta.h, size.h) }}
      >
        <span className="sr-only">Découvrir la collection</span>
      </a>
    </section>
  );
}
