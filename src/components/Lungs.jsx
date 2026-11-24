import { memo, useId, useMemo } from 'react'

const LUNG = 'M148 92 C128 96 96 118 80 160 C66 196 64 250 82 282 C94 300 126 300 140 282 C148 268 150 240 150 215 Z'
const POLY = [[148, 92], [112, 108], [84, 150], [67, 210], [71, 262], [88, 290], [126, 294], [144, 276], [150, 215]]
const inside = (x, y) => {
  let c = false
  for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i++) {
    const [xi, yi] = POLY[i]
    const [xj, yj] = POLY[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}
function rng(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const DOTS = (() => {
  const r = rng(11)
  const out = []
  for (let y = 100; y < 298; y += 13)
    for (let x = 60; x < 150; x += 13) {
      const px = x + (r() - 0.5) * 9
      const py = y + (r() - 0.5) * 9
      if (inside(px, py)) out.push({ x: px, y: py, u1: r(), u2: r() })
    }
  return out
})()
// [trazo, grosor base, opacidad]
const BRONCHI = [
  ['M150 106 L128 130', 5.5, 0.85], ['M128 130 L106 168', 5, 0.8], ['M128 130 L112 215 L116 262', 3.2, 0.7],
  ['M106 168 L84 190', 2.8, 0.65], ['M106 168 L100 140', 2.8, 0.65], ['M112 215 L88 238', 2.4, 0.6],
  ['M112 215 L136 250', 2.4, 0.6], ['M128 130 L140 175', 2.4, 0.6],
]
const TORSO_S = 'M54 70 C54 42 110 36 150 36 C190 36 246 42 246 70 L258 302 C258 318 238 324 150 324 C62 324 42 318 42 302 Z'
const TORSO_E = 'M44 70 C40 36 110 30 150 30 C190 30 260 36 256 70 C278 150 282 250 270 302 C264 320 240 326 150 326 C60 326 36 320 30 302 C18 250 22 150 44 70 Z'

/**
 * scale 0.7–1.26 (volumen) · fill 0–1 (aire restante) · damage 0–1 (enfisema)
 * trapped 0–1 (aire atrapado visible) · flow 0–1 (flujo espiratorio) · caliber (calibre bronquial)
 * puffKey: cambia al administrar salbutamol → ráfaga de fármaco por la vía aérea
 */
function Lungs({ kind, scale = 1, fill = 1, damage = 0, trapped = 0, flow = 0, caliber = 1, puffKey = 0, drug = false, zoom = true, title, className = '', ...p }) {
  const id = useId().replace(/:/g, '')
  const epoc = kind === 'epoc'
  const c = epoc ? ['#dde1e7', '#8e98a8'] : ['#ffd0da', '#ee7b97']
  const transitionW = { transition: 'stroke-width .7s cubic-bezier(.3,.8,.3,1)' }
  // Los ~70 alvéolos del dibujo se recalculan solo si cambian en pasos de 5 %: el movimiento fluido es solo el transform
  const qf = Math.round(fill * 20) / 20
  const qt = Math.round(trapped * 20) / 20
  const dots = useMemo(() => DOTS.map((a, i) => {
    if (epoc && a.u1 < damage * 0.8) {
      const r = (7 + a.u2 * 8 * damage + 2) * (0.55 + 0.45 * Math.max(qf, qt))
      return <circle key={i} cx={a.x} cy={a.y} r={r} fill="#fff" fillOpacity={0.28} stroke="#475569" strokeOpacity=".75" strokeDasharray="3 2.5" strokeWidth="1.1" />
    }
    const dark = epoc && a.u2 < qt
    const r = (3.2 + a.u2 * 1.4) * (0.5 + 0.5 * qf)
    return <circle key={i} cx={a.x} cy={a.y} r={r} fill={dark ? '#334155' : '#fff'} fillOpacity={dark ? 0.5 : 0.55} stroke="#fff" strokeOpacity=".9" strokeWidth=".8" />
  }), [epoc, damage, qf, qt])
  const dur = flow > 0.02 ? (0.9 - 0.7 * flow).toFixed(2) : 0
  return (
    <svg viewBox="16 0 268 330" role="img" aria-label={title} className={`block h-auto w-full ${className}`} {...p}>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c[0]} />
          <stop offset="1" stopColor={c[1]} />
        </linearGradient>
        <radialGradient id={`${id}h`} cx=".35" cy=".25" r=".8">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* tórax y diafragma */}
      <path d={epoc ? TORSO_E : TORSO_S} fill="#f4f8fb" stroke="#b9c9d4" strokeWidth="1.5" />
      <circle cx="150" cy="14" r="17" fill="#f4f8fb" stroke="#b9c9d4" />
      <path d={epoc ? 'M44 300 Q150 288 256 300' : 'M54 298 Q150 262 246 298'} fill="none" stroke="#b9c9d4" strokeDasharray="3 4" />

      <g transform={`translate(150 205) scale(${scale.toFixed(3)}) translate(-150 -205)`}>
        {/* tráquea + flujo de aire */}
        <path d="M150 30 L150 106" stroke="#5b7384" strokeWidth={9 * Math.max(0.6, caliber)} strokeLinecap="round" opacity=".5" fill="none" style={transitionW} />
        {dur !== 0 && (
          <path d="M150 104 L150 34" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 7" fill="none" opacity={0.35 + flow * 0.65}
            style={{ animation: `flow-dash ${dur}s linear infinite` }} />
        )}

        {[false, true].map((m) => (
          <g key={String(m)} transform={m ? 'translate(300 0) scale(-1 1)' : undefined}>
            <path d={LUNG} fill={`url(#${id}g)`} stroke={epoc ? '#5b6573' : '#a35a70'} strokeWidth="1.8" />
            <path d={LUNG} fill={`url(#${id}h)`} />
            {/* alvéolos: íntegros (sano) o fusionados en bullas (enfisema) */}
            {dots}
            {/* árbol bronquial */}
            <g stroke={drug ? '#1d4ed8' : '#3f5668'} strokeLinecap="round" fill="none" style={{ transition: 'stroke .6s' }}>
              {BRONCHI.map(([d, w, o], i) => (
                <path key={i} d={d} strokeWidth={w * caliber} opacity={o} style={transitionW} />
              ))}
            </g>
          </g>
        ))}

        {/* ráfaga de salbutamol */}
        {puffKey > 0 && (
          <g key={puffKey} aria-hidden>
            {Array.from({ length: 9 }, (_, i) => (
              <circle key={i} cx={146 + (i % 3) * 4} cy={48 + (i % 3) * 6} r={2.6 + (i % 2)} fill="#1d4ed8"
                style={{ animation: `puff ${1.1 + (i % 4) * 0.18}s ease-out ${i * 0.09}s both` }} />
            ))}
          </g>
        )}
        {zoom && (
          <g>
            <circle cx="96" cy="222" r="19" fill="none" stroke="#0b1f2e" strokeWidth="2" strokeDasharray="4 3" />
            <path d="M115 214 L150 192" stroke="#0b1f2e" strokeWidth="1.4" opacity=".6" />
          </g>
        )}
      </g>
    </svg>
  )
}

export default memo(Lungs)
