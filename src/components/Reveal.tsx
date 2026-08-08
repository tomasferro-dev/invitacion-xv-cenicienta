import type { ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'

interface RevealProps {
  children: ReactNode
  /** retardo en ms para escalonar apariciones */
  delay?: number
  className?: string
}

/** Envuelve contenido con un fade-up on-scroll (una sola vez). */
export default function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const { ref, inView } = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
