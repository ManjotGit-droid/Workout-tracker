import type { Exercise, MuscleGroupId, WorkoutSession } from '../types'
import type { DayOfWeek } from '../data/animePlans'
import { MOBILITY_STRETCHES } from '../data/mobility'
import type { MobilityCategory, MobilityStretch } from '../data/mobility'

/* ─────────────────────────────────────────────────────────────────────────────
   Weekly mobility plan generator
   ─────────────────────────────────────────────────────────────────────────────
   For each weekday, we build a 4–6-stretch session that combines a fixed
   daily theme (hips / shoulders / spine / …) with adaptive emphasis on
   whichever muscles the user trained hardest in the last 7 days.
   ───────────────────────────────────────────────────────────────────────── */

export interface MobilitySession {
  day: DayOfWeek
  theme: string
  /** Stretches chosen for this day. */
  stretches: MobilityStretch[]
  /** Sum of stretch durations (counting `perSide: true` as 2× duration). */
  totalDurationSec: number
  /** Muscles this session was tilted toward, based on recent training. */
  emphasis: MuscleGroupId[]
}

export interface WeeklyMobilityPlan {
  /** 7 sessions in calendar order — Monday → Sunday. */
  weeklySchedule: MobilitySession[]
  /** Top 3 most-trained muscles over the last 7 days (informational). */
  topTrainedMuscles: MuscleGroupId[]
  generatedAt: string
}

const LOOKBACK_DAYS = 7

const DAY_ORDER: DayOfWeek[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
]

/** Theme + which mobility categories that theme prefers. */
const DAY_THEMES: Record<DayOfWeek, { theme: string; categories: MobilityCategory[] }> = {
  monday:    { theme: 'Hips & lower body',           categories: ['hips', 'legs'] },
  tuesday:   { theme: 'Shoulders & upper back',      categories: ['shoulders', 'arms'] },
  wednesday: { theme: 'Spine & thoracic recovery',   categories: ['spine', 'neck'] },
  thursday:  { theme: 'Hamstrings & posterior chain', categories: ['legs', 'spine'] },
  friday:    { theme: 'Hips & adductors',            categories: ['hips'] },
  saturday:  { theme: 'Chest & shoulders',           categories: ['shoulders', 'arms'] },
  sunday:    { theme: 'Full-body flow',              categories: ['fullbody', 'spine', 'hips'] },
}

// ── Step 1: count muscle volume over the last 7 days ────────────────────────

const computeTopMuscles = (
  workouts: WorkoutSession[],
  exercises: Exercise[],
): MuscleGroupId[] => {
  const cutoff = new Date(Date.now() - LOOKBACK_DAYS * 86400000).toISOString().slice(0, 10)
  const exMap = new Map(exercises.map((e) => [e.id, e]))
  const score: Partial<Record<MuscleGroupId, number>> = {}

  for (const w of workouts) {
    if (!w.completed || w.date < cutoff) continue
    for (const we of w.exercises) {
      const ex = exMap.get(we.exerciseId)
      if (!ex) continue
      const completedSets = we.sets.filter((s) => s.completed).length
      if (completedSets === 0) continue
      for (const m of ex.muscles) {
        const weight = m.type === 'primary' ? 1 : 0.5
        score[m.muscleId] = (score[m.muscleId] ?? 0) + completedSets * weight
      }
    }
  }

  return (Object.entries(score) as [MuscleGroupId, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id]) => id)
}

// ── Step 2: per-day stretch selection ───────────────────────────────────────

const sessionDuration = (stretches: MobilityStretch[]): number =>
  stretches.reduce((sum, s) => sum + s.durationSec * (s.perSide ? 2 : 1), 0)

const buildSession = (
  day: DayOfWeek,
  topMuscles: MuscleGroupId[],
  dayIndex: number,
): MobilitySession => {
  const theme = DAY_THEMES[day]
  const used = new Set<string>()
  const picked: MobilityStretch[] = []

  // Rotate through the pool so the same day isn't identical week-to-week if the
  // top-trained set is unchanged. Offset by dayIndex.
  const rotate = <T>(arr: T[], offset: number): T[] => {
    if (arr.length === 0) return arr
    const o = ((offset % arr.length) + arr.length) % arr.length
    return [...arr.slice(o), ...arr.slice(0, o)]
  }

  const themePool = rotate(
    MOBILITY_STRETCHES.filter((s) => theme.categories.includes(s.category) && !used.has(s.id)),
    dayIndex,
  )
  for (const s of themePool.slice(0, 2)) {
    picked.push(s)
    used.add(s.id)
  }

  // 1–2 stretches targeting top-trained muscles
  const adaptivePool = rotate(
    MOBILITY_STRETCHES.filter(
      (s) => !used.has(s.id) && s.muscles.some((m) => topMuscles.includes(m)),
    ),
    dayIndex,
  )
  for (const s of adaptivePool.slice(0, 2)) {
    picked.push(s)
    used.add(s.id)
  }

  // 1 foundation full-body stretch if there's room
  if (picked.length < 6) {
    const foundation = MOBILITY_STRETCHES.find(
      (s) => s.category === 'fullbody' && !used.has(s.id),
    )
    if (foundation) {
      picked.push(foundation)
      used.add(foundation.id)
    }
  }

  // If we're still under 4 (e.g. small library, lots of overlap), top up from
  // anything in the theme that wasn't already picked.
  if (picked.length < 4) {
    const filler = rotate(
      MOBILITY_STRETCHES.filter((s) => !used.has(s.id)),
      dayIndex,
    )
    for (const s of filler) {
      if (picked.length >= 4) break
      picked.push(s)
      used.add(s.id)
    }
  }

  // Cap at 6 stretches to keep the session under ~12 minutes
  const stretches = picked.slice(0, 6)

  return {
    day,
    theme: theme.theme,
    stretches,
    totalDurationSec: sessionDuration(stretches),
    emphasis: topMuscles.filter((m) => stretches.some((s) => s.muscles.includes(m))),
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

export const generateWeeklyMobilityPlan = (
  workouts: WorkoutSession[],
  exercises: Exercise[],
): WeeklyMobilityPlan => {
  const topTrainedMuscles = computeTopMuscles(workouts, exercises)
  const weeklySchedule = DAY_ORDER.map((day, i) => buildSession(day, topTrainedMuscles, i))
  return {
    weeklySchedule,
    topTrainedMuscles,
    generatedAt: new Date().toISOString(),
  }
}

// Helper for the UI to format a session duration
export const formatSessionDuration = (sec: number): string => {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m === 0) return `${s}s`
  if (s === 0) return `${m} min`
  return `${m}:${String(s).padStart(2, '0')}`
}
