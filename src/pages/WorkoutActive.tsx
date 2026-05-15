import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/AppContext'
import { useWorkoutTimer } from '../hooks/useWorkoutTimer'
import { PageHeader } from '../components/layout/PageHeader'
import { GlowButton } from '../components/ui/GlowButton'
import { NeonCard } from '../components/ui/NeonCard'
import { MUSCLE_GROUPS } from '../data/muscleGroups'
import { toKg } from '../utils/formatters'
import type { MuscleGroupId, TrackingType } from '../types'

// Format seconds → mm:ss display
function fmtDuration(secs: number): string {
  const m = Math.floor(secs / 60).toString()
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// Parse "1:30" or "90" → seconds
function parseDuration(val: string): number | undefined {
  if (!val.trim()) return undefined
  if (val.includes(':')) {
    const [m, s] = val.split(':').map(Number)
    return (m * 60) + (s ?? 0)
  }
  const n = parseFloat(val)
  return isNaN(n) ? undefined : Math.round(n)
}

function TrackingHint({ type }: { type: TrackingType }) {
  const hints: Record<TrackingType, string> = {
    strength: 'reps · weight',
    bodyweight: 'reps · optional weight',
    duration: 'time (mm:ss) · optional weight',
    cardio: 'time (mm:ss) · distance (m)',
  }
  return <span className="text-xs font-mono text-sl-muted ml-1 opacity-60">{hints[type]}</span>
}

export function WorkoutActive() {
  const { state, dispatch, startWorkout, addExercise, removeExercise, logNewSet, patchSet, removeSet, finishWorkout, discardWorkout } = useAppStore()
  const navigate = useNavigate()
  const { activeWorkout, weightUnit } = state
  const timer = useWorkoutTimer(activeWorkout?.startTime ?? null)

  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(!activeWorkout || activeWorkout.exercises.length === 0)
  const [starting, setStarting] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const allExercises = state.customExercises

  // Start workout if none active
  if (!activeWorkout && !starting) {
    setStarting(true)
    startWorkout().catch(console.error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sl-muted font-mono text-sm">Starting workout…</div>
      </div>
    )
  }

  if (!activeWorkout) return null

  const filtered = allExercises.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.muscles.some((m) => MUSCLE_GROUPS[m.muscleId as MuscleGroupId]?.name?.toLowerCase().includes(search.toLowerCase())),
  )

  async function handleAddExercise(exerciseId: string) {
    await addExercise(exerciseId)
    setSearch('')
    setShowSearch(false)
  }

  async function handleAddSet(loggedExId: string, trackingType: TrackingType) {
    const defaults: Parameters<typeof logNewSet>[1] = {}
    if (trackingType === 'strength') { defaults.reps = 10; defaults.weight = 0 }
    else if (trackingType === 'bodyweight') { defaults.reps = 10 }
    else if (trackingType === 'duration') { defaults.duration = 60 }
    else if (trackingType === 'cardio') { defaults.duration = 300; defaults.distance = 1000 }
    await logNewSet(loggedExId, defaults)
  }

  async function handlePatchSet(loggedExId: string, setId: string, field: string, raw: string) {
    if (field === 'reps') {
      const val = parseInt(raw, 10)
      if (!isNaN(val)) await patchSet(loggedExId, setId, { reps: val })
    } else if (field === 'weight') {
      const val = parseFloat(raw)
      if (!isNaN(val)) await patchSet(loggedExId, setId, { weight: toKg(val, weightUnit) })
    } else if (field === 'duration') {
      const val = parseDuration(raw)
      if (val !== undefined) await patchSet(loggedExId, setId, { duration: val })
    } else if (field === 'distance') {
      const val = parseFloat(raw)
      if (!isNaN(val)) await patchSet(loggedExId, setId, { distance: val })
    }
  }

  async function handleToggleSet(loggedExId: string, setId: string, completed: boolean) {
    await patchSet(loggedExId, setId, { completed })
  }

  async function handleFinish() {
    await finishWorkout()
    navigate('/workout/complete', { replace: true })
  }

  async function handleDiscard() {
    await discardWorkout()
    navigate('/')
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
            <GlowButton variant="secondary" size="sm" onClick={() => setConfirmDiscard(true)}>
              Discard
            </GlowButton>
            <GlowButton size="sm" disabled={completedSets === 0} onClick={handleFinish}>
              Finish
            </GlowButton>
          </div>
        }
      />

      <div className="px-4 py-3">
        {completedSets > 0 && (
          <div className="text-xs font-mono text-sl-muted text-center mb-3">
            <span className="text-sl-purple font-bold">{completedSets}</span> sets completed
          </div>
        )}

        <div className="flex flex-col gap-3 mb-4">
          <AnimatePresence>
            {activeWorkout.exercises.map((loggedEx) => {
              const ex = allExercises.find((e) => e.id === loggedEx.exerciseId)
              if (!ex) return null
              const trackingType: TrackingType = ex.tracking_type ?? 'strength'
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
                    {/* Header */}
                    <div className="px-3 py-2.5 flex items-center justify-between border-b border-sl-border">
                      <div>
                        <div className="font-display font-semibold text-sm flex items-center">
                          {ex.name}
                          <TrackingHint type={trackingType} />
                        </div>
                        <div className="text-xs text-sl-muted font-mono mt-0.5">
                          {primaryMuscles.join(' · ')}
                        </div>
                      </div>
                      <button
                        className="text-sl-muted hover:text-sl-danger p-1"
                        onClick={() => removeExercise(loggedEx.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>

                    {/* Sets */}
                    <div className="px-3 py-2">
                      <SetHeaders trackingType={trackingType} weightUnit={weightUnit} />

                      {loggedEx.sets.map((set, idx) => (
                        <SetRow
                          key={set.id}
                          idx={idx}
                          set={set}
                          trackingType={trackingType}
                          weightUnit={weightUnit}
                          onPatch={(field, val) => handlePatchSet(loggedEx.id, set.id, field, val)}
                          onToggle={() => handleToggleSet(loggedEx.id, set.id, !set.completed)}
                          onRemove={() => removeSet(loggedEx.id, set.id)}
                        />
                      ))}

                      <button
                        className="w-full text-xs font-mono text-sl-muted hover:text-sl-purple border border-dashed border-sl-border hover:border-sl-purple/40 rounded-lg py-1.5 mt-1 transition-colors"
                        onClick={() => handleAddSet(loggedEx.id, trackingType)}
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

        {/* Add exercise search */}
        {showSearch ? (
          <NeonCard className="overflow-hidden">
            <div className="p-3 border-b border-sl-border">
              <input
                ref={searchRef}
                autoFocus
                type="text"
                placeholder="Search exercises or muscle…"
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
                    onClick={() => handleAddExercise(ex.id)}
                  >
                    <div>
                      <div className="text-sm font-display font-medium">{ex.name}</div>
                      <div className="text-xs text-sl-muted font-mono">{primaryMuscles.join(' · ')}</div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 ml-2 flex-shrink-0">
                      <span className="text-xs font-mono text-sl-muted capitalize">{ex.equipment}</span>
                      <span className="text-xs font-mono text-sl-purple/70 capitalize">{ex.tracking_type}</span>
                    </div>
                  </button>
                )
              })}
            </div>
            {activeWorkout.exercises.length > 0 && (
              <div className="p-2 border-t border-sl-border">
                <button className="w-full text-xs font-mono text-sl-muted py-1" onClick={() => setShowSearch(false)}>
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

        {/* Weight unit toggle */}
        <div className="flex items-center gap-2 mt-4 justify-center">
          <span className="text-xs font-mono text-sl-muted">Weight:</span>
          {(['kg', 'lbs'] as const).map((u) => (
            <button
              key={u}
              onClick={() => dispatch({ type: 'SET_WEIGHT_UNIT', unit: u })}
              className={`px-3 py-1 text-xs font-mono rounded border transition-colors ${
                weightUnit === u ? 'bg-sl-purple border-sl-purple text-white' : 'border-sl-border text-sl-muted hover:border-sl-purple/40'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Discard modal */}
      <AnimatePresence>
        {confirmDiscard && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmDiscard(false)} />
            <motion.div className="relative z-10 w-full max-w-lg bg-sl-surface border-t border-sl-border rounded-t-2xl p-6" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}>
              <h3 className="text-lg font-display font-bold mb-2">Discard workout?</h3>
              <p className="text-sm text-sl-muted font-mono mb-4">All logged sets will be lost.</p>
              <div className="flex gap-3">
                <GlowButton variant="danger" className="flex-1" onClick={handleDiscard}>Discard</GlowButton>
                <GlowButton variant="secondary" className="flex-1" onClick={() => setConfirmDiscard(false)}>Keep going</GlowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SetHeaders({ trackingType, weightUnit }: { trackingType: TrackingType; weightUnit: string }) {
  const cols = getColConfig(trackingType)
  return (
    <div className={`grid ${cols.grid} gap-2 text-xs font-mono text-sl-muted uppercase tracking-wider mb-1.5 px-1`}>
      <span>#</span>
      {cols.labels.map((l) => <span key={l}>{l === 'kg' ? weightUnit : l}</span>)}
      <span></span>
    </div>
  )
}

type SetRowProps = {
  idx: number
  set: { id: string; reps?: number; weight?: number; duration?: number; distance?: number; completed: boolean }
  trackingType: TrackingType
  weightUnit: string
  onPatch: (field: string, val: string) => void
  onToggle: () => void
  onRemove: () => void
}

function SetRow({ idx, set, trackingType, weightUnit, onPatch, onToggle, onRemove }: SetRowProps) {
  const cols = getColConfig(trackingType)

  function displayValue(field: string): string {
    if (field === 'reps') return String(set.reps ?? 10)
    if (field === 'weight') {
      if (!set.weight) return ''
      return weightUnit === 'lbs' ? (set.weight * 2.20462).toFixed(1) : set.weight.toFixed(1)
    }
    if (field === 'duration') return set.duration ? fmtDuration(set.duration) : ''
    if (field === 'distance') return set.distance ? String(set.distance) : ''
    return ''
  }

  return (
    <div className={`grid ${cols.grid} gap-2 items-center mb-1.5 rounded-lg px-1 py-1 transition-colors ${set.completed ? 'bg-sl-purple/10' : ''}`}>
      <span className="text-xs font-mono text-sl-muted text-center">{idx + 1}</span>
      {cols.fields.map((field) => (
        <input
          key={field}
          type="text"
          inputMode={field === 'duration' ? 'text' : 'decimal'}
          defaultValue={displayValue(field)}
          placeholder={field === 'duration' ? '0:00' : field === 'distance' ? 'm' : '0'}
          onBlur={(e) => onPatch(field, e.target.value)}
          className="bg-sl-border/50 border border-sl-border rounded px-2 py-1 text-sm font-mono text-center text-sl-text focus:border-sl-purple outline-none w-full"
        />
      ))}
      <div className="flex gap-1">
        <button
          onClick={onToggle}
          className={`w-7 h-8 rounded-lg border flex items-center justify-center transition-all ${
            set.completed ? 'bg-sl-purple border-sl-purple text-white' : 'border-sl-border text-sl-muted hover:border-sl-purple'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button onClick={onRemove} className="w-5 h-8 flex items-center justify-center text-sl-muted hover:text-sl-danger opacity-40 hover:opacity-100 transition-opacity">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function getColConfig(type: TrackingType): { grid: string; labels: string[]; fields: string[] } {
  switch (type) {
    case 'strength':
      return { grid: 'grid-cols-[28px_1fr_1fr_44px]', labels: ['Reps', 'kg'], fields: ['reps', 'weight'] }
    case 'bodyweight':
      return { grid: 'grid-cols-[28px_1fr_1fr_44px]', labels: ['Reps', 'kg +'], fields: ['reps', 'weight'] }
    case 'duration':
      return { grid: 'grid-cols-[28px_1fr_1fr_44px]', labels: ['Time', 'kg +'], fields: ['duration', 'weight'] }
    case 'cardio':
      return { grid: 'grid-cols-[28px_1fr_1fr_44px]', labels: ['Time', 'Dist(m)'], fields: ['duration', 'distance'] }
  }
}
