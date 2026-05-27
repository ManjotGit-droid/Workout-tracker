import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/AppContext'
import { useWorkoutTimer } from '../hooks/useWorkoutTimer'
import { PageHeader } from '../components/layout/PageHeader'
import { GlowButton } from '../components/ui/GlowButton'
import { NeonCard } from '../components/ui/NeonCard'
import { MUSCLE_GROUPS } from '../data/muscleGroups'
import { toKg } from '../utils/formatters'
import { estimate1RM } from '../utils/strength'
import { ExerciseDemoModal } from '../components/exercise-vis/ExerciseDemoModal'
import { RestTimer } from '../components/workout/RestTimer'
import { useToast } from '../components/ui/Toast'
import { Calendar } from '../components/ui/Calendar'
import type { Exercise, MuscleGroupId, TrackingType, WorkoutTemplate, LoggedSet } from '../types'

// uid for new template ids — small, dependency-free
const newId = (): string => `t_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

const REST_DURATION_KEY = 'restDurationSec'
const DEFAULT_REST_SEC = 90

// Format seconds → mm:ss display
const fmtDuration = (secs: number): string => {
  const m = Math.floor(secs / 60).toString()
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// Parse "1:30" or "90" → seconds
const parseDuration = (val: string): number | undefined => {
  if (!val.trim()) return undefined
  if (val.includes(':')) {
    const [m, s] = val.split(':').map(Number)
    return m * 60 + (s ?? 0)
  }
  const n = parseFloat(val)
  return isNaN(n) ? undefined : Math.round(n)
}

const TrackingHint = ({ type }: { type: TrackingType }) => {
  const hints: Record<TrackingType, string> = {
    strength: 'reps · weight',
    bodyweight: 'reps · optional weight',
    duration: 'time (mm:ss) · optional weight',
    cardio: 'time (mm:ss) · distance (m)',
  }
  return <span className="text-xs font-mono text-sl-muted ml-1 opacity-60">{hints[type]}</span>
}

export const WorkoutActive = () => {
  const { state, dispatch, startWorkout, addExercise, removeExercise, logNewSet, patchSet, removeSet, finishWorkout, discardWorkout, pauseWorkout, resumeWorkout } = useAppStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { activeWorkout, weightUnit } = state
  const isPaused = !!activeWorkout?.pausedAt
  const timer = useWorkoutTimer({
    startTime: activeWorkout?.startTime ?? null,
    pausedAt: activeWorkout?.pausedAt ?? null,
    pausedDuration: activeWorkout?.pausedDuration ?? 0,
  })

  const todayStr = new Date().toISOString().slice(0, 10)
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(!!activeWorkout && activeWorkout.exercises.length === 0)
  const [starting, setStarting] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [startDate, setStartDate] = useState<string>(todayStr)
  const [demoExercise, setDemoExercise] = useState<Exercise | null>(null)

  // Rest-timer state (C1) — local to this screen; cleared on stop/finish.
  const [restStartedAt, setRestStartedAt] = useState<number | null>(null)
  const [restDuration, setRestDuration] = useState<number>(() => {
    const stored = parseInt(localStorage.getItem(REST_DURATION_KEY) ?? '', 10)
    return Number.isFinite(stored) && stored > 0 ? stored : DEFAULT_REST_SEC
  })

  // Notes/RPE sheet (C5) — { loggedExerciseId, set } | null
  const [noteSheet, setNoteSheet] = useState<{ loggedExerciseId: string; set: LoggedSet } | null>(null)

  // Templates (C6) — save-as-template modal + template-pick state on start screen
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')

  const allExercises = state.customExercises
  const isBackdated = !!activeWorkout && activeWorkout.date !== todayStr

  // Persist preferred rest duration whenever it changes.
  const updateRestDuration = (deltaSec: number) => {
    setRestDuration((cur) => {
      const next = Math.max(15, cur + deltaSec)
      localStorage.setItem(REST_DURATION_KEY, String(next))
      return next
    })
  }

  const handleStart = async () => {
    if (starting) return
    setStarting(true)
    try {
      const opts = startDate !== todayStr ? { date: startDate } : undefined
      await startWorkout(opts)
      setShowSearch(true)
    } finally {
      setStarting(false)
    }
  }

  // No active workout → show explicit Start screen instead of auto-creating one
  if (!activeWorkout) {
    const backdatedDraft = startDate !== todayStr
    return (
      <div className="min-h-screen flex flex-col items-center px-6 text-center pt-12 pb-8">
        <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-2">Ready when you are</div>
        <h1 className="text-2xl font-display font-bold text-sl-text mb-2">Start a workout</h1>
        <p className="text-sm text-sl-muted font-mono mb-5 max-w-xs">
          Nothing is being tracked yet. Tap below to begin a new session — the timer only starts after you press Start.
        </p>

        <div className="w-full max-w-xs mb-5">
          <label className="text-[11px] font-mono text-sl-muted uppercase tracking-widest block mb-1 text-left">
            Workout date
          </label>
          <Calendar
            value={startDate}
            onChange={setStartDate}
            max={todayStr}
            highlightDates={new Set(state.profile.workoutHistory.map((w) => w.date))}
          />
          {backdatedDraft && (
            <p className="text-[11px] font-mono text-brand mt-2 text-left">
              Logging a missed workout for {new Date(startDate).toLocaleDateString()} — no live timer.
            </p>
          )}
          {!backdatedDraft && (
            <p className="text-[11px] font-mono text-sl-muted mt-2 text-left">
              Pick a past date if you forgot to log a previous workout.
            </p>
          )}
        </div>

        <GlowButton className="px-8 py-3" disabled={starting} onClick={handleStart}>
          {starting ? 'Starting…' : backdatedDraft ? 'Log workout' : 'Start workout'}
        </GlowButton>

        {/* Templates panel (C6) */}
        {state.workoutTemplates.length > 0 && (
          <div className="w-full max-w-md mt-8">
            <div className="text-[11px] font-mono text-sl-muted uppercase tracking-widest mb-2 text-left">
              Saved templates
            </div>
            <div className="flex flex-col gap-2">
              {state.workoutTemplates.map((t) => (
                <NeonCard key={t.id} className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-display font-semibold truncate">{t.name}</div>
                    <div className="text-[11px] font-mono text-sl-muted">
                      {t.exerciseIds.length} exercises
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartFromTemplate(t)}
                    disabled={starting}
                    className="text-[11px] font-mono text-brand border border-brand/40 rounded-md px-2 py-1 hover:bg-brand/10 disabled:opacity-50"
                  >
                    Use
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(t.id)}
                    aria-label={`Delete template ${t.name}`}
                    className="text-text-muted hover:text-danger w-7 h-7 flex items-center justify-center"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </NeonCard>
              ))}
            </div>
          </div>
        )}

        <button
          className="mt-6 text-xs font-mono text-sl-muted hover:text-sl-text"
          onClick={() => navigate('/')}
        >
          Back to dashboard
        </button>
      </div>
    )
  }

  const filtered = allExercises.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.muscles.some((m) => MUSCLE_GROUPS[m.muscleId as MuscleGroupId]?.name?.toLowerCase().includes(search.toLowerCase())),
  )

  // Recently-used exercise chips (B9) — last 6 distinct exercise IDs across
  // recent completed workouts, minus the ones already in the active session.
  const recentlyUsedExercises = useMemo<Exercise[]>(() => {
    const inSession = new Set(activeWorkout?.exercises.map((e) => e.exerciseId) ?? [])
    const exById = new Map(allExercises.map((e) => [e.id, e]))
    const seen = new Set<string>()
    const out: Exercise[] = []
    for (const w of state.profile.workoutHistory) {
      for (const we of w.exercises) {
        if (seen.has(we.exerciseId) || inSession.has(we.exerciseId)) continue
        seen.add(we.exerciseId)
        const ex = exById.get(we.exerciseId)
        if (ex) out.push(ex)
        if (out.length >= 6) return out
      }
    }
    return out
  }, [activeWorkout?.exercises, state.profile.workoutHistory, allExercises])

  const handleAddExercise = async (exerciseId: string) => {
    await addExercise(exerciseId)
    setSearch('')
    setShowSearch(false)
  }

  const handleAddSet = async (loggedExId: string, trackingType: TrackingType) => {
    const defaults: Parameters<typeof logNewSet>[1] = {}
    if (trackingType === 'strength') { defaults.reps = 10; defaults.weight = 0 }
    else if (trackingType === 'bodyweight') { defaults.reps = 10 }
    else if (trackingType === 'duration') { defaults.duration = 60 }
    else if (trackingType === 'cardio') { defaults.duration = 300; defaults.distance = 1000 }
    await logNewSet(loggedExId, defaults)
  }

  const handlePatchSet = async (loggedExId: string, setId: string, field: string, raw: string) => {
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

  const handleToggleSet = async (loggedExId: string, setId: string, completed: boolean) => {
    await patchSet(loggedExId, setId, { completed })
    // Auto-start rest timer ONLY when marking a set complete (not when undoing).
    if (completed && !isBackdated) {
      setRestStartedAt(Date.now())
    }
  }

  const handlePatchNotesRpe = async (loggedExId: string, setId: string, notes: string, rpe: number | null) => {
    await patchSet(loggedExId, setId, { notes, rpe: rpe ?? undefined })
  }

  const handleSaveTemplate = () => {
    if (!activeWorkout || !templateName.trim()) return
    const template: WorkoutTemplate = {
      id: newId(),
      name: templateName.trim(),
      exerciseIds: activeWorkout.exercises.map((e) => e.exerciseId),
      createdAt: Date.now(),
    }
    dispatch({ type: 'SAVE_TEMPLATE', template })
    toast({ message: `Saved template "${template.name}"`, variant: 'success' })
    setSavingTemplate(false)
    setTemplateName('')
  }

  const handleStartFromTemplate = async (t: WorkoutTemplate) => {
    if (starting) return
    setStarting(true)
    try {
      const opts = startDate !== todayStr ? { date: startDate } : undefined
      await startWorkout(opts)
      for (const exId of t.exerciseIds) {
        await addExercise(exId)
      }
      setShowSearch(false)
      toast({ message: `Loaded "${t.name}"`, variant: 'info' })
    } finally {
      setStarting(false)
    }
  }

  const handleDeleteTemplate = (id: string) => {
    dispatch({ type: 'DELETE_TEMPLATE', templateId: id })
  }

  const handleFinish = async () => {
    await finishWorkout()
    navigate('/workout/complete', { replace: true })
  }

  const handleDiscard = async () => {
    await discardWorkout()
    navigate('/')
  }

  const completedSets = activeWorkout.exercises.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.completed).length,
    0,
  )

  const formattedWorkoutDate = new Date(activeWorkout.date).toLocaleDateString()
  const subtitle = isBackdated
    ? `Logging for ${formattedWorkoutDate}`
    : isPaused
      ? `${timer} · Paused`
      : timer

  return (
    <div className="min-h-screen">
      <PageHeader
        title={isBackdated ? 'Backdated workout' : 'Workout'}
        subtitle={subtitle}
        right={
          <div className="flex gap-2">
            {!isBackdated && (
              isPaused ? (
                <GlowButton size="sm" onClick={() => resumeWorkout().catch(console.error)}>
                  Resume
                </GlowButton>
              ) : (
                <GlowButton variant="secondary" size="sm" onClick={() => pauseWorkout().catch(console.error)}>
                  Pause
                </GlowButton>
              )
            )}
            <GlowButton variant="danger" size="sm" onClick={() => setConfirmDiscard(true)}>
              Stop
            </GlowButton>
            <GlowButton size="sm" disabled={completedSets === 0} onClick={handleFinish}>
              {isBackdated ? 'Save' : 'Finish'}
            </GlowButton>
          </div>
        }
      />

      {isBackdated && (
        <div className="mx-4 mt-3 mb-1 p-2.5 rounded-lg border border-brand/30 bg-brand-soft flex items-center gap-2 text-[12px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-brand flex-shrink-0">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-text font-medium">
            Recording a missed workout from {formattedWorkoutDate}. No live timer — duration is set to ~1 h on save.
          </span>
        </div>
      )}

      {isPaused && (
        <div className="mx-4 mt-3 mb-1 p-3 rounded-lg border border-sl-purple/40 bg-sl-purple/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-sl-purple">
              <path d="M10 4H6v16h4V4zM18 4h-4v16h4V4z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-display font-semibold text-sl-purple">Workout paused — timer stopped</span>
          </div>
          <button
            className="text-xs font-mono text-sl-muted hover:text-sl-purple px-2 py-1 rounded border border-sl-border hover:border-sl-purple/40 transition-colors"
            onClick={() => resumeWorkout().catch(console.error)}
          >
            Resume
          </button>
        </div>
      )}

      <div className={`px-4 py-3 transition-opacity ${isPaused ? 'opacity-50 pointer-events-none select-none' : ''}`}>
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
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          className="text-text-muted hover:text-brand p-1"
                          onClick={() => setDemoExercise(ex)}
                          aria-label={`Show how to perform ${ex.name}`}
                          title="How to perform"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <polygon points="5 3 19 12 5 21 5 3" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          className="text-sl-muted hover:text-sl-danger p-1"
                          onClick={() => removeExercise(loggedEx.id)}
                          aria-label="Remove exercise"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
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
                          onOpenNotes={() => setNoteSheet({ loggedExerciseId: loggedEx.id, set })}
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
            {recentlyUsedExercises.length > 0 && search.length === 0 && (
              <div className="px-3 pt-3 border-b border-sl-border/50">
                <div className="text-[10px] font-mono text-sl-muted uppercase tracking-widest mb-1.5">
                  Recently used
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {recentlyUsedExercises.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => handleAddExercise(ex.id)}
                      className="flex-shrink-0 text-[11px] font-mono px-2.5 py-1 rounded-full border border-brand/40 text-brand bg-brand/10 hover:bg-brand/15 transition-colors max-w-[160px] truncate"
                      title={ex.name}
                    >
                      {ex.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

        {/* Save-as-template (C6) — only enabled once exercises have been added */}
        {activeWorkout.exercises.length > 0 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setSavingTemplate(true)}
              className="text-[11px] font-mono text-text-muted hover:text-brand border border-border hover:border-brand/40 rounded-md px-3 py-1.5 transition-colors flex items-center gap-1.5"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Save as template
            </button>
          </div>
        )}
      </div>

      {/* Rest timer (C1) */}
      <RestTimer
        startedAt={restStartedAt}
        duration={restDuration}
        onSkip={() => setRestStartedAt(null)}
        onAdjust={(d) => updateRestDuration(d)}
      />

      {/* Discard modal */}
      <AnimatePresence>
        {confirmDiscard && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmDiscard(false)} />
            <motion.div className="relative z-10 w-full max-w-lg bg-sl-surface border-t border-sl-border rounded-t-2xl p-6" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}>
              <h3 className="text-lg font-display font-bold mb-2">Stop workout?</h3>
              <p className="text-sm text-sl-muted font-mono mb-4">
                This ends the session without saving. All logged sets will be lost — to keep your progress, use Finish instead.
              </p>
              <div className="flex gap-3">
                <GlowButton variant="danger" className="flex-1" onClick={handleDiscard}>Stop &amp; discard</GlowButton>
                <GlowButton variant="secondary" className="flex-1" onClick={() => setConfirmDiscard(false)}>Keep going</GlowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes / RPE sheet (C5) */}
      <NotesRpeSheet
        sheet={noteSheet}
        onClose={() => setNoteSheet(null)}
        onSave={(notes, rpe) => {
          if (!noteSheet) return
          handlePatchNotesRpe(noteSheet.loggedExerciseId, noteSheet.set.id, notes, rpe)
          setNoteSheet(null)
        }}
      />

      {/* Save-as-template modal (C6) */}
      <AnimatePresence>
        {savingTemplate && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setSavingTemplate(false)} />
            <motion.div
              className="relative z-10 w-full max-w-lg bg-sl-surface border-t border-sl-border rounded-t-2xl p-6"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
            >
              <h3 className="text-lg font-display font-bold mb-2">Save as template</h3>
              <p className="text-sm text-sl-muted font-mono mb-4">
                Stores the current exercise list (no weights or sets) so you can load it next time.
              </p>
              <input
                type="text"
                autoFocus
                maxLength={60}
                placeholder="e.g. Push day, Leg day"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full bg-sl-bg border border-sl-border rounded-lg px-3 py-2 text-sm font-mono text-sl-text outline-none focus:border-sl-purple mb-4"
              />
              <div className="flex gap-3">
                <GlowButton className="flex-1" onClick={handleSaveTemplate} disabled={!templateName.trim()}>
                  Save template
                </GlowButton>
                <GlowButton variant="secondary" className="flex-1" onClick={() => { setSavingTemplate(false); setTemplateName('') }}>
                  Cancel
                </GlowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form-demo modal */}
      <ExerciseDemoModal exercise={demoExercise} onClose={() => setDemoExercise(null)} />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

const SetHeaders = ({ trackingType, weightUnit }: { trackingType: TrackingType; weightUnit: string }) => {
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
  set: LoggedSet
  trackingType: TrackingType
  weightUnit: string
  onPatch: (field: string, val: string) => void
  onToggle: () => void
  onRemove: () => void
  onOpenNotes: () => void
}

const SetRow = ({ idx, set, trackingType, weightUnit, onPatch, onToggle, onRemove, onOpenNotes }: SetRowProps) => {
  const cols = getColConfig(trackingType)
  // Used to fire a one-shot bg pulse when the user completes a set.
  const [justCompleted, setJustCompleted] = useState(false)

  const displayValue = (field: string): string => {
    if (field === 'reps') return String(set.reps ?? 10)
    if (field === 'weight') {
      if (!set.weight) return ''
      return weightUnit === 'lbs' ? (set.weight * 2.20462).toFixed(1) : set.weight.toFixed(1)
    }
    if (field === 'duration') return set.duration ? fmtDuration(set.duration) : ''
    if (field === 'distance') return set.distance ? String(set.distance) : ''
    return ''
  }

  const handleToggle = () => {
    if (!set.completed) {
      // Only pulse on completion, not on uncomplete.
      setJustCompleted(true)
      window.setTimeout(() => setJustCompleted(false), 650)
    }
    onToggle()
  }

  // Estimated 1RM (Epley) — only meaningful for strength tracking with both
  // reps and weight present. Stored in kg internally; converted on display.
  const showEst1RM = trackingType === 'strength' && (set.reps ?? 0) > 0 && (set.weight ?? 0) > 0
  const est1RMKg = showEst1RM ? estimate1RM(set.weight!, set.reps!) : 0
  const est1RMDisp = weightUnit === 'lbs' ? est1RMKg * 2.20462 : est1RMKg

  return (
    <div className={`rounded-lg px-1 py-1 transition-colors ${set.completed ? 'bg-sl-purple/10' : ''} ${justCompleted ? 'set-row-pulse' : ''}`}>
      <div className={`grid ${cols.grid} gap-2 items-center`}>
        <span className="text-xs font-mono text-sl-muted text-center tabular-nums">{idx + 1}</span>
        {cols.fields.map((field) => (
          <input
            key={field}
            type="text"
            inputMode={field === 'duration' ? 'text' : 'decimal'}
            defaultValue={displayValue(field)}
            placeholder={field === 'duration' ? '0:00' : field === 'distance' ? 'm' : '0'}
            onBlur={(e) => onPatch(field, e.target.value)}
            className="bg-sl-border/50 border border-sl-border rounded px-2 py-1 text-sm font-mono text-center text-sl-text focus:border-sl-purple outline-none w-full tabular-nums"
          />
        ))}
        <div className="flex gap-1">
          <button
            onClick={handleToggle}
            aria-label={set.completed ? 'Unmark set complete' : 'Mark set complete'}
            aria-pressed={set.completed}
            className={`w-7 h-8 rounded-lg border flex items-center justify-center transition-all ${
              set.completed ? 'bg-sl-purple border-sl-purple text-white' : 'border-sl-border text-sl-muted hover:border-sl-purple'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
              <motion.path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{ pathLength: set.completed ? 1 : 0, opacity: set.completed ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </svg>
          </button>
          <button onClick={onRemove} aria-label="Remove set" className="w-5 h-8 flex items-center justify-center text-sl-muted hover:text-sl-danger opacity-40 hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pr-12 mt-0.5 text-[10px] font-mono">
        {showEst1RM && (
          <span className="text-text-muted/70 tabular-nums">
            est. 1RM {est1RMDisp.toFixed(1)} {weightUnit}
          </span>
        )}
        {(set.rpe !== undefined && set.rpe !== null) && (
          <span className="text-brand bg-brand/10 rounded px-1.5 py-0.5 tabular-nums">
            RPE {set.rpe}
          </span>
        )}
        <button
          onClick={onOpenNotes}
          aria-label="Edit set notes or RPE"
          className={`flex items-center gap-1 transition-colors ${set.notes || set.rpe ? 'text-brand' : 'text-text-muted/60 hover:text-text-muted'}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {set.notes ? <span className="max-w-[80px] truncate">{set.notes}</span> : <span>Note · RPE</span>}
        </button>
      </div>
    </div>
  )
}

const getColConfig = (type: TrackingType): { grid: string; labels: string[]; fields: string[] } => {
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

// ── Notes / RPE sheet (C5) ───────────────────────────────────────────────────

interface NotesSheetProps {
  sheet: { loggedExerciseId: string; set: LoggedSet } | null
  onClose: () => void
  onSave: (notes: string, rpe: number | null) => void
}

const NotesRpeSheet = ({ sheet, onClose, onSave }: NotesSheetProps) => (
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

// Inner panel is split out so the local state resets cleanly on each open
// (the AnimatePresence `key={sheet.set.id}` above forces remount per set).
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
