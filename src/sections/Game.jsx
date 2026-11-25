import { useEffect, useRef, useState } from 'react'
import { RotateCcw, Star } from 'lucide-react'
import { Band, Head, HowTo, Tri } from '../components/ui'
import AlveolusZoom from '../components/AlveolusZoom'
import AirwayCross from '../components/AirwayCross'
import Lungs from '../components/Lungs'
import { curveFor, SPIRO } from '../data/spirometry'
import { fmt } from '../lib/physics'
import { sendResult } from '../lib/sendResult'

const ROUNDS = 8
const LETTERS = ['A', 'B', 'C']
const E = SPIRO.epoc
const S = SPIRO.sano

/* ───────── imágenes de cada pregunta ───────── */
function Curves({ epocIsA, mark }) {
  const W = 380, H = 230, M = { l: 44, r: 14, t: 14, b: 38 }
  const X = (t) => M.l + (t / 14) * (W - M.l - M.r)
  const Y = (v) => H - M.b - (v / 3.5) * (H - M.t - M.b)
  const sano = curveFor('sano', 'pre')
  const epoc = curveFor('epoc', 'pre')
  const A = epocIsA ? epoc : sano
  const B = epocIsA ? sano : epoc
  const path = (f) => Array.from({ length: 141 }, (_, i) => `${i ? 'L' : 'M'}${X(i / 10).toFixed(1)} ${Y(f(i / 10)).toFixed(1)}`).join('')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Gráfica de espirometría: aire sacado contra tiempo" className="block h-auto w-full">
      {[0, 1, 2, 3].map((v) => (
        <g key={v}><line x1={M.l} x2={W - M.r} y1={Y(v)} y2={Y(v)} stroke="#1f3342" /><text x={M.l - 8} y={Y(v) + 4} textAnchor="end" fontSize="12" fill="#94a3b8">{v}</text></g>
      ))}
      {[0, 2, 4, 6, 8, 10, 12, 14].map((v) => <text key={v} x={X(v)} y={H - M.b + 17} textAnchor="middle" fontSize="12" fill="#94a3b8">{v}</text>)}
      <line x1={M.l} x2={W - M.r} y1={Y(0)} y2={Y(0)} stroke="#64748b" />
      <line x1={M.l} x2={M.l} y1={M.t} y2={Y(0)} stroke="#64748b" />
      <text x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle" fontSize="12.5" fill="#cbd5e1">Segundos desde que empiezas a soplar</text>
      <text transform={`rotate(-90 12 ${(M.t + H - M.b) / 2})`} x="12" y={(M.t + H - M.b) / 2} textAnchor="middle" fontSize="12.5" fill="#cbd5e1">Litros de aire sacados</text>
      {mark ? (
        <>
          <path d={path(sano)} fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
          <line x1={X(1)} x2={X(1)} y1={M.t} y2={Y(0)} stroke="#facc15" strokeDasharray="4 4" />
          <circle cx={X(1)} cy={Y(sano(1))} r="8" fill="#facc15" stroke="#07131c" strokeWidth="3" />
          <text x={X(1) + 12} y={Y(sano(1)) + 22} fontSize="14" fontWeight="700" fill="#facc15">punto a 1 s</text>
        </>
      ) : (
        <>
          <path d={path(A)} fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
          <path d={path(B)} fill="none" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
          <text x={X(13.9)} y={Y(A(13.9)) - 9} textAnchor="end" fontSize="15" fontWeight="800" fill="#38bdf8">Curva A</text>
          <text x={X(13.9)} y={Y(B(13.9)) - 9} textAnchor="end" fontSize="15" fontWeight="800" fill="#facc15">Curva B</text>
        </>
      )}
    </svg>
  )
}

function Numbers({ rows }) {
  return (
    <dl className="grid grid-cols-[1fr_auto] items-baseline gap-x-6">
      {rows.map(([k, v, c]) => [
        <dt key={k} className="border-b border-white/10 py-3 text-slate-300">{k}</dt>,
        <dd key={k + 'v'} className="border-b border-white/10 py-3 font-display text-5xl font-extrabold tabular-nums" style={{ color: c ?? '#fff' }}>{v}</dd>,
      ])}
    </dl>
  )
}

