import { Suspense, lazy } from 'react'
import MagicBackground from '../components/MagicBackground'
import Hero from '../components/Hero'
import Countdown from '../components/Countdown'
import Invitation from '../components/Invitation'
import LocationMap from '../components/LocationMap'
import Rsvp from '../components/Rsvp'
import DressCode from '../components/DressCode'
import GalleryQr from '../components/GalleryQr'
import GiftAlias from '../components/GiftAlias'
import Gallery from '../components/Gallery'
import Footer from '../components/Footer'

// Three.js va en su propio chunk (lazy) para no penalizar la carga inicial.
const CastleBackground = lazy(() => import('../components/CastleBackground'))

/**
 * Invitación en COLUMNA tipo mobile, centrada también en tablet/desktop.
 *
 * El castillo está pensado para una columna vertical (la imagen es 9:16): a
 * pantalla completa en desktop se recorta feo y se ve ampliado. Por eso la
 * invitación entera vive en una columna de ancho fijo centrada, el castillo se
 * limita a ESE ancho, y los laterales quedan cubiertos por el fondo ambiente
 * (gradiente noche + nieve/polvo mágico a pantalla completa).
 */
export default function Home() {
  return (
    <>
      {/* fondo ambiente: llena toda la pantalla en tablet/desktop */}
      <div
        className="pointer-events-none fixed inset-0 -z-30"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 60%, #16244A 0%, #0B1026 45%, #05070F 100%)',
        }}
        aria-hidden
      />

      {/* castillo: fijo verticalmente, pero limitado al ancho de la columna */}
      <Suspense fallback={null}>
        <div className="pointer-events-none fixed inset-y-0 left-1/2 -z-20 w-full max-w-column -translate-x-1/2">
          <CastleBackground />
        </div>
      </Suspense>

      {/* nieve + polvo mágico: a pantalla completa, para que los laterales
          en desktop también tengan vida */}
      <MagicBackground intensity={0.6} />

      {/* columna de la invitación */}
      <main className="relative mx-auto w-full max-w-column">
        <Hero />

        {/* scrim: velo que atenúa el castillo detrás de los módulos para que el
            texto quede siempre legible */}
        <div className="relative bg-gradient-to-b from-royal-deep/45 via-royal-deep/75 to-royal-deep/85">
          <Countdown />
          <Invitation />
          <LocationMap />
          <Rsvp />
          <DressCode />
          <GalleryQr />
          <GiftAlias />
          <Gallery />
          <Footer />
        </div>
      </main>
    </>
  )
}
