import { useState } from 'react'
import { Band, Head, Tabs, Slider, Button, Rv, Split, Tri, Note } from '../components/ui'
import AlveolusZoom from '../components/AlveolusZoom'
import { reveal } from '../lib/reveal'
import { laplaceP, fmt, T_MAX } from '../lib/physics'

/* ── 1. cifras ── */
function Facts() {
  const big = 'font-display font-extrabold leading-[0.85] tracking-tighter'
  return (
    <Band id="problema" theme="facts">
      <Head n="01" label="Situación problema" title="Una enfermedad vieja, un nuevo *sospechoso*"
        lead="La EPOC es una enfermedad que hace cada vez más difícil sacar el aire de los pulmones. Durante décadas se la asoció casi solo con fumar cigarrillo. Hoy aparece otra pregunta: ¿qué le pasa al pulmón de un joven que vapea?" />
      <ul className="mt-10 grid items-end gap-10 lg:grid-cols-2 lg:gap-16">
        <li ref={reveal}>
          <p className="mask"><span className={`${big} text-[clamp(6rem,16vw,11rem)] text-[#be123c]`}>3.ª</span></p>
          <hr className="draw mt-5 h-[3px] border-0 bg-[#be123c]" style={{ '--d': '500ms' }} />
          <p className="rv mt-4 text-xl font-semibold" style={{ '--d': '700ms' }}>causa de muerte en el mundo es la EPOC.</p>
          <p className="rv mt-1 text-muted" style={{ '--d': '800ms' }}>Es decir, solo hay dos causas de muerte más frecuentes. <cite className="not-italic">Fuente: Organización Mundial de la Salud (OMS).</cite></p>
        </li>
        <li ref={reveal}>
          <p className="mask"><span className={`${big} flex items-center gap-4 text-[clamp(3.2rem,8vw,6rem)] italic text-[#0369a1]`}><Tri dir="up" className="!h-[0.5em] !w-[0.5em]" />vapeo</span></p>
          <hr className="draw mt-5 h-[3px] border-0 bg-[#0369a1]" style={{ '--d': '700ms' }} />
          <p className="rv mt-4 text-xl font-semibold" style={{ '--d': '900ms' }}>crece entre los jóvenes, un grupo que antes fumaba menos.</p>
          <p className="rv mt-1 text-muted" style={{ '--d': '1000ms' }}><cite className="not-italic">Fuente: Ministerio de Salud y Protección Social, 2025.</cite></p>
        </li>
      </ul>
    </Band>
  )
}

function Question() {
  return (
    <Band theme="question">
      <h2 className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--accent)' }}>La pregunta que guía todo el proyecto</h2>
      <p className="mt-4 max-w-5xl font-display text-3xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-5xl">
        <Split step={55} text="¿Cómo afecta el vapeo la biomecánica ventilatoria a nivel alveolar, causando EPOC, y cómo responde este proceso al tratamiento farmacológico?" />
      </p>
      <Rv as="p" d={800} className="mt-5 max-w-3xl text-lg text-slate-300">En palabras simples: ¿qué le pasa a la mecánica de la respiración, dentro de las bolsitas de aire del pulmón, cuando se vapea? ¿Y cómo ayuda un medicamento?</Rv>
    </Band>
  )
}

