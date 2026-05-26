import type { WorkoutSession } from '../types'

const dayKey = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().slice(0, 10)
}

/**
 * Consecutive-day workout streak ending today (or yesterday — we forgive one
 * missed day so a streak doesn't snap mid-morning before the user has
 * trained). Returns 0 when the last workout is older than yesterday.
 *
 * Mirrors the logic in `api/stats.ts` so the value rendered in the UI is
 * consistent with the stored summary.
 */
export const computeStreak = (workoutHistory: WorkoutSession[]): number => {
  const completed = workoutHistory.filter((w) => w.completed)
  if (completed.length === 0) return 0
  const uniqueDates = [...new Set(completed.map((w) => dayKey(w.date)))].sort().reverse()
  const today = dayKey(new Date())
  const yesterday = dayKey(new Date(Date.now() - 86400000))
  let cur = uniqueDates[0] === today || uniqueDates[0] === yesterday ? uniqueDates[0] : null
  if (!cur) return 0
  let streak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(cur)
    prev.setDate(prev.getDate() - 1)
    const expected = dayKey(prev)
    if (uniqueDates[i] === expected) {
      streak++
      cur = expected
    } else break
  }
  return streak
}

/** True if the user has a streak but didn't train today — gentle nudge state. */
export const isStreakAtRisk = (workoutHistory: WorkoutSession[]): boolean => {
  const completed = workoutHistory.filter((w) => w.completed)
  if (completed.length === 0) return false
  const lastDate = completed
    .map((w) => dayKey(w.date))
    .sort()
    .reverse()[0]
  const yesterday = dayKey(new Date(Date.now() - 86400000))
  return lastDate === yesterday
}