function TwoAlveoli() {
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label="Dos alvéolos con la misma tensión: uno pequeño (A) y uno grande (B)" className="block h-auto w-full">
      <g fill="#0e7490" fillOpacity=".2" stroke="#22d3ee" strokeWidth="6">
        <circle cx="90" cy="100" r="30" /><circle cx="226" cy="100" r="64" />
      </g>
      <g textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff"><text x="90" y="105">A</text><text x="226" y="105">B</text></g>
      <text x="160" y="192" textAnchor="middle" fontSize="13" fill="#cbd5e1">Los dos tienen la misma tensión superficial</text>
    </svg>
  )
}

function Surf() {
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label="Dos alvéolos: A con surfactante (puntos cian) y B sin surfactante" className="block h-auto w-full">
      {[[90, true, 'A'], [230, false, 'B']].map(([cx, on, l]) => (
        <g key={l}>
          <circle cx={cx} cy="95" r="52" fill="#0b1c28" stroke={on ? '#22d3ee' : '#fb7185'} strokeWidth={on ? 3 : 8} />
          {on && Array.from({ length: 28 }, (_, i) => <circle key={i} cx={cx + Math.cos((i / 28) * 6.2832) * 44} cy={95 + Math.sin((i / 28) * 6.2832) * 44} r="3.4" fill="#22d3ee" />)}
          <text x={cx} y="101" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff">{l}</text>
          <text x={cx} y="175" textAnchor="middle" fontSize="13" fill="#cbd5e1">{on ? 'con capa de surfactante' : 'sin surfactante'}</text>
        </g>
      ))}
    </svg>
  )
}

function Visual({ v, epocIsA }) {
  switch (v.t) {
    case 'curves': return <Curves epocIsA={epocIsA} />
    case 'mark': return <Curves mark />
    case 'numbers': return <Numbers rows={v.rows} />
    case 'alveolus': return <AlveolusZoom className="mx-auto max-w-[300px]" kind="epoc" damage={0.8} trapped={0.5} caliber={0.6} scale={1} title="Alvéolo de un paciente" />
    case 'aero': return <AlveolusZoom className="mx-auto max-w-[300px]" kind="sano" damage={0} trapped={0} caliber={1} scale={1} aerosol={1} title="Partículas del aerosol llegando a un alvéolo" />
    case 'airway': return <AirwayCross className="mx-auto max-w-[260px]" contraction={v.k} title="Corte de un bronquio" />
    case 'airways2': return (
      <ul className="grid grid-cols-2 gap-3">
        <li><p className="text-center font-bold text-rose-300">Antes</p><AirwayCross contraction={0.7} title="Bronquio antes del salbutamol" /></li>
        <li><p className="text-center font-bold text-sky-300">Después</p><AirwayCross contraction={0.5} drug title="Bronquio después del salbutamol" /></li>
      </ul>
    )
    case 'twoalv': return <TwoAlveoli />
    case 'surf': return <Surf />
    case 'trap': return <Lungs className="mx-auto max-w-[240px]" kind="epoc" scale={1.1} fill={0.5} damage={0.7} trapped={0.6} caliber={0.65} zoom={false} title="Pulmones con enfisema" />
    case 'lung': return <Lungs className="mx-auto max-w-[240px]" kind="epoc" scale={1} fill={0.6} damage={0.5} trapped={0.3} caliber={0.8} zoom={false} title="Pulmones con daño acumulado" />
    default: return null
  }
}

