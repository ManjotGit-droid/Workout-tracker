import { getDB } from '../db'
import type { ExerciseRecord, WorkoutRecord, MuscleXpRecord, BodyEntryRecord } from '../db/schema'

const MAX_IMPORT_BYTES = 25 * 1024 * 1024 // 25 MB — refuses suspiciously large backups
const MAX_RECORDS_PER_STORE = 100_000

const isObj = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v)

const isStr = (v: unknown): v is string => typeof v === 'string'

// Sanity-check a single record so a malformed backup can't poison the DB.
// Only checks the shape we care about; unknown fields are passed through.
const validExercise = (v: unknown): v is ExerciseRecord =>
  isObj(v) && isStr(v.id) && isStr(v.name) && Array.isArray(v.muscles)

const validWorkout = (v: unknown): v is WorkoutRecord =>
  isObj(v) && isStr(v.id) && typeof v.start_time === 'number' && Array.isArray(v.exercises)

const validMuscleXp = (v: unknown): v is MuscleXpRecord =>
  isObj(v) && isStr(v.muscle_id) && typeof v.level === 'number' && typeof v.xp === 'number'

const validBodyEntry = (v: unknown): v is BodyEntryRecord =>
  isObj(v) && isStr(v.id) && isStr(v.date)

export const exportData = async (): Promise<void> => {
  const db = await getDB()
  const exercises = await db.getAll('exercises')
  const workouts = await db.getAll('workouts')
  const muscleXp = await db.getAll('muscle_xp')
  const bodyEntries = await db.getAll('body_entries')

  const payload = {
    version: 3,
    exportedAt: new Date().toISOString(),
    exercises,
    workouts,
    muscleXp,
    bodyEntries,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `workout-backup-${new Date().toISOString().slice(0, 10)}.json`
  // Some browsers race revokeObjectURL against the download — defer it.
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export const importData = async (
  file: File,
): Promise<{ imported: { exercises: number; workouts: number; bodyEntries: number } }> => {
  if (file.size > MAX_IMPORT_BYTES) {
    throw new Error(`Backup too large (>${Math.round(MAX_IMPORT_BYTES / 1024 / 1024)} MB)`)
  }

  const text = await file.text()
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('Invalid backup — not valid JSON')
  }

  if (!isObj(raw)) throw new Error('Invalid backup — root must be an object')

  const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
  const exercises = arr(raw.exercises).filter(validExercise)
  const workouts = arr(raw.workouts).filter(validWorkout)
  const muscleXp = arr(raw.muscleXp).filter(validMuscleXp)
  const bodyEntries = arr(raw.bodyEntries).filter(validBodyEntry)

  // Caps so a hostile/corrupt file can't fill the user's storage quota.
  if (
    exercises.length > MAX_RECORDS_PER_STORE ||
    workouts.length > MAX_RECORDS_PER_STORE ||
    muscleXp.length > MAX_RECORDS_PER_STORE ||
    bodyEntries.length > MAX_RECORDS_PER_STORE
  ) {
    throw new Error('Backup contains too many records')
  }

  const db = await getDB()
  const tx = db.transaction(['exercises', 'workouts', 'muscle_xp', 'body_entries'], 'readwrite')
  await tx.objectStore('exercises').clear()
  await tx.objectStore('workouts').clear()
  await tx.objectStore('muscle_xp').clear()
  await tx.objectStore('body_entries').clear()

  for (const ex of exercises) tx.objectStore('exercises').put(ex)
  for (const w of workouts) tx.objectStore('workouts').put(w)
  for (const m of muscleXp) tx.objectStore('muscle_xp').put(m)
  for (const b of bodyEntries) tx.objectStore('body_entries').put(b)
  await tx.done

  if (exercises.length === 0) localStorage.removeItem('wt-db-seeded-v3')

  return {
    imported: {
      exercises: exercises.length,
      workouts: workouts.length,
      bodyEntries: bodyEntries.length,
    },
  }
}

export const resetData = async (): Promise<void> => {
  const db = await getDB()
  const tx = db.transaction(['workouts', 'muscle_xp', 'body_entries'], 'readwrite')
  await tx.objectStore('workouts').clear()
  await tx.objectStore('muscle_xp').clear()
  await tx.objectStore('body_entries').clear()
  await tx.done
}
