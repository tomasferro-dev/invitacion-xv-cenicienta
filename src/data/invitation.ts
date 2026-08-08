// ─────────────────────────────────────────────────────────────────────────────
// FUENTE ÚNICA DE DATOS de la invitación.
// Editá SOLO este archivo para cambiar nombre, fecha, lugar, alias, etc.
// ─────────────────────────────────────────────────────────────────────────────

export interface GalleryPhoto {
  /** Ruta dentro de /public (ej: "/gallery/01.jpg") */
  src: string
  /** Texto alternativo / epígrafe */
  alt: string
}

export interface InvitationData {
  /** Nombre de la cumpleañera */
  nombre: string
  /** Edad que cumple (para los XV = 15) */
  edad: number
  /**
   * Fecha y hora del evento en ISO local. Formato: "YYYY-MM-DDTHH:mm"
   * Se interpreta en la zona horaria del dispositivo de quien mira.
   */
  fechaISO: string
  /** Texto lindo de la fecha para mostrar (ej: "Sábado 15 de noviembre, 2025") */
  fechaTexto: string
  /** Hora en texto (ej: "21:00 hs") */
  horaTexto: string

  ubicacion: {
    /** Nombre del salón / lugar */
    lugar: string
    /** Dirección completa para mostrar */
    direccion: string
    /** Coordenadas para el mapa */
    lat: number
    lng: number
  }

  invitacion: {
    /** Frase de encabezado (eyebrow) */
    eyebrow: string
    /** Párrafo principal de invitación */
    texto: string
  }

  vestimenta: {
    /** Código de vestimenta (ej: "Formal / Elegante") */
    codigo: string
    /** Nota adicional */
    nota: string
    /** Colores prohibidos (por el vestido de la cumpleañera) */
    prohibidos: { nombre: string; hex: string }[]
  }

  galeria: {
    /** URL del Drive/Form donde los invitados suben SUS fotos (para el QR) */
    driveUrl: string
    /** Fotos previas curadas que mostramos en la invitación */
    fotos: GalleryPhoto[]
  }

  regalo: {
    /** Nota introductoria */
    nota: string
    /** Alias / CBU para transferencias */
    alias: string
    /** Titular de la cuenta */
    titular: string
  }

  /** WhatsApp de contacto (opcional), formato internacional sin signos: 5492611234567 */
  whatsapp?: string
}

export const invitation: InvitationData = {
  nombre: 'Isabella',
  edad: 15,

  // ⚠️ PLACEHOLDER — cambiar por la fecha real del evento
  fechaISO: '2026-11-14T21:00',
  fechaTexto: 'Sábado 14 de Noviembre, 2026',
  horaTexto: '21:00 hs',

  ubicacion: {
    // ⚠️ PLACEHOLDER — ubicación genérica (Plaza Independencia, Mendoza)
    lugar: 'Salón de Fiestas — Palacio Real',
    direccion: 'Plaza Independencia, Ciudad de Mendoza, Mendoza',
    lat: -32.8908,
    lng: -68.8452,
  },

  invitacion: {
    eyebrow: 'Con la magia de un cuento',
    texto:
      'Cuando el reloj marque la hora, las puertas del palacio se abrirán. ' +
      'Te invito a compartir la noche más mágica de mi vida: mis quince años. ' +
      'Habrá luces, música y un poco de polvo de hadas para todos.',
  },

  vestimenta: {
    codigo: 'Elegante / Formal',
    nota: 'Vení preparado para una noche de palacio. Tacos cómodos recomendados: se baila hasta tarde.',
    prohibidos: [
      // El vestido de la cumpleañera es celeste → reservado para ella
      { nombre: 'Celeste', hex: '#A9C2F0' },
    ],
  },

  galeria: {
    // ⚠️ PLACEHOLDER — reemplazar por la carpeta/Form de Google Drive de la cumpleañera
    driveUrl: 'https://drive.google.com/drive/folders/PLACEHOLDER',
    fotos: [
      { src: '/gallery/01.jpg', alt: 'Foto 1' },
      { src: '/gallery/02.jpg', alt: 'Foto 2' },
      { src: '/gallery/03.jpg', alt: 'Foto 3' },
      { src: '/gallery/04.jpg', alt: 'Foto 4' },
      { src: '/gallery/05.jpg', alt: 'Foto 5' },
      { src: '/gallery/06.jpg', alt: 'Foto 6' },
    ],
  },

  regalo: {
    nota: 'Tu presencia es mi mejor regalo. Pero si querés hacerme un obsequio, podés ayudarme a cumplir mis sueños:',
    // ⚠️ PLACEHOLDER — alias de la madre de la cumpleañera
    alias: 'isabella.xv.palacio',
    titular: 'María González',
  },

  whatsapp: '5492611234567',
}
