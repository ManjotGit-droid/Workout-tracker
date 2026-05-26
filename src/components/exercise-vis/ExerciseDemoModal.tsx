import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { GlowButton } from '../ui/GlowButton'
import { BodyDiagram } from '../svg/BodyDiagram'
import {
  getMovementPattern,
  PATTERN_CUES,
  youtubeSearchUrl,
} from '../../utils/movementPattern'
import { MUSCLE_GROUPS } from '../../data/muscleGroups'
import type { Exercise, MuscleGroupId } from '../../types'

/**
 * Modal showing the user's body diagram with the muscles targeted by this
 * exercise highlighted + a subtle breathing pulse so it reads as "alive",
 * 3–5 form cues for the movement pattern, the muscle chips, and a
 * "Watch tutorial" link that opens a curated YouTube search.
 *
 * The diagram visualisation works offline — pure local SVG. The YouTube
 * link only fires when the user taps it; nothing is pre-fetched.
 *
 * The body-diagram approach replaced an earlier per-pattern stick-figure
 * animation: showing real muscles tied to the user's training picture
 * lands better than a generic stick figure, and the diagram already lives
 * elsewhere in the app so the visual language stays consistent.
 */
interface Props {
  exercise: Exercise | null
  onClose: () => void
}

export const ExerciseDemoModal = ({ exercise, onClose }: Props) => {
  return (
    <AnimatePresence>
      {exercise && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="modal-backdrop absolute inset-0" onClick={onClose} />
          <motion.div
            className="relative z-10 w-full max-w-lg bg-elevated border-t sm:border border-border rounded-t-2xl sm:rounded-2xl p-5 max-h-[92vh] overflow-y-auto"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            <ModalBody exercise={exercise} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const ModalBody = ({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) => {
  const pattern = getMovementPattern(exercise)
  const cues = PATTERN_CUES[pattern]
  const primary = exercise.muscles.filter((m) => m.type === 'primary').map((m) => m.muscleId as MuscleGroupId)
  const secondary = exercise.muscles.filter((m) => m.type === 'secondary').map((m) => m.muscleId as MuscleGroupId)
  const ytUrl = youtubeSearchUrl(exercise)
  const prefersReducedMotion = useReducedMotion()

  // Primary muscles are the ones we highlight. (Secondary muscles already
  // appear in the chip list below — adding them to the activation set tends
  // to wash out the visual signal that "these are the main movers".)
  const activated = primary

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-[18px] font-semibold tracking-tight text-text leading-tight">{exercise.name}</h3>
          <div className="text-[11px] font-mono text-text-muted mt-0.5 capitalize">
            {exercise.category} · {exercise.equipment} · {cues.title.toLowerCase()}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-text-muted hover:text-text p-1 -mr-1"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Body-diagram visualization — muscles targeted by the exercise
          glow, and the whole figure breathes gently so it reads as "alive".
          The breathing is dropped under prefers-reduced-motion. */}
      <div className="bg-sunken border border-border rounded-xl p-3 mb-3 flex items-center justify-center">
        <motion.div
          className="w-full max-w-[280px]"
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.025, 1] }}
          transition={prefersReducedMotion ? undefined : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <BodyDiagram activatedMuscleIds={activated} className="max-h-72" />
        </motion.div>
      </div>

      <div className="text-[10px] font-mono text-text-muted/70 text-center mb-3">
        Highlighted muscles are the primary movers.
      </div>

      {/* Pattern label */}
      <div className="text-[11px] font-mono text-text-muted uppercase tracking-widest mb-1">
        Movement pattern
      </div>
      <div className="text-[13px] font-semibold text-text mb-3">{cues.title}</div>

      {/* Form cues */}
      <div className="text-[11px] font-mono text-text-muted uppercase tracking-widest mb-1.5">
        Form cues
      </div>
      <ul className="flex flex-col gap-1.5 mb-4">
        {cues.cues.map((c, i) => (
          <li key={i} className="flex gap-2 text-[13px] text-text leading-snug">
            <span className="text-brand mt-0.5">▸</span>
            <span>{c}</span>
          </li>
        ))}
      </ul>

      {/* Muscles */}
      {(primary.length > 0 || secondary.length > 0) && (
        <>
          <div className="text-[11px] font-mono text-text-muted uppercase tracking-widest mb-1.5">
            Muscles trained
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {primary.map((id) => (
              <span key={id} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-brand text-white">
                {MUSCLE_GROUPS[id]?.shortName ?? id}
              </span>
            ))}
            {secondary.map((id) => (
              <span key={id} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-brand-soft border border-brand/30 text-brand">
                {MUSCLE_GROUPS[id]?.shortName ?? id}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Description (if any) */}
      {exercise.description && (
        <p className="text-[12px] font-mono text-text-muted leading-relaxed mb-4">
          {exercise.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={ytUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <GlowButton className="w-full" variant="primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M23 12s-3.5-7-11-7S1 12 1 12s3.5 7 11 7 11-7 11-7z" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Watch tutorial
          </GlowButton>
        </a>
        <GlowButton variant="secondary" onClick={onClose}>Close</GlowButton>
      </div>
      <p className="text-[10px] font-mono text-text-muted/60 mt-2 text-center">
        Tutorial opens a YouTube search in a new tab.
      </p>
    </>
  )
}
