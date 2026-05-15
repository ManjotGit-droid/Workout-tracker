import { api } from './client'
import type { WorkoutSession, LoggedExercise, LoggedSet, MuscleGroupId } from '../types'

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

interface ApiWorkoutExercise {
  id: string
  workout_id: string
  exercise_id: string
  sort_order: number
  sets: ApiSet[]
  exercise?: { id: string; name: string }
}

interface ApiWorkout {
  id: string
  date: string
  start_time: number
  end_time: number | null
  completed: number
  notes: string
  exercises?: ApiWorkoutExercise[]
  exercise_count?: number
}

function toSet(s: ApiSet): LoggedSet {
  return {
    id: s.id,
    reps: s.reps ?? undefined,
    weight: s.weight ?? undefined,
    duration: s.duration ?? undefined,
    distance: s.distance ?? undefined,
    completed: Boolean(s.completed),
    notes: s.notes ?? undefined,
    timestamp: s.timestamp,
  }
}

function toLoggedExercise(we: ApiWorkoutExercise): LoggedExercise {
  return {
    id: we.id,
    exerciseId: we.exercise_id,
    sets: (we.sets ?? []).map(toSet),
  }
}

function toWorkoutSession(w: ApiWorkout): WorkoutSession {
  return {
    id: w.id,
    date: w.date,
    startTime: w.start_time,
    endTime: w.end_time ?? undefined,
    completed: Boolean(w.completed),
    exercises: (w.exercises ?? []).map(toLoggedExercise),
    xpGained: {},
  }
}

export async function fetchWorkouts(): Promise<WorkoutSession[]> {
  const rows = await api.get<ApiWorkout[]>('/workouts')
  return rows.map(toWorkoutSession)
}

export async function fetchWorkout(id: string): Promise<WorkoutSession> {
  const row = await api.get<ApiWorkout>(`/workouts/${id}`)
  return toWorkoutSession(row)
}

export async function createWorkout(): Promise<WorkoutSession> {
  const row = await api.post<ApiWorkout>('/workouts')
  return toWorkoutSession(row)
}

export async function addExerciseToWorkout(workoutId: string, exerciseId: string): Promise<WorkoutSession> {
  const row = await api.post<ApiWorkout>(`/workouts/${workoutId}/exercises`, { exercise_id: exerciseId })
  return toWorkoutSession(row)
}

export async function removeExerciseFromWorkout(workoutId: string, weId: string): Promise<WorkoutSession> {
  const row = await api.delete<ApiWorkout>(`/workouts/${workoutId}/exercises/${weId}`)
  return toWorkoutSession(row)
}

export async function logSet(workoutId: string, weId: string, setData: {
  reps?: number
  weight?: number
  duration?: number
  distance?: number
  notes?: string
  completed?: boolean
}): Promise<ApiSet> {
  return api.post<ApiSet>(`/workouts/${workoutId}/exercises/${weId}/sets`, setData)
}

export async function updateSet(workoutId: string, weId: string, setId: string, patch: {
  reps?: number
  weight?: number
  duration?: number
  distance?: number
  notes?: string
  completed?: boolean
}): Promise<ApiSet> {
  return api.put<ApiSet>(`/workouts/${workoutId}/exercises/${weId}/sets/${setId}`, patch)
}

export async function deleteSet(workoutId: string, weId: string, setId: string): Promise<void> {
  await api.delete(`/workouts/${workoutId}/exercises/${weId}/sets/${setId}`)
}

export async function completeWorkout(workoutId: string): Promise<{ muscleXp: Record<MuscleGroupId, number> }> {
  return api.post(`/workouts/${workoutId}/complete`)
}

export async function deleteWorkout(id: string): Promise<void> {
  await api.delete(`/workouts/${id}`)
}
