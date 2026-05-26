import { useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'

interface Props {
  value: number
  /** Decimal places to display. Default 0 (integer). */
  decimals?: number
  /** Spring stiffness — higher = snappier. Default 80. */
  stiffness?: number
  /** Spring damping. Default 22. */
  damping?: number
  className?: string
}

/**
 * Eases a number from its previous value to `value` on every change.
 * Respects reduce-motion: snaps to the target immediately when enabled.
 * Uses `tabular-nums` so digit-width never shifts during the roll.
 */
export const AnimatedNumber = ({ value, decimals = 0, stiffness = 80, damping = 22, className = '' }: Props) => {
  const reduced = useReducedMotion()
  const motionValue = useMotionValue(value)
  const spring = useSpring(motionValue, { stiffness, damping })
  const text = useTransform(spring, (latest) => latest.toFixed(decimals))

  useEffect(() => {
    if (reduced) {
      motionValue.jump(value)
    } else {
      motionValue.set(value)
    }
  }, [value, reduced, motionValue])

  return <motion.span className={`tabular-nums ${className}`}>{text}</motion.span>
}
