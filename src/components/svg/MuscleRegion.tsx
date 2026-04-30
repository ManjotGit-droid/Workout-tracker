import { motion } from 'framer-motion'

interface Props {
  id: string
  d: string
  fill: string
  glow: string
  isActivated?: boolean
  isInteractive?: boolean
  onClick?: () => void
  opacity?: number
}

export function MuscleRegion({ id, d, fill, glow, isActivated, isInteractive, onClick, opacity = 1 }: Props) {
  const glowFilter = glow ? `drop-shadow(0 0 4px ${glow})` : 'none'
  const activatedVariants = {
    idle: { filter: glowFilter },
    pulse: {
      filter: [
        `drop-shadow(0 0 3px ${glow})`,
        `drop-shadow(0 0 14px ${glow}) drop-shadow(0 0 28px ${glow})`,
        `drop-shadow(0 0 3px ${glow})`,
      ],
    },
  }

  return (
    <motion.path
      id={id}
      d={d}
      fill={fill}
      opacity={opacity}
      style={{ cursor: isInteractive ? 'pointer' : 'default' }}
      variants={glow ? activatedVariants : undefined}
      animate={isActivated && glow ? 'pulse' : 'idle'}
      transition={isActivated ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
      whileHover={isInteractive ? { opacity: 0.85, scale: 1.02 } : undefined}
      onClick={isInteractive ? onClick : undefined}
    />
  )
}
