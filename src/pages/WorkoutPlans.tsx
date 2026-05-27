import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/AppContext'
import { PageHeader } from '../components/layout/PageHeader'
import { NeonCard } from '../components/ui/NeonCard'
import { GlowButton } from '../components/ui/GlowButton'
import { ProgressBar } from '../components/ui/ProgressBar'
import { ANIME_PLANS } from '../data/animePlans'
import type { AnimePlan, DayOfWeek, PlanWorkout } from '../data/animePlans'
import { generateMonthlyPlan } from '../utils/monthlyPlan'
import { MUSCLE_GROUPS } from '../data/muscleGroups'
import { MobilityView } from '../components/mobility/MobilityView'

type PlansView = 'workouts' | 'mobility'

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_SHORT: Record<DayOfWeek, string> = {
  monday: 'M', tuesday: 'T', wednesday: 'W', thursday: 'T', friday: 'F', saturday: 'S', sunday: 'S',
}

const fmtDuration = (secs?: number): string => {
  if (!secs) return ''
  if (secs >= 60) {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return s ? `${m}:${String(s).padStart(2, '0')}` : `${m} min`
  }
  return `${secs}s`
}

const fmtDistance = (m?: number): string => {
  if (!m) return ''
  return m >= 1000 ? `${(m / 1000).toFixed(1)}K` : `${m}m`
}

const fmtReps = (reps?: number | 'AMRAP'): string => {
  if (reps === 'AMRAP') return 'AMRAP'
  if (typeof reps === 'number') return `×${reps}`
  return ''
}

