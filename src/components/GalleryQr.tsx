import { QRCodeSVG } from 'qrcode.react'
import { invitation } from '../data/invitation'
import Section from './Section'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'

export default function GalleryQr() {
  const { driveUrl } = invitation.galeria

  return (
    <Section id="qr">
      <SectionHeading
        eyebrow="Tus fotos"
        title="Sumá tu magia a los recuerdos"
        subtitle="¿Sacaste fotos en la fiesta? Escaneá el código y compartilas con Uma."
      />

      <Reveal delay={120}>
        <div className="card-royal mx-auto mt-12 flex max-w-md flex-col items-center gap-6 p-8 text-center">
          <div className="rounded-2xl bg-snow p-4 shadow-lg">
            <QRCodeSVG
              value={driveUrl}
              size={196}
              level="M"
              bgColor="#FFFFFF"
              fgColor="#0B1026"
              marginSize={1}
            />
          </div>
          <ol className="space-y-1 font-script text-lg text-celeste-soft/85">
            <li>1 · Apuntá la cámara de tu celular al código.</li>
            <li>2 · Iniciá sesión con tu cuenta de Google.</li>
            <li>3 · Elegí tus fotos y ¡listo! ✨</li>
          </ol>
          <a href={driveUrl} target="_blank" rel="noopener noreferrer" className="btn-royal">
            Subir mis fotos
          </a>
          <p className="font-sans text-xs text-celeste-soft/55">
            Tus fotos llegan directo y en privado a la familia.
          </p>
        </div>
      </Reveal>
    </Section>
  )
}
