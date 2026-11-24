export const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
export const fmt = (v, n = 1) => Number(v).toFixed(n).replace('.', ',')
export const lerp = (a, b, t) => a + (b - a) * t

export const T_MAX = 70 // mN/m, interfaz aire-agua sin surfactante

/** Ley de Laplace para un alvéolo (una interfaz): P = 2T/r. T en mN/m, r en µm → cmH₂O */
export const laplaceP = (T, r) => ((2 * T * 1e-3) / (r * 1e-6)) / 98.0665

/**
 * Tensión efectiva con exposición al aerosol (0–1).
 * Modelo didáctico: el aerosol "desactiva" parte del surfactante y T tiende a T_MAX.
 */
export const tensionEff = (T, vape) => T + (T_MAX - T) * 0.8 * vape

/** Fracción de surfactante funcional equivalente (0–1) para una tensión dada */
export const surfFrac = (T) => clamp(1 - (T - 5) / (T_MAX - 5), 0, 1)

/**
 * Curva presión–volumen sigmoidea.
 * m.d = daño enfisematoso (0–1), m.s = función del surfactante (0–1)
 * limb: 'inf' (inflación) | 'def' (deflación, con histéresis)
 */
export function volume(m, P, limb = 'inf') {
  const A = 5.5 + 2.5 * m.d
  const V0 = 1.2 + 1.6 * m.d
  const w = 5
  let P50 = 10 - 4 * m.d + 4 * (1 - m.s)
  if (limb === 'def') P50 -= 3 * m.s + 0.5
  return V0 + A / (1 + Math.exp(-(P - P50) / w))
}
export const compliance = (m, P, l) => volume(m, P + 0.5, l) - volume(m, P - 0.5, l)

/** Fase de respiración 0–1 → presión transpulmonar y rama */
export function breath(t, period = 5.5) {
  const ph = (t % period) / period
  return { ph, P: 2 + 18 * (0.5 - 0.5 * Math.cos(2 * Math.PI * ph)), limb: ph < 0.5 ? 'inf' : 'def' }
}
