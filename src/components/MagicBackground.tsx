import { useEffect, useRef } from 'react'
import { usePointer } from '../hooks/usePointer'
import { useScrollDust } from '../hooks/useScrollDust'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type Kind = 'snow' | 'star' | 'dust'

interface Particle {
  kind: Kind
  x: number
  y: number
  vx: number
  vy: number
  size: number
  baseAlpha: number
  alpha: number
  life: number // 1→0 para dust; los otros lo ignoran
  decay: number
  sprite: 0 | 1 | 2 // 0 blanco, 1 celeste, 2 dorado
  twinklePhase: number
  twinkleSpeed: number
  sway: number
}

// Colores de los sprites de glow (rgb)
const SPRITE_COLORS: [number, number, number][] = [
  [255, 255, 255], // 0 nieve / destello blanco
  [187, 211, 255], // 1 celeste glow (#BBD3FF)
  [231, 211, 161], // 2 dorado champagne (#E7D3A1)
]

/** Crea un sprite circular con glow radial para dibujar por drawImage. */
function makeSprite(r: number, g: number, b: number): HTMLCanvasElement {
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, `rgba(${r},${g},${b},1)`)
  grad.addColorStop(0.25, `rgba(${r},${g},${b},0.85)`)
  grad.addColorStop(0.6, `rgba(${r},${g},${b},0.25)`)
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return c
}

