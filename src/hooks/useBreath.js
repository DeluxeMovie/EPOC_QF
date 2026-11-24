import { useSyncExternalStore } from 'react'
import { breathStore, noopSubscribe } from '../lib/breathStore'

export const prefersReduced = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Ciclo respiratorio compartido. Solo se suscribe (y solo re-renderiza el componente) si `playing`.
 * Si no, devuelve la presión manual.
 */
export function useBreath(playing, manualP = 10, manualLimb = 'inf') {
  const s = useSyncExternalStore(playing ? breathStore.subscribe : noopSubscribe, breathStore.get)
  return playing ? s : { ph: 0, P: manualP, limb: manualLimb }
}
