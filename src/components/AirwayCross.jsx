import { memo } from 'react'

/**
 * Corte transversal de un bronquio.
 * contraction 0–1: cuánto se aprieta el músculo que rodea la vía (más apretado = vía más angosta).
 * drug: muestra el salbutamol unido al músculo.
 */
function AirwayCross({ contraction = 0, drug = false, title, className = '', ...p }) {
  const muscle = 6 + 30 * contraction
  const lumen = 66 - muscle - 8
  const air = Math.round((lumen * lumen) / 55)
  const mid = 66 - muscle / 2
  const T = 'all .8s cubic-bezier(.3,.8,.3,1)'
  return (
    <svg viewBox="-100 -100 200 200" role="img" aria-label={title} className={`block h-auto w-full ${className}`} {...p}>
      <circle r="84" fill="#f8fafc" stroke="#cbd5e1" />
      {/* pared externa */}
      <circle r="70" fill="none" stroke="#94a3b8" strokeWidth="3" />
      {/* músculo liso */}
      <circle r={mid} fill="none" stroke={contraction > 0.3 ? '#be123c' : '#fb7185'} strokeOpacity={0.85} strokeWidth={muscle} style={{ transition: T }} />
      {/* mucosa */}
      <circle r={lumen + 4} fill="none" stroke="#fecdd3" strokeWidth="8" style={{ transition: T }} />
      {/* luz: por donde pasa el aire */}
      <circle r={lumen} fill="#eff6ff" stroke={drug ? '#1d4ed8' : '#93c5fd'} strokeWidth={drug ? 3 : 1.5} style={{ transition: T }} />
      {Array.from({ length: Math.min(40, air) }, (_, i) => {
        const a = i * 2.39996
        const rr = Math.sqrt((i + 0.5) / Math.min(40, air)) * (lumen - 5)
        return <circle key={i} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} r="2" fill="#60a5fa" opacity=".7" />
      })}
      {drug && Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2
        return <circle key={'d' + i} cx={Math.cos(a) * mid} cy={Math.sin(a) * mid} r="3.2" fill="#1d4ed8" stroke="#fff" strokeWidth="1" />
      })}
      <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e3a8a">paso del aire</text>
      <text x="0" y="-90" textAnchor="middle" fontSize="10.5" fill="#be123c" fontWeight="600">músculo</text>
    </svg>
  )
}

export default memo(AirwayCross)
