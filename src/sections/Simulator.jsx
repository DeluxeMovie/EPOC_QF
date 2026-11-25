import { lazy, memo, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { Band, Head, Slider, Tabs, Button, Rv, Split, HowTo, Note } from '../components/ui'
import Lungs from '../components/Lungs'
import AlveolusZoom from '../components/AlveolusZoom'
import AirwayCross from '../components/AirwayCross'
import SpirometryChart from '../components/SpirometryChart'
import PVChart from '../components/PVChart'
import { SPIRO, T_MAX_S } from '../data/spirometry'
import { useBreath, prefersReduced } from '../hooks/useBreath'
import { useVisible } from '../hooks/useVisible'
import { groupView, exhale } from '../lib/lungState'
import { fmt, laplaceP, tensionEff, surfFrac, volume } from '../lib/physics'

// Recharts pesa mucho: solo se descarga cuando esta sección se monta
const LaplaceChart = lazy(() => import('../components/LaplaceChart'))

const E = SPIRO.epoc
const S0 = SPIRO.sano
const TREAT = [{ value: 'pre', label: 'Antes del salbutamol', color: '#0b1f2e' }, { value: 'post', label: 'Después del salbutamol', color: '#1d4ed8' }]
const MANEUVER = [{ value: 'rest', label: 'Respiración' }, { value: 'forced', label: 'Espiración forzada' }]
const SPEEDS = [{ value: 1, label: 'Velocidad real' }, { value: 0.5, label: 'Más lento' }]
const noSubmit = (e) => e.preventDefault()
const unit = 'ml-1 font-sans text-xs font-normal tracking-normal text-muted'

/* ───────── tabla ───────── */
const ResultsTable = memo(function ResultsTable({ treatment }) {
  const rows = [
    ['FVC (L)', (d) => fmt(d.fvc, 2)], ['FVC (% de lo esperado)', (d) => fmt(d.pt[0])],
    ['FEV₁ (L)', (d) => fmt(d.fev1, 2)], ['FEV₁ (% de lo esperado)', (d) => fmt(d.pt[1])], ['FEV₁/FVC (%)', (d) => fmt(d.ratio)],
  ]
  const th = 'py-2 pl-4 text-right text-xs font-bold uppercase tracking-wide'
  return (
    <table className="w-full min-w-[440px] border-collapse text-sm">
      <caption className="sr-only">Espirometría antes y después de salbutamol</caption>
      <thead>
        <tr className="border-b border-black/15">
          <td />
          <th scope="col" className={`${th} text-healthy`}>Sano antes</th><th scope="col" className={`${th} text-healthy`}>Sano después</th>
          <th scope="col" className={`${th} text-copd`}>EPOC antes</th><th scope="col" className={`${th} text-copd`}>EPOC después</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([n, f]) => (
          <tr key={n} className="border-b border-black/10 last:border-0">
            <th scope="row" className="py-2 text-left font-medium">{n}</th>
            {['sano', 'epoc'].flatMap((g) => ['pre', 'post'].map((ph) => (
              <td key={g + ph} className={`num py-2 pl-4 text-right ${ph === treatment ? 'font-semibold text-ink' : 'text-muted'}`}>{f(SPIRO[g][ph])}</td>
            )))}
          </tr>
        ))}
      </tbody>
    </table>
  )
})

function LungPanel({ k, title, color, blurb, v, dmg, vape, ratio, puffKey, drug, d = 0 }) {
  return (
    <Rv as="article" d={d} className="min-w-0">
      <header className="flex items-end justify-between gap-4">
        <h3 className="text-3xl sm:text-4xl" style={{ color }}>{title}</h3>
        <p className="font-display text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl" style={{ color }}>{fmt(ratio)}<span className="ml-1 font-sans text-sm font-normal tracking-normal text-muted">% FEV₁/FVC</span></p>
      </header>
      <figure className="mt-3 grid grid-cols-[1fr_1.3fr] items-center gap-4">
        <figcaption className="col-span-2 text-ink/75">{blurb}</figcaption>
        <Lungs kind={k} scale={v.scale} fill={v.fill} damage={dmg} trapped={v.trapped} flow={v.flow} caliber={v.caliber} puffKey={puffKey} drug={drug} title={`Pulmones: ${title}`} />
        <AlveolusZoom kind={k} scale={0.9 + 0.2 * v.fill} damage={dmg} trapped={v.trapped} caliber={v.caliber} flow={v.flow} aerosol={k === 'epoc' ? vape : 0} title={`Acercamiento a los alvéolos: ${title}`} />
      </figure>
    </Rv>
  )
}

