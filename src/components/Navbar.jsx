import { useEffect, useRef } from 'react'

const LINKS = [
  ['problema', 'Marco biofísico', '#0369a1'],
  ['simulador', 'Simulador', '#047857'],
  ['analisis', 'Análisis', '#0369a1'],
  ['desafio', 'Juego', '#be123c'],
  ['conclusiones', 'Conclusiones', '#0f766e'],
  ['referencias', 'Referencias', '#334155'],
]

export default function Navbar() {
  const bar = useRef(null)
  // La barra de progreso se mueve por DOM directo (sin re-renderizar React en cada scroll)
  useEffect(() => {
    let raf = 0
    const draw = () => {
      raf = 0
      const h = document.documentElement
      bar.current.style.transform = `scaleX(${h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)})`
    }
    const on = () => { raf ||= requestAnimationFrame(draw) }
    on()
    addEventListener('scroll', on, { passive: true })
    return () => { removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [])
  return (
    <header className="sticky top-0 z-30 bg-white/95">
      <nav aria-label="Principal" className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-5 sm:px-8">
        <a href="#top" className="hov font-display text-lg font-extrabold tracking-tight" style={{ '--accent': '#1d4ed8' }}>Alvéolos bajo presión</a>
        <ul className="ml-auto flex gap-1 overflow-x-auto">
          {LINKS.map(([id, t, c]) => (
            <li key={id}>
              <a href={`#${id}`} style={{ '--accent': c }} className="hov flex min-h-11 items-center whitespace-nowrap px-3 text-sm font-semibold text-muted">{t}</a>
            </li>
          ))}
        </ul>
      </nav>
      <span ref={bar} className="block h-[3px] origin-left bg-ink/80" aria-hidden />
    </header>
  )
}
