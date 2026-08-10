import { describe, it, expect } from 'vitest'
import { buildMonthGrid, WEEKDAY_LABELS } from './calendar'

describe('buildMonthGrid', () => {
  it('arma la grilla de septiembre 2026 (empieza martes, 30 días)', () => {
    const g = buildMonthGrid(2026, 8)
    expect(g.monthName).toBe('Septiembre')
    expect(g.year).toBe(2026)
    // semana arranca lunes: el 1 (martes) va en la 2da celda
    expect(g.weeks[0]).toEqual([null, 1, 2, 3, 4, 5, 6])
    expect(g.weeks[1]).toEqual([7, 8, 9, 10, 11, 12, 13])
    // el 19 es sábado → índice 5
    expect(g.weeks[2][5]).toBe(19)
  })

  it('rellena con null hasta completar la última semana', () => {
    const g = buildMonthGrid(2026, 8)
    const last = g.weeks[g.weeks.length - 1]
    expect(last).toHaveLength(7)
    expect(last.filter((d) => d === 30)).toHaveLength(1)
    expect(last.slice(3)).toEqual([null, null, null, null])
  })

  it('todas las semanas tienen 7 celdas', () => {
    for (const m of [0, 1, 5, 11]) {
      const g = buildMonthGrid(2025, m)
      for (const w of g.weeks) expect(w).toHaveLength(7)
    }
  })

  it('incluye todos los días del mes exactamente una vez', () => {
    const g = buildMonthGrid(2026, 1) // febrero 2026: 28 días
    const dias = g.weeks.flat().filter((d): d is number => d !== null)
    expect(dias).toHaveLength(28)
    expect(new Set(dias).size).toBe(28)
    expect(Math.max(...dias)).toBe(28)
  })

  it('maneja febrero bisiesto (2024 = 29 días)', () => {
    const g = buildMonthGrid(2024, 1)
    const dias = g.weeks.flat().filter((d): d is number => d !== null)
    expect(dias).toHaveLength(29)
  })

  it('un mes que arranca lunes no lleva huecos al inicio', () => {
    // junio 2026 arranca lunes
    const g = buildMonthGrid(2026, 5)
    expect(g.weeks[0][0]).toBe(1)
  })
})

describe('WEEKDAY_LABELS', () => {
  it('arranca en lunes y tiene 7 etiquetas', () => {
    expect(WEEKDAY_LABELS).toHaveLength(7)
    expect(WEEKDAY_LABELS[0]).toBe('L')
    expect(WEEKDAY_LABELS[6]).toBe('D')
  })
})
