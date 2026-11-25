const URL = import.meta.env.VITE_SHEETS_URL
const KEY = 'alveolos_player'

/** ID anónimo aleatorio, guardado en el navegador. No contiene datos personales. */
export function playerId() {
  try {
    let id = localStorage.getItem(KEY)
    if (!id) { id = Math.random().toString(36).slice(2, 10); localStorage.setItem(KEY, id) }
    return id
  } catch { return 'anon' }
}

/** Envía una partida a Google Sheets (Apps Script). Si no hay URL configurada, no hace nada. */
export function sendResult(game) {
  if (!URL) return
  // text/plain evita el preflight CORS que Apps Script no responde
  fetch(URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ player: playerId(), ...game }), keepalive: true }).catch(() => {})
}
