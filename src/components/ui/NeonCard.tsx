import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  glow?: 'purple' | 'blue' | 'gold' | 'none'
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
 */
export const NeonCard = ({ children, className = '', glow = 'none', onClick }: Props) => {
  const baseClass = `app-card ${accentRing[glow]} ${className}`
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
