import { useEffect, useRef, type MutableRefObject } from 'react'

export interface PointerState {
  /** posición en px (viewport) */
  x: number
  y: number
  /** true cuando hay un dedo/puntero activo cerca (para intensificar la magia) */
  active: boolean
  /** timestamp del último movimiento */
  lastMove: number
}

/**
 * Rastrea la posición unificada de mouse + dedo (touch) a nivel window.
 * Devuelve un ref (NO estado) para que un loop de canvas lo lea sin re-render.
 *
 * "Interceptar dónde está el dedo": escuchamos touchmove/touchstart además de
 * mousemove, así en mobile la magia persigue el dedo mientras se scrollea.
 */
export function usePointer(): MutableRefObject<PointerState> {
  const ref = useRef<PointerState>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    active: false,
    lastMove: 0,
  })

  useEffect(() => {
    const setFrom = (x: number, y: number) => {
      const s = ref.current
      s.x = x
      s.y = y
      s.active = true
      s.lastMove = performance.now()
    }

    const onMouse = (e: MouseEvent) => setFrom(e.clientX, e.clientY)
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0] ?? e.changedTouches[0]
      if (t) setFrom(t.clientX, t.clientY)
    }
    const onLeave = () => {
      ref.current.active = false
    }

    window.addEventListener('mousemove', onMouse, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('touchend', onLeave, { passive: true })
    window.addEventListener('mouseout', onLeave, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchend', onLeave)
      window.removeEventListener('mouseout', onLeave)
    }
  }, [])

  return ref
}
