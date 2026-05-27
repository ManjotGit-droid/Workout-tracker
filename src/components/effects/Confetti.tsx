import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  /** Stop emitting confetti when false (default true). */
  active?: boolean
  /** Optional label rendered above the burst. */
  label?: string
}

type ParticleKind = 'tri' | 'square' | 'circle'

// Hand-drawn particle palette. Six pieces is enough to read as "confetti"
// without becoming distracting. Each particle is laid out around the origin
// and animated outward with framer-motion.
const PARTICLES: Array<{ x: number; y: number; angle: number; color: string; kind: ParticleKind }> = [
  { x:  60, y: -10, angle:   15, color: '#fbbf24', kind: 'tri' },
  { x: -50, y:  10, angle:  -25, color: '#38c6f0', kind: 'square' },
  { x:  30, y:  60, angle:   45, color: '#ec4899', kind: 'circle' },
  { x: -70, y: -30, angle: -120, color: '#a855f7', kind: 'tri' },
  { x:  80, y:  40, angle:   75, color: '#22ee99', kind: 'square' },
  { x: -30, y:  70, angle:  -90, color: '#f59e0b', kind: 'circle' },
]

/**
 * One-shot celebration burst. Plays once on mount, then stays in its
 * final state (faded out). Respects prefers-reduced-motion by snapping to
 * the resting position without an animation.
 */
export const Confetti = ({ active = true, label }: Props) => {
  const reduced = useReducedMotion()
  if (!active) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center select-none" aria-hidden="true">
      {label && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-6 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold text-[11px] font-mono uppercase tracking-widest"
        >
          {label}
        </motion.div>
      )}
      <div className="relative w-0 h-0 mt-10">
        {PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: 0, top: 0 }}
            initial={reduced ? false : { x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.4 }}
            animate={reduced
              ? { x: p.x, y: p.y, rotate: p.angle, opacity: 1, scale: 1 }
              : { x: [0, p.x], y: [0, p.y], rotate: [0, p.angle], opacity: [0, 1, 1, 0], scale: [0.4, 1, 1, 0.8] }
            }
            transition={reduced ? { duration: 0 } : { duration: 1.2, delay: i * 0.04, ease: 'easeOut', times: [0, 0.3, 0.7, 1] }}
          >
            <Particle kind={p.kind} color={p.color} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const Particle = ({ kind, color }: { kind: ParticleKind; color: string }) => {
  if (kind === 'tri') {
    return (
      <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
        <path d="M6 1L11 11L1 11Z" fill={color} />
      </svg>
    )
  }
  if (kind === 'square') {
    return (
      <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
        <rect x="1" y="1" width="10" height="10" rx="1.5" fill={color} />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 12 12" width="9" height="9" aria-hidden="true">
      <circle cx="6" cy="6" r="5" fill={color} />
    </svg>
  )
}
