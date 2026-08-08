import { useEffect, useRef, useState } from 'react'

/**
 * Reveal fade-up on-scroll con IntersectionObserver.
 * Devuelve un ref para el elemento y un booleano `inView`.
 * Se dispara una sola vez (no re-oculta al salir).
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Sin soporte / reduced-motion → mostrar directo
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            obs.disconnect()
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px', ...options },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [options])

  return { ref, inView }
}
