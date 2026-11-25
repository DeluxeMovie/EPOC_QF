import { useEffect } from 'react'
import Lenis from 'lenis'
import Navbar from './components/Navbar'
import Hero from './sections/Hero'
import Problem from './sections/Problem'
import Simulator from './sections/Simulator'
import Analysis from './sections/Analysis'
import Game from './sections/Game'
import Conclusions from './sections/Conclusions'
import References from './sections/References'
import { prefersReduced } from './hooks/useBreath'

/** Pausa las animaciones infinitas de las secciones que no se ven (cada animación activa fuerza un cuadro por frame). */
function useLiveSections() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.toggleAttribute('data-live', e.isIntersecting)), { rootMargin: '100px' })
    document.querySelectorAll('section[data-theme]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/** Scroll con inercia suave. Lenis usa su propio rAF y se detiene si la pestaña está oculta. */
function useSmoothScroll() {
  useEffect(() => {
    if (prefersReduced()) return
    const lenis = new Lenis({ autoRaf: true, lerp: 0.12, wheelMultiplier: 1, anchors: true })
    return () => lenis.destroy()
  }, [])
}

export default function App() {
  useSmoothScroll()
  useLiveSections()
  return (
    <>
      <a href="#problema" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Saltar al contenido</a>
      <Navbar />
      <main id="top">
        <Hero />
        <Problem />
        <Simulator />
        <Analysis />
        <Game />
        <Conclusions />
        <References />
      </main>
    </>
  )
}