export const WorkoutPlans = () => {
  const { state, startWorkoutFromPlan } = useAppStore()
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState<AnimePlan | null>(null)
  const [confirmStart, setConfirmStart] = useState<{ plan: AnimePlan; workout: PlanWorkout } | null>(null)
  const [starting, setStarting] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 })
  const [recommendedExpanded, setRecommendedExpanded] = useState(false)
  const [view, setView] = useState<PlansView>('workouts')

  const allExercises = state.customExercises

  const getExerciseName = (planEx: { exerciseId: string; displayName?: string }): string => {
    if (planEx.displayName) return planEx.displayName
    return allExercises.find((e) => e.id === planEx.exerciseId)?.name ?? planEx.exerciseId
  }

  const handleStart = async (_plan: AnimePlan, workout: PlanWorkout) => {
    setStarting(true)
    setProgress({ done: 0, total: 0 })
    try {
      const exercises = workout.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets,
        reps: e.reps,
        duration: e.duration,
        distance: e.distance,
        weight: e.weight,
      }))
      await startWorkoutFromPlan(exercises, (done, total) => setProgress({ done, total }))
      setConfirmStart(null)
      setSelectedPlan(null)
      navigate('/workout')
    } finally {
      setStarting(false)
      setProgress({ done: 0, total: 0 })
    }
  }

  // IMPORTANT — these hooks MUST run on every render, so they sit above any
  // early `return`.  Moving them below the `if (selectedPlan)` block below
  // would change the order of hook calls between renders and crash React
  // (which is why tapping a plan used to leave the screen blank).
  const recommended = useMemo(
    () => generateMonthlyPlan(state.profile.workoutHistory, state.customExercises),
    [state.profile.workoutHistory, state.customExercises],
  )

  const startRecommendedDay = async (day: typeof recommended.weeklySchedule[number]) => {
    setStarting(true)
    setProgress({ done: 0, total: 0 })
    try {
      const exercises = day.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets,
        reps: e.reps.includes('AMRAP') ? ('AMRAP' as const) :
              e.reps.includes('s')     ? undefined :
              e.reps.includes('min')   ? undefined :
              parseInt(e.reps.split('–')[0], 10) || 10,
      }))
      await startWorkoutFromPlan(exercises, (done, total) => setProgress({ done, total }))
      navigate('/workout')
    } finally {
      setStarting(false)
      setProgress({ done: 0, total: 0 })
    }
  }

  // ── Plan detail view ────────────────────────────────────────────────────
  if (selectedPlan) {
    const plan = selectedPlan
    return (
      <div className="min-h-screen">
        <PageHeader title={plan.character} subtitle={plan.anime} back />

        <div className="px-4 py-3 pb-24">
          {/* Hero card */}
          <NeonCard className="p-4 mb-4 overflow-hidden" glow="purple" tint="cyan">
            <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: plan.accentColor }}>
              {plan.style}
            </div>
            <p className="text-sm font-display leading-relaxed mb-3">{plan.goal}</p>
            <div className="border-l-2 pl-3 my-3" style={{ borderColor: plan.accentColor }}>
              <p className="text-xs font-mono italic text-sl-muted">"{plan.mantra}"</p>
            </div>
            <p className="text-xs text-sl-muted leading-relaxed">
              <span className="font-mono uppercase tracking-wider text-sl-text">Nutrition: </span>
              {plan.nutritionTip}
            </p>
          </NeonCard>

          {/* Weekly schedule strip */}
          <div className="mb-4">
            <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-2">Weekly Schedule</div>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS.map((day) => {
                const dayType = plan.weeklySchedule[day]
                const isRest = dayType.toLowerCase().includes('rest')
                return (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <div className="text-[10px] font-mono text-sl-muted uppercase">{DAY_SHORT[day]}</div>
                    <div
                      className={`w-full h-9 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold text-center px-0.5 leading-tight ${
                        isRest ? 'bg-sl-border/40 text-sl-muted' : 'text-white'
                      }`}
                      style={!isRest ? { background: `linear-gradient(135deg, ${plan.accentColor}, ${plan.accentColor}88)` } : {}}
                      title={dayType}
                    >
                      {isRest ? 'REST' : dayType.split(' ')[0].slice(0, 5).toUpperCase()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Workouts */}
          <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-2">Workouts</div>
          <div className="flex flex-col gap-3">
            {plan.workouts.map((workout) => (
              <NeonCard key={workout.dayType} className="overflow-hidden">
                <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-sl-border">
                  <h3 className="font-display font-bold text-base">{workout.dayType}</h3>
                  <span className="text-xs font-mono text-sl-muted">{workout.exercises.length} exercises</span>
                </div>
                <div className="px-4 py-2">
                  {workout.exercises.map((ex, i) => (
                    <div key={i} className="py-1.5 flex items-start justify-between gap-2 border-b border-sl-border/30 last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-display font-medium truncate">{getExerciseName(ex)}</div>
                        {ex.note && <div className="text-[11px] font-mono text-sl-muted italic mt-0.5">{ex.note}</div>}
                      </div>
                      <div className="text-xs font-mono text-right flex-shrink-0">
                        <div className="font-bold" style={{ color: plan.accentColor }}>
                          {ex.sets > 1 ? `${ex.sets} × ` : ''}{fmtReps(ex.reps)}
                          {ex.duration ? ` ${fmtDuration(ex.duration)}` : ''}
                          {ex.distance ? ` ${fmtDistance(ex.distance)}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-sl-border">
                  <GlowButton
                    size="sm"
                    className="w-full"
                    onClick={() => setConfirmStart({ plan, workout })}
                  >
                    Start "{workout.dayType}"
                  </GlowButton>
                </div>
              </NeonCard>
            ))}
          </div>
        </div>

        {/* Confirm start modal */}
        <AnimatePresence>
          {confirmStart && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/60" onClick={() => !starting && setConfirmStart(null)} />
              <motion.div
                className="relative z-10 w-full max-w-lg bg-sl-surface border-t border-sl-border rounded-t-2xl p-5"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
              >
                <h3 className="text-[18px] font-semibold tracking-tight mb-1 text-text">
                  Start "{confirmStart.workout.dayType}"?
                </h3>
                <p className="text-[13px] text-text-muted mb-4 leading-relaxed">
                  This will create a new workout with {confirmStart.workout.exercises.length} exercises pre-loaded.
                  {state.activeWorkout && ' Your current workout will be discarded.'}
                </p>
                {starting && (
                  <div className="mb-4">
                    <ProgressBar
                      label="Loading exercises"
                      value={progress.done}
                      total={progress.total || 1}
                      indeterminate={progress.total === 0}
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <GlowButton
                    className="flex-1"
                    disabled={starting}
                    onClick={() => handleStart(confirmStart.plan, confirmStart.workout)}
                  >
                    {starting ? 'Starting…' : 'Start Workout'}
                  </GlowButton>
                  <GlowButton
                    variant="secondary"
                    className="flex-1"
                    disabled={starting}
                    onClick={() => setConfirmStart(null)}
                  >
                    Cancel
                  </GlowButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ── Plan grid view ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <PageHeader
        title={view === 'mobility' ? 'Mobility' : 'Workout Plans'}
        subtitle={view === 'mobility'
          ? 'Weekly stretching that adapts to your training'
          : 'Recommended + anime-inspired programs'}
      />

      {/* View toggle */}
      <div className="px-4 pt-3">
        <div className="inline-flex p-1 rounded-full bg-sunken border border-border">
          {(['workouts', 'mobility'] as PlansView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-mono uppercase tracking-widest transition-colors ${
                view === v
                  ? 'bg-brand text-white shadow-button'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'mobility' && (
        <div className="px-4 py-3 pb-24">
          <MobilityView />
        </div>
      )}

      {view === 'workouts' && (
      <div className="px-4 py-3 pb-24">

        {/* ── RECOMMENDED FOR YOU (collapsible) ───────────────────────── */}
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-[15px] font-semibold tracking-tight text-text">Recommended for you</h2>
          <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Adapts to your training</span>
        </div>

        <NeonCard className="mb-5 overflow-hidden" glow="purple" tint="emerald">
          {/* Always-visible card header — taps to expand/collapse */}
          <button
            onClick={() => setRecommendedExpanded((v) => !v)}
            className="w-full p-4 text-left relative"
            aria-expanded={recommendedExpanded}
          >
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: 'linear-gradient(90deg, var(--brand), var(--accent))' }}
            />
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="text-[16px] font-semibold leading-tight text-text">Adaptive Weekly Plan</div>
                <div className="text-[11px] text-text-muted mt-0.5">Generated from your last {recommended.lookbackDays} days</div>
              </div>
              <div
                className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md font-bold flex-shrink-0"
                style={{ color: 'var(--brand)', background: 'var(--brand-soft)', border: '1px solid var(--brand)' }}
              >
                {recommended.weeklySchedule.length} days
              </div>
            </div>
            <div className="text-[11px] text-text-muted">
              <span className="text-text font-medium">Focus: </span>
              {recommended.topNeglected.slice(0, 3).map((m) => MUSCLE_GROUPS[m]?.shortName).filter(Boolean).join(' · ')}
            </div>
            <div className="flex items-center text-[11px] font-mono text-text-muted gap-1.5 mt-2">
              <span>{recommendedExpanded ? 'Hide plan' : 'View plan'}</span>
              <svg
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="w-3 h-3 transition-transform"
                style={{ transform: recommendedExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
              >
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {/* Expanded body */}
          <AnimatePresence initial={false}>
            {recommendedExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-border pt-3">
                  {recommended.notes.length > 0 && (
                    <ul className="text-[12px] text-text-soft leading-relaxed list-disc list-inside space-y-1 mb-3">
                      {recommended.notes.map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  )}

                  <div className="flex flex-col gap-2">
                    {recommended.weeklySchedule.map((day) => (
                      <div key={day.day} className="bg-sunken rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-[14px] font-semibold tracking-tight text-text">{day.day}</span>
                              <span className="text-[10px] font-mono text-brand uppercase tracking-wider">{day.focus}</span>
                            </div>
                            <div className="text-[11px] text-text-muted mt-0.5 truncate">
                              {day.primaryMuscles.map((m) => MUSCLE_GROUPS[m]?.shortName).filter(Boolean).join(' · ')}
                            </div>
                          </div>
                          <GlowButton size="sm" onClick={() => startRecommendedDay(day)} disabled={starting || day.exercises.length === 0}>
                            Start
                          </GlowButton>
                        </div>
                        {day.exercises.length > 0 ? (
                          <div className="flex flex-col gap-0.5 pt-1.5 border-t border-border">
                            {day.exercises.map((e, i) => (
                              <div key={i} className="flex items-center justify-between text-[12px]">
                                <span className="text-text-soft truncate flex-1">{e.name}</span>
                                <span className="text-text-muted font-mono ml-2 flex-shrink-0">{e.sets} × {e.reps}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-text-muted italic">No exercises available — add some to your library.</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </NeonCard>

        {/* ── ANIME PLANS ─────────────────────────────────────────────── */}
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-[15px] font-semibold tracking-tight text-text">Anime-Inspired Plans</h2>
          <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">{ANIME_PLANS.length} programs</span>
        </div>
        <div className="text-[12px] text-text-muted leading-relaxed mb-3">
          Pick a character, follow their training.
        </div>

        <div className="grid grid-cols-1 gap-3">
          {ANIME_PLANS.map((plan) => (
            <NeonCard
              key={plan.id}
              className="p-4 cursor-pointer relative overflow-hidden"
              tint="violet"
              onClick={() => setSelectedPlan(plan)}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: `linear-gradient(90deg, ${plan.accentColor}, ${plan.accentColor}55)` }}
              />
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-display font-bold leading-tight">{plan.character}</div>
                  <div className="text-xs font-mono text-sl-muted">{plan.anime}</div>
                </div>
                <div
                  className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md font-bold"
                  style={{ color: plan.accentColor, background: `${plan.accentColor}22`, border: `1px solid ${plan.accentColor}44` }}
                >
                  {plan.workouts.length} days
                </div>
              </div>
              <div className="text-xs font-mono mb-2" style={{ color: plan.accentColor }}>
                {plan.style}
              </div>
              <p className="text-xs text-sl-muted leading-relaxed line-clamp-2 mb-2">{plan.goal}</p>
              <div className="flex items-center text-[11px] font-mono text-sl-muted gap-1.5">
                <span>View plan</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </NeonCard>
          ))}
        </div>
      </div>
      )}
    </div>
  )
}
