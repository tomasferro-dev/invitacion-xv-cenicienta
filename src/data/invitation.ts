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
    /** Paleta sugerida para los invitados */
    paleta: { nombre: string; hex: string }[]
    /** Colores reservados/prohibidos (opcional; vacío = no mostrar) */
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
  nombre: 'Uma Lucía',
  edad: 15,

  fechaISO: '2026-09-19T21:00',
  fechaTexto: 'Sábado 19 de Septiembre, 2026',
  horaTexto: '21:00 hs',

  ubicacion: {
    lugar: 'Salón Palatium Novus',
    direccion: 'El Challao — Las Heras — Mendoza',
    lat: -32.8583504,
    lng: -68.9018509,
  },

  invitacion: {
    eyebrow: 'Con la magia de un cuento',
    texto:
      'Cuando el reloj marque la hora, las puertas del palacio se abrirán. ' +
      'Te invito a compartir la noche más mágica de mi vida: mis quince años. ' +
      'Te pido dos cositas: llegá puntual a las 21:00 y no te olvides de confirmar tu asistencia. ' +
      'Habrá luces, música y momentos inolvidables.',
  },

  vestimenta: {
    codigo: 'Formal / Elegante',
    nota: '¡Queremos que la noche brille en todos los colores! Tacos cómodos recomendados: se baila hasta tarde.',
    // La gente va formal y libre de color: no hay paleta sugerida.
    paleta: [],
    // Colores reservados para la quinceañera y su entorno (los que hay que evitar).
    prohibidos: [
      { nombre: 'Celeste', hex: '#A9C2F0' },
      { nombre: 'Azul', hex: '#4A6BB5' },
      { nombre: 'Gris', hex: '#AEB6C4' },
    ],
  },

  galeria: {
    // ⚠️ PLACEHOLDER — reemplazar por el link real de subida de fotos (ver módulo QR)
    driveUrl: 'https://drive.google.com/drive/folders/PLACEHOLDER',
    fotos: [
      { src: '/uma_01.jpg', alt: 'Uma Lucía — foto 1' },
      { src: '/uma_02.jpg', alt: 'Uma Lucía — foto 2' },
      { src: '/uma_03.jpg', alt: 'Uma Lucía — foto 3' },
      { src: '/uma_04.jpg', alt: 'Uma Lucía — foto 4' },
      { src: '/uma_05.jpg', alt: 'Uma Lucía — foto 5' },
      { src: '/uma_06.jpg', alt: 'Uma Lucía — foto 6' },
    ],
  },

  regalo: {
    nota: 'Tu presencia es mi mejor regalo. Pero si querés hacerme un obsequio, podés ayudarme a cumplir mis sueños:',
    alias: 'lucia.cuilliere',
    // ⚠️ Confirmar el nombre del titular de la cuenta
    titular: 'Mamá de Uma Lucía',
  },

  whatsapp: '5492611234567',
}
