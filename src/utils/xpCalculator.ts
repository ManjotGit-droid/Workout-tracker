import type { LoggedExercise, MuscleGroupId } from '../types'
import type { Exercise } from '../types'

export function calculateXPForSet(
  reps: number,
  weightKg: number,
  muscleType: 'primary' | 'secondary',
): number {
  const BASE_XP = 10
  const weightMultiplier = 1 + Math.log1p(weightKg / 10) * 0.8
  const repMultiplier = 0.5 + (reps / 10) * 0.7
  const targetMultiplier = muscleType === 'primary' ? 1.0 : 0.4
  return Math.round(BASE_XP * weightMultiplier * repMultiplier * targetMultiplier)
}

export function calculateWorkoutXP(
  loggedExercises: LoggedExercise[],
  exerciseDb: Exercise[],
): Partial<Record<MuscleGroupId, number>> {
  const xpMap: Partial<Record<MuscleGroupId, number>> = {}

  for (const loggedEx of loggedExercises) {
    const exercise = exerciseDb.find((e) => e.id === loggedEx.exerciseId)
    if (!exercise) continue

    for (const set of loggedEx.sets.filter((s) => s.completed)) {
      for (const muscle of exercise.muscles) {
        const xp = calculateXPForSet(set.reps, set.weight, muscle.type)
        xpMap[muscle.muscleId] = (xpMap[muscle.muscleId] ?? 0) + xp
      }
    }
  }

  return xpMap
}
