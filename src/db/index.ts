import { openDB, type IDBPDatabase } from 'idb'
import type { ExerciseRecord, WorkoutRecord, MuscleXpRecord } from './schema'

export interface WorkoutTrackerDB {
  exercises: {
    key: string
    value: ExerciseRecord
    indexes: { 'by-category': string }
  }
  workouts: {
    key: string
    value: WorkoutRecord
    indexes: { 'by-date': string; 'by-completed': number }
  }
  muscle_xp: {
    key: string
    value: MuscleXpRecord
  }
}

let _db: IDBPDatabase<WorkoutTrackerDB> | null = null

export async function getDB(): Promise<IDBPDatabase<WorkoutTrackerDB>> {
  if (_db) return _db
  _db = await openDB<WorkoutTrackerDB>('workout-tracker', 1, {
    upgrade(db) {
      const exStore = db.createObjectStore('exercises', { keyPath: 'id' })
      exStore.createIndex('by-category', 'category')

      const wStore = db.createObjectStore('workouts', { keyPath: 'id' })
      wStore.createIndex('by-date', 'date')
      wStore.createIndex('by-completed', 'completed')

      db.createObjectStore('muscle_xp', { keyPath: 'muscle_id' })
    },
  })
  return _db
}
