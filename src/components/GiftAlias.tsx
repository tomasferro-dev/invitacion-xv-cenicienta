import { useState } from 'react'
import { invitation } from '../data/invitation'
import Section from './Section'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'

export default function GiftAlias() {
  const { regalo } = invitation
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(regalo.alias)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* clipboard no disponible — ignorar */
    }
  }

  return (
    <Section id="regalo">
      <SectionHeading eyebrow="Regalos" title="Un detalle con magia" />

      <Reveal delay={120}>
        <div className="card-royal mx-auto mt-12 max-w-md p-8 text-center">
          <p className="font-script text-lg text-celeste-soft/85">{regalo.nota}</p>

          <div className="mt-6 rounded-xl border border-celeste/20 bg-royal-deep/60 p-4">
            <p className="font-sans text-[0.7rem] uppercase tracking-eyebrow text-gold">Alias</p>
            <p className="mt-1 select-all font-display text-xl tracking-royal text-snow break-all">
              {regalo.alias}
            </p>
          </div>

          <button onClick={copiar} className="btn-royal mt-6" type="button">
            {copiado ? '¡Copiado! ✨' : 'Copiar alias'}
          </button>

          <p className="mt-4 font-sans text-xs text-celeste-soft/60">
            A nombre de {regalo.titular}
          </p>
        </div>
      </Reveal>
    </Section>
  )
}
