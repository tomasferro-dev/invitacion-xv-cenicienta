// Lógica pura del temporizador — sin dependencias del DOM, 100% testeable.

export interface TimeLeft {
  dias: number
  horas: number
  minutos: number
  segundos: number
  /** true cuando la fecha objetivo ya pasó */
  finalizado: boolean
}

/**
 * Calcula el tiempo restante entre `ahora` y `objetivo`.
 * Si `objetivo` ya pasó, devuelve todo en cero con `finalizado: true`.
 *
 * @param objetivo  fecha del evento
 * @param ahora     momento actual (inyectable para tests; default = Date.now())
 */
export function calcularTiempoRestante(
  objetivo: Date,
  ahora: Date = new Date(),
): TimeLeft {
  const diffMs = objetivo.getTime() - ahora.getTime()

  if (diffMs <= 0 || Number.isNaN(diffMs)) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, finalizado: true }
  }

  const totalSegundos = Math.floor(diffMs / 1000)
  const dias = Math.floor(totalSegundos / 86400)
  const horas = Math.floor((totalSegundos % 86400) / 3600)
  const minutos = Math.floor((totalSegundos % 3600) / 60)
  const segundos = totalSegundos % 60

  return { dias, horas, minutos, segundos, finalizado: false }
}

/** Pad a 2 dígitos: 7 → "07" */
export function pad2(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0')
}
