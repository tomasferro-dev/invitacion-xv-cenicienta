import { describe, it, expect } from 'vitest'
import { calcularTiempoRestante, pad2 } from './countdown'

describe('calcularTiempoRestante', () => {
  it('calcula días/horas/minutos/segundos exactos', () => {
    const ahora = new Date('2025-01-01T00:00:00')
    // +2d 3h 4m 5s
    const objetivo = new Date('2025-01-03T03:04:05')
    const t = calcularTiempoRestante(objetivo, ahora)
    expect(t).toEqual({ dias: 2, horas: 3, minutos: 4, segundos: 5, finalizado: false })
  })

  it('marca finalizado cuando la fecha ya pasó', () => {
    const ahora = new Date('2025-01-02T00:00:00')
    const objetivo = new Date('2025-01-01T00:00:00')
    const t = calcularTiempoRestante(objetivo, ahora)
    expect(t.finalizado).toBe(true)
    expect(t).toMatchObject({ dias: 0, horas: 0, minutos: 0, segundos: 0 })
  })

  it('trata exactamente la misma hora como finalizado (diff 0)', () => {
    const d = new Date('2025-06-15T21:00:00')
    expect(calcularTiempoRestante(d, d).finalizado).toBe(true)
  })

  it('cuenta correctamente el último segundo', () => {
    const ahora = new Date('2025-01-01T00:00:00')
    const objetivo = new Date('2025-01-01T00:00:01')
    const t = calcularTiempoRestante(objetivo, ahora)
    expect(t).toMatchObject({ dias: 0, horas: 0, minutos: 0, segundos: 1, finalizado: false })
  })

  it('devuelve finalizado con fecha inválida (NaN)', () => {
    const t = calcularTiempoRestante(new Date('no-existe'), new Date('2025-01-01T00:00:00'))
    expect(t.finalizado).toBe(true)
  })
})

describe('pad2', () => {
  it('rellena a 2 dígitos', () => {
    expect(pad2(0)).toBe('00')
    expect(pad2(7)).toBe('07')
    expect(pad2(15)).toBe('15')
  })
  it('nunca devuelve negativos', () => {
    expect(pad2(-3)).toBe('00')
  })
})
