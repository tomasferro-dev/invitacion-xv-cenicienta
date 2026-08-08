import { describe, it, expect } from 'vitest'
import { validarRsvp, normalizarRsvp } from './rsvp'

describe('validarRsvp', () => {
  it('acepta un input válido', () => {
    const r = validarRsvp({ nombre: 'Ana Pérez', acompanantes: 2, asistira: true })
    expect(r.ok).toBe(true)
    expect(r.errores).toEqual({})
  })

  it('rechaza nombre demasiado corto', () => {
    const r = validarRsvp({ nombre: 'A', acompanantes: 0 })
    expect(r.ok).toBe(false)
    expect(r.errores.nombre).toBeDefined()
  })

  it('rechaza nombre vacío / solo espacios', () => {
    expect(validarRsvp({ nombre: '   ', acompanantes: 0 }).ok).toBe(false)
  })

  it('rechaza acompanantes negativos o no enteros', () => {
    expect(validarRsvp({ nombre: 'Ana', acompanantes: -1 }).ok).toBe(false)
    expect(validarRsvp({ nombre: 'Ana', acompanantes: 2.5 }).ok).toBe(false)
  })

  it('rechaza acompanantes faltante (NaN)', () => {
    const r = validarRsvp({ nombre: 'Ana', acompanantes: NaN })
    expect(r.ok).toBe(false)
    expect(r.errores.acompanantes).toBeDefined()
  })

  it('rechaza grupos exageradamente grandes', () => {
    expect(validarRsvp({ nombre: 'Ana', acompanantes: 21 }).ok).toBe(false)
  })

  it('acepta 0 acompañantes (va solo/a)', () => {
    expect(validarRsvp({ nombre: 'Ana', acompanantes: 0 }).ok).toBe(true)
  })
})

describe('normalizarRsvp', () => {
  it('recorta el nombre y piso de acompañantes en 0', () => {
    const n = normalizarRsvp({ nombre: '  Ana  ', acompanantes: 3, asistira: true })
    expect(n.nombre).toBe('Ana')
    expect(n.acompanantes).toBe(3)
  })

  it('convierte mensaje vacío en undefined', () => {
    const n = normalizarRsvp({ nombre: 'Ana', acompanantes: 0, asistira: false, mensaje: '   ' })
    expect(n.mensaje).toBeUndefined()
  })

  it('trunca decimales de acompañantes', () => {
    const n = normalizarRsvp({ nombre: 'Ana', acompanantes: 2.9, asistira: true })
    expect(n.acompanantes).toBe(2)
  })
})
