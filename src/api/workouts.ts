import { getDB } from '../db'
import { uid } from '../db/utils'
import { computeWorkoutXp, applyXpToRecord } from '../db/xpCalc'
import { getXPThreshold } from '../data/levelConfig'
import type { WorkoutSession, LoggedExercise, LoggedSet, MuscleGroupId } from '../types'
import type { WorkoutRecord, WorkoutExerciseRecord, SetRecord } from '../db/schema'

// ── Converters ────────────────────────────────────────────────────────────────

const toSet = (s: SetRecord): LoggedSet => ({
  id: s.id,
  reps: s.reps ?? undefined,
  weight: s.weight ?? undefined,
  duration: s.duration ?? undefined,
  distance: s.distance ?? undefined,
  completed: s.completed,
  notes: s.notes || undefined,
  timestamp: s.timestamp,
})

const toLoggedExercise = (we: WorkoutExerciseRecord): LoggedExercise => ({
  id: we.id,
  exerciseId: we.exercise_id,
  sets: we.sets.map(toSet),
})

const toWorkoutSession = (w: WorkoutRecord): WorkoutSession => ({
  id: w.id,
  date: w.date,
  startTime: w.start_time,
  endTime: w.end_time ?? undefined,
  completed: w.completed,
  exercises: w.exercises.map(toLoggedExercise),
  xpGained: w.xpGained ?? {},
  pausedAt: w.paused_at ?? null,
  pausedDuration: w.paused_duration ?? 0,
})

// ApiSet shape — AppContext expects snake_case from logSet/updateSet
interface ApiSet {
  id: string
  workout_exercise_id: string
  reps: number | null
  weight: number | null
  duration: number | null
  distance: number | null
  completed: number
  notes: string
  timestamp: number
}

const toApiSet = (s: SetRecord, weId: string): ApiSet => ({
  id: s.id,
  workout_exercise_id: weId,
  reps: s.reps,
  weight: s.weight,
  duration: s.duration,
  distance: s.distance,
  completed: s.completed ? 1 : 0,
  notes: s.notes,
  timestamp: s.timestamp,
})

// ── Read ──────────────────────────────────────────────────────────────────────

export const fetchWorkouts = async (): Promise<WorkoutSession[]> => {
  const db = await getDB()
  const rows = await db.getAll('workouts')
  return rows.map(toWorkoutSession)
}

export const fetchWorkout = async (id: string): Promise<WorkoutSession> => {
  const db = await getDB()
  const row = await db.get('workouts', id)
  if (!row) throw new Error('Workout not found')
  return toWorkoutSession(row)
}

// ── Create ────────────────────────────────────────────────────────────────────

export const createWorkout = async (): Promise<WorkoutSession> => {
  const db = await getDB()
  const record: WorkoutRecord = {
    id: uid(),
    date: new Date().toISOString().slice(0, 10),
    start_time: Date.now(),
    end_time: null,
    completed: false,
    notes: '',
    xpGained: {},
    exercises: [],
    paused_at: null,
    paused_duration: 0,
  }
  await db.add('workouts', record)
  return toWorkoutSession(record)
}

export const deleteWorkout = async (id: string): Promise<void> => {
  const db = await getDB()
  await db.delete('workouts', id)
}

// ── Pause / resume ────────────────────────────────────────────────────────────

export const pauseWorkout = async (workoutId: string): Promise<WorkoutSession> => {
  const db = await getDB()
  const w = await db.get('workouts', workoutId)
  if (!w) throw new Error('Workout not found')
  if (w.paused_at) return toWorkoutSession(w)
  const updated: WorkoutRecord = { ...w, paused_at: Date.now() }
  await db.put('workouts', updated)
  return toWorkoutSession(updated)
}

export const resumeWorkout = async (workoutId: string): Promise<WorkoutSession> => {
  const db = await getDB()
  const w = await db.get('workouts', workoutId)
  if (!w) throw new Error('Workout not found')
  if (!w.paused_at) return toWorkoutSession(w)
  const elapsedPause = Date.now() - w.paused_at
  const updated: WorkoutRecord = {
    ...w,
    paused_at: null,
    paused_duration: (w.paused_duration ?? 0) + elapsedPause,
  }
  await db.put('workouts', updated)
  return toWorkoutSession(updated)
}

// ── Update ────────────────────────────────────────────────────────────────────

export const addExerciseToWorkout = async (
  workoutId: string,
  exerciseId: string,
): Promise<WorkoutSession> => {
  const db = await getDB()
  const w = await db.get('workouts', workoutId)
  if (!w) throw new Error('Workout not found')
  const weId = uid()
  const updated: WorkoutRecord = {
    ...w,
    exercises: [
      ...w.exercises,
      { id: weId, exercise_id: exerciseId, sort_order: w.exercises.length, sets: [] },
    ],
  }
  await db.put('workouts', updated)
  return toWorkoutSession(updated)
}

