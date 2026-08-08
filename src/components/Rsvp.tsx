import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { enviarRsvp, validarRsvp, type RsvpInput } from '../lib/rsvp'
import { magicBurst } from '../lib/magic'
import Section from './Section'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'

type Estado = 'idle' | 'enviando' | 'ok' | 'error'

export default function Rsvp() {
  const [nombre, setNombre] = useState('')
  const [acompanantes, setAcompanantes] = useState('0')
  const [asistira, setAsistira] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [estado, setEstado] = useState<Estado>('idle')
  const [errores, setErrores] = useState<ReturnType<typeof validarRsvp>['errores']>({})
  const [errorMsg, setErrorMsg] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const input: RsvpInput = {
      nombre,
      acompanantes: parseInt(acompanantes, 10),
      asistira,
      mensaje,
    }

    const val = validarRsvp(input)
    setErrores(val.errores)
    if (!val.ok) return

    setEstado('enviando')
    const res = await enviarRsvp(input)
    if (res.ok) {
      setEstado('ok')
      magicBurst()
    } else {
      setEstado('error')
      setErrorMsg(res.error ?? 'Algo salió mal.')
    }
  }

  function reset() {
    setEstado('idle')
    setNombre('')
    setAcompanantes('0')
    setAsistira(true)
    setMensaje('')
    setErrores({})
  }

  return (
    <Section id="rsvp">
      <SectionHeading
        eyebrow="Confirmación"
        title="Confirmá tu asistencia"
        subtitle="Ayudanos a preparar todo para recibirte como se merece."
      />

      <Reveal delay={120}>
        <form onSubmit={onSubmit} className="card-royal mx-auto mt-12 max-w-md space-y-5 p-8">
          <div>
            <label className="mb-1.5 block font-sans text-xs uppercase tracking-eyebrow text-celeste-soft/80">
              Nombre y apellido
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-xl border border-celeste/20 bg-royal-deep/60 px-4 py-3 font-sans text-snow placeholder:text-celeste-soft/40 outline-none focus:border-celeste/60"
            />
            {errores.nombre && (
              <p className="mt-1.5 text-sm text-rose-300">{errores.nombre}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block font-sans text-xs uppercase tracking-eyebrow text-celeste-soft/80">
              ¿Cuántos van? (incluyéndote)
            </label>
            <input
              type="number"
              min={0}
              max={20}
              value={acompanantes}
              onChange={(e) => setAcompanantes(e.target.value)}
              className="w-full rounded-xl border border-celeste/20 bg-royal-deep/60 px-4 py-3 font-sans text-snow outline-none focus:border-celeste/60"
            />
            {errores.acompanantes && (
              <p className="mt-1.5 text-sm text-rose-300">{errores.acompanantes}</p>
            )}
          </div>

          <div className="flex gap-3">
            {[
              { v: true, label: '¡Ahí estaré! ✨' },
              { v: false, label: 'No podré ir' },
            ].map((opt) => (
              <button
                key={String(opt.v)}
                type="button"
                onClick={() => setAsistira(opt.v)}
                className={`flex-1 rounded-xl border px-3 py-3 font-sans text-sm transition ${
                  asistira === opt.v
                    ? 'border-celeste bg-celeste/15 text-snow'
                    : 'border-celeste/15 bg-royal-deep/40 text-celeste-soft/60 hover:border-celeste/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div>
            <label className="mb-1.5 block font-sans text-xs uppercase tracking-eyebrow text-celeste-soft/80">
              Dejale un mensaje (opcional)
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={3}
              placeholder="Un saludo mágico…"
              className="w-full resize-none rounded-xl border border-celeste/20 bg-royal-deep/60 px-4 py-3 font-sans text-snow placeholder:text-celeste-soft/40 outline-none focus:border-celeste/60"
            />
          </div>

          <button
            type="submit"
            disabled={estado === 'enviando'}
            className="btn-royal w-full disabled:opacity-60"
          >
            {estado === 'enviando' ? 'Enviando magia…' : 'Confirmar'}
          </button>
        </form>
      </Reveal>

      {/* Pop-up mágico de confirmación */}
      <AnimatePresence>
        {(estado === 'ok' || estado === 'error') && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-royal-deep/85 p-5 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={reset}
          >
            <motion.div
              className="card-royal relative w-full max-w-sm p-8 text-center"
              initial={{ scale: 0.85, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              {estado === 'ok' ? (
                <>
                  <motion.div
                    className="mx-auto mb-4 text-5xl"
                    initial={{ rotate: -20, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                  >
                    {asistira ? '👑' : '💌'}
                  </motion.div>
                  <h3 className="font-display text-2xl tracking-royal text-magic">
                    {asistira ? '¡Confirmado!' : '¡Gracias por avisar!'}
                  </h3>
                  <p className="mt-3 font-script text-lg text-celeste-soft/85">
                    {asistira
                      ? `Nos vemos en el palacio, ${nombre.split(' ')[0]}. Guardá la fecha ✨`
                      : 'Te vamos a extrañar. ¡Gracias por tomarte el tiempo de responder!'}
                  </p>
                  <button onClick={reset} className="btn-royal mt-7" type="button">
                    Cerrar
                  </button>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-4 text-5xl">🌙</div>
                  <h3 className="font-display text-xl tracking-royal text-snow">Uy, algo falló</h3>
                  <p className="mt-3 font-script text-lg text-celeste-soft/85">{errorMsg}</p>
                  <button
                    onClick={() => setEstado('idle')}
                    className="btn-royal mt-7"
                    type="button"
                  >
                    Reintentar
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  )
}
