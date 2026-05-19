import { motion } from 'framer-motion'

interface Props {
  id: string
  d: string
  /** Default (inactive) fill — usually a CSS variable. */
  fill: string
  /** Highlight colour used when isActivated is true. */
  glow: string
  isActivated?: boolean
  isInteractive?: boolean
  onClick?: () => void
  /** Optional stroke colour for muscle definition lines (defaults to --body-line). */
  stroke?: string
  /** Extra class names appended to the default `body-muscle` class. */
  className?: string
}

/**
 * A single muscle region on the body diagram.  Renders as a filled SVG path
 * with a subtle anatomy outline.  When `isActivated` is true, the fill
 * switches to the highlight colour and a soft pulsing glow is added.
 *
 * Default class: `body-muscle`.  When activated, an extra `is-activated`
 * class is added so the muscle can also be styled from external CSS.
 */
export const MuscleRegion = ({
  id,
  d,
  fill,
  glow,
  isActivated,
  isInteractive,
  onClick,
  stroke = 'var(--body-line)',
  className = '',
}: Props) => {
  const targetFill = isActivated ? glow : fill
  const filter = isActivated ? `drop-shadow(0 0 4px ${glow}) drop-shadow(0 0 10px ${glow})` : 'none'

  return (
    <motion.path
      id={id}
      d={d}
      className={`body-muscle ${isActivated ? 'is-activated' : ''} ${className}`.trim()}
      data-muscle-id={id}
      data-activated={isActivated ? 'true' : 'false'}
      stroke={stroke}
      strokeWidth={0.6}
      strokeLinejoin="round"
      animate={{ fill: targetFill, filter }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ cursor: isInteractive ? 'pointer' : 'default' }}
      whileHover={isInteractive ? { opacity: 0.82, scale: 1.005 } : undefined}
      onClick={isInteractive ? onClick : undefined}
    />
  )
}
