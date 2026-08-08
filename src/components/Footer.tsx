import { invitation } from '../data/invitation'
import Ornament from './Ornament'

export default function Footer() {
  const { nombre, fechaTexto } = invitation
  return (
    <footer className="relative px-5 py-16 text-center">
      <Ornament className="mb-6" />
      <p className="font-script text-3xl text-magic">¡Te espero!</p>
      <p className="mt-2 font-display text-lg tracking-royal text-celeste-soft">{nombre}</p>
      <p className="mt-1 font-sans text-xs uppercase tracking-eyebrow text-celeste-soft/50">
        {fechaTexto}
      </p>
      <p className="mt-8 font-sans text-[0.7rem] text-celeste-soft/30">
        Hecho con magia ✨
      </p>
    </footer>
  )
}
