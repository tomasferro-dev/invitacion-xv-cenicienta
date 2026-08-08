import type { ReactNode } from 'react'

interface SectionProps {
  id?: string
  children: ReactNode
  className?: string
}

/** Contenedor de sección: ancho máximo, padding vertical generoso. */
export default function Section({ id, children, className = '' }: SectionProps) {
  return (
    <section
      id={id}
      className={`relative mx-auto w-full max-w-content px-5 py-20 sm:px-8 sm:py-28 ${className}`}
    >
      {children}
    </section>
  )
}
