import { useState } from 'react'
import { Band, Head, Tabs, Slider, Button, Rv, Split, Tri, Note } from '../components/ui'
import AlveolusZoom from '../components/AlveolusZoom'
import { reveal } from '../lib/reveal'
import { laplaceP, fmt } from '../lib/physics'

/* ── 1. cifras ── */
function Facts() {
  const big = 'font-display font-extrabold leading-[0.85] tracking-tighter'
  return (
    <Band theme="facts">
      <Head n="01" label="Situación problema" title="Una enfermedad vieja, un nuevo *sospechoso*"
        lead="Históricamente, la causa principal de la Enfermedad Pulmonar Obstructiva Crónica (EPOC) es el consumo de tabaco. En los últimos años aumentó el uso de vapeadores entre la población joven." />
      <ul className="mt-10 grid items-end gap-10 lg:grid-cols-2 lg:gap-16">
        <li ref={reveal}>
          <p className="mask"><span className={`${big} text-[clamp(6rem,16vw,11rem)] text-[#be123c]`}>3.ª</span></p>
          <hr className="draw mt-5 h-[3px] border-0 bg-[#be123c]" style={{ '--d': '500ms' }} />
          <p className="rv mt-4 text-xl font-semibold" style={{ '--d': '700ms' }}>causa de muerte en el mundo es la EPOC, según la OMS.</p>
          <p className="rv mt-1 text-muted" style={{ '--d': '800ms' }}><cite className="not-italic">Fuente: Organización Mundial de la Salud (OMS), 2026.</cite></p>
        </li>
        <li ref={reveal}>
          <p className="mask"><span className={`${big} flex items-center gap-4 text-[clamp(3.2rem,8vw,6rem)] italic text-[#0369a1]`}><Tri dir="up" className="!h-[0.5em] !w-[0.5em]" />vapeo</span></p>
          <hr className="draw mt-5 h-[3px] border-0 bg-[#0369a1]" style={{ '--d': '700ms' }} />
          <p className="rv mt-4 text-xl font-semibold" style={{ '--d': '900ms' }}>aumenta entre la población joven.</p>
          <p className="rv mt-1 text-muted" style={{ '--d': '1000ms' }}><cite className="not-italic">Fuente: Ministerio de Salud y Protección Social, 2025.</cite></p>
        </li>
      </ul>
    </Band>
  )
}

function Question() {
  return (
    <Band theme="question">
      <h2 className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--accent)' }}>Pregunta problema</h2>
      <p className="mt-4 max-w-5xl font-display text-3xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-5xl">
        <Split step={55} text="¿De qué manera el consumo de vapeadores afecta la biomecánica ventilatoria a nivel alveolar causando EPOC y cómo responde este proceso mecánico al tratamiento farmacológico?" />
      </p>
      <Rv as="p" d={800} className="mt-5 max-w-3xl text-lg text-slate-300"><strong className="text-white">Objetivo general.</strong> Explicar mediante un modelo interactivo los fenómenos físicos que afectan al surfactante pulmonar.</Rv>
    </Band>
  )
}

