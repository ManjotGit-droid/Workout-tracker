import { getDB } from './index'
import { EXERCISES } from '../data/exercises'

const SEED_FLAG = 'wt-db-seeded-v1'

export async function seedIfNeeded(): Promise<void> {
  if (localStorage.getItem(SEED_FLAG)) return
  const db = await getDB()
  const count = await db.count('exercises')
  if (count > 0) {
    localStorage.setItem(SEED_FLAG, '1')
    return
  }
  const tx = db.transaction('exercises', 'readwrite')
  await Promise.all(
    EXERCISES.map((ex) =>
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
  localStorage.setItem(SEED_FLAG, '1')
}