const LEGEND = [['#fb7185', 'pulmón (se infla y desinfla)'], ['#dcfce7', 'círculo: acercamiento a los alvéolos'], ['#334155', 'puntos oscuros: aire que no sale'], ['#1d4ed8', 'bronquios azules: salbutamol actuando']]

/* ───────── 1. escenario ───────── */
// Parte viva: se suscribe a la respiración solo mientras se ve, así el resto de la sección no se re-renderiza
const StageLive = memo(function StageLive({ treatment, mode, vape, dE, post, puffKey, breathing, tSp, manualP, limb, mS, mE, setManualP, setLimb, setMode, setBreathing, setPlayingF, reset }) {
  const [ref, visible] = useVisible()
  const running = mode === 'rest' && breathing
  const b = useBreath(running && visible, manualP, limb)
  const trapBase = dE * (post ? 0.93 : 1)
  const vS = groupView({ group: 'sano', mode, t: tSp, treatment, dmg: 0, restV: volume(mS, b.P, b.limb), trapBase: 0 })
  const vE = groupView({ group: 'epoc', mode, t: tSp, treatment, dmg: dE, restV: volume(mE, b.P, b.limb), trapBase })
  const toggleBreath = () => {
    setMode('rest'); setPlayingF(false)
    if (running) { setManualP(b.P); setLimb(b.limb); setBreathing(false) } else setBreathing(true)
  }
  return (
    <>
      <section ref={ref} className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14" aria-label="Pulmones">
        <LungPanel k="sano" title="Persona sana" color="#15803d" blurb="Voluntario 1: 32 años, pulmones sanos." v={vS} dmg={0} vape={0} ratio={S0[treatment].ratio} puffKey={0} drug={false} />
        <LungPanel k="epoc" title="Persona con EPOC" color="#be123c" blurb="Voluntario 2: 37 años, 5 años vapeando de forma constante. Patrón obstructivo." v={vE} dmg={dE} vape={vape} ratio={E[treatment].ratio} puffKey={puffKey} drug={post} d={200} />
      </section>

      <ul className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink/80" aria-label="Leyenda">
        <li className="font-bold text-ink">Qué ves:</li>
        {LEGEND.map(([c, t]) => (
          <li key={t} className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-sm" style={{ background: c }} />{t}</li>
        ))}
      </ul>
      <p className="mt-3 text-lg">
        <strong>El número grande</strong> es el índice FEV₁/FVC: la fracción de aire que se exhala en el primer segundo respecto a la FVC. <strong>Sano: {fmt(S0[treatment].ratio)} %. EPOC: {fmt(E[treatment].ratio)} %.</strong>
      </p>

      <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Button variant="ghost" className="-ml-3" onClick={toggleBreath}>
          {running ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}{running ? 'Pausar respiración' : 'Respirar'}
        </Button>
        <Button variant="ghost" onClick={reset}><RotateCcw size={16} aria-hidden />Restablecer</Button>
        <output className="text-ink/75">{mode === 'rest' ? `Ahora: ${b.limb === 'inf' ? 'inspirando' : 'espirando'}, presión ${fmt(b.P)} cmH₂O` : `Ahora: espiración forzada, segundo ${fmt(tSp, 2)}`}</output>
      </p>
    </>
  )
})

