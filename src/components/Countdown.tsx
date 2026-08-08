import { useEffect, useState } from 'react'
import { invitation } from '../data/invitation'
import { calcularTiempoRestante, pad2, type TimeLeft } from '../lib/countdown'
import Section from './Section'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'

const objetivo = new Date(invitation.fechaISO)

function Unidad({ valor, label }: { valor: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="card-royal flex h-20 w-20 items-center justify-center sm:h-28 sm:w-28">
        <span className="font-display text-3xl font-semibold text-magic sm:text-5xl tabular-nums">
          {pad2(valor)}
        </span>
      </div>
      <span className="mt-3 font-sans text-[0.7rem] uppercase tracking-eyebrow text-celeste-soft/80 sm:text-xs">
        {label}
      </span>
    </div>
  )
}

export default function Countdown() {
  const [t, setT] = useState<TimeLeft>(() => calcularTiempoRestante(objetivo))

  useEffect(() => {
    const id = setInterval(() => setT(calcularTiempoRestante(objetivo)), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <Section id="countdown">
      <SectionHeading
        eyebrow="La cuenta regresiva"
        title="Falta muy poco para la magia"
        subtitle={t.finalizado ? '¡El gran día llegó!' : 'Cada segundo nos acerca al palacio.'}
      />
      <Reveal delay={120}>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Unidad valor={t.dias} label="Días" />
          <Unidad valor={t.horas} label="Horas" />
          <Unidad valor={t.minutos} label="Minutos" />
          <Unidad valor={t.segundos} label="Segundos" />
        </div>
      </Reveal>
    </Section>
  )
}
