import { getDB } from '../db'
import type { MuscleXpRecord, SetRecord, WorkoutExerciseRecord } from '../db/schema'

export interface MuscleXpRow extends MuscleXpRecord {}

export interface StatsSummary {
  totalWorkouts: number
  lastWorkout: { id: string; date: string; start_time: number; end_time: number | null; notes: string } | null
  streak: number
  weeklyVolume: number
  topMuscles: { muscle_id: string; type: string; freq: number }[]
}

export interface PrRow {
  exercise_id: string
  reps: number
  weight: number
  date: string
  orm: number
}

export interface VolumeRow {
  date: string
  volume: number
  workouts: number
}

export const fetchMuscleXp = async (): Promise<Record<string, MuscleXpRow>> => {
  const db = await getDB()
  const rows = await db.getAll('muscle_xp')
  return Object.fromEntries(rows.map((r) => [r.muscle_id, r]))
}

export const fetchSummary = async (): Promise<StatsSummary> => {
  const db = await getDB()
  const allWorkouts = await db.getAll('workouts')
  const completed = allWorkouts.filter((w) => w.completed)

  const totalWorkouts = completed.length
  const lastWorkout = completed.length > 0
    ? completed.reduce((a, b) => ((a.end_time ?? 0) > (b.end_time ?? 0) ? a : b))
    : null

  // Streak: consecutive days with a completed workout
  const dates = [...new Set(completed.map((w) => w.date))].sort().reverse()
  let streak = 0
  if (dates.length > 0) {
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    let cur = dates[0] === today || dates[0] === yesterday ? dates[0] : null
    if (cur) {
      streak = 1
      for (let i = 1; i < dates.length; i++) {
        const d = new Date(cur)
        d.setDate(d.getDate() - 1)
        const expected = d.toISOString().slice(0, 10)
        if (dates[i] === expected) {
          streak++
          cur = expected
        } else break
      }
    }
  }

  // Weekly volume
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
  let weeklyVolume = 0
  for (const w of completed.filter((x) => x.date >= weekAgo)) {
    for (const we of w.exercises) {
      for (const s of we.sets.filter((x: SetRecord) => x.completed && x.weight && x.reps)) {
        weeklyVolume += (s.weight ?? 0) * (s.reps ?? 0)
      }
    }
  }

  // Top muscles (last 30 days)
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const exercises = await db.getAll('exercises')
  const exMap = new Map(exercises.map((e) => [e.id, e]))
  const muscleFreq: Record<string, { type: string; freq: number }> = {}
  for (const w of completed.filter((x) => x.date >= monthAgo)) {
    for (const we of w.exercises) {
      const ex = exMap.get(we.exercise_id)
      if (!ex) continue
      for (const m of ex.muscles) {
        muscleFreq[m.muscle_id] ??= { type: m.type, freq: 0 }
        muscleFreq[m.muscle_id].freq++
      }
    }
  }
  const topMuscles = Object.entries(muscleFreq)
    .map(([muscle_id, v]) => ({ muscle_id, type: v.type, freq: v.freq }))
    .sort((a, b) => b.freq - a.freq)
    .slice(0, 5)

  return {
    totalWorkouts,
    lastWorkout: lastWorkout
      ? {
          id: lastWorkout.id,
          date: lastWorkout.date,
          start_time: lastWorkout.start_time,
          end_time: lastWorkout.end_time,
          notes: lastWorkout.notes,
        }
      : null,
    streak,
    weeklyVolume: Math.round(weeklyVolume),
    topMuscles,
  }
}

export const fetchPRs = async (): Promise<PrRow[]> => {
  const db = await getDB()
  const completed = (await db.getAll('workouts')).filter((w) => w.completed)
  const best: Record<string, PrRow> = {}
  for (const w of completed) {
    for (const we of w.exercises) {
      for (const s of we.sets.filter((x: SetRecord) => x.completed && x.weight && x.reps)) {
        const reps = s.reps ?? 0
        const weight = s.weight ?? 0
        const orm = weight * (1 + reps / 30)
        const existing = best[we.exercise_id]
        if (!existing || orm > existing.orm) {
          best[we.exercise_id] = { exercise_id: we.exercise_id, reps, weight, date: w.date, orm }
        }
      }
    }
  }
  return Object.values(best)
}

export const fetchVolume = async (days = 30): Promise<VolumeRow[]> => {
  const db = await getDB()
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
  const completed = (await db.getAll('workouts')).filter((w) => w.completed && w.date >= since)
  const byDate: Record<string, { volume: number; workouts: number }> = {}
  for (const w of completed) {
    byDate[w.date] ??= { volume: 0, workouts: 0 }
    byDate[w.date].workouts++
    for (const we of w.exercises) {
      for (const s of we.sets.filter((x: SetRecord) => x.completed && x.weight && x.reps)) {
        byDate[w.date].volume += (s.weight ?? 0) * (s.reps ?? 0)
      }
    }
  }
  return Object.entries(byDate)
    .map(([date, v]) => ({ date, volume: Math.round(v.volume), workouts: v.workouts }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export const fetchExerciseHistory = async (exerciseId: string) => {
  const db = await getDB()
  const completed = (await db.getAll('workouts')).filter((w) => w.completed)
  const rows: { date: string; reps: number | null; weight: number | null; duration: number | null; distance: number | null }[] = []
  for (const w of completed.sort((a, b) => a.date.localeCompare(b.date))) {
    for (const we of w.exercises.filter((e: WorkoutExerciseRecord) => e.exercise_id === exerciseId)) {
      for (const s of we.sets) {
        rows.push({ date: w.date, reps: s.reps, weight: s.weight, duration: s.duration, distance: s.distance })
      }
    }
  }
  return rows
}