function Stage({ treatment, pickTreatment, mode, changeMode, vape, setVape, ...live }) {
  return (
    <Band id="simulador" theme="stage">
      <Head n="02" label="Simulador" title="Sano frente a *EPOC*"
        lead="Compara dos espirometrías realizadas el año pasado: un voluntario de 32 años con pulmones sanos y otro de 37 años que lleva 5 años vapeando de forma constante." />
      <HowTo className="mt-6" title="Cómo usarlo" items={[
        ['1. Tratamiento', 'Elige ver los pulmones antes o después de aplicar el broncodilatador salbutamol.'],
        ['2. Maniobra', '“Respiración” muestra el ciclo normal. “Espiración forzada” muestra exhalar con fuerza desde una inspiración máxima, como en la espirometría.'],
        ['3. Vapeo', 'Sube la exposición al vapeo y mira cómo cambia el pulmón de la derecha.'],
      ]} />

      <form className="mt-6 flex flex-wrap items-end gap-x-12 gap-y-4" onSubmit={noSubmit} aria-label="Controles del simulador">
        <fieldset><legend className="text-sm font-semibold text-muted">Tratamiento</legend><Tabs label="Tratamiento" value={treatment} onChange={pickTreatment} options={TREAT} /></fieldset>
        <fieldset><legend className="text-sm font-semibold text-muted">Maniobra</legend><Tabs label="Maniobra" value={mode} onChange={changeMode} options={MANEUVER} /></fieldset>
        <Slider className="max-w-xs" label="Exposición al vapeo" value={Math.round(vape * 100)} min={0} max={100} unit="%" onChange={(v) => setVape(v / 100)} color="var(--color-copd)" />
      </form>
      <StageLive treatment={treatment} mode={mode} vape={vape} {...live} />
    </Band>
  )
}

/* ───────── 2. salbutamol (estático: nunca se re-renderiza) ───────── */
const AIRWAYS = [
  { t: 'Persona sana', c: '#15803d', k: 0.1, drug: false, line: 'Voluntario sano: el FEV₁ casi no cambia.', n: `${fmt(S0.pre.fev1, 2)} → ${fmt(S0.post.fev1, 2)} L` },
  { t: 'EPOC, antes', c: '#be123c', k: 0.7, drug: false, line: 'Antes del broncodilatador.', n: `${fmt(E.pre.fev1, 2)} L` },
  { t: 'EPOC, después', c: '#1d4ed8', k: 0.5, drug: true, line: 'El músculo liso se relaja y el diámetro de la vía aumenta.', n: `${fmt(E.post.fev1, 2)} L (+${fmt(E.post.fev1 - E.pre.fev1, 2)})` },
]
const WHY = [
  ['Qué hace', 'Relaja el músculo liso que envuelve los bronquios y los bronquiolos, aumenta el diámetro de las vías aéreas y disminuye la resistencia al flujo del aire.'],
  ['Qué mostraron las espirometrías', 'En la persona sana el FEV₁ pasó de 2,08 a 2,10 L. En la persona con EPOC pasó de 0,95 a 1,02 L.'],
  ['Familias de broncodilatadores', 'Se agrupan en tres: agonistas beta-2 adrenérgicos, anticolinérgicos y metilxantinas.'],
]
const SalbutamolBand = memo(function SalbutamolBand() {
  return (
    <Band id="salbutamol" theme="drug">
      <h2 className="text-4xl sm:text-6xl"><Split text="¿Qué hace el *salbutamol*?" /></h2>
      <Rv as="p" d={300} className="mt-4 max-w-3xl text-lg text-ink/75 sm:text-xl">
        El salbutamol es un medicamento que abre los bronquios y las vías respiratorias por las que entra el aire a los pulmones. Es un broncodilatador: relaja el músculo liso que envuelve los bronquios. Así se ve un bronquio cortado de lado:
      </Rv>
      <ul className="mt-8 grid gap-8 md:grid-cols-3">
        {AIRWAYS.map((x, i) => (
          <Rv as="li" key={x.t} d={i * 120} kind="rv-s">
            <figure>
              <figcaption><strong className="block text-2xl font-extrabold" style={{ color: x.c }}>{x.t}</strong><span className="text-ink/80">{x.line}</span></figcaption>
              <AirwayCross className="mx-auto my-3 max-w-[230px]" contraction={x.k} drug={x.drug} title={`Corte de bronquio: ${x.t}`} />
              <p className="text-sm font-semibold text-muted">FEV₁ (aire exhalado en el primer segundo)</p>
              <strong className="font-display text-3xl font-semibold tabular-nums" style={{ color: x.c }}>{x.n}</strong>
            </figure>
          </Rv>
        ))}
      </ul>
      <ul className="mt-8 grid gap-6 md:grid-cols-3">
        {WHY.map(([t, d], i) => (
          <Rv as="li" key={t} d={i * 100}><h3 className="text-xl font-extrabold">{t}</h3><p className="mt-1 text-ink/75">{d}</p></Rv>
        ))}
      </ul>
    </Band>
  )
})

