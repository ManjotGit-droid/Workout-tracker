import { getDB } from '../db'
import { uid } from '../db/utils'
import type { Exercise, ExerciseCategory, Equipment, MuscleGroupId, TrackingType } from '../types'
import type { ExerciseRecord } from '../db/schema'

function toExercise(r: ExerciseRecord): Exercise {
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
  const db = await getDB()
  const rows = await db.getAll('exercises')
  return rows.map(toExercise).sort((a, b) => a.name.localeCompare(b.name))
}

export async function createExercise(data: {
  name: string
  category: ExerciseCategory
  equipment: Equipment
  tracking_type?: TrackingType
  description?: string
  muscles?: { muscle_id: string; type: string }[]
}): Promise<Exercise> {
  const db = await getDB()
  const record: ExerciseRecord = {
    id: uid(),
    name: data.name.trim(),
    category: data.category,
    equipment: data.equipment,
    tracking_type: data.tracking_type ?? 'strength',
    description: data.description?.trim() ?? '',
    muscles: data.muscles ?? [],
  }
  await db.add('exercises', record)
  return toExercise(record)
}

export async function updateExercise(id: string, data: Partial<{
  name: string
  category: ExerciseCategory
  equipment: Equipment
  tracking_type: TrackingType
  description: string
  muscles: { muscle_id: string; type: string }[]
}>): Promise<Exercise> {
  const db = await getDB()
  const existing = await db.get('exercises', id)
  if (!existing) throw new Error('Exercise not found')
  const updated: ExerciseRecord = { ...existing, ...data }
  await db.put('exercises', updated)
  return toExercise(updated)
}

export async function deleteExercise(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('exercises', id)
}
