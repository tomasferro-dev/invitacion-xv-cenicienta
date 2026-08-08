import { useEffect, useState } from 'react'
import { invitation } from '../data/invitation'
import Section from './Section'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'

/** Placeholder decorativo cuando la foto real todavía no fue subida a /public/gallery. */
function markPlaceholder(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget
  img.style.visibility = 'hidden'
  img.parentElement?.classList.add('is-placeholder')
}

export default function Gallery() {
  const { fotos } = invitation.galeria
  const [abierta, setAbierta] = useState<number | null>(null)

  // cerrar lightbox con Escape + bloquear scroll del body
  useEffect(() => {
    if (abierta === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierta(null)
      if (e.key === 'ArrowRight') setAbierta((i) => (i === null ? i : (i + 1) % fotos.length))
      if (e.key === 'ArrowLeft')
        setAbierta((i) => (i === null ? i : (i - 1 + fotos.length) % fotos.length))
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [abierta, fotos.length])

  return (
    <Section id="galeria">
      <SectionHeading
        eyebrow="Galería"
        title="Momentos de cuento"
        subtitle="Un vistazo antes de la gran noche."
      />

      <Reveal delay={120}>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {fotos.map((f, i) => (
            <button
              key={f.src}
              type="button"
              onClick={() => setAbierta(i)}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-celeste/15 bg-royal-soft/50 [&.is-placeholder]:grid [&.is-placeholder]:place-items-center"
            >
              <img
                src={f.src}
                alt={f.alt}
                loading="lazy"
                onError={markPlaceholder}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* estrella decorativa que aparece si no hay imagen */}
              <span className="pointer-events-none absolute inset-0 hidden place-items-center text-gold/40 [.is-placeholder_&]:grid">
                <svg width="34" height="34" viewBox="0 0 24 24" className="animate-twinkle">
                  <path
                    d="M12 2l2.2 6.4L21 9l-5.4 4.1L17.6 20 12 16.2 6.4 20l2-6.9L3 9l6.8-.6z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-royal-deep/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </Reveal>

      {/* Lightbox */}
      {abierta !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-royal-deep/90 p-4 backdrop-blur-sm animate-fade-up"
          onClick={() => setAbierta(null)}
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute right-5 top-5 text-3xl text-celeste-soft hover:text-snow"
          >
            ×
          </button>
          <img
            src={fotos[abierta].src}
            alt={fotos[abierta].alt}
            onError={markPlaceholder}
            className="max-h-[85vh] max-w-full rounded-2xl border border-celeste/20 object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </Section>
  )
}
