import { memo, useId, useMemo } from 'react'
import { clamp } from '../lib/physics'

// Panal de 7 sacos alveolares (hexágonos que comparten paredes). Se calcula una sola vez.
const RH = 30
const hexV = (cx, cy) => Array.from({ length: 6 }, (_, k) => [cx + RH * Math.cos((Math.PI / 3) * k + Math.PI / 6), cy + RH * Math.sin((Math.PI / 3) * k + Math.PI / 6)])
const CENTERS = [[0, 0], ...Array.from({ length: 6 }, (_, k) => [Math.sqrt(3) * RH * Math.cos((Math.PI / 3) * k), Math.sqrt(3) * RH * Math.sin((Math.PI / 3) * k)])]
const GEOM = (() => {
  const seen = new Map()
  CENTERS.forEach(([cx, cy]) => {
    const v = hexV(cx, cy)
    v.forEach((p, i) => {
      const q = v[(i + 1) % 6]
      const key = [p, q].map((z) => z.map((n) => Math.round(n)).join(',')).sort().join('|')
      if (!seen.has(key)) seen.set(key, [p, q])
    })
  })
  return { edges: [...seen.values()].map((e, i) => ({ e, u: ((i * 7919) % 97) / 97 })), hexes: CENTERS.map(([cx, cy]) => hexV(cx, cy)) }
})()
const pts = (v) => v.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')
const HEX_POINTS = GEOM.hexes.map(pts)

/**
 * kind sano|epoc · scale (ventilación) · damage 0–1 · trapped 0–1 · caliber bronquiolar · flow 0–1
 * Sano: septos íntegros con capilares. EPOC: paredes rotas/fusionadas y aire atrapado.
 */
function AlveolusZoom({ kind, scale = 1, damage = 0, trapped = 0, caliber = 1, flow = 0, aerosol = 0, title, className = '', ...p }) {
  const id = useId().replace(/:/g, '')
  const epoc = kind === 'epoc'
  const grow = epoc ? 1 + 0.28 * damage : 1
  const col = epoc ? '#be123c' : '#15803d'
  const half = 5 + 12 * clamp(caliber, 0.3, 1.1)
  const nTrap = Math.round(trapped * 30)
  const qFlow = Math.round(flow * 10) / 10

  // Las paredes y el aire atrapado solo cambian con el daño, no en cada cuadro de la respiración
  const cells = useMemo(() => {
    const limit = Math.min(0.96, damage * 1.15)
    return (
      <>
        {HEX_POINTS.map((h, i) => <polygon key={i} points={h} fill={epoc ? '#ffe4e6' : '#dcfce7'} fillOpacity={epoc ? 0.85 : 0.95} />)}
        {GEOM.edges.map(({ e: [p, q], u }, i) => {
          if (!(epoc && u < limit)) return <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={col} strokeWidth={epoc ? 2.2 : 4} strokeLinecap="round" opacity={epoc ? 0.8 : 1} />
          const k = 0.26
          const a = [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k]
          const b = [q[0] + (p[0] - q[0]) * k, q[1] + (p[1] - q[1]) * k]
          return (
            <g key={i} stroke={col} strokeWidth="2.4" strokeLinecap="round">
              <line x1={p[0]} y1={p[1]} x2={a[0]} y2={a[1]} />
              <line x1={q[0]} y1={q[1]} x2={b[0]} y2={b[1]} />
              <circle cx={a[0]} cy={a[1]} r="2" fill="#fff" strokeWidth="1.2" />
              <circle cx={b[0]} cy={b[1]} r="2" fill="#fff" strokeWidth="1.2" />
            </g>
          )
        })}
        {!epoc && GEOM.edges.map(({ e: [p, q] }, i) => <circle key={'c' + i} cx={(p[0] + q[0]) / 2} cy={(p[1] + q[1]) / 2} r="2.6" fill="#dc2626" opacity=".7" />)}
        {epoc && [0, 1, 2].map((g) => (
          <g key={g} fill="#334155" opacity=".7" style={{ animation: `float-a ${2.4 + g * 0.6}s ease-in-out infinite` }}>
            {Array.from({ length: nTrap }, (_, i) => i).filter((i) => i % 3 === g).map((i) => {
              const a = i * 2.39996
              const rr = 6 + (i % 9) * 9
              return <circle key={i} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} r={2.8} />
            })}
          </g>
        ))}
        {!epoc && qFlow > 0.02 && Array.from({ length: 8 }, (_, i) => <circle key={'f' + i} cx={(i % 4) * 22 - 33} cy={Math.floor(i / 4) * 30 - 15} r="2.4" fill="#1d4ed8" opacity={0.3 + qFlow * 0.6} />)}
      </>
    )
  }, [epoc, damage, nTrap, qFlow, col])

  return (
    <svg viewBox="-135 -122 270 244" role="img" aria-label={title} className={`block h-auto w-full ${className}`} {...p}>
      <defs><clipPath id={`${id}c`}><circle r="116" /></clipPath></defs>
      <circle r="116" fill="#fff" stroke="#b9c9d4" strokeWidth="2" />
      <g clipPath={`url(#${id}c)`}>
        {/* bronquiolo terminal */}
        <rect x="-140" y={-half} width="86" height={half * 2} fill="#eaf1f6" style={{ transition: 'all .7s cubic-bezier(.3,.8,.3,1)' }} />
        <g stroke="#6f8797" strokeWidth="3">
          <line x1="-140" x2="-54" y1={-half} y2={-half} style={{ transition: 'all .7s' }} />
          <line x1="-140" x2="-54" y1={half} y2={half} style={{ transition: 'all .7s' }} />
        </g>
        {flow > 0.02 && (
          <line x1="-54" x2="-140" y1="0" y2="0" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 8" opacity={0.4 + flow * 0.6}
            style={{ animation: `flow-dash ${(0.9 - 0.7 * flow).toFixed(2)}s linear infinite` }} />
        )}

        <g style={{ transform: `scale(${(scale * grow).toFixed(3)})`, transformOrigin: '0 0' }}>{cells}</g>

        {aerosol > 0.05 && (
          <g fill="#7a8f9e" opacity={0.15 + aerosol * 0.4} style={{ animation: 'drift 2.6s linear infinite' }}>
            {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={-100} cy={-8 + i * 3} r={3 + (i % 3) * 2} />)}
          </g>
        )}
        <text x="-108" y={-half - 6} fontSize="10" fill="#4a6272">bronquiolo</text>
        <text x="0" y="100" textAnchor="middle" fontSize="11" fontWeight="600" fill={col}>{epoc ? 'paredes rotas' : 'septos íntegros'}</text>
      </g>
    </svg>
  )
}

export default memo(AlveolusZoom)
