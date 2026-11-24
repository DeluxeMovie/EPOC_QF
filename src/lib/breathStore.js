import { breath } from './physics'

/**
 * Almacén único del ciclo respiratorio. Un solo requestAnimationFrame, que solo corre mientras
 * haya componentes suscritos (y estos solo se suscriben cuando son visibles).
 */
let t = 0
let state = breath(0)
let raf = 0
let last = 0
let acc = 0
const subs = new Set()

function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000)
  last = now
  t += dt
  acc += dt
  if (acc > 1 / 24) {
    acc = 0
    state = breath(t)
    subs.forEach((f) => f())
  }
  raf = requestAnimationFrame(loop)
}

export const breathStore = {
  subscribe(f) {
    subs.add(f)
    if (subs.size === 1) { last = performance.now(); acc = 0; raf = requestAnimationFrame(loop) }
    return () => {
      subs.delete(f)
      if (!subs.size) cancelAnimationFrame(raf)
    }
  },
  get: () => state,
}
export const noopSubscribe = () => () => {}
