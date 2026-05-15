import { api } from './client'

export interface MuscleXpRow {
  muscle_id: string
  level: number
  xp: number
  xp_to_next: number
}

export interface StatsSummary {
  totalWorkouts: number
  lastWorkout: {
    id: string
    date: string
    start_time: number
    end_time: number | null
    notes: string
  } | null
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

export async function fetchMuscleXp(): Promise<Record<string, MuscleXpRow>> {
  return api.get<Record<string, MuscleXpRow>>('/stats/muscles')
}

export async function fetchSummary(): Promise<StatsSummary> {
  return api.get<StatsSummary>('/stats/summary')
}

export async function fetchPRs(): Promise<PrRow[]> {
  return api.get<PrRow[]>('/stats/prs')
}

export async function fetchVolume(days = 30): Promise<VolumeRow[]> {
  return api.get<VolumeRow[]>(`/stats/volume?days=${days}`)
}

export async function fetchExerciseHistory(exerciseId: string) {
  return api.get<{ date: string; reps: number | null; weight: number | null; duration: number | null; distance: number | null }[]>(
    `/stats/exercise/${exerciseId}`
  )
}
