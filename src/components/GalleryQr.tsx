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
        title="Sumá tu magia a la galería"
        subtitle="Sacaste una foto en la fiesta? Escaneá el código y subila a la carpeta compartida."
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
          <p className="font-script text-lg text-celeste-soft/85">
            Apuntá la cámara de tu celular al código.
          </p>
          <a href={driveUrl} target="_blank" rel="noopener noreferrer" className="btn-royal">
            Abrir carpeta
          </a>
        </div>
      </Reveal>
    </Section>
  )
}
