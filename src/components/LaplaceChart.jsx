import { memo, useMemo, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, ReferenceDot, ResponsiveContainer, Tooltip } from 'recharts'
import { withReveal } from '../lib/reveal'
import { clamp, fmt, laplaceP, T_MAX } from '../lib/physics'

const PLOT = { left: 52, right: 16 }
const MARGIN = { top: 12, right: PLOT.right, left: 0, bottom: 22 }
const axisProps = { tick: { fontSize: 12, fill: '#4a6272' }, stroke: '#8aa1b1' }

/** Presión necesaria para mantener abierto un alvéolo según su tamaño. Se carga en diferido (Recharts pesa). */
function LaplaceChart({ r, onR, T, Teff }) {
  const ref = useRef(null)
  const on = useRef(false)
  const setRef = useMemo(() => withReveal(ref), [])
  const data = useMemo(
    () => Array.from({ length: 51 }, (_, i) => {
      const x = 40 + i * 2
      return { r: x, sin: laplaceP(T_MAX, x), normal: laplaceP(T, x), user: laplaceP(Teff, x) }
    }),
    [T, Teff],
  )
  const upd = (e) => {
    const b = ref.current.getBoundingClientRect()
    onR(Math.round(clamp(40 + ((e.clientX - b.left - PLOT.left) / (b.width - PLOT.left - PLOT.right)) * 100, 40, 140)))
  }
  const Pc = laplaceP(Teff, r)
  return (
    <div
      ref={setRef} role="img" aria-label="Presión necesaria para mantener abierto un alvéolo según su tamaño" className="chart-drag wipe h-72 sm:h-80"
      onPointerDown={(e) => { on.current = true; e.currentTarget.setPointerCapture(e.pointerId); upd(e) }}
      onPointerMove={(e) => on.current && upd(e)} onPointerUp={() => (on.current = false)} onPointerCancel={() => (on.current = false)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={MARGIN}>
          <CartesianGrid stroke="#e2e8f0" />
          <XAxis dataKey="r" type="number" domain={[40, 140]} ticks={[40, 60, 80, 100, 120, 140]} label={{ value: 'Tamaño del alvéolo (radio, µm)', position: 'insideBottom', offset: -12, fontSize: 12, fill: '#4a6272' }} {...axisProps} />
          <YAxis domain={[0, 40]} width={PLOT.left - 4} label={{ value: 'Presión para abrirlo (cmH₂O)', angle: -90, position: 'insideLeft', offset: 14, fontSize: 12, fill: '#4a6272' }} allowDataOverflow {...axisProps} />
          <Line dataKey="sin" name="Sin surfactante" stroke="#be123c" strokeDasharray="6 5" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line dataKey="normal" name="Surfactante normal" stroke="#15803d" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          <Line dataKey="user" name="Con tu nivel de vapeo" stroke="#0e7490" strokeWidth={4} dot={false} isAnimationActive={false} />
          <ReferenceLine x={r} stroke="#0b1f2e" strokeDasharray="4 4" />
          <ReferenceDot x={r} y={Math.min(Pc, 40)} r={9} fill="#0e7490" stroke="#fff" strokeWidth={3} ifOverflow="extendDomain" />
          <Tooltip formatter={(v) => `${fmt(v)} cmH₂O`} labelFormatter={(l) => `Radio ${l} µm`} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default memo(LaplaceChart)
