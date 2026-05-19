import { getDB } from './index'
import { EXERCISES } from '../data/exercises'

// Bump this whenever EXERCISES gains new entries that should also reach users
// who already installed the app. We diff by id, never overwriting custom exercises.
const SEED_FLAG = 'wt-db-seeded-v3'

// One-time refresh of seed-exercise muscle data. Bump the version here when
// EXERCISES has updated muscles/secondary muscles that should propagate to
// existing devices (without touching the user's own custom exercises).
const MUSCLE_SYNC_FLAG = 'wt-seed-muscles-synced-v2'

export const seedIfNeeded = async (): Promise<void> => {
  const db = await getDB()
  const existing = await db.getAll('exercises')
  const existingIds = new Set(existing.map((e) => e.id))

  const missing = EXERCISES.filter((ex) => !existingIds.has(ex.id))

  if (missing.length > 0) {
    const tx = db.transaction('exercises', 'readwrite')
    await Promise.all(
      missing.map((ex) =>
        tx.store.add({
          id: ex.id,
          name: ex.name,
          category: ex.category,
          equipment: ex.equipment,
          tracking_type: ex.tracking_type ?? 'strength',
          description: ex.description ?? '',
          muscles: ex.muscles.map((m) => ({ muscle_id: m.muscleId, type: m.type })),
        }),
      ),
    )
    await tx.done
  }

  // One-time muscle refresh for seed exercises already in the DB.
  // Only updates the `muscles` field of records whose id matches a seed exercise —
  // custom user exercises (non-seed ids) and edits to name/description are
  // preserved.
  if (!localStorage.getItem(MUSCLE_SYNC_FLAG)) {
    const seedById = new Map(EXERCISES.map((ex) => [ex.id, ex]))
    const updates = existing.filter((row) => seedById.has(row.id))
    if (updates.length > 0) {
      const tx = db.transaction('exercises', 'readwrite')
      await Promise.all(
        updates.map((row) => {
          const seed = seedById.get(row.id)
          if (!seed) return Promise.resolve()
          return tx.store.put({
            ...row,
            muscles: seed.muscles.map((m) => ({ muscle_id: m.muscleId, type: m.type })),
          })
        }),
      )
      await tx.done
    }
    localStorage.setItem(MUSCLE_SYNC_FLAG, '1')
  }

  localStorage.setItem(SEED_FLAG, '1')
}
