import { getDB } from '../db'
import type { ExerciseRecord, WorkoutRecord, MuscleXpRecord } from '../db/schema'

export async function exportData(): Promise<void> {
  const db = await getDB()
  const exercises = await db.getAll('exercises')
  const workouts = await db.getAll('workouts')
  const muscleXp = await db.getAll('muscle_xp')

  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    exercises,
    workouts,
    muscleXp,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `workout-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importData(file: File): Promise<{ imported: { exercises: number; workouts: number } }> {
  const text = await file.text()
  const json = JSON.parse(text) as {
    version?: number
    exercises?: ExerciseRecord[]
    workouts?: WorkoutRecord[]
    muscleXp?: MuscleXpRecord[]
  }

  const exercises: ExerciseRecord[] = json.exercises ?? []
  const workouts: WorkoutRecord[] = json.workouts ?? []
  const muscleXp: MuscleXpRecord[] = json.muscleXp ?? []

  const db = await getDB()
  const tx = db.transaction(['exercises', 'workouts', 'muscle_xp'], 'readwrite')
  await tx.objectStore('exercises').clear()
  await tx.objectStore('workouts').clear()
  await tx.objectStore('muscle_xp').clear()

  for (const ex of exercises) tx.objectStore('exercises').put(ex)
  for (const w of workouts)  tx.objectStore('workouts').put(w)
  for (const m of muscleXp)  tx.objectStore('muscle_xp').put(m)
  await tx.done

  // Re-arm seed check so if exercises were wiped they get re-seeded next import
  if (exercises.length === 0) localStorage.removeItem('wt-db-seeded-v1')

  return { imported: { exercises: exercises.length, workouts: workouts.length } }
}

export async function resetData(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['workouts', 'muscle_xp'], 'readwrite')
  await tx.objectStore('workouts').clear()
  await tx.objectStore('muscle_xp').clear()
  await tx.done
}