/* ───────── 3. espirometría (solo se re-renderiza al mover el tiempo o el tratamiento) ───────── */
const SpiroBand = memo(function SpiroBand({ treatment, pickTreatment, tSp, setTSp, grabTime, playingF, playForced, speed, setSpeed, dE, post }) {
  const trapBase = dE * (post ? 0.93 : 1)
  const fS = groupView({ group: 'sano', mode: 'forced', t: tSp, treatment, dmg: 0, restV: 0, trapBase: 0 })
  const fE = groupView({ group: 'epoc', mode: 'forced', t: tSp, treatment, dmg: dE, restV: 0, trapBase })
  const exS = exhale('sano', treatment, tSp)
  const exE = exhale('epoc', treatment, tSp)
  const people = [['Sano', '#15803d', fS, 'sano', 0, exS], ['EPOC', '#be123c', fE, 'epoc', dE, exE]]
  return (
    <Band id="espirometria" theme="spiro">
      <h2 className="text-4xl sm:text-6xl"><Split text="La espirometría: soplar para *medir*" /></h2>
      <Rv as="p" d={300} className="mt-4 max-w-3xl text-lg text-ink/75 sm:text-xl">
        Es la prueba de función respiratoria más estandarizada. Evalúa las propiedades mecánicas del sistema respiratorio y es el estándar de oro para identificar obstrucción al flujo aéreo. Mide flujos y volúmenes de aire exhalado desde una inspiración máxima. Es sencilla, rápida y no invasiva.
      </Rv>
      <section className="mt-6 grid gap-6 lg:grid-cols-2" aria-label="Cómo leer la gráfica">
        <HowTo title="Qué muestra esta gráfica" items={[
          ['Compara', 'a una persona sana (verde) con una con EPOC (roja), en el mismo soplido.'],
          ['Eje horizontal', 'segundos desde que empiezas a soplar.'],
          ['Eje vertical', 'litros de aire acumulados que se han expulsado.'],
          ['Líneas', 'discontinua = antes del salbutamol; continua = después. La más gruesa es la que elegiste.'],
          ['Qué notar', 'fíjate en qué tan inclinada sube la curva: si sube empinada al inicio, el aire salió en muy poco tiempo. La meseta, cuando la curva se aplana, indica que ya no sale más aire.'],
        ]} />
        <HowTo title="Tres números que debes conocer" items={[
          ['FVC', 'capacidad vital forzada: el aire exhalado con fuerza después de una inhalación total (la línea punteada horizontal).'],
          ['FEV₁', 'volumen espiratorio forzado: el aire exhalado abruptamente en un segundo (la línea vertical marcada 1 s).'],
          ['FEV₁/FVC', 'la fracción de aire que se exhala en el primer segundo respecto a la FVC. Sano ≈ 72 %, EPOC ≈ 55 %.'],
        ]} />
      </section>

      <form className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-3" onSubmit={noSubmit}>
        <fieldset><legend className="text-sm font-semibold text-muted">Tratamiento</legend><Tabs label="Tratamiento" value={treatment} onChange={pickTreatment} options={TREAT} /></fieldset>
        <p className="text-lg font-semibold">Arrastra el cursor sobre la curva o pulsa Reproducir: los pulmones se vacían al ritmo de cada curva.</p>
      </form>

      <section className="mt-4 grid gap-8 lg:grid-cols-[1.5fr_1fr]" aria-label="Espirometría">
        <figure>
          <SpirometryChart t={tSp} onT={setTSp} onGrab={grabTime} treatment={treatment} />
          <form className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3" onSubmit={noSubmit}>
            <Button onClick={playForced}>{playingF ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}{playingF ? 'Pausar' : 'Reproducir'}</Button>
            <Tabs label="Velocidad" value={speed} onChange={setSpeed} options={SPEEDS} />
            <Slider className="min-w-[220px]" label="Segundo del soplido" value={tSp} min={0} max={T_MAX_S} step={0.05} display={`${fmt(tSp, 2)} s`} onChange={(v) => { grabTime(); setTSp(v) }} color="var(--color-ink)" />
          </form>
        </figure>
        <ul className="grid grid-cols-2 gap-4">
          {people.map(([n, c, v, k, d, x]) => (
            <li key={n}>
              <h3 className="text-lg font-extrabold" style={{ color: c }}>{n}</h3>
              <Lungs className="mx-auto max-w-[150px]" kind={k} scale={v.scale} fill={v.fill} damage={d} trapped={v.trapped} flow={v.flow} caliber={v.caliber} drug={k === 'epoc' && post} zoom={false} title={`Pulmones ${n} durante la espiración forzada`} />
              <p className="font-display text-4xl font-semibold tabular-nums" style={{ color: c }}>{fmt(x.V, 2)}<span className="ml-1 font-sans text-sm font-normal tracking-normal text-muted">L sacados</span></p>
              <p className="text-sm text-ink/70">Le queda {fmt(x.rem * 100, 0)} % del aire</p>
            </li>
          ))}
        </ul>
      </section>
      <Note label={`Qué notas en el segundo ${fmt(tSp, 2)}`} className="mt-6">
        El pulmón sano ya sacó el {fmt((1 - exS.rem) * 100, 0)} % de su aire; el de EPOC, solo el {fmt((1 - exE.rem) * 100, 0)} %. {tSp >= 1 ? '' : 'Mira cuánto cambia en el primer segundo.'}
      </Note>
      <details className="mt-5 overflow-x-auto">
        <summary className="hov inline-block cursor-pointer font-semibold ulink">Ver la tabla con todos los datos medidos</summary>
        <ResultsTable treatment={treatment} />
      </details>
      <Note label="Valores esperados e índice Z" className="mt-6">
        El voluntario 1 obtiene una FVC de 2,88 L frente a un valor teórico de 2,84 L, y un índice Z de +0,11. El voluntario 2 queda por debajo de lo esperado: su FVC tiene un índice Z de −0,87, pero la desviación más marcada está en el FEV₁ (Z = −2,16) y en el FEV₁/FVC (Z = −2,40), coherentes con un patrón obstructivo. Se considera crítico un valor cercano a −1,645.
      </Note>
    </Band>
  )
})

