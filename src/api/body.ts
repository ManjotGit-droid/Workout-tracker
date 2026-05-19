import { getDB } from '../db'
import { uid } from '../db/utils'
import type { BodyEntry } from '../types'
import type { BodyEntryRecord } from '../db/schema'

// ── snake_case (storage) ⇄ camelCase (frontend) adapters ─────────────────────

const toEntry = (r: BodyEntryRecord): BodyEntry => ({
  id: r.id,
  date: r.date,
  weightKg: r.weight_kg,
  bodyFatPct: r.body_fat_pct,
  heightCm: r.height_cm,
  neckCm: r.neck_cm,
  shouldersCm: r.shoulders_cm,
  chestCm: r.chest_cm,
  leftArmCm: r.left_arm_cm,
  rightArmCm: r.right_arm_cm,
  leftForearmCm: r.left_forearm_cm,
  rightForearmCm: r.right_forearm_cm,
  waistCm: r.waist_cm,
  hipsCm: r.hips_cm,
  leftThighCm: r.left_thigh_cm,
  rightThighCm: r.right_thigh_cm,
  leftCalfCm: r.left_calf_cm,
  rightCalfCm: r.right_calf_cm,
  restingHrBpm: r.resting_hr_bpm,
  sleepHours: r.sleep_hours,
  energyLevel: r.energy_level,
  moodLevel: r.mood_level,
  sorenessLevel: r.soreness_level,
  hydrationL: r.hydration_l,
  stepsCount: r.steps_count,
  notes: r.notes,
})

const toRecord = (e: BodyEntry): BodyEntryRecord => ({
  id: e.id,
  date: e.date,
  weight_kg: e.weightKg,
  body_fat_pct: e.bodyFatPct,
  height_cm: e.heightCm,
  neck_cm: e.neckCm,
  shoulders_cm: e.shouldersCm,
  chest_cm: e.chestCm,
  left_arm_cm: e.leftArmCm,
  right_arm_cm: e.rightArmCm,
  left_forearm_cm: e.leftForearmCm,
  right_forearm_cm: e.rightForearmCm,
  waist_cm: e.waistCm,
  hips_cm: e.hipsCm,
  left_thigh_cm: e.leftThighCm,
  right_thigh_cm: e.rightThighCm,
  left_calf_cm: e.leftCalfCm,
  right_calf_cm: e.rightCalfCm,
  resting_hr_bpm: e.restingHrBpm,
  sleep_hours: e.sleepHours,
  energy_level: e.energyLevel,
  mood_level: e.moodLevel,
  soreness_level: e.sorenessLevel,
  hydration_l: e.hydrationL,
  steps_count: e.stepsCount,
  notes: e.notes,
})

// ── CRUD ─────────────────────────────────────────────────────────────────────

export const fetchBodyEntries = async (): Promise<BodyEntry[]> => {
  const db = await getDB()
  const rows = await db.getAll('body_entries')
  return rows.map(toEntry).sort((a, b) => b.date.localeCompare(a.date))
}

export const createBodyEntry = async (entry: Omit<BodyEntry, 'id'>): Promise<BodyEntry> => {
  const db = await getDB()
  const full: BodyEntry = { ...entry, id: uid() }
  await db.add('body_entries', toRecord(full))
  return full
}

export const updateBodyEntry = async (entry: BodyEntry): Promise<BodyEntry> => {
  const db = await getDB()
  await db.put('body_entries', toRecord(entry))
  return entry
}

export const deleteBodyEntry = async (id: string): Promise<void> => {
  const db = await getDB()
  await db.delete('body_entries', id)
}
