import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

interface Row {
  id: number
  nombre: string
  acompanantes: number
  asistira: boolean
  mensaje: string | null
  created_at: string
}
interface Resumen {
  respuestas: number
  confirmados: number
  rechazados: number
  totalPersonas: number
}
interface Data {
  rows: Row[]
  resumen: Resumen
}

const POLL_MS = 8000

export default function Admin() {
  const [params] = useSearchParams()
  const key = params.get('key') ?? ''
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState('')
  const [ultima, setUltima] = useState<Date | null>(null)

  useEffect(() => {
    if (!key) {
      setError('Falta la clave. Abrí esta página como /admin?key=TU_CLAVE')
      return
    }
    let vivo = true

    async function cargar() {
      try {
        const res = await fetch(`/api/rsvp?key=${encodeURIComponent(key)}`)
        if (!res.ok) {
          if (res.status === 401) throw new Error('Clave incorrecta.')
          throw new Error(`El servidor respondió ${res.status}.`)
        }
        const json = (await res.json()) as Data
        if (!vivo) return
        setData(json)
        setError('')
        setUltima(new Date())
      } catch (e) {
        if (vivo) setError(e instanceof Error ? e.message : 'Error al cargar.')
      }
    }

    cargar()
    const id = setInterval(cargar, POLL_MS)
    return () => {
      vivo = false
      clearInterval(id)
    }
  }, [key])

  return (
    <div className="min-h-screen bg-royal-deep px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-2xl tracking-royal text-magic">Confirmaciones · Mis 15</h1>
        <p className="mt-1 font-sans text-sm text-celeste-soft/60">
          Se actualiza sola cada 8 segundos.
          {ultima && ` Última: ${ultima.toLocaleTimeString('es-AR')}`}
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-rose-400/40 bg-rose-500/10 p-4 text-rose-200">
            {error}
          </div>
        )}

        {data && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Respuestas', v: data.resumen.respuestas },
                { label: 'Confirmados', v: data.resumen.confirmados },
                { label: 'No asisten', v: data.resumen.rechazados },
                { label: 'Total personas', v: data.resumen.totalPersonas },
              ].map((s) => (
                <div key={s.label} className="card-royal p-4 text-center">
                  <p className="font-display text-3xl text-magic tabular-nums">{s.v}</p>
                  <p className="mt-1 font-sans text-xs uppercase tracking-eyebrow text-celeste-soft/70">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 overflow-x-auto rounded-2xl border border-celeste/15">
              <table className="w-full text-left font-sans text-sm">
                <thead className="bg-royal-soft/60 text-celeste-soft/80">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Personas</th>
                    <th className="px-4 py-3">Asiste</th>
                    <th className="px-4 py-3">Mensaje</th>
                    <th className="px-4 py-3">Cuándo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.id} className="border-t border-celeste/10 text-snow/90">
                      <td className="px-4 py-3">{r.nombre}</td>
                      <td className="px-4 py-3 tabular-nums">{r.acompanantes}</td>
                      <td className="px-4 py-3">
                        <span className={r.asistira ? 'text-celeste' : 'text-rose-300'}>
                          {r.asistira ? 'Sí ✨' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-celeste-soft/70">{r.mensaje ?? '—'}</td>
                      <td className="px-4 py-3 text-celeste-soft/50">
                        {new Date(r.created_at).toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                  {data.rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-celeste-soft/50">
                        Todavía no hay confirmaciones.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