/* ───────── 4. mecánica ───────── */
const MechCharts = memo(function MechCharts({ playing, manualP, manualLimb, mS, mE, Teff, T, r, setR, onPV, grabPV }) {
  const [ref, visible] = useVisible()
  const b = useBreath(playing && visible, manualP, manualLimb)
  const Pc = laplaceP(Teff, r)
  const status = Pc > b.P ? ['#be123c', 'Tiende a cerrarse (colapsa)'] : mE.d > 0.5 ? ['#be123c', 'Se mantiene abierto, con paredes dañadas'] : ['#15803d', 'Se mantiene abierto']
  return (
    <section ref={ref} className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14" aria-label="Gráficas de mecánica pulmonar">
      <article>
        <h3 className="text-2xl sm:text-3xl">¿Cuánto se infla el pulmón con cada presión?</h3>
        <HowTo className="mt-3" title="Cómo leerla" items={[
          ['Compara', 'el pulmón sano (verde) con el de EPOC (rojo).'],
          ['Horizontal', 'la presión con la que se infla; vertical: cuánto aire cabe (litros).'],
          ['Línea continua', 'al inspirar; punteada: al espirar.'],
          ['Qué notar', 'cuando se altera el equilibrio del surfactante, cambia la relación presión-volumen.'],
        ]} />
        <p className="mt-4 font-semibold">Arrastra los puntos sobre la curva: a la derecha inflas, a la izquierda desinflas.</p>
        <PVChart P={b.P} limb={b.limb} mS={mS} mE={mE} onGrab={grabPV} onChange={onPV} />
        <p className="mt-3 text-lg">Al final de espirar (2 cmH₂O) al pulmón sano le quedan <strong className="num">{fmt(volume(mS, 2, 'def'))} L</strong> y al de EPOC <strong className="num text-copd">{fmt(volume(mE, 2, 'def'))} L</strong>.</p>
      </article>
      <article>
        <h3 className="text-2xl sm:text-3xl">¿Por qué los alvéolos pequeños se cierran?</h3>
        <HowTo className="mt-3" title="Cómo leerla" items={[
          ['Muestra', 'la presión que necesita un alvéolo para no cerrarse (vertical) según su tamaño (horizontal), con la regla P = 2T/r.'],
          ['Tres líneas', 'sin surfactante (roja punteada), con surfactante normal (verde) y con tu nivel de vapeo (cian).'],
          ['Qué notar', 'cuanto más pequeño el radio (izquierda), mayor la presión. El surfactante evita que la tensión suba; con vapeo la línea cian sube hacia la roja.'],
        ]} />
        <p className="mt-4 font-semibold">Arrastra sobre la gráfica para cambiar el tamaño del alvéolo.</p>
        <Suspense fallback={<p className="h-72 text-muted">Cargando gráfica…</p>}>
          <LaplaceChart r={Math.round(r)} onR={setR} T={T} Teff={Teff} />
        </Suspense>
        <ul className="mt-3 grid grid-cols-3 gap-4">
          <li><p className="text-sm text-muted">Tensión superficial con vapeo</p><output className="font-display text-3xl font-semibold tabular-nums" style={{ color: '#0e7490' }}>{fmt(Teff)}<span className={unit}>mN/m</span></output></li>
          <li><p className="text-sm text-muted">Presión para abrirlo</p><output className="font-display text-3xl font-semibold tabular-nums">{fmt(Pc)}<span className={unit}>cmH₂O</span></output></li>
          <li><p className="text-sm text-muted">Presión disponible</p><output className="font-display text-3xl font-semibold tabular-nums">{fmt(b.P)}<span className={unit}>cmH₂O</span></output></li>
        </ul>
        <p className="mt-2 text-xl font-extrabold" style={{ color: status[0] }}>{status[1]}</p>
      </article>
    </section>
  )
})

