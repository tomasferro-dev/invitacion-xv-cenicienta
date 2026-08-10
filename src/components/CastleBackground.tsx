// ============================================================
// FONDO: CASTILLO — PARALAJE 2.5D SOBRE IMAGEN
//
// La imagen real va sobre un plano a pantalla completa y toda la
// vida se le agrega encima: el realismo lo pone la foto, no la
// geometría. Doce conos y cilindros nunca iban a ser fotorrealistas.
//
// Qué hace cada pieza:
//  - mapa de profundidad derivado de la propia imagen (cielo lejos,
//    castillo medio, agua y setos cerca). El shader desplaza el
//    muestreo según profundidad: el castillo se despega del cielo
//    al inclinar el teléfono. Es paralaje real, no un pan plano.
//  - zoom al castillo en espacio UV con el scroll: nunca se ven los
//    bordes del plano porque el zoom jamás baja de 1.
//  - centelleo aplicado solo a los puntos brillantes de la zona de
//    cielo, con fase por posición: titilan las estrellas que YA
//    están pintadas en la imagen, no unas nuevas encima.
//  - estrellas fugaces en 3D delante del plano, adit1vas.
//  - bloom: el halo cálido alrededor del castillo encendido.
// ============================================================

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
// Postprocesado incluido en `three` (tipado en @types/three): no
// hace falta @react-three/postprocessing.
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

interface CastleBackgroundProps {
  /** Solo se ven mientras carga la imagen. */
  skyTop?: string;
  skyBottom?: string;
  /** Imagen de fondo. Vertical funciona mejor: la columna story lo es. */
  src?: string;
  /** Punto de la imagen al que se acerca el scroll, en UV (0,0 abajo-izq). */
  focus?: [number, number];
  /**
   * Zoom al castillo al final del scroll. 1 = imagen fija (default).
   * Ampliar por encima de lo que da la imagen no se ve como zoom, se ve
   * como derretido: cualquier valor > 1 exige que `src` tenga al menos
   * anchoColumnaCSS * DPR * maxZoom píxeles de ancho. Con la imagen de
   * 635 px y una columna de 430, en un celular a DPR 3 no alcanza ni
   * para 1. Por eso está apagado.
   */
  maxZoom?: number;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

// ── Máscara de cielo ────────────────────────────────────────

// Separa cielo de todo lo demás. Solo el cielo se mueve, así que
// esta máscara define exactamente qué puede desplazarse.
//
// El test de color salió de medir la imagen, no de suponer. Un
// "es azul" a secas NO sirve: el tejado cónico derecho da b/r 1.98
// y el cielo de arriba a la derecha da 1.89, o sea que se solapan,
// y clasificar tejados como cielo es justo lo que hacía que partes
// del castillo se desplazaran y se vieran borrosas. Lo que sí los
// separa es el brillo: el cielo es azul Y oscuro (lum <= 0.55),
// mientras los tejados y la aguja son azules Y brillantes (0.62+).
//
// Errores asimétricos: que un pedacito de cielo quede quieto no se
// nota; que un pedacito de castillo se mueva se nota muchísimo. Por
// eso además hay relleno por contigüidad (nada suelto en medio del
// castillo cuenta como cielo) y una erosión que achica la máscara
// hacia adentro del cielo.
function buildDepthMap(img: HTMLImageElement): THREE.CanvasTexture {
  const W = 160;
  const H = Math.max(1, Math.round((img.height / img.width) * W));

  const src = document.createElement('canvas');
  src.width = W;
  src.height = H;
  const sctx = src.getContext('2d', { willReadFrequently: true })!;
  sctx.drawImage(img, 0, 0, W, H);
  const px = sctx.getImageData(0, 0, W, H).data;

  // Umbrales medidos sobre la imagen de referencia.
  const looksLikeSky = (k: number) => {
    const i = k * 4;
    const r = px[i] / 255;
    const g = px[i + 1] / 255;
    const b = px[i + 2] / 255;
    const lum = r * 0.299 + g * 0.587 + b * 0.114;
    return b >= 0.55 && lum <= 0.58 && b - g >= 0.1;
  };

  // Relleno por contigüidad desde el borde superior y los laterales
  // altos: el cielo es la región azul conectada con el borde. Un
  // vitral o una ventana azul en medio del castillo no se alcanza
  // desde el borde, así que no puede colarse como cielo.
  const sky = new Uint8Array(W * H);
  const stack: number[] = [];
  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const k = y * W + x;
    if (sky[k] || !looksLikeSky(k)) return;
    sky[k] = 1;
    stack.push(k);
  };
  for (let x = 0; x < W; x++) push(x, 0);
  for (let y = 0; y < H * 0.7; y++) {
    push(0, y);
    push(W - 1, y);
  }
  while (stack.length) {
    const k = stack.pop()!;
    const x = k % W;
    const y = (k - x) / W;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  // Erosión: saca de la máscara los píxeles de cielo pegados al
  // castillo. Cede unos píxeles de cielo (invisible) a cambio de que
  // ningún píxel de castillo quede del lado que se mueve.
  const R = 1;
  let depth = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let all = sky[y * W + x] === 1;
      for (let a = -R; a <= R && all; a++) {
        for (let c = -R; c <= R; c++) {
          const yy = Math.min(H - 1, Math.max(0, y + a));
          const xx = Math.min(W - 1, Math.max(0, x + c));
          if (!sky[yy * W + xx]) {
            all = false;
            break;
          }
        }
      }
      // 0.05 = cielo (se mueve), 0.5 = todo lo demás (queda clavado)
      depth[y * W + x] = all ? 0.05 : 0.5;
    }
  }

  // Desenfoque separable. Apenas un plumeado en los bordes: alcanza
  // para que el salto entre planos no se vea como un corte, sin
  // convertir el interior de cada plano en un degradé (que deforma).
  const blur = (input: Float32Array, radius: number) => {
    const tmp = new Float32Array(W * H);
    const out = new Float32Array(W * H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let sum = 0;
        let n = 0;
        for (let k = -radius; k <= radius; k++) {
          const xx = Math.min(W - 1, Math.max(0, x + k));
          sum += input[y * W + xx];
          n++;
        }
        tmp[y * W + x] = sum / n;
      }
    }
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let sum = 0;
        let n = 0;
        for (let k = -radius; k <= radius; k++) {
          const yy = Math.min(H - 1, Math.max(0, y + k));
          sum += tmp[yy * W + x];
          n++;
        }
        out[y * W + x] = sum / n;
      }
    }
    return out;
  };
  depth = blur(depth, 2);

  const out = document.createElement('canvas');
  out.width = W;
  out.height = H;
  const octx = out.getContext('2d')!;
  const id = octx.createImageData(W, H);
  for (let i = 0; i < W * H; i++) {
    const v = depth[i] * 255;
    id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v;
    id.data[i * 4 + 3] = 255;
  }
  octx.putImageData(id, 0, 0);

  const t = new THREE.CanvasTexture(out);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.minFilter = t.magFilter = THREE.LinearFilter;
  return t;
}

