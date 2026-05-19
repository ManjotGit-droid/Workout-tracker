import type { MuscleGroupId, Exercise } from '../types'

export const getRecommendations = (
  muscleId: MuscleGroupId,
  currentLevel: number,
  exerciseDb: Exercise[],
  recentExerciseIds: string[] = [],
  count = 4,
): Exercise[] => {
  const minLevel = Math.max(1, currentLevel - 2)
  const maxLevel = currentLevel + 6

  return exerciseDb
    .filter(
      (ex) =>
        ex.muscles.some((m) => m.muscleId === muscleId) &&
        ex.recommendedLevelRange[0] <= maxLevel &&
        ex.recommendedLevelRange[1] >= minLevel &&
        !recentExerciseIds.includes(ex.id),
    )
    .sort((a, b) => {
      const aPrimary = a.muscles.some((m) => m.muscleId === muscleId && m.type === 'primary')
      const bPrimary = b.muscles.some((m) => m.muscleId === muscleId && m.type === 'primary')
      if (aPrimary !== bPrimary) return aPrimary ? -1 : 1
      return (
        Math.abs(a.recommendedLevelRange[0] - currentLevel) -
        Math.abs(b.recommendedLevelRange[0] - currentLevel)
      )
    })
    .slice(0, count)
}
