import { useEffect, useState } from 'react'

/**
 * true cuando la página está visible por primera vez.
 *
 * La secuencia de entrada del hero dura varios segundos: si la invitación se
 * abre en una pestaña de fondo (típico al tocar un link desde WhatsApp), la
 * animación correría sin que nadie la vea y al volver ya pasó todo. Con esto,
 * el guion arranca recién cuando hay alguien mirando.
 */
export function useStartWhenVisible(): boolean {
  const [visible, setVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible',
  )

  useEffect(() => {
    if (visible) return
    const onChange = () => {
      if (document.visibilityState === 'visible') setVisible(true)
    }
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [visible])

  return visible
}