export const removeExerciseFromWorkout = async (
  workoutId: string,
  weId: string,
): Promise<WorkoutSession> => {
  const db = await getDB()
  const w = await db.get('workouts', workoutId)
  if (!w) throw new Error('Workout not found')
  const updated: WorkoutRecord = {
    ...w,
    exercises: w.exercises.filter((e: WorkoutExerciseRecord) => e.id !== weId),
  }
  await db.put('workouts', updated)
  return toWorkoutSession(updated)
}

// ── Sets ──────────────────────────────────────────────────────────────────────

export const logSet = async (
  workoutId: string,
  weId: string,
  data: {
    reps?: number
    weight?: number
    duration?: number
    distance?: number
    notes?: string
    completed?: boolean
  },
): Promise<ApiSet> => {
  const db = await getDB()
  const w = await db.get('workouts', workoutId)
  if (!w) throw new Error('Workout not found')
  const setId = uid()
  const newSet: SetRecord = {
    id: setId,
    reps: data.reps ?? null,
    weight: data.weight ?? null,
    duration: data.duration ?? null,
    distance: data.distance ?? null,
    completed: data.completed ?? false,
    notes: data.notes ?? '',
    timestamp: Date.now(),
  }
  const updated: WorkoutRecord = {
    ...w,
    exercises: w.exercises.map((e: WorkoutExerciseRecord) =>
      e.id === weId ? { ...e, sets: [...e.sets, newSet] } : e,
    ),
  }
  await db.put('workouts', updated)
  return toApiSet(newSet, weId)
}

export const updateSet = async (
  workoutId: string,
  weId: string,
  setId: string,
  patch: {
    reps?: number
    weight?: number
    duration?: number
    distance?: number
    completed?: boolean
    notes?: string
  },
): Promise<ApiSet> => {
  const db = await getDB()
  const w = await db.get('workouts', workoutId)
  if (!w) throw new Error('Workout not found')
  let updatedSet: SetRecord | null = null
  const updated: WorkoutRecord = {
    ...w,
    exercises: w.exercises.map((e: WorkoutExerciseRecord) => {
      if (e.id !== weId) return e
      return {
        ...e,
        sets: e.sets.map((s: SetRecord) => {
          if (s.id !== setId) return s
          updatedSet = {
            ...s,
            reps: patch.reps ?? s.reps,
            weight: patch.weight ?? s.weight,
            duration: patch.duration ?? s.duration,
            distance: patch.distance ?? s.distance,
            completed: patch.completed ?? s.completed,
            notes: patch.notes ?? s.notes,
          }
          return updatedSet
        }),
      }
    }),
  }
  await db.put('workouts', updated)
  if (!updatedSet) throw new Error('Set not found')
  return toApiSet(updatedSet, weId)
}

export const deleteSet = async (
  workoutId: string,
  weId: string,
  setId: string,
): Promise<void> => {
  const db = await getDB()
  const w = await db.get('workouts', workoutId)
  if (!w) throw new Error('Workout not found')
  const updated: WorkoutRecord = {
    ...w,
    exercises: w.exercises.map((e: WorkoutExerciseRecord) =>
      e.id === weId ? { ...e, sets: e.sets.filter((s: SetRecord) => s.id !== setId) } : e,
    ),
  }
  await db.put('workouts', updated)
}

// ── Complete ──────────────────────────────────────────────────────────────────

export const completeWorkout = async (
  workoutId: string,
): Promise<{ muscleXp: Record<MuscleGroupId, number> }> => {
  const db = await getDB()
  const w = await db.get('workouts', workoutId)
  if (!w) throw new Error('Workout not found')

  const exerciseRecords = await db.getAll('exercises')
  const exerciseMap = new Map(exerciseRecords.map((e) => [e.id, e]))

  const muscleXp = computeWorkoutXp(w, exerciseMap)

  const tx = db.transaction(['workouts', 'muscle_xp'], 'readwrite')
  for (const [muscleId, xpGain] of Object.entries(muscleXp)) {
    if (xpGain <= 0) continue
    const existing = (await tx.objectStore('muscle_xp').get(muscleId)) ?? {
      muscle_id: muscleId,
      level: 1,
      xp: 0,
      xp_to_next: getXPThreshold(1),
    }
    tx.objectStore('muscle_xp').put(applyXpToRecord(existing, xpGain))
  }

  const completedWorkout: WorkoutRecord = {
    ...w,
    completed: true,
    end_time: Date.now(),
    xpGained: muscleXp,
  }
  tx.objectStore('workouts').put(completedWorkout)
  await tx.done

  return { muscleXp: muscleXp as Record<MuscleGroupId, number> }
}
