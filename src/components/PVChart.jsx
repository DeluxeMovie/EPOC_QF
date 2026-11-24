import { memo, useMemo, useRef } from 'react'
import { withReveal } from '../lib/reveal'
import { clamp, fmt, volume } from '../lib/physics'

const W = 640
const H = 340
const M = { l: 52, r: 20, t: 16, b: 46 }
const X = (p) => M.l + (p / 30) * (W - M.l - M.r)
const Y = (v) => H - M.b - (v / 10) * (H - M.t - M.b)

/**
 * Curva presión–volumen con manijas arrastrables SOBRE la curva.
 * Arrastrar a la derecha = inspiración (rama de inflación); a la izquierda = espiración (rama de deflación).
 */
function PVChart({ P, limb, onChange, onGrab, mS, mE }) {
  const ref = useRef(null)
  const drag = useRef(null)
  const setRef = useMemo(() => withReveal(ref), [])
  const last = useRef(P)
  const paths = useMemo(() => {
    const mk = (m, l) => {
      let d = ''
      for (let i = 0; i <= 120; i++) {
        const p = (i / 120) * 30
        d += `${i ? 'L' : 'M'}${X(p).toFixed(1)} ${Y(volume(m, p, l)).toFixed(1)}`
      }
      return d
    }
    return { sI: mk(mS, 'inf'), sD: mk(mS, 'def'), eI: mk(mE, 'inf'), eD: mk(mE, 'def') }
  }, [mS, mE])

  const setFrom = (clientX) => {
    const r = ref.current.getBoundingClientRect()
    const px = ((clientX - r.left) / r.width) * W
    const p = clamp(((px - M.l) / (W - M.l - M.r)) * 30, 0, 30)
    const dir = p > last.current + 0.05 ? 'inf' : p < last.current - 0.05 ? 'def' : limb
    last.current = p
    onChange(Math.round(p * 10) / 10, dir)
  }
  const onKey = (e) => {
    const step = e.shiftKey ? 3 : 0.5
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); last.current = P; onChange(clamp(P + step, 0, 30), 'inf') }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); last.current = P; onChange(clamp(P - step, 0, 30), 'def') }
  }
  const vs = volume(mS, P, limb)
  const ve = volume(mE, P, limb)
  const flip = X(P) > W - 130

  const Handle = ({ y, color, square, label, text, dy }) => (
    <g
      role="slider" tabIndex={0} aria-label={label} aria-valuemin={0} aria-valuemax={30} aria-valuenow={Math.round(P * 10) / 10}
      aria-valuetext={`${fmt(P)} centímetros de agua, ${text}`} onKeyDown={onKey}
      style={{ cursor: 'grab' }}
    >
      <circle cx={X(P)} cy={y} r="26" fill="transparent" />
      <circle cx={X(P)} cy={y} r="15" fill={color} opacity=".16" />
      {square ? <rect x={X(P) - 8} y={y - 8} width="16" height="16" rx="3" fill={color} stroke="#fff" strokeWidth="3" /> : <circle cx={X(P)} cy={y} r="9" fill={color} stroke="#fff" strokeWidth="3" />}
      <text x={X(P) + (flip ? -16 : 16)} y={y + dy} textAnchor={flip ? 'end' : 'start'} fontSize="13" fontWeight="600" fill={color} className="num">{text}</text>
    </g>
  )

  return (
    <svg
      ref={setRef} viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Curva presión–volumen: arrastra las manijas sobre la curva"
      className="chart-drag wipe block h-auto w-full"
      onPointerDown={(e) => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); onGrab?.(); setFrom(e.clientX) }}
      onPointerMove={(e) => drag.current && setFrom(e.clientX)}
      onPointerUp={() => (drag.current = false)}
      onPointerCancel={() => (drag.current = false)}
    >
      {[0, 2, 4, 6, 8, 10].map((v) => (
        <g key={v}>
          <line x1={M.l} x2={W - M.r} y1={Y(v)} y2={Y(v)} stroke="#e3ebf1" />
          <text x={M.l - 8} y={Y(v) + 4} textAnchor="end" fontSize="12" fill="#4a6272" className="num">{v}</text>
        </g>
      ))}
      {[0, 5, 10, 15, 20, 25, 30].map((v) => (
        <g key={v}>
          <line x1={X(v)} x2={X(v)} y1={M.t} y2={H - M.b} stroke="#eef3f7" />
          <text x={X(v)} y={H - M.b + 19} textAnchor="middle" fontSize="12" fill="#4a6272" className="num">{v}</text>
        </g>
      ))}
      <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} stroke="#8aa1b1" />
      <line x1={M.l} x2={M.l} y1={M.t} y2={H - M.b} stroke="#8aa1b1" />
      <text x={(M.l + W - M.r) / 2} y={H - 8} textAnchor="middle" fontSize="13" fill="#4a6272">Presión transpulmonar (cmH₂O)</text>
      <text transform={`rotate(-90 14 ${(M.t + H - M.b) / 2})`} x="14" y={(M.t + H - M.b) / 2} textAnchor="middle" fontSize="13" fill="#4a6272">Volumen pulmonar (L)</text>

      <path d={paths.sD} fill="none" stroke="#15803d" strokeWidth="1.8" strokeDasharray="5 5" opacity=".7" />
      <path d={paths.eD} fill="none" stroke="#be123c" strokeWidth="1.8" strokeDasharray="5 5" opacity=".7" />
      <path d={paths.sI} fill="none" stroke="#15803d" strokeWidth="3.6" strokeLinecap="round" />
      <path d={paths.eI} fill="none" stroke="#be123c" strokeWidth="3.6" strokeLinecap="round" />
      <line x1={X(P)} x2={X(P)} y1={M.t} y2={H - M.b} stroke="#0b1f2e" strokeDasharray="4 4" opacity=".6" />
      <text x={clamp(X(P), M.l + 40, W - M.r - 40)} y={M.t + 12} textAnchor="middle" fontSize="12" fontWeight="600" fill="#0b1f2e">{limb === 'inf' ? 'inspiración' : 'espiración'}</text>

      <Handle y={Y(vs)} color="#15803d" label="Manija pulmón sano" text={`${fmt(vs)} L`} dy={ve > vs ? 22 : -14} />
      <Handle y={Y(ve)} color="#be123c" square label="Manija pulmón con EPOC" text={`${fmt(ve)} L`} dy={ve > vs ? -14 : 22} />
    </svg>
  )
}

export default memo(PVChart)