/* ───────── banco de preguntas (imagen, pregunta, opciones, por qué) ───────── */
export const BANK = [
  { id: 'curvas', visual: { t: 'curves' }, q: 'Dos personas soplaron en el espirómetro. ¿Cuál curva es de la persona con EPOC?', opts: ['La curva A', 'La curva B'], answer: 'epocCurve', why: 'La curva de la persona sana sube casi de inmediato y luego se aplana. La de la persona con EPOC sube más despacio: el aire sale con más dificultad.' },
  { id: 'ratio-epoc', visual: { t: 'numbers', rows: [['FEV₁ (aire en el primer segundo)', `${fmt(E.pre.fev1, 2)} L`, '#fb7185'], ['FVC (aire total)', `${fmt(E.pre.fvc, 2)} L`, '#fff']] }, q: 'Con estos datos, ¿qué fracción del aire sale en el primer segundo y qué sugiere?', opts: [`Cerca de ${fmt(E.pre.ratio, 0)} %: patrón obstructivo`, 'Cerca de 72 %: igual que el voluntario sano', 'Cerca de 95 %: sale casi todo en el primer segundo'], answer: 0, why: '0,95 ÷ 1,73 es cerca de 55 %. El voluntario sano saca 72,2 %, así que este paciente muestra un patrón obstructivo.' },
  { id: 'ratio-sano', visual: { t: 'numbers', rows: [['FEV₁ (aire en el primer segundo)', `${fmt(S.pre.fev1, 2)} L`, '#4ade80'], ['FVC (aire total)', `${fmt(S.pre.fvc, 2)} L`, '#fff']] }, q: 'Otra persona sopló y dio estos valores. ¿Cómo se interpreta?', opts: ['Sale cerca del 72 % del aire en el primer segundo: pulmón sano', 'Patrón obstructivo (EPOC)', 'No se puede saber'], answer: 0, why: '2,08 ÷ 2,88 es cerca de 72 %: es el valor del voluntario con pulmones sanos.' },
  { id: 'alveolo', visual: { t: 'alveolus' }, q: 'Mira este racimo de alvéolos de un paciente. ¿Qué le pasó?', opts: ['Las paredes entre los sacos de aire están dañadas (enfisema)', 'Se llenaron de agua', 'Se volvieron más pequeños y duros'], answer: 0, why: 'En el enfisema las paredes entre los sacos de aire de los pulmones están dañadas y cuesta más sacar el aire.' },
  { id: 'bronquio', visual: { t: 'airway', k: 0.75 }, q: 'Este es un bronquio visto de lado: el músculo (rojo) está apretado. ¿Qué medicamento ayudaría?', opts: ['Un broncodilatador, como el salbutamol', 'Un antibiótico', 'Más surfactante'], answer: 0, why: 'Los broncodilatadores relajan el músculo liso que envuelve los bronquios y bronquiolos, y así aumentan el diámetro de las vías aéreas.' },
  { id: 'despues', visual: { t: 'airways2' }, q: 'Tras usar salbutamol, ¿qué cambia en el bronquio?', opts: ['El músculo se relaja y el diámetro aumenta', 'Aumenta la resistencia al paso del aire', 'Se destruyen las paredes de los alvéolos'], answer: 0, why: 'El salbutamol abre los bronquios: relaja el músculo liso, aumenta el diámetro de la vía y disminuye la resistencia al flujo del aire.' },
  { id: 'resultado', visual: { t: 'numbers', rows: [['FEV₁ antes del salbutamol', `${fmt(E.pre.fev1, 2)} L`, '#fb7185'], ['FEV₁ después', `${fmt(E.post.fev1, 2)} L`, '#60a5fa']] }, q: 'En este paciente con EPOC el FEV₁ subió solo 0,07 L. ¿Qué significa?', opts: ['Mejora pequeña: sigue muy por debajo del voluntario sano', 'El FEV₁ empeoró', 'Quedó igual que en una persona sana'], answer: 0, why: 'El FEV₁ pasó de 0,95 a 1,02 L y el FEV₁/FVC de 54,8 a 58,0 %, todavía lejos del 72 % del voluntario sano.' },
  { id: 'sano-salb', visual: { t: 'numbers', rows: [['FEV₁ sano, antes', `${fmt(S.pre.fev1, 2)} L`, '#4ade80'], ['FEV₁ sano, después', `${fmt(S.post.fev1, 2)} L`, '#60a5fa']] }, q: 'Una persona sana usó salbutamol. ¿Qué mostró su espirometría?', opts: ['Casi ningún cambio en el FEV₁', 'Una mejora enorme', 'Que el FEV₁ bajó mucho'], answer: 0, why: 'En el voluntario sano el FEV₁ pasó de 2,08 a 2,10 L: casi no cambió.' },
  { id: 'laplace', visual: { t: 'twoalv' }, q: 'Con la misma tensión superficial, ¿cuál alvéolo necesita más presión?', opts: ['El pequeño (A)', 'El grande (B)', 'Los dos igual'], answer: 0, why: 'Según la ley de Laplace, P = 2T/r: si el radio (r) es pequeño, el denominador es pequeño y la presión aumenta.' },
  { id: 'surfactante', visual: { t: 'surf' }, q: '¿Qué hace la capa de surfactante del alvéolo A?', opts: ['Reduce la tensión superficial y evita el colapso', 'Sube la tensión superficial', 'Hace más grueso el aire'], answer: 0, why: 'El surfactante reduce la tensión superficial en la interfase aire-líquido del alvéolo para evitar su colapso al espirar. La exposición al vapeo lo altera.' },
  { id: 'enfisema', visual: { t: 'trap' }, q: 'Estos pulmones tienen enfisema. ¿Qué le ocurre al aire?', opts: ['Cuesta más sacarlo porque las paredes entre los sacos de aire están dañadas', 'Sale más rápido que en un pulmón sano', 'No logra entrar a los pulmones'], answer: 0, why: 'En el enfisema las paredes de los alvéolos están dañadas y no permiten distenderse: aparece un patrón obstructivo y el aire sale con dificultad.' },
  { id: 'punto', visual: { t: 'mark' }, q: 'En la curva, el punto marcado a 1 segundo mide…', opts: ['FEV₁: el aire exhalado en el primer segundo', 'FVC: el aire exhalado tras una inhalación total', 'El aire que quedó dentro'], answer: 0, why: 'FEV₁ es el volumen espiratorio forzado en el primer segundo. FVC es la capacidad vital forzada, el total exhalado con fuerza.' },
  { id: 'aerosol', visual: { t: 'aero' }, q: '¿Qué afirmación sobre el aerosol del vapeador es correcta?', opts: ['Trae nicotina (en algunos casos), saborizantes, otros químicos, sustancias cancerígenas y metales pesados', 'Es solo vapor de agua', 'No contiene sustancias dañinas'], answer: 0, why: 'El aerosol puede contener nicotina, saborizantes y otros químicos. Se han encontrado sustancias cancerígenas como NNN y NNK, y también metales pesados.' },
  { id: 'comparacion', visual: { t: 'numbers', rows: [['FEV₁/FVC del voluntario sano', `${fmt(S.pre.ratio)} %`, '#4ade80'], ['FEV₁/FVC del voluntario que vapea', `${fmt(E.pre.ratio)} %`, '#fb7185']] }, q: '¿Qué indica esta comparación entre el voluntario sano y el que lleva 5 años vapeando?', opts: ['El que vapea solo logra sacar cerca del 55 % del aire en el primer segundo: patrón obstructivo', 'Los dos sacan el aire al mismo ritmo', 'El que vapea saca el aire más rápido'], answer: 0, why: 'El voluntario sano saca 72,2 % del aire en el primer segundo. El que vapea solo saca cerca de 55 %, coherente con un patrón obstructivo.' },
]

