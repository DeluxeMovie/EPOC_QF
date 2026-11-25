const URL = import.meta.env.VITE_SHEETS_URL

/** Envía una partida a Google Sheets (Apps Script). Cada partida cuenta como un jugador distinto: no se guarda nada en el navegador. */
export function sendResult(game) {
  if (!URL) return
  // text/plain evita el preflight CORS que Apps Script no responde
  fetch(URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ player: game.game, ...game }), keepalive: true }).catch(() => {})
}
