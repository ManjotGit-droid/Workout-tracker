import type { Exercise, MuscleGroupId, WorkoutSession } from '../types'
import { MUSCLE_GROUP_IDS, MUSCLE_GROUPS } from '../data/muscleGroups'

// ─────────────────────────────────────────────────────────────────────────────
// Adaptive monthly plan generator
//
// Looks at the user's training history over the last N days and produces a
// 4-week split that:
//   • prioritises NEGLECTED muscles (rarely trained recently)
//   • spaces out muscle group hits so anything trained one day rests for 48h
//   • uses the highest-quality exercises available in the user's library for
//     each muscle group (prefers primary-target compounds first, then isolation)
// ─────────────────────────────────────────────────────────────────────────────

const LOOKBACK_DAYS = 30
const SESSIONS_PER_WEEK = 4   // Mon, Tue, Thu, Fri
const TRAINING_DAYS: { day: string; index: number }[] = [
  { day: 'Monday',    index: 0 },
  { day: 'Tuesday',   index: 1 },
  { day: 'Thursday',  index: 3 },
  { day: 'Friday',    index: 4 },
]

export type SplitFocus = 'Upper Push' | 'Upper Pull' | 'Lower' | 'Full Body & Core'

interface MuscleStat {
  muscleId: MuscleGroupId
  setsLast30Days: number
  priorityScore: number   // higher = more neglected
}

export interface MonthlyPlanDay {
  day: string
  focus: SplitFocus
  primaryMuscles: MuscleGroupId[]
  exercises: { exerciseId: string; name: string; sets: number; reps: string }[]
}

export interface MonthlyPlan {
  generatedAt: string
  lookbackDays: number
  weeklyVolumePerMuscle: Record<MuscleGroupId, number>
  topNeglected: MuscleGroupId[]
  topRecentlyTrained: MuscleGroupId[]
  weeklySchedule: MonthlyPlanDay[]
  notes: string[]
}

// ── Stats ────────────────────────────────────────────────────────────────────

const computeMuscleStats = (
  workouts: WorkoutSession[],
  exercises: Exercise[],
): MuscleStat[] => {
  const cutoff = new Date(Date.now() - LOOKBACK_DAYS * 86400000).toISOString().slice(0, 10)
  const exMap = new Map(exercises.map((e) => [e.id, e]))

  const setsPerMuscle: Partial<Record<MuscleGroupId, number>> = {}

  for (const w of workouts) {
    if (!w.completed || w.date < cutoff) continue
    for (const we of w.exercises) {
      const ex = exMap.get(we.exerciseId)
      if (!ex) continue
      const completedSets = we.sets.filter((s) => s.completed).length
      if (completedSets === 0) continue
      for (const m of ex.muscles) {
        // Primary muscles count fully, secondaries at half
        const weight = m.type === 'primary' ? 1 : 0.5
        setsPerMuscle[m.muscleId] = (setsPerMuscle[m.muscleId] ?? 0) + completedSets * weight
      }
    }
  }

  // Priority = how neglected.  A muscle that was hit 0 times scores high;
  // a heavily trained muscle scores low.  Normalise by an "ideal" weekly
  // target so very small differences don't dominate.
  const IDEAL_WEEKLY_SETS = 12  // roughly Schoenfeld's 10-20 sets/week ballpark
  const idealTotal = IDEAL_WEEKLY_SETS * (LOOKBACK_DAYS / 7)

  return MUSCLE_GROUP_IDS.map((muscleId): MuscleStat => {
    const sets = setsPerMuscle[muscleId] ?? 0
    const deficit = Math.max(0, idealTotal - sets)
    return {
      muscleId,
      setsLast30Days: Math.round(sets * 10) / 10,
      priorityScore: deficit / idealTotal,
    }
  }).sort((a, b) => b.priorityScore - a.priorityScore)
}

// ── Split assignment ────────────────────────────────────────────────────────

const FOCUS_MUSCLES: Record<SplitFocus, MuscleGroupId[]> = {
  'Upper Push':     ['chest', 'front_delts', 'side_delts', 'triceps'],
  'Upper Pull':     ['lats', 'rhomboids', 'rear_delts', 'biceps', 'forearms', 'traps'],
  'Lower':          ['quads', 'hamstrings', 'glutes', 'calves', 'inner_thighs', 'hip_flexors'],
  'Full Body & Core': ['upper_abs', 'lower_abs', 'obliques', 'lower_back', 'chest', 'lats', 'quads'],
}

// ── Exercise selection ──────────────────────────────────────────────────────

const pickExercisesForMuscle = (
  muscleId: MuscleGroupId,
  exercises: Exercise[],
  used: Set<string>,
  prefer: 'compound' | 'isolation' | 'any' = 'any',
): Exercise[] => {
  // Find all exercises that target this muscle (primary first)
  const primary = exercises.filter((e) =>
    !used.has(e.id) && e.muscles.some((m) => m.muscleId === muscleId && m.type === 'primary'),
  )
  const secondary = exercises.filter((e) =>
    !used.has(e.id) && e.muscles.some((m) => m.muscleId === muscleId && m.type === 'secondary'),
  )

  // Compound = primary muscles >= 2; Isolation = exactly 1 primary
  const isCompound = (e: Exercise) => e.muscles.filter((m) => m.type === 'primary').length >= 2
  const isIso      = (e: Exercise) => e.muscles.filter((m) => m.type === 'primary').length === 1

  let pool = primary
  if (prefer === 'compound') pool = primary.filter(isCompound).concat(primary.filter(isIso))
  if (prefer === 'isolation') pool = primary.filter(isIso).concat(primary.filter(isCompound))
  if (pool.length === 0) pool = secondary

  return pool
}