const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] } return r }

function makeRound(q) {
  const epocIsA = Math.random() < 0.5
  const base = q.opts.map((text, i) => ({ text, i }))
  const correctIdx = q.answer === 'epocCurve' ? (epocIsA ? 0 : 1) : q.answer
  const opts = q.answer === 'epocCurve' ? base : shuffle(base)
  return { q, epocIsA, opts, correct: opts.findIndex((o) => o.i === correctIdx) }
}
const newGame = () => shuffle(BANK).slice(0, ROUNDS).map(makeRound)

/* ───────── juego ───────── */
function Play({ onExit }) {
  const [rounds, setRounds] = useState(newGame)
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [log, setLog] = useState([])
  const [times, setTimes] = useState([])
  const t0 = useRef(performance.now())
  const gameId = useRef(Math.random().toString(36).slice(2, 10))
  const sent = useRef(false)
  const done = i >= ROUNDS
  const R = rounds[i]
  const ok = picked !== null && picked === R?.correct

  const answer = (n) => {
    if (picked !== null) return
    setPicked(n)
    const good = n === R.correct
    setLog((l) => [...l, good])
    setTimes((t) => [...t, Math.round(performance.now() - t0.current)])
    if (good) { setScore((s) => s + 100 + Math.min(streak, 4) * 25); setStreak((s) => s + 1) } else setStreak(0)
  }
  const next = () => { setPicked(null); setI((x) => x + 1); t0.current = performance.now() }
  const again = () => { setRounds(newGame()); setI(0); setPicked(null); setScore(0); setStreak(0); setLog([]); setTimes([]); sent.current = false; gameId.current = Math.random().toString(36).slice(2, 10); t0.current = performance.now() }

  useEffect(() => {
    if (!done || sent.current) return
    sent.current = true
    sendResult({ game: gameId.current, score, correct: log.filter(Boolean).length, total: ROUNDS, ms: times.reduce((a, b) => a + b, 0), answers: rounds.map((r, n) => ({ id: r.q.id, ok: !!log[n], ms: times[n] ?? 0 })) })
  }, [done, score, log, times, rounds])

  useEffect(() => {
    const on = (e) => {
      if (done) return
      if (picked === null && ['1', '2', '3'].includes(e.key) && R.opts[+e.key - 1]) answer(+e.key - 1)
      else if (picked !== null && (e.key === 'Enter' || e.key === ' ') && document.activeElement?.tagName !== 'BUTTON') { e.preventDefault(); next() }
    }
    addEventListener('keydown', on)
    return () => removeEventListener('keydown', on)
  })

  const correctN = log.filter(Boolean).length
  const progress = (
    <header className="flex items-center gap-4">
      <ol className="flex flex-1 gap-1.5" aria-label={`Pregunta ${Math.min(i + 1, ROUNDS)} de ${ROUNDS}`}>
        {Array.from({ length: ROUNDS }, (_, n) => (
          <li key={n} className="h-2 flex-1 rounded-full transition-colors duration-300" style={{ background: n < log.length ? (log[n] ? '#34d399' : '#fb7185') : n === i ? '#e2e8f0' : '#1f3342' }} />
        ))}
      </ol>
      <p className="num whitespace-nowrap text-sm text-slate-300">{Math.min(i + 1, ROUNDS)} de {ROUNDS}</p>
      <p className="font-display text-2xl font-extrabold tabular-nums text-white">{score}<span className="ml-1 font-sans text-xs font-normal tracking-normal text-slate-400">puntos</span></p>
      {streak > 1 && <p className="text-sm font-bold text-yellow-300">Racha de {streak}</p>}
    </header>
  )

  if (done) {
    const stars = correctN >= 7 ? 3 : correctN >= 5 ? 2 : correctN >= 3 ? 1 : 0
    const rank = ['Sigue repasando', 'Estudiante en práctica', 'Residente', 'Especialista en neumología'][stars]
    const wrong = rounds.filter((_, n) => !log[n])
    return (
      <>
        {progress}
        <section className="mt-8 grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16" aria-label="Resultado">
          <article>
            <h3 className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">Terminaste</h3>
            <p className="mt-2 font-display text-8xl font-extrabold leading-none tabular-nums text-white">{score}</p>
            <p className="mt-2 text-lg text-slate-300">{correctN} de {ROUNDS} respuestas correctas</p>
            <p className="mt-3 flex items-center gap-1" aria-label={`${stars} de 3 estrellas`}>
              {[1, 2, 3].map((n) => <Star key={n} size={28} aria-hidden className={n <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'} />)}
              <strong className="ml-3 text-xl text-yellow-300">{rank}</strong>
            </p>
            <p className="mt-6 flex flex-wrap gap-3">
              <button onClick={again} className="press inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-emerald-400 px-6 text-sm font-bold text-[#07131c] hover:bg-white"><RotateCcw size={16} aria-hidden />Jugar otra vez</button>
              <button onClick={onExit} className="press hov min-h-11 cursor-pointer px-3 text-sm font-semibold text-slate-200">Volver al inicio</button>
            </p>
          </article>
          <article>
            {wrong.length === 0 ? (
              <p className="font-display text-3xl font-extrabold text-emerald-300">Sin errores. Dominas el tema.</p>
            ) : (
              <>
                <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Para repasar</h3>
                <ul className="mt-3 space-y-5">
                  {wrong.map((r) => (
                    <li key={r.q.id} className="border-l-[3px] border-rose-400 pl-4">
                      <strong className="block text-lg">{r.q.q}</strong>
                      <span className="mt-1 block font-semibold text-emerald-300">Respuesta: {r.opts[r.correct].text}</span>
                      <span className="mt-1 block text-slate-300">{r.q.why}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </article>
        </section>
      </>
    )
  }

  return (
    <>
      {progress}
      <section className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14" aria-label="Pregunta">
        <figure key={'v' + i} className="pop-in"><Visual v={R.q.visual} epocIsA={R.epocIsA} /></figure>
        <article>
          <h3 key={'q' + i} className="pop-in font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">{R.q.q}</h3>
          <ul className="mt-5 space-y-3" aria-label="Opciones de respuesta">
            {R.opts.map((o, n) => {
              const isC = picked !== null && n === R.correct
              const isW = picked === n && n !== R.correct
              return (
                <li key={n}>
                  <button onClick={() => answer(n)} disabled={picked !== null}
                    className={`flex min-h-14 w-full items-center gap-4 rounded-xl border-2 px-4 py-3 text-left text-lg transition-colors duration-200 ${
                      isC ? 'border-emerald-400 bg-emerald-400/15 text-white' : isW ? 'shake border-rose-400 bg-rose-400/15 text-white' : picked !== null ? 'border-white/10 text-slate-500' : 'cursor-pointer border-white/20 text-slate-100 hover:border-emerald-300 hover:text-emerald-200'
                    }`}>
                    <kbd className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border font-sans text-sm font-bold ${isC ? 'border-emerald-300 bg-emerald-300 text-[#07131c]' : isW ? 'border-rose-300 bg-rose-300 text-[#07131c]' : 'border-white/30'}`}>{LETTERS[n]}</kbd>
                    {o.text}
                  </button>
                </li>
              )
            })}
          </ul>
          {picked !== null ? (
            <aside className="pop-in mt-5" aria-live="polite">
              <h4 className="text-2xl font-extrabold" style={{ color: ok ? '#34d399' : '#fb7185' }}>{ok ? '¡Correcto!' : 'Casi. La respuesta era la ' + LETTERS[R.correct]}</h4>
              <p className="mt-1 text-lg text-slate-200">{R.q.why}</p>
              <button onClick={next} className="press mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#07131c] hover:bg-emerald-300">
                {i + 1 >= ROUNDS ? 'Ver mi resultado' : 'Siguiente pregunta'}<Tri />
              </button>
            </aside>
          ) : (
            <p className="mt-4 text-sm text-slate-400">Toca una respuesta, o pulsa 1, 2 o 3 en el teclado.</p>
          )}
        </article>
      </section>
    </>
  )
}

export default function Game() {
  const [on, setOn] = useState(false)
  return (
    <Band id="desafio" theme="game">
      <Head dark n="03" label="Minijuego" title={on ? 'Pon a prueba lo *aprendido*' : 'Ahora *juega*: ¿qué le pasa a este paciente?'}
        lead={on ? undefined : 'Es un juego de preguntas con casos clínicos. Cada pregunta trae una imagen (una curva, un alvéolo, un bronquio) y tres respuestas. Si fallas, el juego te explica por qué.'} />
      {on ? (
        <section className="mt-8" aria-label="Juego en curso"><Play onExit={() => setOn(false)} /></section>
      ) : (
        <section className="mt-8 grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-16" aria-label="Instrucciones">
          <HowTo dark title="Cómo se juega" items={[
            ['8 casos', 'Te toca una mezcla al azar: leer curvas, interpretar números, mirar alvéolos y bronquios.'],
            ['Puntos', 'Cada acierto da 100 puntos. Si aciertas varias seguidas ganas una racha con bonus.'],
            ['Explicación', 'Después de cada respuesta ves por qué era la correcta, con el mismo lenguaje de la página.'],
            ['Resultado', 'Al final recibes un rango y la lista de lo que conviene repasar.'],
          ]} />
          <article className="text-center lg:text-left">
            <button onClick={() => setOn(true)} className="press inline-flex min-h-16 cursor-pointer items-center gap-3 rounded-full bg-emerald-400 px-10 text-xl font-extrabold text-[#07131c] hover:bg-white">
              Empezar a jugar<Tri />
            </button>
            <p className="mt-4 text-slate-300">8 preguntas, unos 3 minutos.</p>
            <p className="mt-2 max-w-sm text-sm text-slate-400 lg:max-w-none">Al terminar se guardan tu puntaje y qué preguntas acertaste, sin nombre ni correo, para un estudio del curso.</p>
          </article>
        </section>
      )}
    </Band>
  )
}