const MechBand = memo(function MechBand({ vape, setVape, T, setT, r, setR, ...charts }) {
  return (
    <Band id="mecanica" theme="mech">
      <h2 className="text-4xl sm:text-6xl"><Split text="Por dentro: presión, volumen y *Laplace*" /></h2>
      <Rv as="p" d={300} className="mt-4 max-w-3xl text-lg text-ink/75 sm:text-xl">Dos gráficas: la relación presión-volumen y la ley de Laplace. Los deslizadores de abajo cambian ambas.</Rv>
      <form className="mt-6 grid gap-6 sm:grid-cols-3" onSubmit={noSubmit}>
        <Slider label="Exposición al vapeo" value={Math.round(vape * 100)} min={0} max={100} unit="%" onChange={(v) => setVape(v / 100)} color="var(--color-copd)" />
        <Slider label="Tensión superficial basal (T, mN/m)" value={T} min={5} max={40} onChange={setT} color="#0e7490" />
        <Slider label="Tamaño del alvéolo (radio, µm)" value={r} min={40} max={140} onChange={setR} />
      </form>
      <MechCharts T={T} r={r} setR={setR} {...charts} />
      <p className="mt-8 text-ink/70">Son modelos didácticos: sirven para entender las tendencias, no para calcular valores clínicos.</p>
    </Band>
  )
})

