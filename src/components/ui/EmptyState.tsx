import type { ReactNode } from 'react'

interface Props {
  /** Pre-defined glyph or your own ReactNode. */
  glyph?: 'workouts' | 'history' | 'chart' | 'muscle' | ReactNode
  title: string
  /** Optional 1-line subtitle below the title. */
  subtitle?: string
  /** Optional CTA (rendered as a child — usually a <GlowButton>). */
  action?: ReactNode
  className?: string
}

/**
 * Generic empty-state card. Use anywhere we'd otherwise render nothing.
 * Glyph is a hand-drawn inline SVG (no external assets), tinted by the
 * theme so it picks up light/dark mode automatically.
 */
export const EmptyState = ({ glyph = 'workouts', title, subtitle, action, className = '' }: Props) => (
  <div className={`flex flex-col items-center text-center px-6 py-8 ${className}`}>
    <div className="w-16 h-16 mb-3 text-text-muted/70" aria-hidden="true">
      {typeof glyph === 'string' ? <Glyph kind={glyph as GlyphKind} /> : glyph}
    </div>
    <h4 className="text-[14px] font-display font-semibold text-text">{title}</h4>
    {subtitle && (
      <p className="text-[12px] font-mono text-text-muted mt-1 max-w-[260px] leading-relaxed">
        {subtitle}
      </p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
)

type GlyphKind = 'workouts' | 'history' | 'chart' | 'muscle'

const Glyph = ({ kind }: { kind: GlyphKind }) => {
  const common = 'w-full h-full'
  switch (kind) {
    case 'workouts':
      // Dumbbell sitting on the floor
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <line x1="12" y1="32" x2="52" y2="32" />
          <rect x="8" y="22" width="6" height="20" rx="1.5" />
          <rect x="50" y="22" width="6" height="20" rx="1.5" />
          <rect x="4" y="26" width="3" height="12" rx="1" />
          <rect x="57" y="26" width="3" height="12" rx="1" />
          <line x1="8" y1="52" x2="56" y2="52" strokeDasharray="3 4" opacity="0.5" />
        </svg>
      )
    case 'history':
      // Open page with horizontal lines (a "log")
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <rect x="12" y="8" width="40" height="48" rx="3" />
          <line x1="20" y1="20" x2="44" y2="20" />
          <line x1="20" y1="30" x2="40" y2="30" />
          <line x1="20" y1="40" x2="44" y2="40" />
          <line x1="20" y1="50" x2="36" y2="50" />
        </svg>
      )
    case 'chart':
      // Simple bar chart silhouette
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <line x1="8" y1="56" x2="56" y2="56" />
          <line x1="8" y1="56" x2="8" y2="14" />
          <rect x="16" y="38" width="8" height="18" rx="1" />
          <rect x="28" y="28" width="8" height="28" rx="1" />
          <rect x="40" y="20" width="8" height="36" rx="1" />
        </svg>
      )
    case 'muscle':
      // Bicep / flex icon (stylised)
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="M14 40c0-10 8-18 18-18 6 0 10 3 13 7 4 5 5 11 5 17" />
          <path d="M30 22V8" />
          <path d="M50 46l4 8" />
          <circle cx="32" cy="38" r="6" />
        </svg>
      )
  }
}
