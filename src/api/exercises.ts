import { api } from './client'
import type { Exercise, ExerciseCategory, Equipment, MuscleGroupId, TrackingType } from '../types'

// API response shape (snake_case from SQLite)
interface ApiExercise {
  id: string
  name: string
  category: string
  equipment: string
  tracking_type: string
  description: string
  muscles: { muscle_id: string; type: string }[]
}

function toExercise(r: ApiExercise): Exercise {
  return {
    id: r.id,
    name: r.name,
    category: r.category as ExerciseCategory,
    equipment: r.equipment as Equipment,
    tracking_type: (r.tracking_type ?? 'strength') as TrackingType,
    description: r.description ?? '',
    recommendedLevelRange: [1, 30],
    muscles: (r.muscles ?? []).map((m) => ({
      muscleId: m.muscle_id as MuscleGroupId,
      type: m.type as 'primary' | 'secondary',
    })),
  }
}

export async function fetchExercises(): Promise<Exercise[]> {
  const rows = await api.get<ApiExercise[]>('/exercises')
  return rows.map(toExercise)
}

export async function createExercise(data: {
  name: string
  category: ExerciseCategory
  equipment: Equipment
  tracking_type?: TrackingType
  description?: string
  muscles?: { muscle_id: string; type: string }[]
}): Promise<Exercise> {
  const row = await api.post<ApiExercise>('/exercises', data)
  return toExercise(row)
}

export async function updateExercise(id: string, data: Partial<{
  name: string
  category: ExerciseCategory
  equipment: Equipment
  tracking_type: TrackingType
  description: string
  muscles: { muscle_id: string; type: string }[]
}>): Promise<Exercise> {
  const row = await api.put<ApiExercise>(`/exercises/${id}`, data)
  return toExercise(row)
}

export async function deleteExercise(id: string): Promise<void> {
  await api.delete(`/exercises/${id}`)
}
