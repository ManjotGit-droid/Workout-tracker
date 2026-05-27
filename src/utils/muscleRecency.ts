import { MUSCLE_GROUP_IDS } from '../data/muscleGroups'
import type { Exercise, MuscleGroupId, WorkoutSession } from '../types'

/**
 * For each muscle group, returns the number of days since it was last trained
 * (rounded down). Null when never trained. "Trained" means any completed set
 * of an exercise that targets the muscle (primary or secondary).
 */
export const computeMuscleRecency = (
  workouts: WorkoutSession[],
  exercises: Exercise[],
): Record<MuscleGroupId, number | null> => {
  const exMap = new Map(exercises.map((e) => [e.id, e]))
  const lastDay: Partial<Record<MuscleGroupId, string>> = {}

  for (const w of workouts) {
    if (!w.completed) continue
    for (const we of w.exercises) {
      const ex = exMap.get(we.exerciseId)
      if (!ex) continue
      const hasCompleted = we.sets.some((s) => s.completed)
      if (!hasCompleted) continue
      for (const m of ex.muscles) {
        const id = m.muscleId
        if (!lastDay[id] || w.date > lastDay[id]!) lastDay[id] = w.date
      }
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const out = {} as Record<MuscleGroupId, number | null>
  for (const id of MUSCLE_GROUP_IDS) {
    const d = lastDay[id]
    if (!d) {
      out[id] = null
    } else {
      const a = new Date(d).getTime()
      const b = new Date(today).getTime()
      out[id] = Math.max(0, Math.floor((b - a) / 86400000))
    }
  }
  return out
}

/**
 * Map days-since-last-trained to a tint colour for the body-diagram fill.
 * Recent training reads warm (training fatigue / freshly-worked), stale reads
 * cool (under-trained / catch-up candidate).
 */
export const recencyFill = (days: number | null): string => {
  if (days === null) return 'var(--body-muscle)'           // never trained — neutral
  if (days <= 1)     return 'rgba(245, 158, 11, 0.55)'     // hot — worked today/yesterday
  if (days <= 3)     return 'rgba(251, 191, 36, 0.42)'     // warm
  if (days <= 7)     return 'rgba(56, 198, 240, 0.32)'     // neutral-cool (in rotation)
  if (days <= 14)    return 'rgba(99, 102, 241, 0.30)'     // cooler — could use a session
  return 'rgba(59, 130, 246, 0.45)'                        // cold — undertrained
}