/* ── 2. qué es un alvéolo ── */
const INSIDE = [
  ['Qué es el alvéolo', 'Bolsa diminuta llena de aire al final de los bronquiolos. Allí el oxígeno pasa a la sangre y el dióxido de carbono pasa de la sangre al alvéolo y se expulsa al espirar.'],
  ['Qué hace el surfactante', 'Es una mezcla de lípidos y proteínas. Reduce la tensión superficial en el alvéolo para evitar que colapse durante la espiración.'],
  ['Qué es el enfisema', 'Es uno de los dos tipos de afección de la EPOC. Las paredes entre los sacos de aire están dañadas y cuesta más sacar el aire.'],
]
function Inside() {
  return (
    <Band theme="inside">
      <h2 className="text-4xl sm:text-6xl"><Split text="El *alvéolo* y el enfisema" /></h2>
      <Rv as="p" d={300} className="mt-4 max-w-3xl text-lg text-ink/75 sm:text-xl">La EPOC es una enfermedad obstructiva crónica causada por lesiones en las vías respiratorias. Puede causar inflamación y otros problemas que bloquean el flujo de aire y dificultan la respiración. Este proyecto se centra en el enfisema. Así se compara un alvéolo normal con uno con enfisema:</Rv>
      <section className="mt-8 grid gap-8 sm:grid-cols-2 lg:gap-16" aria-label="Comparación de alvéolos">
        <Rv as="figure" kind="rv-s">
          <figcaption className="mb-3"><strong className="block text-2xl font-extrabold text-[#15803d]">Alvéolos sanos</strong><span className="text-ink/70">Paredes íntegras entre los sacos de aire.</span></figcaption>
          <AlveolusZoom className="mx-auto max-w-[360px]" kind="sano" damage={0} trapped={0} caliber={1} scale={1} title="Alvéolos sanos con paredes íntegras" />
        </Rv>
        <Rv as="figure" kind="rv-s" d={150}>
          <figcaption className="mb-3"><strong className="block text-2xl font-extrabold text-[#be123c]">Alvéolos con enfisema</strong><span className="text-ink/70">Paredes dañadas entre los sacos de aire: mayor dificultad para sacar el aire.</span></figcaption>
          <AlveolusZoom className="mx-auto max-w-[360px]" kind="epoc" damage={0.7} trapped={0.45} caliber={0.6} scale={1} title="Alvéolos con enfisema y paredes rotas" />
        </Rv>
      </section>
      <ul className="mt-10 grid gap-8 md:grid-cols-3">
        {INSIDE.map(([t, d], i) => (
          <Rv as="li" key={t} d={i * 100}>
            <h3 className="text-xl font-extrabold">{t}</h3>
            <p className="mt-1 text-ink/75">{d}</p>
          </Rv>
        ))}
      </ul>
    </Band>
  )
}

