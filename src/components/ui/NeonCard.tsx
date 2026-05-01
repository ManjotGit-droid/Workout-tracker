import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  glow?: 'purple' | 'blue' | 'gold' | 'none'
  onClick?: () => void
}

const glowMap = {
  purple: 'border-sl-purple/40 shadow-neon-sm hover:border-sl-purple/70',
  blue:   'border-sl-blue/40 hover:border-sl-blue/70',
  gold:   'border-sl-gold/40 hover:border-sl-gold/70',
  none:   'border-sl-border',
}

export function NeonCard({ children, className = '', glow = 'none', onClick }: Props) {
  return (
    <div
      className={`bg-sl-surface border rounded-xl transition-all duration-200 ${glowMap[glow]} ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
