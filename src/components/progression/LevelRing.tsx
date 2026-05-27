import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  /** Level number rendered in the centre. */
  level: number
  /** XP progress toward the next level, 0–1. */
  pct: number
  /** Ring colour (hex or CSS var). */
  color: string
  /** Outer diameter in px. Default 56. */
  size?: number
  /** Stroke width in px. Default 4. */
  stroke?: number
  className?: string
}

/**
 * Animated circular progress ring with the level number centred. Used on the
 * Dashboard "Top Level" stat — fitness apps canonically use rings for
 * progress (ui-ux-pro-max skill rec). Pure SVG + framer-motion, no deps.
 *
 * Reduced-motion users get the ring at its final state with no animation.
 */
export const LevelRing = ({
  level,
  pct,
  color,
  size = 56,
  stroke = 4,
  className = '',
}: Props) => {
  const reduced = useReducedMotion()
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(1, pct))
  const offset = circumference * (1 - clamped)

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
          opacity={0.4}
        />
        {/* Fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduced ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={reduced ? { duration: 0 } : { duration: 0.9, ease: 'easeOut', delay: 0.1 }}
          style={{ filter: clamped > 0.05 ? `drop-shadow(0 0 4px ${color})` : 'none' }}
        />
      </svg>
      <span
        className="absolute font-mono font-bold tabular-nums"
        style={{ fontSize: size * 0.35, color }}
      >
        {level}
      </span>
    </div>
  )
}
