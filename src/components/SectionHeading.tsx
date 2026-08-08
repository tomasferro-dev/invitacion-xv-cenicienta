import type { ReactNode } from 'react'
import Reveal from './Reveal'

interface Props {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  center?: boolean
}

export default function SectionHeading({ eyebrow, title, subtitle, center = true }: Props) {
  return (
    <Reveal className={center ? 'text-center' : ''}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 className="font-display text-3xl font-semibold tracking-royal text-snow sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-xl font-script text-lg text-celeste-soft/80 sm:text-xl">
          {subtitle}
        </p>
      )}
    </Reveal>
  )
}
