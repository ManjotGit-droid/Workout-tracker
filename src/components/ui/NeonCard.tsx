import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Tint palette used by the colored partition look (Dribbble fitness ref).
 * Each entry is a `linear-gradient(...)` string applied as an absolutely-
 * positioned overlay so it sits underneath the card content but above the
 * solid background. Add more here and they're available app-wide.
 */
export type CardTint =
  | 'none'
  | 'cyan'
  | 'violet'
  | 'amber'
  | 'emerald'
  | 'rose'
  | 'indigo'
  | 'pink'
  | 'orange'
  | 'teal'

const TINT_BG: Record<CardTint, string> = {
  none:    '',
  cyan:    'linear-gradient(135deg, rgba(56,198,240,0.42), rgba(56,198,240,0.08) 80%)',
  violet:  'linear-gradient(135deg, rgba(167,139,250,0.40), rgba(167,139,250,0.08) 85%)',
  amber:   'linear-gradient(135deg, rgba(251,191,36,0.42), rgba(251,191,36,0.08) 85%)',
  emerald: 'linear-gradient(135deg, rgba(52,211,153,0.40), rgba(52,211,153,0.08) 85%)',
  rose:    'linear-gradient(135deg, rgba(251,113,133,0.40), rgba(251,113,133,0.08) 85%)',
  indigo:  'linear-gradient(135deg, rgba(129,140,248,0.40), rgba(129,140,248,0.08) 85%)',
  pink:    'linear-gradient(135deg, rgba(244,114,182,0.40), rgba(244,114,182,0.08) 85%)',
  orange:  'linear-gradient(135deg, rgba(251,146,60,0.42), rgba(251,146,60,0.08) 85%)',
  teal:    'linear-gradient(135deg, rgba(45,212,191,0.40), rgba(45,212,191,0.08) 85%)',
}

interface Props {
  children: ReactNode
  className?: string
  glow?: 'purple' | 'blue' | 'gold' | 'none'
  /** Optional tinted background gradient — see CardTint. Defaults to 'none'. */
  tint?: CardTint
  onClick?: () => void
}

// Apple-style card — subtle shadow, hairline border, optional accent ring.
const accentRing = {
  purple: 'ring-1 ring-brand/20',
  blue:   'ring-1 ring-brand/20',
  gold:   'ring-1 ring-gold/25',
  none:   '',
}

/**
 * Renders as a non-interactive div when `onClick` is absent.
 * When `onClick` is provided, switches to a motion.button so we get
 * a consistent press-flicker (whileTap scale) and proper keyboard
 * focusability without changing visual styling.
 *
 * When `tint` is provided, an absolutely-positioned gradient overlay is
 * rendered behind the children (above the card base bg, below content).
 * The wrapper auto-applies `relative overflow-hidden` so the gradient
 * gets clipped to the card's rounded corners.
 */
export const NeonCard = ({
  children,
  className = '',
  glow = 'none',
  tint = 'none',
  onClick,
}: Props) => {
  const baseClass = `app-card ${accentRing[glow]} ${tint !== 'none' ? 'relative overflow-hidden' : ''} ${className}`
  const overlay = tint !== 'none' && (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{ background: TINT_BG[tint] }}
    />
  )
  const contentWrap = tint !== 'none'
    ? <div className="relative z-10 contents">{children}</div>
    : children

  if (!onClick) {
    return (
      <div className={baseClass}>
        {overlay}
        {contentWrap}
      </div>
    )
  }
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className={`${baseClass} app-card-pressable cursor-pointer text-left w-full`}
    >
      {overlay}
      {contentWrap}
    </motion.button>
  )
}
