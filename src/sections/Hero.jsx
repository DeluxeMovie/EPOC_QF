import Lungs from '../components/Lungs'
import { Rv, Split, Tri, THEMES } from '../components/ui'
import { useBreath, prefersReduced } from '../hooks/useBreath'
import { useVisible } from '../hooks/useVisible'
import { reveal } from '../lib/reveal'
import { volume } from '../lib/physics'
import { restScale } from '../lib/lungState'

export default function Hero() {
  const [ref, visible] = useVisible()
  const b = useBreath(visible && !prefersReduced(), 10)
  const sc = restScale(volume({ d: 0, s: 1 }, b.P, b.limb))
  return (
    <section ref={ref} data-theme="hero" className="band grid items-center gap-10 lg:min-h-[88vh] lg:grid-cols-[1.25fr_.75fr]" style={{ background: THEMES.hero.bg, '--accent': THEMES.hero.accent }}>
      <header>
        <Rv as="p" className="num text-xs font-medium uppercase tracking-[0.16em]" style={{ color: 'var(--accent)' }}>Biomecánica de la EPOC</Rv>
        <h1 className="mt-4 text-[clamp(3rem,10.5vw,9rem)] font-extrabold leading-[0.86] tracking-tighter">
          <Split text="Alvéolos" by="letter" step={38} delay={150} className="block" />
          <Split text="*bajo* *presión*" by="letter" step={38} delay={450} className="block whitespace-nowrap" />
        </h1>
        <Rv as="p" d={1000} className="mt-7 max-w-lg text-xl text-ink/75">Un modelo interactivo para explicar los fenómenos físicos del alvéolo en condiciones normales y patológicas, y relacionarlos con el tratamiento farmacológico.</Rv>
        <Rv as="nav" d={1200} aria-label="Acciones principales" className="mt-8 flex flex-wrap items-center gap-3">
          <a href="#simulador" className="press inline-flex min-h-11 items-center rounded-full bg-ink px-6 text-sm font-semibold text-white hover:bg-[var(--accent)]">Abrir el simulador</a>
          <a href="#desafio" style={{ '--accent': '#be123c' }} className="hov inline-flex min-h-11 items-center gap-2 px-3 text-sm font-semibold">Jugar el minijuego <Tri /></a>
        </Rv>
      </header>
      <Lungs ref={reveal} kind="sano" scale={sc} fill={(sc - 0.72) / 0.54} flow={b.limb === 'def' ? 0.35 : 0} zoom={false} title="Pulmones sanos respirando" className="rv-s mx-auto max-w-[340px]" style={{ '--d': '400ms' }} />
    </section>
  )
}
