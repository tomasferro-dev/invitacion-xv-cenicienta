// Validación y envío del RSVP. La validación es pura y testeable;
// enviarRsvp() hace el fetch al endpoint serverless.

export interface RsvpInput {
  nombre: string
  acompanantes: number
  asistira: boolean
  mensaje?: string
}

export interface ValidationResult {
  ok: boolean
  errores: Partial<Record<'nombre' | 'acompanantes', string>>
}

/** Valida los datos del formulario de confirmación (pura, sin efectos). */
export function validarRsvp(input: Partial<RsvpInput>): ValidationResult {
  const errores: ValidationResult['errores'] = {}

  const nombre = (input.nombre ?? '').trim()
  if (nombre.length < 2) {
    errores.nombre = 'Ingresá tu nombre y apellido.'
  } else if (nombre.length > 80) {
    errores.nombre = 'El nombre es demasiado largo.'
  }

  const acomp = input.acompanantes
  if (acomp == null || Number.isNaN(acomp)) {
    errores.acompanantes = 'Indicá cuántas personas van (0 si vas solo/a).'
  } else if (!Number.isInteger(acomp) || acomp < 0) {
    errores.acompanantes = 'La cantidad debe ser un número entero de 0 o más.'
  } else if (acomp > 20) {
    errores.acompanantes = '¿Tantos? Contactanos para grupos grandes.'
  }

  return { ok: Object.keys(errores).length === 0, errores }
}

/** Normaliza el input a lo que espera el backend. */
export function normalizarRsvp(input: RsvpInput): RsvpInput {
  return {
    nombre: input.nombre.trim(),
    acompanantes: Math.max(0, Math.floor(input.acompanantes)),
    asistira: Boolean(input.asistira),
    mensaje: input.mensaje?.trim() || undefined,
  }
}

export interface SendResult {
  ok: boolean
  error?: string
}

/** Envía la confirmación al endpoint serverless. */
export async function enviarRsvp(input: RsvpInput): Promise<SendResult> {
  const val = validarRsvp(input)
  if (!val.ok) {
    return { ok: false, error: 'Revisá los datos del formulario.' }
  }

  try {
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalizarRsvp(input)),
    })
    if (!res.ok) {
      return { ok: false, error: `El servidor respondió ${res.status}.` }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'No se pudo conectar. Revisá tu conexión.' }
  }
}
