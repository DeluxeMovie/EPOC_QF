import { memo, useMemo, useRef } from 'react'
import { withReveal } from '../lib/reveal'
import { curveFor, SPIRO, T_MAX_S, timeClamp } from '../data/spirometry'
import { clamp, fmt } from '../lib/physics'

const W = 680
const H = 380
const M = { l: 56, r: 20, t: 20, b: 50 }
const X = (t) => M.l + (t / T_MAX_S) * (W - M.l - M.r)
const Y = (v) => H - M.b - (v / 3.5) * (H - M.t - M.b)

const GROUPS = [
  { key: 'sano', color: '#15803d', shape: 'circle' },
  { key: 'epoc', color: '#be123c', shape: 'square' },
]

function Marker({ x, y, shape, color, r = 7, fill = color }) {
  return shape === 'circle' ? (
    <circle cx={x} cy={y} r={r} fill={fill} stroke="#fff" strokeWidth="2.5" />
  ) : (
    <rect x={x - r} y={y - r} width={r * 2} height={r * 2} rx="2" fill={fill} stroke="#fff" strokeWidth="2.5" />
  )
}

/** Espirometría Volumen–Tiempo con cursor arrastrable e inspección de puntos */
function SpirometryChart({ t, onT, treatment, onGrab }) {
  const ref = useRef(null)
  const dragging = useRef(false)
  const setRef = useMemo(() => withReveal(ref), [])
  const curves = useMemo(() => {
    const out = {}
    for (const g of GROUPS) for (const ph of ['pre', 'post']) out[`${g.key}-${ph}`] = curveFor(g.key, ph)
    return out
  }, [])
  const path = (fn) => {
    let d = ''
    for (let i = 0; i <= 150; i++) {
      const x = (i / 150) * T_MAX_S
      d += `${i ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(fn(x)).toFixed(1)}`
    }
    return d
  }
  const fromEvent = (e) => {
    const r = ref.current.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    onT(timeClamp(Math.round(((px - M.l) / (W - M.l - M.r)) * T_MAX_S * 20) / 20))
  }
  return (
    <svg
      ref={setRef}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Gráfica de espirometría: volumen exhalado contra tiempo"
      className="chart-drag wipe block h-auto w-full"
      onPointerDown={(e) => { dragging.current = true; onGrab?.(); e.currentTarget.setPointerCapture(e.pointerId); fromEvent(e) }}
      onPointerMove={(e) => dragging.current && fromEvent(e)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map((v) => (
        <g key={v}>
          <line x1={M.l} x2={W - M.r} y1={Y(v)} y2={Y(v)} stroke="#e3ebf1" />
          <text x={M.l - 8} y={Y(v) + 4} textAnchor="end" fontSize="12" fill="#4a6272" className="num">{v.toFixed(1)}</text>
        </g>
      ))}
      {[0, 2, 4, 6, 8, 10, 12, 14].map((v) => (
        <g key={v}>
          <line x1={X(v)} x2={X(v)} y1={M.t} y2={H - M.b} stroke="#eef3f7" />
          <text x={X(v)} y={H - M.b + 20} textAnchor="middle" fontSize="12" fill="#4a6272" className="num">{v}</text>
        </g>
      ))}
      <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} stroke="#8aa1b1" />
      <line x1={M.l} x2={M.l} y1={M.t} y2={H - M.b} stroke="#8aa1b1" />
      <text x={(M.l + W - M.r) / 2} y={H - 8} textAnchor="middle" fontSize="13" fill="#4a6272">Tiempo (s)</text>
      <text transform={`rotate(-90 15 ${(M.t + H - M.b) / 2})`} x="15" y={(M.t + H - M.b) / 2} textAnchor="middle" fontSize="13" fill="#4a6272">Volumen exhalado (L)</text>

      {/* 1 s = FEV1 */}
      <line x1={X(1)} x2={X(1)} y1={M.t} y2={H - M.b} stroke="#854d0e" strokeDasharray="3 4" />
      <text x={X(1) + 6} y={M.t + 12} fontSize="11" fill="#475569">1 s, FEV₁</text>

      {GROUPS.flatMap((g) =>
        ['pre', 'post'].map((ph) => {
          const active = ph === treatment
          const d = SPIRO[g.key][ph]
          return (
            <g key={g.key + ph}>
              <line x1={X(0)} x2={X(T_MAX_S)} y1={Y(d.fvc)} y2={Y(d.fvc)} stroke={g.color} strokeDasharray="2 6" opacity={active ? 0.55 : 0.18} />
              <path d={path(curves[`${g.key}-${ph}`])} fill="none" stroke={g.color} strokeWidth={active ? 4 : 2} strokeDasharray={ph === 'pre' ? '8 5' : undefined} strokeLinecap="round" opacity={active ? 1 : 0.4} />
              {active && Math.abs(t - 1) > 0.7 && (
                <g>
                  <Marker x={X(1)} y={Y(d.fev1)} shape={g.shape} color={g.color} r={6} fill="#fff" />
                  <text x={X(1) + 12} y={Y(d.fev1) + (g.key === 'sano' ? 16 : 18)} fontSize="11.5" fontWeight="600" fill={g.color} className="num">FEV₁ {fmt(d.fev1, 2)} L</text>
                </g>
              )}
            </g>
          )
        }),
      )}

      {/* cursor */}
      <line x1={X(t)} x2={X(t)} y1={M.t} y2={H - M.b} stroke="#0b1f2e" strokeWidth="1.5" />
      {GROUPS.map((g) => {
        const v = curves[`${g.key}-${treatment}`](t)
        const right = X(t) > W - 170
        return (
          <g key={g.key}>
            <circle cx={X(t)} cy={Y(v)} r="14" fill={g.color} opacity=".15" />
            <Marker x={X(t)} y={Y(v)} shape={g.shape} color={g.color} />
            <text x={X(t) + (right ? -14 : 14)} y={Y(v) + (g.key === 'sano' ? -10 : 18)} textAnchor={right ? 'end' : 'start'} fontSize="12.5" fontWeight="600" fill={g.color} className="num">{fmt(v, 2)} L</text>
          </g>
        )
      })}
      <rect x={clamp(X(t) - 22, M.l, W - M.r - 44)} y={H - M.b - 22} width="44" height="18" rx="5" fill="#0b1f2e" />
      <text x={clamp(X(t), M.l + 22, W - M.r - 22)} y={H - M.b - 9} textAnchor="middle" fontSize="11.5" fill="#fff" className="num">{fmt(t)} s</text>
    </svg>
  )
}

export default memo(SpirometryChart)
