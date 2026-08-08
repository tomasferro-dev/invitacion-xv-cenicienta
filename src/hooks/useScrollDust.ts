import { useEffect, useRef, type MutableRefObject } from 'react'

export interface ScrollState {
  /** velocidad instantánea del scroll en px/frame aprox (suavizada) */
  velocity: number
  /** dirección: 1 baja, -1 sube, 0 quieto */
  direction: number
  /** último scrollY conocido */
  y: number
}

/**
 * Mide la velocidad del scroll (suavizada) para alimentar la emisión de
 * "polvo mágico": cuanto más rápido scrolleás, más destellos.
 * Devuelve un ref para lectura sin re-render dentro del loop del canvas.
 */
export function useScrollDust(): MutableRefObject<ScrollState> {
  const ref = useRef<ScrollState>({ velocity: 0, direction: 0, y: 0 })

  useEffect(() => {
    ref.current.y = window.scrollY
    let lastY = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY
      lastY = y
      const s = ref.current
      // pico inmediato; el decay lo hace el consumidor (canvas) por frame
      s.velocity = Math.min(60, s.velocity + Math.abs(delta))
      s.direction = Math.sign(delta)
      s.y = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return ref
}