/* ── 3. qué le hace el vapeo ── */
const COMP = [
  ['Nicotina y saborizantes', 'El aerosol contiene nicotina en algunos casos, saborizantes y otros químicos.'],
  ['NNN y NNK', 'n-nitrosonornicotina y nitrosamina cetona: sustancias cancerígenas presentes en el aerosol.'],
  ['Metales pesados', 'También se han encontrado metales pesados.'],
  ['De dónde viene el daño', 'Principalmente de materiales como los saborizantes y el tabaco, y de las sustancias cancerígenas.'],
]
const STEPS = [
  { t: 'Inhalación del aerosol', d: 'El vapeador es un dispositivo de batería que permite inhalar un aerosol con nicotina (en algunos casos), saborizantes y otros químicos.', v: { kind: 'sano', damage: 0, trapped: 0, aerosol: 1 } },
  { t: 'Surfactante alterado', d: 'La exposición a los vapeadores altera el surfactante. Cuando se rompe su equilibrio, cambia la relación presión-volumen.', v: { kind: 'epoc', damage: 0.2, trapped: 0.1, aerosol: 0.6 } },
  { t: 'Alvéolos pequeños se cierran', d: 'Por la relación tensión-radio (ley de Laplace), el surfactante alterado favorece el colapso y el cierre temprano de los alvéolos pequeños.', v: { kind: 'epoc', damage: 0.65, trapped: 0.35, aerosol: 0.3 } },
  { t: 'Patrón obstructivo', d: 'En el enfisema las paredes de los alvéolos están tan juntas que no permiten distenderse. El resultado es un patrón obstructivo, como se ve en la espirometría.', v: { kind: 'epoc', damage: 0.95, trapped: 0.9, aerosol: 0 } },
]
function Pathway() {
  const [i, setI] = useState(0)
  const S = STEPS[i]
  return (
    <Band theme="path">
      <h2 className="text-4xl sm:text-6xl"><Split text="¿Qué le hace el vapeo al *alvéolo*?" /></h2>
      <Rv as="p" d={300} className="mt-4 max-w-3xl text-lg text-ink/75 sm:text-xl">Los vapeadores, también llamados cigarrillos electrónicos, son dispositivos que dependen de baterías y permiten inhalar un aerosol. Este es su contenido y su efecto en el alvéolo:</Rv>

      <ul className="mt-8 grid gap-x-12 gap-y-5 sm:grid-cols-2">
        {COMP.map(([k, d], n) => (
          <Rv as="li" key={k} d={n * 80} className="text-ink/75"><strong className="block text-xl font-extrabold text-ink">{k}</strong>{d}</Rv>
        ))}
      </ul>

      <section className="mt-12 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16" aria-label="Avance del daño">
        <AlveolusZoom ref={reveal} className="rv-s mx-auto max-w-[420px]" {...S.v} caliber={1 - 0.4 * S.v.damage} scale={1} title={`Alvéolo en el paso ${i + 1}: ${S.t}`} />
        <section>
          <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--accent)' }}>Así avanza el daño. Toca cada paso y mira el alvéolo</h3>
          <ol className="mt-3 divide-y divide-black/10 border-y border-black/10">
            {STEPS.map((s, n) => (
              <Rv as="li" kind="rv-l" key={s.t} d={150 + n * 100}>
                <button onClick={() => setI(n)} aria-current={n === i ? 'step' : undefined} className="group flex min-h-16 w-full cursor-pointer items-baseline gap-5 py-3.5 text-left">
                  <span className="num text-sm" style={{ color: n === i ? 'var(--accent)' : '#4a6272' }}>0{n + 1}</span>
                  <span className="flex-1">
                    <strong className={`ghov block text-2xl tracking-tight ${n === i ? 'font-extrabold text-ink' : 'font-medium text-muted'}`}>{s.t}</strong>
                    {n === i && <span className="mt-1 block text-ink/75">{s.d}</span>}
                  </span>
                </button>
              </Rv>
            ))}
          </ol>
        </section>
      </section>

      <Note label="Efectos reportados del vapeador" className="mt-10">
        Boca y faringe secas, tos, sensación de quemadura en boca, labios y faringe, dolor de cabeza, palpitaciones, problemas para respirar, mareo, disminución del gusto y somnolencia. También manifestaciones respiratorias y gastrointestinales, y enfermedades cardiovasculares como el infarto de miocardio, según el historial del usuario.
      </Note>
    </Band>
  )
}

