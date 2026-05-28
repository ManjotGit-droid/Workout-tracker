import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Card tints used to be a rainbow palette overlaid on each card. Forge
 * uses a single restrained accent, so every tint value collapses to the
 * same flat hairline card. The CardTint type is preserved as a no-op
 * literal union so all the existing `tint="violet"` etc. call sites still
 * type-check without us having to touch every page.
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

interface Props {
  children: ReactNode
  className?: string
  glow?: 'purple' | 'blue' | 'gold' | 'none'
  tint?: CardTint
  onClick?: () => void
}

export const NeonCard = ({
  children,
  className = '',
  glow: _glow = 'none',
  tint: _tint = 'none',
  onClick,
}: Props) => {
  // _glow / _tint intentionally unused — Forge cards are flat.
  void _glow; void _tint
  const baseClass = `app-card ${className}`

  if (!onClick) {
    return <div className={baseClass}>{children}</div>
  }
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className={`${baseClass} app-card-pressable cursor-pointer text-left w-full`}
    >
      {children}
    </motion.button>
  )
}
