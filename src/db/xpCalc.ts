import { getXPThreshold } from '../data/levelConfig'
import type { WorkoutRecord, ExerciseRecord, MuscleXpRecord } from './schema'

export function computeWorkoutXp(
  workout: WorkoutRecord,
  exerciseMap: Map<string, ExerciseRecord>,
): Record<string, number> {
  const muscleXp: Record<string, number> = {}
  for (const we of workout.exercises) {
    const exercise = exerciseMap.get(we.exercise_id)
    if (!exercise) continue
    let setXp = 0
    for (const s of we.sets.filter((s) => s.completed)) {
      if (s.reps)     setXp += s.reps * (s.weight ? 0.5 : 1)
      if (s.duration) setXp += Math.floor(s.duration / 30) * 5
      if (s.distance) setXp += Math.floor(s.distance / 100) * 3
    }
    for (const m of exercise.muscles) {
      const mult = m.type === 'primary' ? 1.0 : 0.5
      muscleXp[m.muscle_id] = (muscleXp[m.muscle_id] ?? 0) + Math.round(setXp * mult)
    }
  }
  return muscleXp
}

export function applyXpToRecord(record: MuscleXpRecord, gain: number): MuscleXpRecord {
  let { level, xp, xp_to_next } = record
  xp += gain
  while (xp >= xp_to_next) {
    xp -= xp_to_next
    level++
    xp_to_next = getXPThreshold(level)
  }
  return { ...record, level, xp, xp_to_next }
}
