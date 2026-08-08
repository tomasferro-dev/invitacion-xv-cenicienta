import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ensureTable, sql } from './_db.js'

interface Body {
  nombre?: unknown
  acompanantes?: unknown
  asistira?: unknown
  mensaje?: unknown
}

/**
 * /api/rsvp
 *   POST  → guarda una confirmación. Body JSON: { nombre, acompanantes, asistira, mensaje? }
 *   GET   → lista las confirmaciones. Requiere ?key=ADMIN_KEY (para /admin).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureTable()

    if (req.method === 'POST') {
      const b = (req.body ?? {}) as Body

      const nombre = typeof b.nombre === 'string' ? b.nombre.trim() : ''
      const acompanantes = Number(b.acompanantes)
      const asistira = Boolean(b.asistira)
      const mensaje =
        typeof b.mensaje === 'string' && b.mensaje.trim() ? b.mensaje.trim().slice(0, 500) : null

      // validación de servidor (defensa en profundidad)
      if (nombre.length < 2 || nombre.length > 80) {
        return res.status(400).json({ error: 'nombre inválido' })
      }
      if (!Number.isInteger(acompanantes) || acompanantes < 0 || acompanantes > 20) {
        return res.status(400).json({ error: 'acompanantes inválido' })
      }

      await sql`
        INSERT INTO rsvp (nombre, acompanantes, asistira, mensaje)
        VALUES (${nombre}, ${acompanantes}, ${asistira}, ${mensaje});
      `
      return res.status(201).json({ ok: true })
    }

    if (req.method === 'GET') {
      const key = req.query.key
      if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'no autorizado' })
      }

      const { rows } = await sql`
        SELECT id, nombre, acompanantes, asistira, mensaje, created_at
        FROM rsvp
        ORDER BY created_at DESC;
      `
      const confirmados = rows.filter((r) => r.asistira)
      const totalPersonas = confirmados.reduce(
        (acc, r) => acc + (Number(r.acompanantes) || 0),
        0,
      )
      return res.status(200).json({
        rows,
        resumen: {
          respuestas: rows.length,
          confirmados: confirmados.length,
          rechazados: rows.length - confirmados.length,
          totalPersonas,
        },
      })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'método no permitido' })
  } catch (err) {
    console.error('[rsvp] error', err)
    return res.status(500).json({ error: 'error del servidor' })
  }
}