/* ── 4. tres ideas, con demo ── */
function Tension() {
  const [on, setOn] = useState(true)
  return (
    <figure>
      <svg viewBox="0 0 240 120" className="w-full max-w-md" role="img" aria-label="Interfaz aire-agua con o sin surfactante">
        <rect x="0" y="66" width="240" height="54" fill="#dbeafe" />
        <path d="M0 66 H240" stroke="#1d4ed8" strokeWidth={on ? 1.5 : 5} style={{ transition: 'stroke-width .4s' }} />
        {Array.from({ length: 19 }, (_, i) => (
          <g key={i}>
            {on && <g stroke="#0e7490"><circle cx={10 + i * 12.2} cy={62} r="3.2" fill="#0e7490" /><path d={`M${10 + i * 12.2} 65 v9`} strokeWidth="1.5" /></g>}
            <circle cx={10 + i * 12.2} cy={82 + (i % 3) * 12} r="3" fill="#1d4ed8" opacity=".35" />
          </g>
        ))}
        <text x="120" y="30" textAnchor="middle" fontSize="12" fill="#4a6272">aire dentro del alvéolo</text>
        <text x="120" y="112" textAnchor="middle" fontSize="12" fill="#1e3a8a">capa de agua</text>
      </svg>
      <figcaption className="mt-3 flex max-w-md items-end justify-between gap-6">
        <Tabs label="Surfactante" value={on} onChange={setOn} options={[{ value: true, label: 'Con surfactante', color: '#0e7490' }, { value: false, label: 'Sin surfactante', color: '#be123c' }]} />
        <output className="font-display text-4xl font-semibold tabular-nums">{on ? '0–2' : 'alta'}<span className="ml-1 font-sans text-sm font-normal tracking-normal text-muted">mN/m</span></output>
      </figcaption>
      <p className="mt-2 max-w-md text-sm text-muted">Los palitos cian son moléculas de surfactante. El número es la tensión superficial en mN/m. Con surfactante baja a valores cercanos a 0–2 mN/m.</p>
    </figure>
  )
}
function Laplace() {
  const [r, setR] = useState(80)
  const [T, setT] = useState(25)
  const P = laplaceP(T, r)
  return (
    <figure>
      <p className="font-display text-6xl font-extrabold italic tracking-tighter text-drug sm:text-7xl">P = <span className="whitespace-nowrap">2T/r</span></p>
      <form className="mt-4 grid max-w-lg gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        <Slider label="Tensión T (mN/m)" value={T} min={5} max={70} onChange={setT} color="#0e7490" />
        <Slider label="Tamaño r (µm)" value={r} min={40} max={140} onChange={setR} />
      </form>
      <figcaption className="mt-3 font-display text-5xl font-semibold tabular-nums">{fmt(P)} <span className="font-sans text-base font-normal tracking-normal text-muted">cmH₂O: presión P del alvéolo</span></figcaption>
    </figure>
  )
}
const SALB = [
  ['Músculo liso', 'Un músculo liso envuelve los bronquios y los bronquiolos.'],
  ['Relaja el músculo', 'El efecto principal de un broncodilatador es relajar ese músculo liso.'],
  ['Aumenta el diámetro', 'Al relajarse el músculo, las vías aéreas se hacen más anchas.'],
  ['Menos resistencia', 'Disminuye la resistencia al flujo del aire. El salbutamol abre los bronquios y las vías por las que entra el aire a los pulmones.'],
]
function Salbutamol() {
  const [s, setS] = useState(0)
  return (
    <figure className="grid items-center gap-6 sm:grid-cols-[170px_1fr]">
      <svg viewBox="0 0 120 120" className="w-full max-w-[170px]" role="img" aria-label="Bronquio cuya luz se ensancha">
        <circle cx="60" cy="60" r="54" fill="#ffe4e6" stroke="#be123c" strokeWidth={s === 0 ? 8 : 4} style={{ transition: 'all .5s' }} />
        <circle cx="60" cy="60" r={14 + s * 8} fill="#fff" stroke="#1d4ed8" strokeWidth="2.5" style={{ transition: 'r .6s cubic-bezier(.3,.8,.3,1)' }} />
        <text x="60" y="64" textAnchor="middle" fontSize="10" fill="#1e3a8a">aire</text>
      </svg>
      <figcaption>
        <strong className="font-display text-2xl font-extrabold tracking-tight">{s + 1}. {SALB[s][0]}</strong>
        <span className="mt-1 block min-h-[72px] text-ink/75">{SALB[s][1]}</span>
        <span className="mt-2 flex gap-2">
          <Button variant="ghost" onClick={() => setS(Math.max(0, s - 1))} disabled={s === 0}><Tri dir="left" />Anterior</Button>
          <Button variant="drug" onClick={() => setS(Math.min(3, s + 1))} disabled={s === 3}>Siguiente<Tri /></Button>
        </span>
      </figcaption>
    </figure>
  )
}

