import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, useDispatch } from '../store/AppContext'
import { useWorkoutTimer } from '../hooks/useWorkoutTimer'
import { PageHeader } from '../components/layout/PageHeader'
import { GlowButton } from '../components/ui/GlowButton'
import { NeonCard } from '../components/ui/NeonCard'
import { EXERCISES } from '../data/exercises'
import { MUSCLE_GROUPS } from '../data/muscleGroups'
import { fromKg, toKg } from '../utils/formatters'
import type { MuscleGroupId } from '../types'

export function WorkoutActive() {
  const { state } = useAppStore()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { activeWorkout, weightUnit, customExercises } = state
  const timer = useWorkoutTimer(activeWorkout?.startTime ?? null)

  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(!activeWorkout || activeWorkout.exercises.length === 0)
  const searchRef = useRef<HTMLInputElement>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const allExercises = [...EXERCISES, ...customExercises]

  if (!activeWorkout) {
    dispatch({ type: 'START_WORKOUT' })
    return null
  }

  const filtered = allExercises.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.muscles.some((m) => MUSCLE_GROUPS[m.muscleId].name.toLowerCase().includes(search.toLowerCase())),
  )

  function addExercise(exerciseId: string) {
    dispatch({ type: 'ADD_EXERCISE', exerciseId })
    setSearch('')
    setShowSearch(false)
  }

  function addSet(loggedExId: string) {
    dispatch({
      type: 'LOG_SET',
      loggedExerciseId: loggedExId,
      set: { reps: 10, weight: 0, completed: false },
    })
  }

  function updateSet(loggedExId: string, setId: string, field: 'reps' | 'weight', raw: string) {
    const val = parseFloat(raw)
    if (isNaN(val)) return
    const weightKg = field === 'weight' ? toKg(val, weightUnit) : val
    dispatch({
      type: 'UPDATE_SET',
      loggedExerciseId: loggedExId,
      setId,
      patch: field === 'weight' ? { weight: weightKg } : { reps: val },
    })
  }

  function toggleSet(loggedExId: string, setId: string, completed: boolean) {
    dispatch({ type: 'UPDATE_SET', loggedExerciseId: loggedExId, setId, patch: { completed } })
  }

  function finishWorkout() {
    dispatch({ type: 'FINISH_WORKOUT' })
    navigate('/workout/complete', { replace: true })
  }

  const completedSets = activeWorkout.exercises.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.completed).length,
    0,
  )

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Workout"
        subtitle={timer}
        right={
          <div className="flex gap-2">
            <GlowButton
              variant="secondary"
              size="sm"
              onClick={() => setConfirmDiscard(true)}
            >
              Discard
            </GlowButton>
            <GlowButton
              size="sm"
              disabled={completedSets === 0}
              onClick={finishWorkout}
            >
              Finish
            </GlowButton>
          </div>
        }
      />

      <div className="px-4 py-3">
        {/* Completed sets indicator */}
        {completedSets > 0 && (
          <div className="text-xs font-mono text-sl-muted text-center mb-3">
            <span className="text-sl-purple font-bold">{completedSets}</span> sets completed
          </div>
        )}

        {/* Exercise list */}
        <div className="flex flex-col gap-3 mb-4">
          <AnimatePresence>
            {activeWorkout.exercises.map((loggedEx) => {
              const ex = allExercises.find((e) => e.id === loggedEx.exerciseId)
              if (!ex) return null

              const primaryMuscles = ex.muscles
                .filter((m) => m.type === 'primary')
                .map((m) => MUSCLE_GROUPS[m.muscleId as MuscleGroupId]?.shortName)

              return (
                <motion.div
                  key={loggedEx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <NeonCard glow="purple" className="overflow-hidden">
                    {/* Exercise header */}
                    <div className="px-3 py-2.5 flex items-center justify-between border-b border-sl-border">
                      <div>
                        <div className="font-display font-semibold text-sm">{ex.name}</div>
                        <div className="text-xs text-sl-muted font-mono mt-0.5">
                          {primaryMuscles.join(' · ')}
                        </div>
                      </div>
                      <button
                        className="text-sl-muted hover:text-sl-danger p-1"
                        onClick={() => dispatch({ type: 'REMOVE_EXERCISE', loggedExerciseId: loggedEx.id })}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>

                    {/* Sets */}
                    <div className="px-3 py-2">
                      {/* Header */}
                      <div className="grid grid-cols-[28px_1fr_1fr_36px] gap-2 text-xs font-mono text-sl-muted uppercase tracking-wider mb-1.5 px-1">
                        <span>#</span>
                        <span>Reps</span>
                        <span>{weightUnit === 'kg' ? 'kg' : 'lbs'}</span>
                        <span></span>
                      </div>

                      {loggedEx.sets.map((set, idx) => (
                        <div key={set.id} className={`grid grid-cols-[28px_1fr_1fr_36px] gap-2 items-center mb-1.5 rounded-lg px-1 py-1 transition-colors ${set.completed ? 'bg-sl-purple/10' : ''}`}>
                          <span className="text-xs font-mono text-sl-muted text-center">{idx + 1}</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            defaultValue={set.reps}
                            onBlur={(e) => updateSet(loggedEx.id, set.id, 'reps', e.target.value)}
                            className="bg-sl-border/50 border border-sl-border rounded px-2 py-1 text-sm font-mono text-center text-sl-text focus:border-sl-purple outline-none w-full"
                          />
                          <input
                            type="text"
                            inputMode="decimal"
                            defaultValue={set.weight > 0 ? fromKg(set.weight, weightUnit).toFixed(1) : ''}
                            placeholder="0"
                            onBlur={(e) => updateSet(loggedEx.id, set.id, 'weight', e.target.value)}
                            className="bg-sl-border/50 border border-sl-border rounded px-2 py-1 text-sm font-mono text-center text-sl-text focus:border-sl-purple outline-none w-full"
                          />
                          <button
                            onClick={() => toggleSet(loggedEx.id, set.id, !set.completed)}
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                              set.completed
                                ? 'bg-sl-purple border-sl-purple text-white'
                                : 'border-sl-border text-sl-muted hover:border-sl-purple'
                            }`}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      ))}

                      <button
                        className="w-full text-xs font-mono text-sl-muted hover:text-sl-purple border border-dashed border-sl-border hover:border-sl-purple/40 rounded-lg py-1.5 mt-1 transition-colors"
                        onClick={() => addSet(loggedEx.id)}
                      >
                        + Add Set
                      </button>
                    </div>
                  </NeonCard>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Add exercise */}
        {showSearch ? (
          <NeonCard className="overflow-hidden">
            <div className="p-3 border-b border-sl-border">
              <input
                ref={searchRef}
                autoFocus
                type="text"
                placeholder="Search exercises or muscle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sl-text placeholder:text-sl-muted font-mono text-sm outline-none"
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filtered.length === 0 && (
                <div className="p-4 text-center text-sl-muted text-sm font-mono">No exercises found</div>
              )}
              {filtered.map((ex) => {
                const primaryMuscles = ex.muscles
                  .filter((m) => m.type === 'primary')
                  .map((m) => MUSCLE_GROUPS[m.muscleId as MuscleGroupId]?.shortName)
                return (
                  <button
                    key={ex.id}
                    className="w-full px-3 py-2.5 text-left hover:bg-sl-surface flex items-center justify-between border-b border-sl-border/50 last:border-0"
                    onClick={() => addExercise(ex.id)}
                  >
                    <div>
                      <div className="text-sm font-display font-medium">{ex.name}</div>
                      <div className="text-xs text-sl-muted font-mono">{primaryMuscles.join(' · ')}</div>
                    </div>
                    <span className="text-xs font-mono text-sl-muted capitalize ml-2 flex-shrink-0">{ex.equipment}</span>
                  </button>
                )
              })}
            </div>
            {activeWorkout.exercises.length > 0 && (
              <div className="p-2 border-t border-sl-border">
                <button
                  className="w-full text-xs font-mono text-sl-muted py-1"
                  onClick={() => setShowSearch(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </NeonCard>
        ) : (
          <button
            className="w-full border border-dashed border-sl-border hover:border-sl-purple/60 rounded-xl py-3 text-sm font-display text-sl-muted hover:text-sl-purple transition-colors"
            onClick={() => { setShowSearch(true); setTimeout(() => searchRef.current?.focus(), 50) }}
          >
            + Add Exercise
          </button>
        )}

        {/* Unit toggle */}
        <div className="flex items-center gap-2 mt-4 justify-center">
          <span className="text-xs font-mono text-sl-muted">Weight unit:</span>
          {(['kg', 'lbs'] as const).map((u) => (
            <button
              key={u}
              onClick={() => dispatch({ type: 'SET_WEIGHT_UNIT', unit: u })}
              className={`px-3 py-1 text-xs font-mono rounded border transition-colors ${
                weightUnit === u
                  ? 'bg-sl-purple border-sl-purple text-white'
                  : 'border-sl-border text-sl-muted hover:border-sl-purple/40'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Discard confirm modal */}
      <AnimatePresence>
        {confirmDiscard && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmDiscard(false)} />
            <motion.div
              className="relative z-10 w-full max-w-lg bg-sl-surface border-t border-sl-border rounded-t-2xl p-6"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
            >
              <h3 className="text-lg font-display font-bold mb-2">Discard workout?</h3>
              <p className="text-sm text-sl-muted font-mono mb-4">All logged sets will be lost.</p>
              <div className="flex gap-3">
                <GlowButton variant="danger" className="flex-1" onClick={() => { dispatch({ type: 'DISCARD_WORKOUT' }); navigate('/') }}>
                  Discard
                </GlowButton>
                <GlowButton variant="secondary" className="flex-1" onClick={() => setConfirmDiscard(false)}>
                  Keep going
                </GlowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
