/** Un único IntersectionObserver compartido: marca data-in cuando el elemento entra en pantalla. */
let io
const get = () => (io ??= new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.setAttribute('data-in', '1'); io.unobserve(e.target) }
}), { rootMargin: '0px 0px -10% 0px' }))

/** Ref de callback: `<p ref={reveal}>`. Devuelve su limpieza (React 19). */
export function reveal(el) {
  if (!el) return
  if (typeof IntersectionObserver === 'undefined') { el.setAttribute('data-in', '1'); return }
  const o = get()
  o.observe(el)
  return () => o.unobserve(el)
}

/** Combina un ref propio con `reveal`. */
export const withReveal = (own) => (el) => { own.current = el; return reveal(el) }
