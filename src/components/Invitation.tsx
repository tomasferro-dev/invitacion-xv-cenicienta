import { invitation } from '../data/invitation'
import Section from './Section'
import Reveal from './Reveal'
import Ornament from './Ornament'

export default function Invitation() {
  const { invitacion, nombre } = invitation
  return (
    <Section id="invitacion" className="max-w-3xl">
      <Reveal className="text-center">
        <p className="eyebrow mb-6">{invitacion.eyebrow}</p>
        <Ornament className="mb-8" />
        <p className="font-script text-2xl leading-relaxed text-snow/90 sm:text-[1.7rem] sm:leading-relaxed">
          {invitacion.texto}
        </p>
        <p className="mt-10 font-display text-xl tracking-royal text-celeste-soft sm:text-2xl">
          Con amor, {nombre}
        </p>
        <Ornament className="mt-8" />
      </Reveal>
    </Section>
  )
}