// ── Entradas ────────────────────────────────────────────────

// Inclinación por giroscopio (mobile) o puntero (desktop).
// El giroscopio pisa al puntero apenas llegan datos.
function useTilt(reducedMotion: boolean, sensitivity: number) {
  const tilt = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) return;
    let baseBeta: number | null = null;
    let baseGamma: number | null = null;

    const onPointer = (e: PointerEvent) => {
      tilt.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      tilt.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      // La primera lectura es la posición neutra: da igual cómo
      // venga sostenido el teléfono al abrir la invitación.
      if (baseBeta === null || baseGamma === null) {
        baseBeta = e.beta;
        baseGamma = e.gamma;
        return;
      }
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      tilt.current.x = clamp((e.gamma - baseGamma) / sensitivity);
      tilt.current.y = clamp((e.beta - baseBeta) / sensitivity);
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('deviceorientation', onOrient);

    // iOS 13+ solo entrega orientación si se pide desde un gesto.
    type IOSOrientation = { requestPermission?: () => Promise<PermissionState> };
    const askGyro = () => {
      (DeviceOrientationEvent as unknown as IOSOrientation).requestPermission?.().catch(() => {});
    };
    window.addEventListener('touchend', askGyro, { once: true });
    window.addEventListener('click', askGyro, { once: true });

    return () => {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('deviceorientation', onOrient);
      window.removeEventListener('touchend', askGyro);
      window.removeEventListener('click', askGyro);
    };
  }, [reducedMotion, sensitivity]);

  return tilt;
}

// Progreso de scroll 0..1 de la invitación entera.
function useScrollProgress() {
  const p = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      p.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return p;
}

// ── Oclusión por máscara ────────────────────────────────────

