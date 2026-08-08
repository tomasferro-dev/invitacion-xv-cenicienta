import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { invitation } from '../data/invitation'
import Section from './Section'
import SectionHeading from './SectionHeading'
import Reveal from './Reveal'

const { lat, lng, lugar, direccion } = invitation.ubicacion

// Link a Google Maps (direcciones hacia el evento)
const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

// Pin custom (evita los assets rotos del ícono default de Leaflet bajo bundlers)
const pinIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;transform:translate(-50%,-100%)">
      <svg width="40" height="52" viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#CFE0FA"/>
            <stop offset="1" stop-color="#A9C2F0"/>
          </linearGradient>
        </defs>
        <path d="M20 0C9 0 0 9 0 20c0 14 20 32 20 32s20-18 20-32C40 9 31 0 20 0z" fill="url(#pg)"/>
        <circle cx="20" cy="20" r="8" fill="#0B1026"/>
        <path d="M20 15l1.6 3.3 3.6.4-2.7 2.4.7 3.6L20 22.9 16.8 24.7l.7-3.6-2.7-2.4 3.6-.4z" fill="#E7D3A1"/>
      </svg>
    </div>`,
  iconSize: [40, 52],
  iconAnchor: [20, 52],
})

export default function LocationMap() {
  return (
    <Section id="ubicacion">
      <SectionHeading
        eyebrow="Ubicación"
        title="Dónde nos encontramos"
        subtitle={lugar}
      />

      <Reveal delay={120}>
        <p className="mb-6 text-center font-script text-lg text-celeste-soft/80">{direccion}</p>

        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-celeste/20 shadow-2xl">
          <MapContainer
            center={[lat, lng]}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: '380px', width: '100%' }}
          >
            <TileLayer
              // CartoDB Voyager: tiles claras y elegantes, sin API key
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap &copy; CARTO'
            />
            <Marker position={[lat, lng]} icon={pinIcon}>
              <Popup>
                <strong>{lugar}</strong>
                <br />
                {direccion}
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="mt-8 text-center">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-royal"
          >
            Cómo llegar
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M7 17L17 7M17 7H9M17 7v8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </Reveal>
    </Section>
  )
}
