import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlowButton } from '../ui/GlowButton'
import type { LoggedSet } from '../../types'

interface NotesSheetProps {
  sheet: { loggedExerciseId: string; set: LoggedSet } | null
  onClose: () => void
  onSave: (notes: string, rpe: number | null) => void
}

/**
 * Bottom-sheet for editing per-set notes and RPE. The outer wrapper handles
 * the animated open/close; the inner panel owns the local form state and is
 * remounted (via `key={set.id}`) every time a different set is opened so
 * state initialises cleanly each time.
 */
export const NotesRpeSheet = ({ sheet, onClose, onSave }: NotesSheetProps) => (
  <AnimatePresence>
    {sheet && (
      <motion.div
        key={sheet.set.id}
        className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <NotesRpeSheetInner sheet={sheet} onClose={onClose} onSave={onSave} />
      </motion.div>
    )}
  </AnimatePresence>
)

const NotesRpeSheetInner = ({ sheet, onClose, onSave }: NotesSheetProps) => {
  const [notes, setNotes] = useState<string>(sheet?.set.notes ?? '')
  const [rpe, setRpe] = useState<number | null>(sheet?.set.rpe ?? null)
  if (!sheet) return null

  return (
    <motion.div
      className="relative z-10 w-full max-w-lg bg-sl-surface border-t border-sl-border rounded-t-2xl p-5"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
    >
      <h3 className="text-lg font-display font-bold mb-3">Set notes</h3>

      <label className="text-[11px] font-mono text-sl-muted uppercase tracking-wider block mb-1">
        Notes (form cues, fatigue, equipment…)
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="e.g. left arm fatigued, kept form tight"
        rows={3}
        className="w-full bg-sl-bg border border-sl-border rounded-lg px-3 py-2 text-sm font-mono text-sl-text outline-none focus:border-sl-purple resize-none mb-4"
      />

      <div className="flex items-baseline justify-between mb-1">
        <label className="text-[11px] font-mono text-sl-muted uppercase tracking-wider">
          RPE (Rate of Perceived Exertion)
        </label>
        <span className="text-[11px] font-mono text-brand tabular-nums">
          {rpe === null ? '—' : `${rpe} / 10`}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={rpe ?? 0}
        onChange={(e) => setRpe(parseInt(e.target.value, 10))}
        className="w-full accent-[var(--brand)] mb-1"
      />
      <div className="flex justify-between text-[10px] font-mono text-text-muted mb-4">
        <span>1 easy</span>
        <span>5 moderate</span>
        <span>10 max</span>
      </div>
      {rpe !== null && (
        <button
          onClick={() => setRpe(null)}
          className="text-[11px] font-mono text-text-muted hover:text-text underline mb-4"
        >
          Clear RPE
        </button>
      )}

      <div className="flex gap-3">
        <GlowButton className="flex-1" onClick={() => onSave(notes.trim(), rpe)}>
          Save
        </GlowButton>
        <GlowButton variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </GlowButton>
      </div>
    </motion.div>
  )
}