/**
 * Uniforms que comparten el plano de imagen y todo lo que tenga que
 * quedar DETRÁS del castillo. El castillo es una imagen plana, así
 * que nada puede taparlo por geometría: lo que va detrás se recorta
 * con la máscara de cielo. Son los mismos objetos uniform en todos
 * los materiales, así que se animan una sola vez.
 */
interface SharedUniforms {
  uMask: { value: THREE.Texture };
  uCover: { value: THREE.Vector2 };
  uFocus: { value: THREE.Vector2 };
  uZoom: { value: number };
}

// Reconstruye la UV de imagen a partir de la posición en pantalla y
// devuelve 1 donde hay cielo. Es la misma transformación que aplica
// el plano de imagen, para que máscara y foto coincidan pixel a pixel.
const OCCLUSION_GLSL = `
  uniform sampler2D uMask;
  uniform vec2 uCover;
  uniform vec2 uFocus;
  uniform float uZoom;
  varying vec4 vClip;

  float skyVisibility() {
    vec2 screen = vClip.xy / vClip.w * 0.5 + 0.5;
    vec2 iuv = (screen - 0.5) * uCover + 0.5;
    iuv = (iuv - uFocus) / uZoom + uFocus;
    float d = texture2D(uMask, clamp(iuv, 0.002, 0.998)).r;
    return smoothstep(0.32, 0.12, d);
  }
`;

// vClip se pasa sin dividir y se divide en el fragment: así el mapeo
// a pantalla es exacto y no una interpolación lineal aproximada.
const CLIP_VARYING_VS = `
  varying vec4 vClip;
`;

// ── Plano de imagen ─────────────────────────────────────────

