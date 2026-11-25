import { useCallback, useEffect, useMemo, useState } from 'react'
import { BANK } from './Game'

const URL = import.meta.env.VITE_SHEETS_URL
const label = Object.fromEntries(BANK.map((b) => [b.id, b.q]))
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)
const f1 = (n) => n.toFixed(1).replace('.', ',')
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)

// Paleta de Google Formularios
const C = { ok: '#3366cc', bad: '#dc3912', a: '#ff9900', b: '#109618', brand: '#673ab7', page: '#f0ebf8' }

const card = 'rounded-lg border border-[#dadce0] bg-white px-6 py-5'

function Card({ title, sub, children }) {
  return (
    <section className={card}>
      <h2 className="text-base font-medium text-[#202124]">{title}</h2>
      {sub && <p className="mt-0.5 text-sm text-[#5f6368]">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** Gráfico circular como el de Formularios: círculo y leyenda con cantidad y porcentaje. */
function Pie({ parts, name }) {
  const total = parts.reduce((s, p) => s + p.v, 0)
  let acc = 0
  const stops = parts.filter((p) => p.v > 0).map((p) => { const from = (acc / total) * 100; acc += p.v; return `${p.c} ${from}% ${(acc / total) * 100}%` })
  return (
    <figure className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <span role="img" aria-label={name} className="block h-32 w-32 shrink-0 rounded-full" style={{ background: total ? `conic-gradient(${stops.join(',')})` : '#e8eaed' }} />
      <figcaption>
        <ul className="space-y-1.5 text-sm text-[#202124]">
          {parts.map((p) => (
            <li key={p.l} className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-sm" style={{ background: p.c }} />{p.l}: <strong className="font-medium">{p.v}</strong> <span className="text-[#5f6368]">({pct(p.v, total)} %)</span></li>
          ))}
        </ul>
      </figcaption>
    </figure>
  )
}

/** Barras verticales con la cantidad encima. */
function Columns({ data, xLabel, yLabel }) {
  const max = Math.max(1, ...data.map((d) => d.v))
  return (
    <figure>
      <p className="text-xs text-[#5f6368]">{yLabel}</p>
      <ul className="mt-1 flex h-36 items-end gap-1.5 border-b border-[#dadce0]">
        {data.map((d) => (
          <li key={d.l} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-xs text-[#202124]">{d.v}</span>
            <span className="w-full max-w-9 rounded-t-sm" style={{ height: `${(d.v / max) * 78}%`, minHeight: d.v ? 3 : 0, background: C.ok }} />
          </li>
        ))}
      </ul>
      <ul className="mt-1 flex gap-1.5">
        {data.map((d) => <li key={d.l} className="flex-1 text-center text-xs text-[#5f6368]">{d.l}</li>)}
      </ul>
      <figcaption className="mt-1 text-center text-xs text-[#5f6368]">{xLabel}</figcaption>
    </figure>
  )
}

/** Barras horizontales cortas con el valor al lado. */
function Rows({ rows, unit }) {
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.id} className="grid grid-cols-[1fr_minmax(0,9rem)_3.5rem] items-center gap-3 text-sm">
          <span className="text-[#202124]">{r.l}</span>
          <span className="block h-2.5 rounded-sm bg-[#e8eaed]"><span className="block h-full rounded-sm" style={{ width: `${r.w}%`, background: C.ok }} /></span>
          <span className="whitespace-nowrap text-right text-[#202124]">{r.v}{unit}</span>
        </li>
      ))}
    </ul>
  )
}

const short = (t) => (t.length > 70 ? t.slice(0, 68) + '…' : t)

