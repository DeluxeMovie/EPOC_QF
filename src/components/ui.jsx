import { reveal } from '../lib/reveal'

/** Cada sección tiene su propio fondo y acento (sobre una página blanca). */
export const THEMES = {
  hero: { bg: '#ffffff', accent: '#1d4ed8' },
  facts: { bg: '#f0f9ff', accent: '#0369a1' },
  question: { bg: '#0b2a3a', accent: '#5eead4', dark: true },
  inside: { bg: '#ecfeff', accent: '#0e7490' },
  drug: { bg: '#eff6ff', accent: '#1d4ed8' },
  gloss: { bg: '#f1f5f9', accent: '#334155' },
  path: { bg: '#ffffff', accent: '#be123c' },
  ideas: { bg: '#f7fee7', accent: '#4d7c0f' },
  stage: { bg: '#ffffff', accent: '#047857' },
  spiro: { bg: '#f0fdf4', accent: '#15803d' },
  mech: { bg: '#f8fafc', accent: '#0e7490' },
  analysis: { bg: '#f0f9ff', accent: '#0369a1' },
  concl: { bg: '#f0fdfa', accent: '#0f766e' },
  game: { bg: '#07131c', accent: '#34d399', dark: true },
  refs: { bg: '#f1f5f9', accent: '#334155' },
}

/** Sección a todo el ancho. El centrado se resuelve con CSS (.band), sin div envolvente. */
export function Band({ id, theme = 'stage', className = '', children, ...p }) {
  const t = THEMES[theme]
  return (
    <section id={id} data-theme={theme} style={{ background: t.bg, '--accent': t.accent }} className={`band ${t.dark ? 'text-slate-100' : 'text-ink'} ${className}`} {...p}>
      {children}
    </section>
  )
}

/** Texto que aparece al entrar en pantalla. `*palabra*` = cursiva. Por palabra (barato) o por letra. */
export function Split({ text, as: Tag = 'span', step = 40, delay = 0, by = 'word', className = '' }) {
  const words = text.split(' ')
  const it = (w) => w.includes('*')
  const clean = (w) => w.replace(/\*/g, '')
  let n = 0
  return (
    <Tag ref={reveal} aria-label={clean(text)} className={className}>
      {words.map((w, wi) =>
        by === 'word' ? (
          <span key={wi} aria-hidden>
            <span className={`sp ${it(w) ? 'italic' : ''}`} style={{ '--d': `${delay + wi * step}ms` }}>{clean(w)}</span>{' '}
          </span>
        ) : (
          <span key={wi} aria-hidden className={`inline-block whitespace-nowrap ${it(w) ? 'italic' : ''}`}>
            {[...clean(w)].map((u, ui) => <span key={ui} className="sp" style={{ '--d': `${delay + n++ * step}ms` }}>{u}</span>)}
            {wi < words.length - 1 ? ' ' : ''}
          </span>
        ),
      )}
    </Tag>
  )
}

/** Bloque que aparece (con retardo opcional). */
export function Rv({ as: Tag = 'div', d = 0, kind = 'rv', className = '', style, children, ...p }) {
  return (
    <Tag ref={reveal} className={`${kind} ${className}`} style={{ '--d': `${d}ms`, ...style }} {...p}>
      {children}
    </Tag>
  )
}

/** Flecha rellena (triángulo), la única flecha permitida. */
export function Tri({ dir = 'right', className = '' }) {
  const rot = { right: 0, down: 90, left: 180, up: -90 }[dir]
  return (
    <svg viewBox="0 0 10 10" aria-hidden className={`inline-block h-[0.65em] w-[0.65em] ${className}`} style={{ transform: `rotate(${rot}deg)` }}>
      <path d="M1.5 0.8 9 5 1.5 9.2Z" fill="currentColor" />
    </svg>
  )
}

export function Head({ n, label, title, lead, dark }) {
  return (
    <header className="max-w-4xl">
      <p className="num text-xs font-medium uppercase tracking-[0.16em]" style={{ color: 'var(--accent)' }}>
        <span>{n}</span><span className="ml-4">{label}</span>
      </p>
      <h2 className="mt-2 text-4xl leading-[0.98] text-balance sm:text-6xl"><Split text={title} /></h2>
      {lead && <Rv as="p" d={300} className={`mt-4 max-w-3xl text-lg sm:text-xl ${dark ? 'text-slate-300' : 'text-ink/75'}`}>{lead}</Rv>}
    </header>
  )
}

/** Guía de lectura: qué muestra, qué compara, cómo se lee. */
export function HowTo({ title = 'Cómo leer esto', items, dark = false, className = '' }) {
  return (
    <Rv as="aside" className={`border-l-[3px] pl-5 ${className}`} style={{ borderColor: 'var(--accent)' }}>
      <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--accent)' }}>{title}</h3>
      <ul className="mt-2 space-y-1.5">
        {items.map(([k, t]) => (
          <li key={k} className={dark ? 'text-slate-300' : 'text-ink/75'}>
            <strong className={dark ? 'text-white' : 'text-ink'}>{k}. </strong>{t}
          </li>
        ))}
      </ul>
    </Rv>
  )
}

/** Dato importante, grande y visible. */
export function Note({ label = 'Ojo', children, dark = false, className = '' }) {
  return (
    <Rv as="aside" className={`rounded-2xl px-5 py-4 sm:px-6 ${className}`} style={{ background: `color-mix(in srgb, var(--accent) ${dark ? 16 : 10}%, transparent)` }}>
      <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--accent)' }}>{label}</h3>
      <p className={`mt-1 text-lg font-medium leading-snug sm:text-xl ${dark ? 'text-white' : 'text-ink'}`}>{children}</p>
    </Rv>
  )
}

/** Pestañas de texto subrayadas; el color cambia al pasar el cursor. */
export function Tabs({ value, onChange, options, label, dark = false, className = '' }) {
  return (
    <div role="radiogroup" aria-label={label} className={`flex gap-x-6 ${className}`}>
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={String(o.value)}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`min-h-11 cursor-pointer border-b-2 text-[15px] font-semibold transition-colors duration-200 ${
              on ? (dark ? 'text-white' : 'text-ink') : `border-transparent hov ${dark ? 'text-slate-500' : 'text-muted'}`
            }`}
            style={on ? { borderColor: o.color ?? 'var(--accent)' } : undefined}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** Deslizador: la etiqueta envuelve al input (sin id ni div) y el valor es un <output>. */
export function Slider({ label, value, min, max, step = 1, unit, onChange, color = 'var(--color-drug)', display, dark = false, className = '' }) {
  return (
    <label className={`block min-w-[180px] flex-1 text-sm ${dark ? 'text-slate-400' : 'text-muted'} ${className}`}>
      <span className="flex items-baseline justify-between gap-3">
        <span>{label}</span>
        <output className={`num whitespace-nowrap font-medium ${dark ? 'text-slate-100' : 'text-ink'}`}>{display ?? `${value}${unit ? ' ' + unit : ''}`}</output>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} style={{ '--thumb': color }} className="mt-2 block" />
    </label>
  )
}

export function Button({ variant = 'primary', className = '', ...p }) {
  const v = {
    primary: 'bg-ink text-white hover:bg-[var(--accent)]',
    drug: 'bg-drug text-white hover:bg-[#1e40af]',
    ghost: 'text-ink hov hover:bg-transparent',
    light: 'bg-white text-ink hover:bg-slate-200',
  }[variant]
  return (
    <button
      className={`press inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${v} ${className}`}
      {...p}
    />
  )
}