function ParallaxImage({
  texture,
  shared,
  reducedMotion,
  maxZoom,
}: {
  texture: THREE.Texture;
  shared: SharedUniforms;
  reducedMotion: boolean;
  maxZoom: number;
}) {
  const { viewport } = useThree();
  const tilt = useTilt(reducedMotion, 18); // ±1 a los 18°: bien sensible
  const scroll = useScrollProgress();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const elapsed = useRef(0);

  // uMask/uCover/uFocus/uZoom son los objetos compartidos: al animar
  // uZoom acá, lo que va detrás del castillo se recorta con el mismo
  // encuadre sin tener que sincronizar nada.
  const uniforms = useMemo(
    () => ({
      uImage: { value: texture },
      uDepth: shared.uMask,
      uTilt: { value: new THREE.Vector2() },
      uZoom: shared.uZoom,
      uFocus: shared.uFocus,
      uCover: shared.uCover,
      uTime: { value: 0 },
      uTwinkle: { value: reducedMotion ? 0 : 1 },
    }),
    [texture, shared, reducedMotion]
  );

  useFrame((_, delta) => {
    if (document.hidden || !mat.current) return;
    elapsed.current += delta;
    const u = mat.current.uniforms;
    u.uTime.value = elapsed.current;

    // deriva lenta: en mobile quieto, la escena igual respira
    const driftX = reducedMotion ? 0 : Math.sin(elapsed.current * 0.13) * 0.18;
    const driftY = reducedMotion ? 0 : Math.sin(elapsed.current * 0.1) * 0.1;

    const k = Math.min(1, delta * 3);
    const tx = tilt.current.x + driftX;
    const ty = tilt.current.y + driftY;
    u.uTilt.value.x += (tx - u.uTilt.value.x) * k;
    u.uTilt.value.y += (ty - u.uTilt.value.y) * k;

    const targetZoom = 1 + (maxZoom - 1) * scroll.current;
    u.uZoom.value += (targetZoom - u.uZoom.value) * k;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D uImage;
          uniform sampler2D uDepth;
          uniform vec2 uTilt;
          uniform vec2 uCover;
          uniform vec2 uFocus;
          uniform float uZoom;
          uniform float uTime;
          uniform float uTwinkle;
          varying vec2 vUv;

          void main() {
            // recorte cover + zoom hacia el castillo
            vec2 uv = (vUv - 0.5) * uCover + 0.5;
            uv = (uv - uFocus) / uZoom + uFocus;

            // El castillo y el primer plano se muestrean SIN desplazar:
            // quedan clavados, nítidos, imposible que se deformen. Solo
            // el cielo se mueve, y se compone por máscara. Desplazar el
            // castillo aunque sea poco lo deforma y lo desenfoca, porque
            // cada pixel termina interpolado entre vecinos distintos.
            float d = texture2D(uDepth, uv).r;
            float skyMask = smoothstep(0.32, 0.12, d);

            vec2 uvSky = clamp(uv + vec2(-uTilt.x, uTilt.y) * 0.022, 0.002, 0.998);
            vec3 fixedPart = texture2D(uImage, uv).rgb;
            vec3 skyPart = texture2D(uImage, uvSky).rgb;
            vec3 col = mix(fixedPart, skyPart, skyMask);

            // centelleo sobre los puntos ya brillantes del cielo
            float lum = dot(col, vec3(0.299, 0.587, 0.114));
            float spark = smoothstep(0.52, 0.92, lum) * skyMask;
            float phase = fract(sin(uvSky.x * 127.1 + uvSky.y * 311.7) * 43758.5453) * 6.2831;
            float tw = sin(uTime * 2.1 + phase) * 0.5 + 0.5;
            col += col * spark * pow(tw, 2.0) * 1.7 * uTwinkle;

            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}

// Carga la imagen, construye la máscara y arma los uniforms
// compartidos. Vive acá arriba para que el plano de imagen, el polvo
// lejano y las fugaces usen exactamente la misma máscara y el mismo
// encuadre.
function CastleScene({
  src,
  focus,
  maxZoom,
  reducedMotion,
}: {
  src: string;
  focus: [number, number];
  maxZoom: number;
  reducedMotion: boolean;
}) {
  const { size } = useThree();
  const texture = useLoader(THREE.TextureLoader, src);

  const depthMap = useMemo(() => buildDepthMap(texture.image as HTMLImageElement), [texture]);
  useEffect(() => () => depthMap.dispose(), [depthMap]);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
  }, [texture]);

  const shared: SharedUniforms = useMemo(
    () => ({
      uMask: { value: depthMap },
      uCover: { value: new THREE.Vector2(1, 1) },
      uFocus: { value: new THREE.Vector2(focus[0], focus[1]) },
      uZoom: { value: 1 },
    }),
    [depthMap, focus]
  );

  // Encuadre tipo `background-size: cover`, calculado acá y no por
  // pixel en el shader.
  useEffect(() => {
    const img = texture.image as HTMLImageElement;
    const imgAspect = img.width / img.height;
    const screenAspect = size.width / size.height;
    if (screenAspect > imgAspect) {
      shared.uCover.value.set(1, imgAspect / screenAspect);
    } else {
      shared.uCover.value.set(screenAspect / imgAspect, 1);
    }
  }, [texture, size, shared]);

  return (
    <>
      <ParallaxImage texture={texture} shared={shared} reducedMotion={reducedMotion} maxZoom={maxZoom} />
      <Dust shared={shared} reducedMotion={reducedMotion} />
      {!reducedMotion && <ShootingStar shared={shared} />}
      <Postfx />
    </>
  );
}

// ── Estrellas fugaces ───────────────────────────────────────

let glowTexture: THREE.CanvasTexture | null = null;
function getGlowTexture() {
  if (glowTexture) return glowTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.7)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  glowTexture = new THREE.CanvasTexture(c);
  return glowTexture;
}

