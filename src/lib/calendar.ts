// Grilla de calendario mensual — lógica pura, sin DOM, testeable.
// La semana arranca en LUNES (convención local).

export const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const

export const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const

export interface MonthGrid {
  year: number
  /** 0-11 */
  month: number
  monthName: string
  /** semanas de 7 celdas; null = celda vacía (fuera del mes) */
  weeks: (number | null)[][]
}

/**
 * Construye la grilla del mes: semanas de 7 días empezando en lunes,
 * con `null` en las celdas que caen fuera del mes.
 */
export function buildMonthGrid(year: number, month: number): MonthGrid {
  const primero = new Date(year, month, 1)
  // getDay(): 0=domingo … 6=sábado → reindexado a lunes=0
  const offset = (primero.getDay() + 6) % 7
  const diasEnMes = new Date(year, month + 1, 0).getDate()

  const celdas: (number | null)[] = []
  for (let i = 0; i < offset; i++) celdas.push(null)
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d)
  while (celdas.length % 7 !== 0) celdas.push(null)

  const weeks: (number | null)[][] = []
  for (let i = 0; i < celdas.length; i += 7) weeks.push(celdas.slice(i, i + 7))

  return { year, month, monthName: MONTH_NAMES[month], weeks }
}
