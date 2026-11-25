import { useCallback, useEffect, useMemo, useState } from 'react'
import { BANK } from './Game'

const URL = import.meta.env.VITE_SHEETS_URL
const label = Object.fromEntries(BANK.map((b) => [b.id, b.q]))
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)
const f1 = (n) => n.toFixed(1).replace('.', ',')

function Bar({ pct, color = '#1d4ed8' }) {
  return <span className="block h-3 rounded-full bg-black/10"><span className="block h-full rounded-full" style={{ width: `${pct}%`, background: color }} /></span>
}

function Stats({ d }) {
  const s = useMemo(() => {
    const games = d.partidas
    const players = new Set(games.map((g) => g.jugador)).size
    const byQ = {}
    d.respuestas.forEach((r) => { (byQ[r.pregunta] ||= []).push(r) })
    const qs = Object.entries(byQ).map(([id, rs]) => ({ id, n: rs.length, ok: (rs.filter((r) => +r.acierto === 1).length / rs.length) * 100, t: avg(rs.map((r) => +r.segundos)) })).sort((a, b) => a.ok - b.ok)
    const bins = Array.from({ length: 9 }, (_, i) => ({ from: i, n: games.filter((g) => +g.aciertos === i).length }))
    return { games, players, qs, bins }
  }, [d])
  const maxBin = Math.max(1, ...s.bins.map((b) => b.n))
  const csv = () => {
    const rows = [['pregunta', 'respondidas', 'acierto_%', 'segundos_promedio'], ...s.qs.map((q) => [q.id, q.n, q.ok.toFixed(1), q.t.toFixed(1)])]
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.map((r) => r.join(',')).join('\n'))
    a.download = 'resultados_por_pregunta.csv'
    a.click()
  }
  return (
    <>
      <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {[['Partidas', s.games.length], ['Jugadores', s.players], ['Puntaje promedio', Math.round(avg(s.games.map((g) => +g.puntaje)))], ['Aciertos promedio', `${f1(avg(s.games.map((g) => +g.aciertos)))} de 8`]].map(([k, v]) => (
          <div key={k}><dt className="text-sm text-muted">{k}</dt><dd className="font-display text-4xl font-extrabold tabular-nums">{v}</dd></div>
        ))}
      </dl>

      <h2 className="mt-12 text-2xl font-extrabold">Porcentaje de acierto por pregunta</h2>
      <p className="mt-1 text-muted">De la más difícil a la más fácil. Más abajo, el tiempo promedio en segundos.</p>
      <ol className="mt-4 space-y-4">
        {s.qs.map((q) => (
          <li key={q.id}>
            <p className="flex justify-between gap-4"><span>{label[q.id] ?? q.id}</span><strong className="num whitespace-nowrap">{Math.round(q.ok)} % · {q.t.toFixed(1)} s · n={q.n}</strong></p>
            <Bar pct={q.ok} color={q.ok < 50 ? '#be123c' : q.ok < 75 ? '#854d0e' : '#15803d'} />
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-2xl font-extrabold">Cuántos acertaron cada cantidad de preguntas</h2>
      <ul className="mt-4 flex h-44 items-end gap-2">
        {s.bins.map((b) => (
          <li key={b.from} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="num text-sm">{b.n}</span>
            <span className="w-full rounded-t bg-[#1d4ed8]" style={{ height: `${(b.n / maxBin) * 80}%`, minHeight: b.n ? 4 : 0 }} />
            <span className="num text-sm text-muted">{b.from}</span>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-center text-sm text-muted">Respuestas correctas de 8</p>
      <button onClick={csv} className="press mt-8 min-h-11 cursor-pointer rounded-full bg-ink px-6 text-sm font-semibold text-white">Descargar tabla por pregunta (CSV)</button>
    </>
  )
}

export default function Results() {
  const [key, setKey] = useState(() => { try { return sessionStorage.getItem('rk') || '' } catch { return '' } })
  const [d, setD] = useState(null)
  const [err, setErr] = useState('')
  const [at, setAt] = useState(null)
  const [busy, setBusy] = useState(false)
  const load = useCallback(async (e, silent) => {
    e?.preventDefault()
    if (!silent) setErr('')
    setBusy(true)
    try {
      const r = await (await fetch(`${URL}?clave=${encodeURIComponent(key)}`)).json()
      if (r.error) { setD(null); return setErr('Clave incorrecta.') }
      try { sessionStorage.setItem('rk', key) } catch { /* sin almacenamiento */ }
      setD(r); setAt(new Date())
    } catch { if (!silent) setErr('No se pudieron leer los datos. Revisa la URL del script y que el acceso sea "Cualquier persona".') }
    finally { setBusy(false) }
  }, [key])

  // Entra solo si la clave ya se escribió en esta pestaña
  useEffect(() => { if (key && URL) load(null, true) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // Apps Script no puede avisar a la página, así que se consulta cada 10 s mientras la pestaña se ve
  useEffect(() => {
    if (!d) return
    const id = setInterval(() => { if (!document.hidden) load(null, true) }, 10000)
    return () => clearInterval(id)
  }, [d, load])
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 text-ink">
      <h1 className="text-4xl font-extrabold sm:text-5xl">Resultados del juego</h1>
      {d && (
        <p className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
          <button onClick={() => load(null, true)} disabled={busy} className="press min-h-10 cursor-pointer rounded-full border border-black/20 px-4 font-semibold text-ink hover:border-black/50 disabled:opacity-50">{busy ? 'Actualizando…' : 'Actualizar ahora'}</button>
          <span>Se actualiza sola cada 10 segundos. Última lectura: {at?.toLocaleTimeString('es-CO')}</span>
        </p>
      )}
      {!URL && <p className="mt-4 font-semibold text-copd">Falta VITE_SHEETS_URL en el archivo .env.</p>}
      {!d ? (
        <form onSubmit={load} className="mt-6 flex flex-wrap items-end gap-3">
          <label className="text-sm text-muted">Clave<input type="password" value={key} onChange={(e) => setKey(e.target.value)} className="mt-1 block min-h-11 rounded-lg border border-black/20 bg-white px-3 text-base text-ink" /></label>
          <button className="press min-h-11 cursor-pointer rounded-full bg-ink px-6 text-sm font-semibold text-white">Ver resultados</button>
          {err && <p className="w-full font-semibold text-copd">{err}</p>}
        </form>
      ) : d.partidas.length ? <Stats d={d} /> : <p className="mt-6">Todavía no hay partidas guardadas.</p>}
      <p className="mt-12"><a href="#top" className="hov font-semibold" onClick={() => location.assign(location.pathname)}>Volver a la página</a></p>
    </main>
  )
}
