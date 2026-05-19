import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  glow?: 'purple' | 'blue' | 'gold' | 'none'
  onClick?: () => void
}

// Apple-style card — subtle shadow, hairline border, no neon glow.
// `glow` prop is preserved for API compatibility but only adds a thin coloured ring.
const accentRing = {
  purple: 'ring-1 ring-brand/20',
  blue:   'ring-1 ring-brand/20',
  gold:   'ring-1 ring-gold/25',
  none:   '',
}

export const NeonCard = ({ children, className = '', glow = 'none', onClick }: Props) => (
  <div
    className={`app-card ${accentRing[glow]} ${onClick ? 'app-card-pressable cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
)
