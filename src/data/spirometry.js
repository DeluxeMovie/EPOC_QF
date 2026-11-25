import { clamp } from '../lib/physics'

/**
 * Datos experimentales del proyecto (fuente única de verdad).
 * pt = [% teórico FVC, % teórico FEV1]
 * a, t2 = forma de la curva (biexponencial) usada solo para reconstruir el trazo.
 */
export const SPIRO = {
  sano: {
    label: 'Pulmón sano',
    pre: { fvc: 2.88, fev1: 2.08, ratio: 72.2, pt: [101.3, 85.5], z: [0.11, -1.26, -2.05] },
    post: { fvc: 2.9, fev1: 2.1, ratio: 72.3, pt: [102.2, 86.4], z: [0.19, -1.18, -2.04] },
    change: [0.9, 0.9, 0.1],
    shape: { a: [0.8, 0.8], t2: [1.8, 1.8] },
    end: '≈ 5–8 s',
  },
  epoc: {
    label: 'Pulmón con EPOC',
    pre: { fvc: 1.73, fev1: 0.95, ratio: 54.8, pt: [83.7, 59.7], z: [-0.87, -2.16, -2.4] },
    post: { fvc: 1.76, fev1: 1.02, ratio: 58.0, pt: [85.2, 64.4], z: [-0.79, -1.92, -2.1] },
    change: [1.6, 4.6, 4.1],
    shape: { a: [0.55, 0.58], t2: [6, 5.5] },
    end: 'hasta ≈ 14 s',
  },
}

/** Ajusta una curva V(t) que pasa exactamente por (1 s, FEV1) y converge a FVC */
export function fitCurve(fvc, fev1, a, t2) {
  const ratio = fev1 / fvc
  if (a === 1) {
    const t = -1 / Math.log(1 - ratio)
    return (x) => fvc * (1 - Math.exp(-x / t))
  }
  const e2 = Math.exp(-1 / t2)
  let lo = 0.03
  let hi = 30
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    const v = 1 - a * Math.exp(-1 / mid) - (1 - a) * e2
    if (v > ratio) lo = mid
    else hi = mid
  }
  const t1 = (lo + hi) / 2
  return (x) => fvc * (1 - a * Math.exp(-x / t1) - (1 - a) * Math.exp(-x / t2))
}

export function curveFor(group, phase) {
  const d = SPIRO[group]
  const i = phase === 'pre' ? 0 : 1
  return fitCurve(d[phase].fvc, d[phase].fev1, d.shape.a[i], d.shape.t2[i])
}

export const T_MAX_S = 14
export const timeClamp = (t) => clamp(t, 0, T_MAX_S)
