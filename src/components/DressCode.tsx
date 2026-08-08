import { invitation } from '../data/invitation'
import Section from './Section'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'

function Hanger() {
  return (
    <svg width="46" height="46" viewBox="0 0 24 24" className="text-celeste" aria-hidden>
      <path
        d="M12 3a2 2 0 00-1 3.7c.6.35 1 .87 1 1.3M12 8L3.5 14.5a1.2 1.2 0 00.7 2.2h15.6a1.2 1.2 0 00.7-2.2L12 8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function DressCode() {
  const { vestimenta } = invitation
  return (
    <Section id="vestimenta">
      <SectionHeading eyebrow="Vestimenta" title="Etiqueta de palacio" />

      <Reveal delay={120}>
        <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-celeste/25 bg-royal-soft/50">
            <Hanger />
          </div>
          <p className="font-display text-2xl tracking-royal text-snow">{vestimenta.codigo}</p>
          <p className="font-script text-lg text-celeste-soft/80">{vestimenta.nota}</p>
        </div>
      </Reveal>

      {vestimenta.paleta.length > 0 && (
        <Reveal delay={220}>
          <div className="card-royal mx-auto mt-10 max-w-md p-6 text-center">
            <p className="font-sans text-xs uppercase tracking-eyebrow text-gold">
              Paleta sugerida
            </p>
            <p className="mt-3 font-script text-lg text-snow/85">
              Vestite en la gama de la noche:
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-5">
              {vestimenta.paleta.map((c) => (
                <div key={c.hex} className="flex flex-col items-center gap-2">
                  <span
                    className="inline-block h-11 w-11 rounded-full ring-2 ring-white/30 shadow-lg"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="font-sans text-sm text-celeste-soft/90">{c.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {vestimenta.prohibidos.length > 0 && (
        <Reveal delay={300}>
          <div className="card-royal mx-auto mt-6 max-w-md p-6 text-center">
            <p className="font-sans text-xs uppercase tracking-eyebrow text-gold">
              Color reservado para la cumpleañera
            </p>
            <p className="mt-3 font-script text-lg text-snow/85">
              Por favor, evitá vestir de estos colores:
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
              {vestimenta.prohibidos.map((c) => (
                <div key={c.hex} className="flex items-center gap-2">
                  <span
                    className="relative inline-block h-9 w-9 rounded-full ring-2 ring-white/30"
                    style={{ backgroundColor: c.hex }}
                  >
                    {/* barra de "prohibido" */}
                    <span className="absolute left-1/2 top-1/2 h-[2px] w-11 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded bg-rose-400/90" />
                  </span>
                  <span className="font-sans text-sm text-celeste-soft/90">{c.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </Section>
  )
}
