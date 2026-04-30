import { useAppStore } from '../store/AppContext'
import { getLevelColor } from '../data/levelConfig'
import type { MuscleGroupId } from '../types'

export function useMuscleColors(): Record<MuscleGroupId, { fill: string; glow: string }> {
  const { state } = useAppStore()
  const result = {} as Record<MuscleGroupId, { fill: string; glow: string }>

  for (const [id, muscle] of Object.entries(state.profile.muscleGroups)) {
    result[id as MuscleGroupId] = getLevelColor(muscle.level)
  }

  return result
}