const IDEAS = [
  { v: 'st', label: 'Tensión superficial', simple: 'Es una propiedad de la superficie de un líquido que hace que se comporte como una película delgada y elástica que mantiene unido al líquido. Surge de las fuerzas de cohesión entre sus moléculas.', why: 'El surfactante reduce la tensión superficial en la interfase aire-líquido del alvéolo para evitar su colapso al espirar.', demo: Tension },
  { v: 'lp', label: 'Ley de Laplace', simple: 'A medida que aumenta el radio de una esfera, disminuye el gradiente de presión a través de la pared. Y a medida que aumenta la tensión superficial, aumenta ese gradiente. Se escribe P = 2T/r.', why: 'P es la presión o tendencia del alvéolo a contraerse o abrirse, T la tensión superficial y r el radio. Prueba los deslizadores.', demo: Laplace },
  { v: 'sb', label: 'Salbutamol', simple: 'Es un medicamento que abre los bronquios y las vías respiratorias por las que entra el aire a los pulmones. Sirve para tratar dificultades para respirar producidas por diferentes enfermedades.', why: 'Es un broncodilatador: relaja el músculo liso que envuelve los bronquios y los bronquiolos.', demo: Salbutamol },
]
function Ideas() {
  const [v, setV] = useState('st')
  const cur = IDEAS.find((x) => x.v === v)
  const Demo = cur.demo
  return (
    <Band theme="ideas">
      <h2 className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--accent)' }}>Tres ideas para el simulador</h2>
      <Rv>
        <Tabs label="Concepto" value={v} onChange={setV} className="mt-3 flex-wrap !gap-x-8 [&_button]:pb-1 [&_button]:font-display [&_button]:text-3xl [&_button]:font-extrabold [&_button]:tracking-tight sm:[&_button]:text-5xl"
          options={IDEAS.map((x) => ({ value: x.v, label: x.label }))} />
      </Rv>
      <article key={v} className="pop-in mt-6 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <section>
          <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-ink/60">En palabras simples</h3>
          <p className="mt-1 text-lg text-ink/85">{cur.simple}</p>
          <h3 className="mt-5 font-sans text-xs font-bold uppercase tracking-[0.14em] text-ink/60">Por qué importa aquí</h3>
          <p className="mt-1 text-lg font-semibold">{cur.why}</p>
        </section>
        <Demo />
      </article>
    </Band>
  )
}

/* ── 5. glosario ── */
const GLOS = [
  ['Alvéolo', 'Bolsa diminuta llena de aire al final de los bronquiolos, donde se intercambian oxígeno y dióxido de carbono.'],
  ['Surfactante', 'Mezcla de lípidos y proteínas que reduce la tensión superficial del alvéolo.'],
  ['Tensión superficial', 'Propiedad que hace que la superficie de un líquido se comporte como una película elástica.'],
  ['Ley de Laplace', 'P = 2T/r: relaciona la presión, la tensión superficial y el radio.'],
  ['EPOC', 'Enfermedad que obstruye de forma persistente el flujo de aire.'],
  ['Enfisema', 'Daño en las paredes entre los sacos de aire; cuesta más sacar el aire.'],
  ['Vapeador', 'Cigarrillo electrónico: dispositivo de batería que permite inhalar un aerosol.'],
  ['Broncodilatador', 'Fármaco que relaja el músculo liso de bronquios y bronquiolos.'],
  ['Espirometría', 'Prueba que mide flujos y volúmenes de aire exhalado desde una inspiración máxima.'],
  ['FVC', 'Capacidad vital forzada: aire exhalado con fuerza tras una inhalación total.'],
  ['FEV₁', 'Volumen espiratorio forzado en el primer segundo.'],
  ['FEV₁/FVC', 'Fracción del aire que se exhala en el primer segundo respecto a la FVC.'],
]
function Glossary() {
  return (
    <Band id="problema" theme="gloss">
      <h2 className="text-3xl sm:text-5xl"><Split text="Glosario *rápido*" /></h2>
      <p className="mt-2 text-lg text-ink/70">Las palabras que aparecen en toda la página.</p>
      <ul className="mt-6 grid gap-x-14 sm:grid-cols-2">
        {GLOS.map(([k, d], i) => (
          <Rv as="li" key={k} d={(i % 5) * 60} className="border-t border-black/10 py-3 text-ink/75">
            <dfn className="font-extrabold not-italic text-ink">{k}. </dfn>{d}
          </Rv>
        ))}
      </ul>
    </Band>
  )
}

export default function Problem() {
  return (
    <>
      <Glossary />
      <Facts />
      <Question />
      <Inside />
      <Pathway />
      <Ideas />
    </>
  )
}
