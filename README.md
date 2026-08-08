# Invitación digital XV — "Palacio Real de Noche"

Invitación de un cumpleaños de 15, temática **princesa celeste / palacio de noche**.
SPA en **Vite + React + TypeScript + Tailwind**, con fondo mágico interactivo
(nieve, polvo mágico al scrollear y partículas que siguen el dedo/mouse).

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # genera /dist
npm run preview    # sirve el build
npm run test       # tests de lógica (countdown + rsvp)
npm run lint       # tsc --noEmit
```

## Dónde se edita el contenido

**Todo** vive en un solo archivo: [`src/data/invitation.ts`](src/data/invitation.ts).
Nombre, fecha, hora, lugar, coordenadas del mapa, vestimenta, colores prohibidos,
link del Drive, alias de regalos y WhatsApp. Los valores actuales son **placeholders**.

## Lo que hay que completar (marcado con ⚠️ en `invitation.ts`)

1. **Fecha real** del evento → `fechaISO`, `fechaTexto`, `horaTexto`.
2. **Ubicación real** → `ubicacion.lugar`, `direccion`, `lat`, `lng`.
   Para conseguir lat/lng: abrí Google Maps, click derecho sobre el lugar →
   "¿Qué hay aquí?" → copiá los dos números. Hoy usa Plaza Independencia (Mendoza).
3. **Link de Drive** para el QR → `galeria.driveUrl`. Pegá el link de la carpeta
   compartida o Google Form de la cumpleañera.
   > Nota: con Drive/Form, para **subir** fotos el invitado necesita estar logueado
   > en Google. Si querés que suban sin cuenta, después migramos a una página propia
   > con Vercel Blob.
4. **Alias de regalos** → `regalo.alias` y `regalo.titular`.
5. **Fotos de la galería previa** → poné las imágenes en `public/gallery/`
   (`01.jpg`, `02.jpg`, …). Mientras no existan, se muestra un placeholder con una
   estrellita. Cambiá la lista en `galeria.fotos` si son más/menos de 6.

## Confirmación de asistencia (RSVP) — Vercel Postgres

Las confirmaciones se guardan en **Vercel Postgres** vía una función serverless
(`api/rsvp.ts`). La cumpleañera ve la lista en **`/admin?key=TU_CLAVE`**, que se
actualiza sola cada 8 segundos.

### Variables de entorno

Creá un archivo `.env.development.local` (NO se commitea) con:

```
# Se completa solo con `vercel env pull` tras conectar el Postgres
POSTGRES_URL=...
# Clave para ver /admin — poné un string largo y difícil
ADMIN_KEY=una-clave-larga-y-secreta
```

### Pasos en Vercel (una sola vez)

1. Importá el repo en Vercel (detecta Vite automáticamente).
2. **Storage → Create Database → Postgres** → conectalo a este proyecto.
   Vercel inyecta `POSTGRES_URL` solo. La tabla `rsvp` se crea sola en el primer uso.
3. **Settings → Environment Variables** → agregá `ADMIN_KEY` con tu clave.
4. Redeploy.

### Probar el RSVP en local

El `/api` sólo corre con el runtime de Vercel, no con `npm run dev`. Para probarlo local:

```bash
npm i -g vercel
vercel link
vercel env pull .env.development.local
vercel dev        # levanta front + /api juntos
```

Sin esto, el formulario muestra el pop-up de error (no hay backend en `vite dev`),
pero toda la parte visual (magia, confetti) igual se ve.

## Panel de confirmados

`/admin?key=LA_CLAVE_QUE_PUSISTE_EN_ADMIN_KEY`
Muestra: total de respuestas, confirmados, no asisten, total de personas, y la
tabla con nombre / cantidad / mensaje / fecha. Compartí ese link **con la clave**
solo con la cumpleañera / familia.

## Deploy

Vercel, framework Vite autodetectado (`build` → `dist`). `vercel.json` ya tiene el
rewrite de SPA (todas las rutas menos `/api/*` resuelven a `index.html`).

## Notas técnicas

- **Fondo mágico**: `src/components/MagicBackground.tsx` (canvas + sprites de glow).
  Respeta `prefers-reduced-motion` (queda estático) y baja densidad en mobile.
- **Mapa**: Leaflet + tiles de CARTO (gratis, sin API key). El botón "Cómo llegar"
  abre Google Maps con la dirección.
- **Sin Blob** por ahora: la galería previa es estática. Si pesa mucho, se migra.
```
