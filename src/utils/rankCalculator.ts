import type { Rank, UserProfile } from '../types'
import { RANK_THRESHOLDS, RANK_ORDER } from '../data/levelConfig'

export const calculateRank = (profile: UserProfile): Rank => {
  const levels = Object.values(profile.muscleGroups).map((m) => m.level)
  if (levels.length === 0) return 'E'
  const avg = levels.reduce((a, b) => a + b, 0) / levels.length

  let rank: Rank = 'E'
  for (const r of RANK_ORDER) {
    if (avg >= RANK_THRESHOLDS[r]) rank = r
  }
  return rank
}

export const xpToDisplay = (xp: number, threshold: number): string => {
  if (threshold === 0) return '∞'
  return `${xp} / ${threshold}`
}

export const xpPercent = (xp: number, threshold: number): number => {
  if (threshold === 0) return 100
  return Math.min(100, Math.round((xp / threshold) * 100))
}
