import { useCallback, useState } from 'react'

/** Devuelve [ref, visible]: sirve para pausar animaciones cuando la sección no se ve. */
export function useVisible(margin = '120px') {
  const [v, setV] = useState(false)
  const ref = useCallback((el) => {
    if (!el) return
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [margin])
  return [ref, v]
}
