import { invitation } from '../data/invitation'
import Ornament from './Ornament'

/** Corona / tiara decorativa. */
function Crown() {
  return (
    <svg
      width="86"
      height="52"
      viewBox="0 0 86 52"
      className="mx-auto mb-6 animate-float text-gold drop-shadow-[0_0_18px_rgba(231,211,161,0.5)]"
      aria-hidden
    >
      <path
        d="M8 44h70l-4-30-17 14L43 6 29 28 12 14z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="43" cy="6" r="3.4" fill="#BBD3FF" />
      <circle cx="12" cy="14" r="2.6" fill="#BBD3FF" />
      <circle cx="74" cy="14" r="2.6" fill="#BBD3FF" />
      <rect x="8" y="44" width="70" height="4" rx="2" fill="currentColor" />
    </svg>
  )
}

export default function Hero() {
  const { nombre, edad, fechaTexto, horaTexto, ubicacion } = invitation

  return (
    <header className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 text-center">
      {/* halo suave detrás del título */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-[1] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[90px]"
        style={{ background: 'radial-gradient(circle, rgba(169,194,240,0.35), transparent 70%)' }}
        aria-hidden
      />

      <div className="animate-fade-up">
        <Crown />
        <p className="eyebrow mb-5">Te invito a mis</p>
        <h1 className="font-display text-[5.5rem] leading-none font-bold sm:text-[9rem]">
          <span className="text-magic">{edad}</span>
        </h1>
        <p className="mt-2 font-script text-2xl italic text-celeste-soft sm:text-3xl">años</p>

        <div className="my-8">
          <Ornament />
        </div>

        <h2 className="font-script text-4xl font-medium tracking-wide text-snow sm:text-6xl">
          {nombre}
        </h2>

        <div className="mt-8 space-y-1 font-sans text-sm tracking-royal text-celeste-soft/90 sm:text-base">
          <p className="uppercase">{fechaTexto}</p>
          <p className="uppercase">{horaTexto} · {ubicacion.lugar}</p>
        </div>
      </div>

      {/* indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float" aria-hidden>
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-celeste/40 p-1.5">
          <span className="h-2 w-1 rounded-full bg-celeste/80" />
        </div>
      </div>
    </header>
  )
}
