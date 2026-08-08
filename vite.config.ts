/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Mock del endpoint /api/rsvp SOLO en `npm run dev` (Vite no corre las
// funciones serverless de Vercel). Guarda en memoria para poder probar el
// flujo completo — RSVP + pop-up + confetti + /admin — sin desplegar.
// En producción manda api/rsvp.ts (Vercel), este plugin no se incluye.
function rsvpDevMock(): Plugin {
  interface Row {
    id: number
    nombre: string
    acompanantes: number
    asistira: boolean
    mensaje: string | null
    created_at: string
  }
  const rows: Row[] = []
  let id = 1

  return {
    name: 'rsvp-dev-mock',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/rsvp', (req, res) => {
        const send = (code: number, body: unknown) => {
          res.statusCode = code
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }

        if (req.method === 'POST') {
          let raw = ''
          req.on('data', (c) => (raw += c))
          req.on('end', () => {
            try {
              const b = JSON.parse(raw || '{}')
              rows.unshift({
                id: id++,
                nombre: String(b.nombre ?? ''),
                acompanantes: Number(b.acompanantes ?? 0),
                asistira: Boolean(b.asistira),
                mensaje: b.mensaje ?? null,
                created_at: new Date().toISOString(),
              })
              send(201, { ok: true })
            } catch {
              send(400, { error: 'json inválido' })
            }
          })
          return
        }

        if (req.method === 'GET') {
          const confirmados = rows.filter((r) => r.asistira)
          send(200, {
            rows,
            resumen: {
              respuestas: rows.length,
              confirmados: confirmados.length,
              rechazados: rows.length - confirmados.length,
              totalPersonas: confirmados.reduce((a, r) => a + r.acompanantes, 0),
            },
          })
          return
        }

        send(405, { error: 'método no permitido' })
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), rsvpDevMock()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
