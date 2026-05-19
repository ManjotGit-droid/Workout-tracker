import { openDB, type IDBPDatabase } from 'idb'
import type { ExerciseRecord, WorkoutRecord, MuscleXpRecord, BodyEntryRecord } from './schema'
import { dbNameForUser, getActiveUserId } from '../store/users'

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
  body_entries: {
    key: string
    value: BodyEntryRecord
    indexes: { 'by-date': string }
  }
}

let _db: IDBPDatabase<WorkoutTrackerDB> | null = null
let _dbUserId: string | null = null

/**
 * Returns the IDB handle for the currently active user.  When the active
 * user changes, call `resetDBHandle()` so the next `getDB()` opens the new
 * user's database.
 */
export const getDB = async (): Promise<IDBPDatabase<WorkoutTrackerDB>> => {
  const activeUser = getActiveUserId()
  if (_db && _dbUserId === activeUser) return _db
  if (_db && _dbUserId !== activeUser) _db.close()

  _db = await openDB<WorkoutTrackerDB>(dbNameForUser(activeUser), 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const exStore = db.createObjectStore('exercises', { keyPath: 'id' })
        exStore.createIndex('by-category', 'category')

        const wStore = db.createObjectStore('workouts', { keyPath: 'id' })
        wStore.createIndex('by-date', 'date')
        wStore.createIndex('by-completed', 'completed')

        db.createObjectStore('muscle_xp', { keyPath: 'muscle_id' })
      }
      if (oldVersion < 2) {
        const bStore = db.createObjectStore('body_entries', { keyPath: 'id' })
        bStore.createIndex('by-date', 'date')
      }
    },
  })
  _dbUserId = activeUser
  return _db
}

/** Close and forget the current DB handle. Use after switching active user. */
export const resetDBHandle = (): void => {
  if (_db) {
    _db.close()
    _db = null
    _dbUserId = null
  }
}