// Polvo luminoso en dos capas que derivan a distinta velocidad y
// responden al giroscopio con distinta amplitud. Dos capas es el
// mínimo para que haya sensación de profundidad: con una sola, todo
// se mueve igual y el cerebro lo lee como una calcomanía.
function Dust({ shared, reducedMotion }: { shared: SharedUniforms; reducedMotion: boolean }) {
  const { viewport } = useThree();
  const tilt = useTilt(reducedMotion, 18);
  const far = useRef<THREE.Points>(null);
  const near = useRef<THREE.Points>(null);

  const make = (count: number, sizeMin: number, sizeMax: number, seed: number) => {
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * viewport.width * 1.6;
      pos[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 1.4;
      pos[i * 3 + 2] = 0.2 + seed * 0.1;
      size[i] = sizeMin + Math.random() * (sizeMax - sizeMin);
      phase[i] = Math.random() * Math.PI * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    return g;
  };

  const geoFar = useMemo(() => make(90, 1.5, 4, 0), [viewport.width, viewport.height]); // eslint-disable-line react-hooks/exhaustive-deps
  const geoNear = useMemo(() => make(28, 5, 13, 1), [viewport.width, viewport.height]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      geoFar.dispose();
      geoNear.dispose();
    },
    [geoFar, geoNear]
  );

  const uniformsFar = useMemo(
    () => ({
      uTime: { value: 0 },
      uMap: { value: getGlowTexture() },
      uOpacity: { value: 0.5 },
      uMask: shared.uMask,
      uCover: shared.uCover,
      uFocus: shared.uFocus,
      uZoom: shared.uZoom,
    }),
    [shared]
  );
  const uniformsNear = useMemo(() => ({ uTime: { value: 0 }, uMap: { value: getGlowTexture() }, uOpacity: { value: 0.22 } }), []);

  const drift = useRef(0);

  useFrame((_, delta) => {
    if (document.hidden || reducedMotion) return;
    drift.current += delta;
    uniformsFar.uTime.value = drift.current;
    uniformsNear.uTime.value = drift.current;
    const h = viewport.height;
    const wrap = (p: THREE.Points | null, speed: number, par: number) => {
      if (!p) return;
      const attr = p.geometry.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let i = 1; i < arr.length; i += 3) {
        arr[i] += delta * speed;
        if (arr[i] > h * 0.7) arr[i] = -h * 0.7;
      }
      attr.needsUpdate = true;
      // la capa cercana se desplaza más con la inclinación: eso es el paralaje
      p.position.x += (tilt.current.x * par - p.position.x) * Math.min(1, delta * 2.5);
      p.position.y += (-tilt.current.y * par * 0.6 - p.position.y) * Math.min(1, delta * 2.5);
    };
    wrap(far.current, 0.045, viewport.width * 0.02);
    wrap(near.current, 0.11, viewport.width * 0.06);
  });

  // `occluded` recorta la capa con la máscara de cielo. La capa lejana
  // está detrás del castillo por definición, así que se recorta; la
  // cercana pasa por delante, que es lo que la hace leer como cercana.
  const shader = (occluded: boolean) => ({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      ${occluded ? CLIP_VARYING_VS : ''}
      attribute float aSize;
      attribute float aPhase;
      uniform float uTime;
      varying float vTw;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vTw = 0.35 + 0.65 * (sin(uTime * 0.9 + aPhase) * 0.5 + 0.5);
        gl_PointSize = aSize * (0.7 + 0.3 * vTw) * (60.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
        ${occluded ? 'vClip = gl_Position;' : ''}
      }
    `,
    fragmentShader: `
      ${occluded ? OCCLUSION_GLSL : ''}
      uniform sampler2D uMap;
      uniform float uOpacity;
      varying float vTw;
      void main() {
        vec4 t = texture2D(uMap, gl_PointCoord);
        float vis = ${occluded ? 'skyVisibility()' : '1.0'};
        gl_FragColor = vec4(vec3(0.85, 0.93, 1.0), t.a * vTw * uOpacity * vis);
      }
    `,
  });

  if (reducedMotion) return null;

  return (
    <>
      <points ref={far} geometry={geoFar} frustumCulled={false}>
        <shaderMaterial {...shader(true)} uniforms={uniformsFar} />
      </points>
      <points ref={near} geometry={geoNear} frustumCulled={false}>
        <shaderMaterial {...shader(false)} uniforms={uniformsNear} />
      </points>
    </>
  );
}

// Cabeza + estela, delante del plano de imagen. Trayectoria
// fronto-paralela: así el ángulo en pantalla es el ángulo en XY y
// alcanza con rotar sobre Z para que la estela mire a la cámara.
function ShootingStar({ shared }: { shared: SharedUniforms }) {
  const { viewport } = useThree();
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Mesh>(null);
  const trail = useRef<THREE.Mesh>(null);
  const run = useRef({ t: 0, wait: 0, dur: 1.1, angle: 0, from: new THREE.Vector3(), to: new THREE.Vector3() });
  const scale = Math.max(viewport.width, viewport.height) * 0.05;

  // Material con oclusión: la fugaz se dibuja delante del plano, pero
  // se recorta con la máscara de cielo, así que al cruzar por encima
  // del castillo desaparece. Es la única forma de que pase por detrás
  // de algo que en realidad es una foto plana.
  const makeStarMaterial = (tint: string) =>
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      uniforms: {
        uMap: { value: getGlowTexture() },
        uOpacity: { value: 0 },
        uTint: { value: new THREE.Color(tint) },
        uMask: shared.uMask,
        uCover: shared.uCover,
        uFocus: shared.uFocus,
        uZoom: shared.uZoom,
      },
      vertexShader: `
        ${CLIP_VARYING_VS}
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vClip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_Position = vClip;
        }
      `,
      fragmentShader: `
        ${OCCLUSION_GLSL}
        uniform sampler2D uMap;
        uniform float uOpacity;
        uniform vec3 uTint;
        varying vec2 vUv;
        void main() {
          vec4 t = texture2D(uMap, vUv);
          gl_FragColor = vec4(uTint, t.a * uOpacity * skyVisibility());
        }
      `,
    });

  const headMat = useMemo(() => makeStarMaterial('#ffffff'), [shared]); // eslint-disable-line react-hooks/exhaustive-deps
  const trailMat = useMemo(() => makeStarMaterial('#dceaff'), [shared]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      headMat.dispose();
      trailMat.dispose();
    },
    [headMat, trailMat]
  );

  const arm = (first = false) => {
    const r = run.current;
    const w = viewport.width;
    const h = viewport.height;
    // arranca arriba, cruza hacia abajo y hacia el lado opuesto
    const startX = (Math.random() - 0.5) * w * 1.1;
    const dirX = startX > 0 ? -1 : 1;
    r.from.set(startX, h * (0.2 + Math.random() * 0.28), 0.5);
    r.to.set(r.from.x + dirX * w * (0.35 + Math.random() * 0.4), r.from.y - h * (0.18 + Math.random() * 0.2), 0.5);
    r.angle = Math.atan2(r.to.y - r.from.y, r.to.x - r.from.x);
    r.dur = 0.75 + Math.random() * 0.6;
    r.wait = first ? 2 + Math.random() * 4 : 5 + Math.random() * 9;
    r.t = 0;
  };

  // Armar en el montaje: si no, la primera pasada sale de (0,0,0).
  useEffect(() => arm(true), [viewport.width, viewport.height]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    const g = group.current;
    if (document.hidden || !g || !head.current || !trail.current) return;
    const r = run.current;

    if (r.wait > 0) {
      r.wait -= delta;
      g.visible = false;
      if (r.wait <= 0) {
        g.position.copy(r.from);
        g.rotation.z = r.angle;
        g.visible = true;
      }
      return;
    }

    r.t += delta;
    const p = r.t / r.dur;
    if (p >= 1) {
      arm();
      return;
    }
    g.position.lerpVectors(r.from, r.to, p);
    const fade = Math.sin(p * Math.PI);
    headMat.uniforms.uOpacity.value = fade;
    trailMat.uniforms.uOpacity.value = fade * 0.65;
    trail.current.scale.x = (0.5 + fade) * scale * 6;
  });

  return (
    <group ref={group} visible={false}>
      <mesh ref={head} scale={[scale, scale, 1]}>
        <planeGeometry args={[1, 1]} />
        <primitive object={headMat} attach="material" />
      </mesh>
      {/* estela detrás de la cabeza, sobre -X local */}
      <mesh ref={trail} position={[-scale * 3, 0, 0]} scale={[scale * 6, scale * 0.35, 1]}>
        <planeGeometry args={[1, 1]} />
        <primitive object={trailMat} attach="material" />
      </mesh>
    </group>
  );
}

// ── Render ──────────────────────────────────────────────────

// Bloom: el halo cálido alrededor del castillo encendido. Toma el
// control del loop de render (prioridad 1), así que r3f deja de
// dibujar por su cuenta.
function Postfx() {
  const { gl, scene, camera, size } = useThree();

  const composer = useMemo(() => {
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));
    // Radio corto y umbral alto: solo entran las luces del castillo.
    // Con radio largo el halo se come el detalle de las torres y, sobre
    // una imagen ya ampliada, eso se lee como que se derrite.
    c.addPass(new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.3, 0.35, 0.88));
    c.addPass(new OutputPass());
    return c;
    // el tamaño se ajusta abajo; recrear el composer al redimensionar
    // tira los render targets al pedo
  }, [gl, scene, camera]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => composer.dispose(), [composer]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }, [composer, size]);

  useFrame(() => composer.render(), 1);

  return null;
}

export default function CastleBackground({
  skyTop = '#050b26',
  skyBottom = '#0f2f6b',
  src = '/castle/castle.jpg',
  focus = [0.5, 0.46],
  maxZoom = 1,
}: CastleBackgroundProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        // solo visible mientras carga la imagen
        background: `radial-gradient(ellipse 90% 60% at 50% 72%, #1d5f86 0%, ${skyBottom} 40%, ${skyTop} 100%)`,
      }}
      aria-hidden="true"
    >
      <Canvas dpr={[1, 2]} gl={{ antialias: false, alpha: false }} camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <CastleScene src={src} focus={focus} maxZoom={maxZoom} reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