export default function MagicBackground({ intensity = 1 }: { intensity?: number } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointer = usePointer()
  const scroll = useScrollDust()
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    // aliases con tipo no-nulo: el narrowing de flujo no persiste dentro de
    // las funciones anidadas del loop, así que fijamos el tipo acá.
    const cv: HTMLCanvasElement = canvas
    const g: CanvasRenderingContext2D = ctx

    const sprites = SPRITE_COLORS.map(([r, g, b]) => makeSprite(r, g, b))

    let width = 0
    let height = 0
    let dpr = 1
    const particles: Particle[] = []

    // seguimiento del movimiento del puntero para la emisión de polvo:
    // energía que sube con el movimiento y decae rápido al frenar → el polvo
    // se corta de forma progresiva (sin la cola de ~1s del enfoque anterior).
    let lastPX = 0
    let lastPY = 0
    let emitEnergy = 0

    const rand = (a: number, b: number) => a + Math.random() * (b - a)

    const isMobile = () => window.innerWidth < 768

    function spawnSnow(atTop = false): Particle {
      return {
        kind: 'snow',
        x: rand(0, width),
        y: atTop ? rand(-40, 0) : rand(0, height),
        vx: rand(-0.15, 0.15),
        vy: rand(0.25, 0.8),
        size: rand(1.2, 3.4),
        baseAlpha: rand(0.35, 0.9),
        alpha: 0,
        life: 1,
        decay: 0,
        sprite: 0,
        twinklePhase: rand(0, Math.PI * 2),
        twinkleSpeed: rand(0.01, 0.03),
        sway: rand(0.4, 1.4),
      }
    }

    function spawnStar(): Particle {
      const sprite = Math.random() < 0.6 ? 1 : 2
      return {
        kind: 'star',
        x: rand(0, width),
        y: rand(0, height),
        vx: 0,
        vy: rand(-0.05, 0.05),
        size: rand(0.8, 2.4),
        baseAlpha: rand(0.2, 0.7),
        alpha: 0,
        life: 1,
        decay: 0,
        sprite: sprite as 1 | 2,
        twinklePhase: rand(0, Math.PI * 2),
        twinkleSpeed: rand(0.008, 0.025),
        sway: 0,
      }
    }

    function spawnDust(x: number, y: number, energy: number): Particle {
      const sprite = Math.random() < 0.5 ? 1 : 2
      const angle = rand(0, Math.PI * 2)
      const speed = rand(0.3, 1.6) * (0.6 + energy)
      return {
        kind: 'dust',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rand(0.2, 0.9), // tiende a subir
        size: rand(1.4, 4),
        baseAlpha: rand(0.6, 1),
        alpha: 0,
        life: 1,
        decay: rand(0.012, 0.03),
        sprite: sprite as 1 | 2,
        twinklePhase: rand(0, Math.PI * 2),
        twinkleSpeed: rand(0.05, 0.12),
        sway: 0,
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      cv.width = Math.floor(width * dpr)
      cv.height = Math.floor(height * dpr)
      cv.style.width = width + 'px'
      cv.style.height = height + 'px'
      g.setTransform(dpr, 0, 0, dpr, 0, 0)

      // (re)poblar densidad según área
      particles.length = 0
      const area = width * height
      const density = isMobile() ? 26000 : 15000
      const snowCount = Math.min(reduced ? 40 : 240, Math.floor((area / density) * intensity))
      const starCount = Math.min(reduced ? 30 : 120, Math.floor((area / (density * 2.2)) * intensity))
      for (let i = 0; i < snowCount; i++) particles.push(spawnSnow(false))
      for (let i = 0; i < starCount; i++) particles.push(spawnStar())
    }

    let raf = 0
    let running = true

    function drawParticle(p: Particle) {
      const s = sprites[p.sprite]
      const d = p.size * 4 // el sprite es glow; escalamos ~4x el radio
      g.globalAlpha = Math.max(0, Math.min(1, p.alpha))
      g.drawImage(s, p.x - d / 2, p.y - d / 2, d, d)
    }

    function frame() {
      raf = requestAnimationFrame(frame)
      if (!running) return

      g.clearRect(0, 0, width, height)
      g.globalCompositeOperation = 'lighter' // los glows suman luz

      const ptr = pointer.current
      const scr = scroll.current
      const now = performance.now()
      const pointerFresh = now - ptr.lastMove < 900 && ptr.active

      // decay de la velocidad de scroll + emisión de polvo mágico
      scr.velocity *= 0.9
      if (!reduced && scr.velocity > 1.5) {
        const bursts = Math.min(6, Math.floor(scr.velocity / 4))
        const energy = Math.min(1.2, scr.velocity / 40)
        for (let i = 0; i < bursts; i++) {
          particles.push(spawnDust(rand(0, width), rand(0, height), energy))
        }
      }

      // emisión de polvo proporcional al movimiento real del puntero este frame.
      // emitEnergy sube al mover y decae al frenar → corta progresivo y sin cola.
      const pdx = ptr.x - lastPX
      const pdy = ptr.y - lastPY
      lastPX = ptr.x
      lastPY = ptr.y
      const pSpeed = Math.hypot(pdx, pdy)
      emitEnergy = emitEnergy * 0.78 + pSpeed
      if (!reduced && ptr.active) {
        const n = Math.min(2, Math.floor(emitEnergy / 55))
        for (let i = 0; i < n; i++) {
          particles.push(spawnDust(ptr.x + rand(-9, 9), ptr.y + rand(-9, 9), 0.3))
        }
      }

      const pr = isMobile() ? 120 : 170 // radio de influencia del puntero
      const pr2 = pr * pr

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        // twinkle
        p.twinklePhase += p.twinkleSpeed
        const tw = 0.6 + 0.4 * Math.sin(p.twinklePhase)

        if (p.kind === 'dust') {
          p.life -= p.decay
          if (p.life <= 0) {
            particles.splice(i, 1)
            continue
          }
          p.vy += 0.006 // leve gravedad
          p.vx *= 0.985
          p.vy *= 0.99
          p.alpha = p.baseAlpha * p.life * tw
        } else if (p.kind === 'snow') {
          p.y += p.vy
          p.x += p.vx + Math.sin((p.y + p.twinklePhase * 40) * 0.01) * p.sway * 0.15
          p.alpha = p.baseAlpha * tw
          if (p.y > height + 10) {
            Object.assign(p, spawnSnow(true))
          }
        } else {
          // star ambiental
          p.y += p.vy
          p.alpha = p.baseAlpha * tw
          if (p.y < -10) p.y = height + 10
          if (p.y > height + 10) p.y = -10
        }

        // interacción con el puntero/dedo: swirl + empuje
        if (!reduced && pointerFresh) {
          const dx = p.x - ptr.x
          const dy = p.y - ptr.y
          const d2 = dx * dx + dy * dy
          if (d2 < pr2 && d2 > 0.5) {
            const d = Math.sqrt(d2)
            const force = (1 - d / pr) * (p.kind === 'snow' ? 0.9 : 1.6)
            // empuje radial hacia afuera
            p.x += (dx / d) * force
            p.y += (dy / d) * force
            // swirl (perpendicular) → sensación de remolino mágico
            p.x += (-dy / d) * force * 0.6
            p.y += (dx / d) * force * 0.6
            // destellan más cerca del dedo
            p.alpha = Math.min(1, p.alpha + force * 0.5)
          }
        }

        drawParticle(p)
      }

      g.globalAlpha = 1
      g.globalCompositeOperation = 'source-over'

      // techo de partículas para que dust no crezca sin límite
      if (particles.length > 900) {
        particles.splice(0, particles.length - 900)
      }
    }

    resize()

    if (reduced) {
      // Render estático una sola vez (sin loop): campo tenue de estrellas
      g.clearRect(0, 0, width, height)
      g.globalCompositeOperation = 'lighter'
      for (const p of particles) {
        p.alpha = p.baseAlpha * 0.7
        drawParticle(p)
      }
      g.globalCompositeOperation = 'source-over'
    } else {
      raf = requestAnimationFrame(frame)
    }

    const onVisibility = () => {
      running = document.visibilityState === 'visible'
    }
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced, pointer, scroll, intensity])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  )
}