function Stats({ d }) {
  const s = useMemo(() => {
    const games = d.partidas
    const byQ = {}
    d.respuestas.forEach((r) => { (byQ[r.pregunta] ||= []).push(r) })
    const qs = BANK.filter((b) => byQ[b.id]).map((b) => {
      const rs = byQ[b.id]
      const ok = rs.filter((r) => +r.acierto === 1).length
      return { id: b.id, q: b.q, n: rs.length, ok, bad: rs.length - ok, t: avg(rs.map((r) => +r.segundos)) }
    })
    const hist = Array.from({ length: 9 }, (_, i) => ({ l: String(i), v: games.filter((g) => +g.aciertos === i).length }))
    const rank = (a) => (a >= 7 ? 3 : a >= 5 ? 2 : a >= 3 ? 1 : 0)
    const ranks = ['Sigue repasando (0 a 2)', 'Estudiante en práctica (3 a 4)', 'Residente (5 a 6)', 'Especialista (7 a 8)'].map((l, i) => ({ l, v: games.filter((g) => rank(+g.aciertos) === i).length, c: [C.bad, C.a, C.ok, C.b][i] }))
    return { games, qs, hist, ranks, okAll: d.respuestas.filter((r) => +r.acierto === 1).length, tAll: avg(d.respuestas.map((r) => +r.segundos)) }
  }, [d])

  const csv = (name, head, rows) => {
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent([head, ...rows].map((r) => r.join(',')).join('\n'))
    a.download = name
    a.click()
  }
  const hard = [...s.qs].sort((a, b) => a.ok / a.n - b.ok / b.n)
  const slow = [...s.qs].sort((a, b) => b.t - a.t)

  return (
    <>
      <Card title="Resumen general" sub="Cada partida completa cuenta como una persona.">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          {[
            ['Personas', s.games.length, 'Partidas completas del juego.'],
            ['Puntaje promedio', Math.round(avg(s.games.map((g) => +g.puntaje))), 'Puntos obtenidos por partida.'],
            ['Aciertos promedio', `${f1(avg(s.games.map((g) => +g.aciertos)))} de 8`, 'Preguntas correctas por partida.'],
            ['Tiempo de respuesta', `${f1(s.tAll)} s`, 'Promedio entre ver una pregunta y elegir respuesta.'],
          ].map(([k, v, t]) => (
            <div key={k}><dt className="text-sm text-[#5f6368]">{k}</dt><dd className="text-3xl font-normal text-[#202124]">{v}</dd><dd className="mt-0.5 text-xs text-[#5f6368]">{t}</dd></div>
          ))}
        </dl>
      </Card>

      <Card title="Cuántas preguntas acertó cada persona" sub={`${s.games.length} respuestas`}>
        <Columns data={s.hist} xLabel="Preguntas acertadas de 8" yLabel="Número de personas" />
      </Card>

      <Card title="Rango final" sub="El rango que recibió cada persona al terminar el juego.">
        <Pie parts={s.ranks} name="Personas por rango final" />
      </Card>

      <Card title="Preguntas de la más difícil a la más fácil" sub="Porcentaje de personas que acertó cada pregunta.">
        <Rows unit=" %" rows={hard.map((q) => ({ id: q.id, l: short(q.q), w: pct(q.ok, q.n), v: pct(q.ok, q.n) }))} />
      </Card>

      <Card title="Tiempo de respuesta por pregunta" sub="Segundos promedio que tardaron en elegir una opción, de la más lenta a la más rápida.">
        <Rows unit=" s" rows={slow.map((q) => ({ id: q.id, l: short(q.q), w: Math.min(100, (q.t / Math.max(...slow.map((x) => x.t), 1)) * 100), v: f1(q.t) }))} />
      </Card>

      <h2 className="px-1 pt-2 text-sm font-medium text-[#5f6368]">Detalle por pregunta</h2>
      {s.qs.map((q) => (
        <Card key={q.id} title={q.q} sub={`${q.n} respuestas · Tiempo de respuesta promedio: ${f1(q.t)} s`}>
          <Pie name={`Aciertos de la pregunta: ${q.q}`} parts={[{ l: 'Correctas', v: q.ok, c: C.ok }, { l: 'Incorrectas', v: q.bad, c: C.bad }]} />
        </Card>
      ))}

      <p className="flex flex-wrap gap-3 pt-2">
        <button onClick={() => csv('resultados_por_pregunta.csv', ['pregunta', 'respuestas', 'correctas', 'incorrectas', 'segundos_promedio'], s.qs.map((q) => [q.id, q.n, q.ok, q.bad, q.t.toFixed(1)]))} className="min-h-10 cursor-pointer rounded border border-[#dadce0] bg-white px-4 text-sm font-medium text-[#673ab7] hover:bg-[#f8f5fd]">Descargar resumen por pregunta (.csv)</button>
        <button onClick={() => csv('partidas.csv', ['puntaje', 'aciertos', 'segundos'], s.games.map((g) => [g.puntaje, g.aciertos, g.segundos]))} className="min-h-10 cursor-pointer rounded border border-[#dadce0] bg-white px-4 text-sm font-medium text-[#673ab7] hover:bg-[#f8f5fd]">Descargar partidas (.csv)</button>
      </p>
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

  useEffect(() => { if (key && URL) load(null, true) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // Apps Script no puede avisar a la página, así que se consulta cada 10 s mientras la pestaña se ve
  useEffect(() => {
    if (!d) return
    const id = setInterval(() => { if (!document.hidden) load(null, true) }, 10000)
    return () => clearInterval(id)
  }, [d, load])

  return (
    <main className="min-h-screen px-4 py-6 text-[#202124]" style={{ background: C.page }}>
      <div className="mx-auto grid max-w-3xl gap-3">
        <header className={`${card} border-t-[10px]`} style={{ borderTopColor: C.brand }}>
          <h1 className="text-3xl font-normal">Resultados del juego</h1>
          <p className="mt-1 text-sm text-[#5f6368]">Alvéolos bajo presión: la biomecánica en la EPOC</p>
          {d && (
            <>
              <p className="mt-4 border-b border-[#dadce0] pb-2 text-xl"><span className="border-b-[3px] pb-2" style={{ borderColor: C.brand, color: C.brand }}>{d.partidas.length} respuestas</span></p>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#5f6368]">
                <button onClick={() => load(null, true)} disabled={busy} className="min-h-9 cursor-pointer rounded border border-[#dadce0] px-3 font-medium text-[#673ab7] hover:bg-[#f8f5fd] disabled:opacity-50">{busy ? 'Actualizando…' : 'Actualizar ahora'}</button>
                <span>Se actualiza sola cada 10 segundos. Última lectura: {at?.toLocaleTimeString('es-CO')}</span>
              </p>
              <p className="mt-3 text-sm text-[#5f6368]">Aquí «respuestas» son las partidas completas, una por persona. El «tiempo de respuesta» es cuántos segundos pasan desde que aparece una pregunta hasta que se elige una opción.</p>
            </>
          )}
        </header>

        {!URL && <p className={`${card} font-medium text-[#dc3912]`}>Falta VITE_SHEETS_URL en el archivo .env.</p>}
        {!d ? (
          <form onSubmit={load} className={`${card} flex flex-wrap items-end gap-3`}>
            <label className="text-sm text-[#5f6368]">Clave<input type="password" value={key} onChange={(e) => setKey(e.target.value)} className="mt-1 block min-h-10 rounded border border-[#dadce0] bg-white px-3 text-base text-[#202124]" /></label>
            <button className="min-h-10 cursor-pointer rounded px-5 text-sm font-medium text-white" style={{ background: C.brand }}>Ver resultados</button>
            {err && <p className="w-full text-sm font-medium text-[#dc3912]">{err}</p>}
          </form>
        ) : d.partidas.length ? <Stats d={d} /> : <p className={card}>Todavía no hay partidas guardadas.</p>}

        <p className="px-1 pt-2 text-sm"><a href="/" className="text-[#673ab7] hover:underline">Volver a la página</a></p>
      </div>
    </main>
  )
}
