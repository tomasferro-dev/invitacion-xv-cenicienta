import { sql } from '@vercel/postgres'

let ensured = false

/**
 * Crea la tabla `rsvp` si no existe. Idempotente; se llama al inicio de cada
 * request (barato: sólo la primera vez ejecuta el CREATE real).
 */
export async function ensureTable(): Promise<void> {
  if (ensured) return
  await sql`
    CREATE TABLE IF NOT EXISTS rsvp (
      id           SERIAL PRIMARY KEY,
      nombre       TEXT NOT NULL,
      acompanantes INTEGER NOT NULL DEFAULT 0,
      asistira     BOOLEAN NOT NULL DEFAULT true,
      mensaje      TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `
  ensured = true
}

export { sql }