/* ───────── contenedor de estado (ya no se re-renderiza con la respiración) ───────── */
export default function Simulator() {
  const reduced = prefersReduced()
  const [treatment, setTreatment] = useState('pre')
  const [mode, setMode] = useState('rest')
  const [vape, setVape] = useState(0.7)
  const [T, setT] = useState(10)
  const [r, setR] = useState(80)
  const [breathing, setBreathing] = useState(!reduced)
  const [manualP, setManualP] = useState(10)
  const [limb, setLimb] = useState('inf')
  const [tSp, setTSp] = useState(1)
  const [playingF, setPlayingF] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [puffKey, setPuffKey] = useState(0)

  // La espiración forzada avanza a ritmo real (o más lento) solo mientras se reproduce
  useEffect(() => {
    if (!playingF) return
    let raf, last = performance.now()
    const loop = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      let done = false
      setTSp((t) => { const n = t + dt * speed; if (n >= T_MAX_S) { done = true; return T_MAX_S } return n })
      if (done) setPlayingF(false)
      else raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playingF, speed])

  const post = treatment === 'post'
  const Teff = tensionEff(T, vape)
  const mS = useMemo(() => ({ d: 0, s: surfFrac(T) }), [T])
  const dE = 0.85 * vape
  const mE = useMemo(() => ({ d: dE, s: surfFrac(Teff) }), [dE, Teff])

  const pickTreatment = useCallback((v) => { setTreatment(v); if (v === 'post') setPuffKey((k) => k + 1) }, [])
  const grabTime = useCallback(() => { setMode('forced'); setPlayingF(false) }, [])
  const grabPV = useCallback(() => { setMode('rest'); setBreathing(false); setPlayingF(false) }, [])
  const onPV = useCallback((p, l) => { setManualP(p); setLimb(l) }, [])
  const playForced = useCallback(() => {
    setMode('forced'); setBreathing(false)
    if (playingF) { setPlayingF(false); return }
    if (tSp >= T_MAX_S - 0.05) setTSp(0)
    setPlayingF(true)
  }, [playingF, tSp])
  const changeMode = (m) => { setMode(m); if (m === 'rest') { setBreathing(true); setPlayingF(false) } else setBreathing(false) }
  const reset = () => { setVape(0.7); setT(10); setR(80); setTreatment('pre'); setMode('rest'); setBreathing(true); setTSp(1); setPlayingF(false) }

  return (
    <>
      <Stage treatment={treatment} pickTreatment={pickTreatment} mode={mode} changeMode={changeMode} vape={vape} setVape={setVape}
        dE={dE} post={post} puffKey={puffKey} breathing={breathing} tSp={tSp} manualP={manualP} limb={limb} mS={mS} mE={mE}
        setManualP={setManualP} setLimb={setLimb} setMode={setMode} setBreathing={setBreathing} setPlayingF={setPlayingF} reset={reset} />
      <SalbutamolBand />
      <SpiroBand treatment={treatment} pickTreatment={pickTreatment} tSp={tSp} setTSp={setTSp} grabTime={grabTime} playingF={playingF} playForced={playForced}
        speed={speed} setSpeed={setSpeed} dE={dE} post={post} />
      <MechBand vape={vape} setVape={setVape} T={T} setT={setT} r={r} setR={setR} playing={mode === 'rest' && breathing} manualP={manualP} manualLimb={limb}
        mS={mS} mE={mE} Teff={Teff} onPV={onPV} grabPV={grabPV} />
    </>
  )
}
