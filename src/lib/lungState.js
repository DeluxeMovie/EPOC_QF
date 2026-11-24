import { SPIRO, curveFor } from '../data/spirometry'
import { clamp } from './physics'

export const T_END = 14 // s: duración de la espiración forzada mostrada

const cache = {}
export const curve = (group, phase) => (cache[`${group}-${phase}`] ??= curveFor(group, phase))

/** Estado de la espiración forzada en el instante t (s) según la curva medida */
export function exhale(group, phase, t) {
  const f = curve(group, phase)
  const fvc = SPIRO[group][phase].fvc
  const h = 0.05
  const flow = (f(t + h) - f(Math.max(0, t - h))) / (t < h ? t + h : 2 * h)
  return { V: f(t), rem: clamp(1 - f(t) / fvc, 0, 1), flow: Math.max(0, flow) }
}

export const FLOW_MAX = 4.2 // L/s, escala visual

/** Calibre bronquial relativo: pre vs. post-salbutamol (efecto visible pero modesto) */
export const caliberBase = (dmg, post) => 1 - 0.6 * dmg * (post ? 0.5 : 1)

/** Escala visual de los pulmones (volumen) */
export const restScale = (V) => clamp(0.72 + (V - 1.2) * 0.062, 0.7, 1.26)

/** Reconstruye la vista (pulmón + saco alveolar) de un grupo, en reposo o en espiración forzada */
export function groupView({ group, mode, t, treatment, dmg, restV, trapBase }) {
  const post = treatment === 'post'
  const cal0 = group === 'sano' ? 1 : caliberBase(dmg, post)
  if (mode === 'rest') {
    const scale = restScale(restV)
    return { scale, fill: clamp((scale - 0.72) / 0.54, 0, 1), trapped: trapBase, flow: 0, caliber: cal0, rem: null, V: restV }
  }
  const ex = exhale(group, treatment, t)
  const floor = group === 'sano' ? 0.74 : 0.74 + 0.2 * dmg - (post ? 0.02 : 0)
  const scale = floor + (1.24 - floor) * ex.rem
  return {
    scale,
    fill: ex.rem,
    trapped: group === 'sano' ? 0 : trapBase * (0.3 + 0.7 * (1 - ex.rem)),
    flow: clamp(ex.flow / FLOW_MAX, 0, 1),
    caliber: group === 'sano' ? 1 : cal0 * (1 - 0.35 * dmg * (1 - ex.rem)), // colapso dinámico
    rem: ex.rem,
    V: ex.V,
    flowLs: ex.flow,
  }
}
