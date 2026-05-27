import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/AppContext'
import { useToast } from '../ui/Toast'
import { deleteWorkout as apiDeleteWorkout } from '../../api/workouts'
import { GlowButton } from '../ui/GlowButton'
import { formatDate } from '../../utils/formatters'
import type { WorkoutSession } from '../../types'

interface Props {
  workout: WorkoutSession | null
  onClose: () => void
}

/**
 * Bottom-sheet action menu shown on long-press of a workout history item.
 * Offers: Duplicate to today (creates a new active workout with the same
 * exercise list — no weights carried over), and Delete (drops the row from
 * history + IDB; confirmation step inline).
 */
export const WorkoutContextMenu = ({ workout, onClose }: Props) => {
  const { startWorkout, addExercise, state, dispatch } = useAppStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!workout) return null

  const exerciseCount = workout.exercises.length
  const setCount = workout.exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.completed).length, 0)

  const handleDuplicate = async () => {
    if (busy || state.activeWorkout) {
      if (state.activeWorkout) toast({ message: 'Finish your current workout first', variant: 'info' })
      return
    }
    setBusy(true)
    try {
      await startWorkout()
      for (const we of workout.exercises) {
        await addExercise(we.exerciseId)
      }
      toast({ message: `Duplicated · ${exerciseCount} exercises`, variant: 'success' })
      onClose()
      navigate('/workout')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (busy) return
    setBusy(true)
    try {
      await apiDeleteWorkout(workout.id).catch(() => {/* still drop from state */})
      dispatch({ type: 'DELETE_WORKOUT_FROM_HISTORY', workoutId: workout.id })
      toast({ message: 'Workout deleted', variant: 'success' })
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={() => !busy && onClose()} />
        <motion.div
          className="relative z-10 w-full max-w-lg bg-surface border-t border-border rounded-t-2xl p-5 safe-bottom"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 480, damping: 32 }}
        >
          <div className="text-xs font-mono text-text-muted mb-1">{formatDate(workout.date)}</div>
          <h3 className="text-lg font-display font-bold mb-1">Workout actions</h3>
          <p className="text-xs font-mono text-text-muted mb-4">
            {exerciseCount} exercises · {setCount} sets logged
          </p>

          {!confirmDelete ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDuplicate}
                disabled={busy}
                className="app-card flex items-center gap-3 px-3 py-3 text-left hover:border-brand/40 disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-brand flex-shrink-0">
                  <rect x="9" y="9" width="13" height="13" rx="2" strokeLinejoin="round" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeLinejoin="round" />
                </svg>
                <div className="flex-1">
                  <div className="text-sm font-display font-semibold">Duplicate to today</div>
                  <div className="text-[11px] font-mono text-text-muted">Starts a new session with the same exercises (no weights carried)</div>
                </div>
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={busy}
                className="app-card flex items-center gap-3 px-3 py-3 text-left hover:border-danger/40 disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-danger flex-shrink-0">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex-1">
                  <div className="text-sm font-display font-semibold text-danger">Delete workout</div>
                  <div className="text-[11px] font-mono text-text-muted">Removes the row from history. Cannot be undone.</div>
                </div>
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm font-mono text-text-muted mb-4">
                Delete this workout? Personal records earned in it stay; only the row is removed.
              </p>
              <div className="flex gap-3">
                <GlowButton variant="danger" className="flex-1" onClick={handleDelete} disabled={busy}>
                  {busy ? 'Deleting…' : 'Delete'}
                </GlowButton>
                <GlowButton variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)} disabled={busy}>
                  Cancel
                </GlowButton>
              </div>
            </>
          )}

          <button
            onClick={() => !busy && onClose()}
            className="w-full text-center text-xs font-mono text-text-muted mt-4 py-2"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
