import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { buildMonthGrid, WEEKDAY_LABELS } from '../lib/calendar'

interface Props {
  /** fecha del evento */
  fecha: Date
  /** delay de entrada (s) para encadenar con la secuencia del hero */
  delay?: number
  /** la secuencia arrancó (la página está visible) */
  started?: boolean
  /** el usuario pidió reducir animaciones */
  reduced?: boolean
}

const HIDDEN = { opacity: 0, y: 26, scale: 0.92, rotateX: 18 }
const SHOW = { opacity: 1, y: 0, scale: 1, rotateX: 0 }

/** Calendario del mes del evento, con el día destacado en los colores de la fiesta. */
export default function EventCalendar({
  fecha,
  delay = 0,
  started = true,
  reduced = false,
}: Props) {
  const grid = useMemo(
    () => buildMonthGrid(fecha.getFullYear(), fecha.getMonth()),
    [fecha],
  )
  const diaEvento = fecha.getDate()

  return (
    <motion.div
      initial={reduced ? false : HIDDEN}
      animate={reduced || started ? SHOW : HIDDEN}
      transition={reduced ? undefined : { delay, duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      className="card-royal mx-auto w-[248px] px-4 py-4"
      style={{ perspective: 800 }}
    >
      {/* encabezado: mes y año */}
      <div className="mb-3 text-center">
        <p className="font-display text-sm uppercase tracking-royal text-gold">
          {grid.monthName}
        </p>
        <p className="font-sans text-[0.65rem] tracking-eyebrow text-celeste-soft/60">
          {grid.year}
        </p>
      </div>

      {/* días de la semana */}
      <div className="mb-1.5 grid grid-cols-7 gap-0.5">
        {WEEKDAY_LABELS.map((d, i) => (
          <span
            key={i}
            className="text-center font-sans text-[0.6rem] font-medium uppercase text-celeste/50"
          >
            {d}
          </span>
        ))}
      </div>

      {/* grilla de días */}
      <div className="grid grid-cols-7 gap-0.5">
        {grid.weeks.flat().map((d, i) => {
          if (d === null) return <span key={i} className="h-7" />
          const esEvento = d === diaEvento
          return (
            <span
              key={i}
              className={`relative flex h-7 items-center justify-center rounded-full font-sans text-[0.7rem] tabular-nums ${
                esEvento ? 'font-semibold text-royal-deep' : 'text-celeste-soft/70'
              }`}
            >
              {esEvento && (
                <>
                  {/* halo pulsante detrás del día del evento */}
                  <motion.span
                    className="absolute inset-0 rounded-full bg-celeste"
                    initial={reduced ? false : { scale: 0 }}
                    animate={reduced || started ? { scale: 1 } : { scale: 0 }}
                    transition={
                      reduced
                        ? undefined
                        : { delay: delay + 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }
                    }
                  />
                  <motion.span
                    className="absolute inset-0 rounded-full bg-celeste/40 blur-md"
                    animate={
                      reduced || !started ? undefined : { opacity: [0.5, 1, 0.5], scale: [1, 1.35, 1] }
                    }
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: delay + 1.2 }}
                  />
                </>
              )}
              <span className="relative z-10">{d}</span>
            </span>
          )
        })}
      </div>

      {/* filete dorado inferior */}
      <div className="mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
    </motion.div>
  )
}
