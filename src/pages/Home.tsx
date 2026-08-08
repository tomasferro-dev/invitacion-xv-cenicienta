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

/** Invitación de una sola página: todos los módulos en scroll. */
export default function Home() {
  return (
    <>
      <MagicBackground />
      <main className="relative">
        <Hero />
        <Countdown />
        <Invitation />
        <LocationMap />
        <Rsvp />
        <DressCode />
        <GalleryQr />
        <GiftAlias />
        <Gallery />
        <Footer />
      </main>
    </>
  )
}
