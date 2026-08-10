import { motion, type Target, type Transition } from 'framer-motion'
import { invitation } from '../data/invitation'
import EventCalendar from './EventCalendar'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useStartWhenVisible } from '../hooks/useStartWhenVisible'

// ── Guion de la entrada ──────────────────────────────────────────────────────
// Secuencia con suspenso: cada pieza entra lenta y se solapa apenas con la
// siguiente. Los tiempos están acá arriba para afinar el ritmo de un vistazo
// (en segundos, desde que la página se vuelve visible).
const T = {
  eyebrow: 0.4,
  numero: 1.4,
  anios: 3.0,
  ornamento: 3.8,
  nombre: 4.5,
  calendario: 5.8,
} as const

const EASE: number[] = [0.22, 1, 0.36, 1]

/** Props de animación que se esparcen sobre un `motion.*`. */
interface AnimProps {
  initial: Target | false
  animate: Target
  transition?: Transition
}

export default function Hero() {
  const { nombre, edad, fechaISO } = invitation
  const reduced = usePrefersReducedMotion()
  const started = useStartWhenVisible()
  const fecha = new Date(fechaISO)

  /**
   * Props de animación para una pieza del guion.
   * - reduced-motion: aparece sin animación ni espera.
   * - pestaña de fondo: se queda en `hidden` hasta que haya alguien mirando.
   */
  const anim = (
    hidden: Target,
    show: Target,
    delay: number,
    duration = 1.6,
  ): AnimProps => {
    if (reduced) return { initial: false, animate: show }
    return {
      initial: hidden,
      animate: started ? show : hidden,
      transition: { delay, duration, ease: EASE },
    }
  }

  return (
    <header className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 py-10 text-center">
      {/* velo oscuro: atenúa el brillo del castillo detrás del texto */}
      <div
        className="pointer-events-none absolute inset-0 -z-[2]"
        style={{
          background:
            'radial-gradient(ellipse 78% 55% at 50% 46%, rgba(5,7,15,0.62) 0%, rgba(5,7,15,0.28) 45%, transparent 74%)',
        }}
        aria-hidden
      />

      {/* halo celeste que crece detrás del número */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-[1] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
        style={{ background: 'radial-gradient(circle, rgba(169,194,240,0.35), transparent 70%)' }}
        {...anim({ opacity: 0, scale: 0.5 }, { opacity: 0.6, scale: 1 }, T.numero, 2.6)}
        aria-hidden
      />

      {/* "Te invito a mis" */}
      <motion.p
        className="eyebrow mb-5"
        {...anim(
          { opacity: 0, y: 14, letterSpacing: '0.9em' },
          { opacity: 1, y: 0, letterSpacing: '0.34em' },
          T.eyebrow,
          1.8,
        )}
      >
        Te invito a mis
      </motion.p>

      {/* el número: el momento de la entrada */}
      <motion.h1
        className="font-display text-[5rem] leading-none font-bold"
        {...anim(
          { opacity: 0, scale: 1.9, filter: 'blur(26px)' },
          { opacity: 1, scale: 1, filter: 'blur(0px)' },
          T.numero,
          2.2,
        )}
      >
        <span className="text-magic">{edad}</span>
      </motion.h1>

      <motion.p
        className="mt-2 font-script text-2xl italic text-celeste-soft"
        {...anim({ opacity: 0, y: 16 }, { opacity: 1, y: 0 }, T.anios, 1.5)}
      >
        años
      </motion.p>

      {/* ornamento: los filetes se abren y la estrella gira al centro */}
      <div className="my-6 flex items-center justify-center gap-3 text-gold" aria-hidden>
        <motion.span
          className="h-px bg-gradient-to-r from-transparent to-gold/60"
          {...anim({ width: 0, opacity: 0 }, { width: 64, opacity: 1 }, T.ornamento, 1.4)}
        />
        <motion.svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          {...anim(
            { scale: 0, rotate: -140, opacity: 0 },
            { scale: 1, rotate: 0, opacity: 1 },
            T.ornamento + 0.25,
            1.5,
          )}
        >
          <path
            d="M12 2l2.2 6.4L21 9l-5.4 4.1L17.6 20 12 16.2 6.4 20l2-6.9L3 9l6.8-.6z"
            fill="currentColor"
          />
        </motion.svg>
        <motion.span
          className="h-px bg-gradient-to-l from-transparent to-gold/60"
          {...anim({ width: 0, opacity: 0 }, { width: 64, opacity: 1 }, T.ornamento, 1.4)}
        />
      </div>

      {/* nombre: letra por letra */}
      <h2 className="font-script text-4xl font-medium tracking-wide text-snow">
        <span className="sr-only">{nombre}</span>
        <span aria-hidden>
          {nombre.split('').map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block"
              {...anim(
                { opacity: 0, y: 24, filter: 'blur(8px)' },
                { opacity: 1, y: 0, filter: 'blur(0px)' },
                T.nombre + i * 0.08,
                1.4,
              )}
            >
              {ch === ' ' ? ' ' : ch}
            </motion.span>
          ))}
        </span>
      </h2>

      {/* calendario del evento */}
      <div className="mt-8">
        <EventCalendar fecha={fecha} delay={T.calendario} started={started} reduced={reduced} />
      </div>
    </header>
  )
}