/* ── 2. qué es un alvéolo ── */
const INSIDE = [
  ['Qué los mantiene abiertos', 'Por dentro son húmedos y el agua tiende a pegar sus propias paredes, como un globo mojado que se cierra. Una capa parecida a un jabón natural, el surfactante, evita que eso pase.'],
  ['Qué pasa en la EPOC', 'Las paredes se destruyen y las vías se estrechan. El pulmón pierde elasticidad: el aire entra, pero ya no es empujado hacia afuera y se queda atrapado.'],
  ['Qué se siente', 'Falta de aire al hacer esfuerzos, tos y cansancio. Como el daño es mayormente permanente, la enfermedad no se cura: se trata para aliviarla y frenarla.'],
]
function Inside() {
  return (
    <Band theme="inside">
      <h2 className="text-4xl sm:text-6xl"><Split text="Antes de seguir: ¿qué es un *alvéolo*?" /></h2>
      <Rv as="p" d={300} className="mt-4 max-w-3xl text-lg text-ink/75 sm:text-xl">Tus bronquios se ramifican como un árbol y terminan en millones de bolsitas llamadas alvéolos, parecidas a racimos de globos diminutos. En sus paredes, el oxígeno pasa a la sangre y el dióxido de carbono sale. Así se ve uno sano y uno dañado:</Rv>
      <section className="mt-8 grid gap-8 sm:grid-cols-2 lg:gap-16" aria-label="Comparación de alvéolos">
        <Rv as="figure" kind="rv-s">
          <figcaption className="mb-3"><strong className="block text-2xl font-extrabold text-[#15803d]">Alvéolos sanos</strong><span className="text-ink/70">Paredes completas y elásticas: se llenan y se vacían como un globo nuevo.</span></figcaption>
          <AlveolusZoom className="mx-auto max-w-[360px]" kind="sano" damage={0} trapped={0} caliber={1} scale={1} title="Alvéolos sanos con paredes íntegras" />
        </Rv>
        <Rv as="figure" kind="rv-s" d={150}>
          <figcaption className="mb-3"><strong className="block text-2xl font-extrabold text-[#be123c]">Alvéolos con enfisema</strong><span className="text-ink/70">Paredes rotas: varios alvéolos se funden en una bolsa grande y floja que retiene el aire.</span></figcaption>
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
  ['Nicotina', 'Sustancia adictiva que además irrita e inflama las vías respiratorias.'],
  ['Saborizantes', 'Dan sabor dulce o mentolado, pero algunos (como el diacetilo) dañan las vías pequeñas al inhalarse calentados.'],
  ['NNN y NNK', 'N-nitrosonornicotina y nitrosamina cetona: compuestos de la familia de las nitrosaminas, considerados cancerígenos. Se han detectado en aerosoles de vapeadores.'],
  ['Metales pesados', 'La resistencia que calienta el líquido puede soltar partículas de níquel, cromo o plomo hacia el aerosol.'],
]
const STEPS = [
  { t: 'Inhalación', d: 'Cada calada lleva partículas diminutas hasta el fondo del pulmón, hasta los alvéolos.', v: { kind: 'sano', damage: 0, trapped: 0, aerosol: 1 } },
  { t: 'Surfactante alterado', d: 'El aerosol y la inflamación dañan la capa de “jabón” del alvéolo. Sin ella el agua pega las paredes y cuesta más mantenerlo abierto: sube la tensión superficial.', v: { kind: 'epoc', damage: 0.2, trapped: 0.1, aerosol: 0.6 } },
  { t: 'Paredes destruidas', d: 'La inflamación constante activa sustancias que “digieren” las paredes. Los alvéolos vecinos se funden en bolsas grandes y flojas: eso es el enfisema.', v: { kind: 'epoc', damage: 0.65, trapped: 0.35, aerosol: 0.3 } },
  { t: 'Aire atrapado', d: 'Las bolsas flojas ya no empujan el aire hacia afuera y las vías se estrechan al soplar. El aire entra pero no sale del todo: aparece la falta de aire.', v: { kind: 'epoc', damage: 0.95, trapped: 0.9, aerosol: 0 } },
]
function Pathway() {
  const [i, setI] = useState(0)
  const S = STEPS[i]
  return (
    <Band theme="path">
      <h2 className="text-4xl sm:text-6xl"><Split text="¿Qué le hace el vapeo al *alvéolo*?" /></h2>
      <Rv as="p" d={300} className="mt-4 max-w-3xl text-lg text-ink/75 sm:text-xl">Un vapeador calienta un líquido hasta formar un aerosol que se inhala. No es “solo vapor de agua”: arrastra sustancias que pueden dañar el pulmón.</Rv>

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

      <Note label="Por qué importa en jóvenes" className="mt-10">
        Los pulmones siguen madurando hasta los 20 o 25 años y la EPOC tarda años en notarse: el daño de hoy aparece mucho después. La evidencia sobre vapeo y EPOC aún se está construyendo; por eso este proyecto usa modelos didácticos para entender el mecanismo.
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
        <output className="font-display text-4xl font-semibold tabular-nums">{on ? 25 : T_MAX}<span className="ml-1 font-sans text-sm font-normal tracking-normal text-muted">mN/m</span></output>
      </figcaption>
      <p className="mt-2 max-w-md text-sm text-muted">Los palitos cian son moléculas de surfactante. El número es la tensión superficial (mN/m, milinewton por metro, la unidad de esa fuerza).</p>
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
      <figcaption className="mt-3 font-display text-5xl font-semibold tabular-nums">{fmt(P)} <span className="font-sans text-base font-normal tracking-normal text-muted">cmH₂O de presión para mantenerlo abierto</span></figcaption>
    </figure>
  )
}
const SALB = [
  ['Llega al músculo', 'Alrededor de cada bronquio hay un músculo. En la EPOC se aprieta y el tubo se estrecha.'],
  ['Se une al receptor β₂', 'El salbutamol encaja en unos “botones” del músculo llamados receptores beta-2.'],
  ['El músculo se relaja', 'Dentro de la célula sube una señal (AMPc) que baja el calcio y suelta el músculo.'],
  ['El tubo se ensancha', 'Pasa más aire con menos esfuerzo. Mejora poco en la EPOC porque las paredes rotas no se reparan.'],
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
  { v: 'st', label: 'Tensión superficial', simple: 'Dentro del alvéolo hay una capa de agua y las moléculas de agua se atraen entre sí, tendiendo a cerrar el espacio, como un globo mojado que se pega. Esa fuerza se llama tensión superficial.', why: 'El surfactante la reduce y deja el alvéolo abierto. El vapeo altera el surfactante y la tensión sube.', demo: Tension },
  { v: 'lp', label: 'Ley de Laplace', simple: 'Es una regla de la física: la presión que hace falta para que un alvéolo no se cierre (P) sube cuando la tensión (T) sube y también cuando el alvéolo es más pequeño (r).', why: 'Con poco surfactante, T es alta: los alvéolos pequeños se cierran y vacían su aire hacia los grandes. Prueba los deslizadores.', demo: Laplace },
  { v: 'sb', label: 'Salbutamol', simple: 'Es un broncodilatador: un medicamento que abre los bronquios, los tubos por donde baja el aire. Se usa en inhalador cuando falta el aire.', why: 'Actúa sobre el músculo de las vías, no sobre las paredes de los alvéolos. Por eso ayuda, pero no cura la EPOC.', demo: Salbutamol },
]
function Ideas() {
  const [v, setV] = useState('st')
  const cur = IDEAS.find((x) => x.v === v)
  const Demo = cur.demo
  return (
    <Band theme="ideas">
      <h2 className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--accent)' }}>Tres ideas que necesitas para el simulador</h2>
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
  ['Alvéolo', 'Bolsita de aire donde el oxígeno pasa a la sangre.'],
  ['Surfactante', 'Capa tipo jabón del pulmón; evita que los alvéolos se cierren.'],
  ['Tensión superficial', 'Fuerza que pega las paredes húmedas de un alvéolo.'],
  ['Enfisema', 'Daño de las paredes alveolares: se funden y pierden elasticidad.'],
  ['Broncodilatador', 'Medicamento que abre los bronquios. El salbutamol es uno.'],
  ['Espirometría', 'Prueba en la que soplas fuerte en un tubo para medir tus pulmones.'],
  ['FVC', 'Litros totales de aire que puedes sacar soplando con fuerza.'],
  ['FEV₁', 'Litros que salen durante el primer segundo de ese soplido.'],
  ['FEV₁/FVC', 'Qué parte del aire sale en el primer segundo. Bajo 70 % sugiere obstrucción.'],
  ['cmH₂O', 'Unidad de presión: centímetros de columna de agua.'],
]
function Glossary() {
  return (
    <Band theme="gloss">
      <h2 className="text-3xl sm:text-5xl"><Split text="Glosario *rápido*" /></h2>
      <p className="mt-2 text-lg text-ink/70">Vuelve aquí cuando aparezca una palabra nueva.</p>
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
      <Facts />
      <Question />
      <Inside />
      <Pathway />
      <Ideas />
      <Glossary />
    </>
  )
}
