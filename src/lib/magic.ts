import confetti from 'canvas-confetti'

const COLORS = ['#A9C2F0', '#CFE0FA', '#E7D3A1', '#F4E8C6', '#FFFFFF']

/** Estallido de "polvo mágico" celeste + dorado (al confirmar asistencia). */
export function magicBurst() {
  const base: confetti.Options = {
    colors: COLORS,
    disableForReducedMotion: true,
    scalar: 1.05,
    ticks: 220,
  }

  // ráfaga central
  confetti({ ...base, particleCount: 90, spread: 90, startVelocity: 42, origin: { y: 0.6 } })

  // dos chorros laterales, un pelín después
  setTimeout(() => {
    confetti({ ...base, particleCount: 50, angle: 60, spread: 70, origin: { x: 0, y: 0.7 } })
    confetti({ ...base, particleCount: 50, angle: 120, spread: 70, origin: { x: 1, y: 0.7 } })
  }, 180)

  // lluvia de destellos que cae suave
  setTimeout(() => {
    confetti({
      ...base,
      particleCount: 60,
      spread: 120,
      startVelocity: 22,
      gravity: 0.55,
      scalar: 0.8,
      origin: { y: 0 },
    })
  }, 380)
}