// ── Day builder ─────────────────────────────────────────────────────────────

const buildDay = (
  day: string,
  focus: SplitFocus,
  exercises: Exercise[],
  stats: MuscleStat[],
  used: Set<string>,
): MonthlyPlanDay => {
  const focusMuscles = FOCUS_MUSCLES[focus]
  // Rank focus-muscles by priority score (neglected first)
  const ranked = [...focusMuscles].sort((a, b) => {
    const sa = stats.find((s) => s.muscleId === a)?.priorityScore ?? 0
    const sb = stats.find((s) => s.muscleId === b)?.priorityScore ?? 0
    return sb - sa
  })

  const picked: { exerciseId: string; name: string; sets: number; reps: string }[] = []

  // First two muscles: one compound each
  for (const muscleId of ranked.slice(0, 2)) {
    const candidates = pickExercisesForMuscle(muscleId, exercises, used, 'compound')
    if (candidates.length > 0) {
      const ex = candidates[0]
      used.add(ex.id)
      const reps = ex.tracking_type === 'duration' ? '30–60 s'
                 : ex.tracking_type === 'cardio'   ? '10–20 min'
                 : ex.tracking_type === 'bodyweight' ? 'AMRAP'
                 : '5–8'
      picked.push({ exerciseId: ex.id, name: ex.name, sets: 4, reps })
    }
  }

  // Next two muscles: isolation
  for (const muscleId of ranked.slice(2, 4)) {
    const candidates = pickExercisesForMuscle(muscleId, exercises, used, 'isolation')
    if (candidates.length > 0) {
      const ex = candidates[0]
      used.add(ex.id)
      const reps = ex.tracking_type === 'duration' ? '45–60 s'
                 : ex.tracking_type === 'cardio'   ? '5–15 min'
                 : ex.tracking_type === 'bodyweight' ? '12–15'
                 : '8–12'
      picked.push({ exerciseId: ex.id, name: ex.name, sets: 3, reps })
    }
  }

  // For "Full Body & Core" — add 1-2 extra core/cardio finishers
  if (focus === 'Full Body & Core') {
    for (const muscleId of ['upper_abs', 'lower_abs', 'obliques'] as MuscleGroupId[]) {
      const candidates = pickExercisesForMuscle(muscleId, exercises, used, 'any')
      if (candidates.length > 0 && picked.length < 6) {
        const ex = candidates[0]
        used.add(ex.id)
        picked.push({ exerciseId: ex.id, name: ex.name, sets: 3, reps: '15–20' })
      }
    }
  }

  return {
    day,
    focus,
    primaryMuscles: ranked.slice(0, 4),
    exercises: picked,
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

export const generateMonthlyPlan = (
  workouts: WorkoutSession[],
  exercises: Exercise[],
): MonthlyPlan => {
  const stats = computeMuscleStats(workouts, exercises)

  const weeklyVolumePerMuscle = {} as Record<MuscleGroupId, number>
  for (const s of stats) weeklyVolumePerMuscle[s.muscleId] = Math.round(s.setsLast30Days * 7 / LOOKBACK_DAYS * 10) / 10

  const topNeglected = stats.slice(0, 5).map((s) => s.muscleId)
  const topRecentlyTrained = stats.slice(-5).reverse().map((s) => s.muscleId)

  // Pick the 4 splits in order of "what we need most"
  // We always cover Push / Pull / Lower at minimum
  const splitsOrdered: SplitFocus[] = ['Upper Push', 'Upper Pull', 'Lower', 'Full Body & Core']

  // Reorder so the highest-priority split goes earliest in the week
  splitsOrdered.sort((a, b) => {
    const aScore = FOCUS_MUSCLES[a].reduce((sum, m) => sum + (stats.find((s) => s.muscleId === m)?.priorityScore ?? 0), 0)
    const bScore = FOCUS_MUSCLES[b].reduce((sum, m) => sum + (stats.find((s) => s.muscleId === m)?.priorityScore ?? 0), 0)
    return bScore - aScore
  })

  const used = new Set<string>()
  const weeklySchedule: MonthlyPlanDay[] = []
  for (let i = 0; i < SESSIONS_PER_WEEK; i++) {
    weeklySchedule.push(buildDay(TRAINING_DAYS[i].day, splitsOrdered[i], exercises, stats, used))
    // Reset the "used" set every two days so we can repeat compound lifts later in the week
    if (i % 2 === 1) used.clear()
  }

  const notes: string[] = []
  if (workouts.filter((w) => w.completed).length === 0) {
    notes.push('No training history yet — this plan assumes you\'re starting fresh. After a couple of weeks the plan will adapt to what you\'ve been hitting.')
  } else {
    const mostNeglectedName = MUSCLE_GROUPS[topNeglected[0]]?.name
    if (mostNeglectedName) {
      notes.push(`Most under-trained over the last 30 days: ${mostNeglectedName}. The plan prioritises this group.`)
    }
    const mostHitName = MUSCLE_GROUPS[topRecentlyTrained[0]]?.name
    if (mostHitName) {
      notes.push(`Most frequently trained: ${mostHitName}. Plan keeps volume there but stops adding more.`)
    }
  }
  notes.push('Rest days: Wednesday, Saturday, Sunday. Sleep & eat to support training.')

  return {
    generatedAt: new Date().toISOString(),
    lookbackDays: LOOKBACK_DAYS,
    weeklyVolumePerMuscle,
    topNeglected,
    topRecentlyTrained,
    weeklySchedule,
    notes,
  }
}
