import { RANK_ORDER } from '../data/levelConfig'
import { computeStreak } from './streak'
import type { AppState } from '../types'

export interface Achievement {
  id: string
  title: string
  description: string
  /** Tier color group — drives badge gradient. */
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'mythic'
}

export interface EvaluatedAchievement extends Achievement {
  unlocked: boolean
  progress?: { current: number; target: number }
}

const ACHIEVEMENTS: Array<Achievement & { check: (s: AppState) => { unlocked: boolean; progress?: { current: number; target: number } } }> = [
  {
    id: 'first-workout',
    title: 'First Steps',
    description: 'Complete your first workout',
    tier: 'bronze',
    check: (s) => ({
      unlocked: s.profile.totalWorkouts >= 1,
      progress: { current: Math.min(s.profile.totalWorkouts, 1), target: 1 },
    }),
  },
  {
    id: 'ten-workouts',
    title: 'Apprentice',
    description: 'Complete 10 workouts',
    tier: 'bronze',
    check: (s) => ({
      unlocked: s.profile.totalWorkouts >= 10,
      progress: { current: Math.min(s.profile.totalWorkouts, 10), target: 10 },
    }),
  },
  {
    id: 'fifty-workouts',
    title: 'Disciplined',
    description: 'Complete 50 workouts',
    tier: 'silver',
    check: (s) => ({
      unlocked: s.profile.totalWorkouts >= 50,
      progress: { current: Math.min(s.profile.totalWorkouts, 50), target: 50 },
    }),
  },
  {
    id: 'hundred-workouts',
    title: 'Centurion',
    description: 'Complete 100 workouts',
    tier: 'gold',
    check: (s) => ({
      unlocked: s.profile.totalWorkouts >= 100,
      progress: { current: Math.min(s.profile.totalWorkouts, 100), target: 100 },
    }),
  },
  {
    id: 'year-workouts',
    title: 'Iron Year',
    description: 'Complete 365 workouts',
    tier: 'mythic',
    check: (s) => ({
      unlocked: s.profile.totalWorkouts >= 365,
      progress: { current: Math.min(s.profile.totalWorkouts, 365), target: 365 },
    }),
  },
  {
    id: 'hundred-sets',
    title: 'Volume Builder',
    description: 'Log 100 completed sets',
    tier: 'bronze',
    check: (s) => ({
      unlocked: s.profile.totalSets >= 100,
      progress: { current: Math.min(s.profile.totalSets, 100), target: 100 },
    }),
  },
  {
    id: 'thousand-sets',
    title: 'Workhorse',
    description: 'Log 1,000 completed sets',
    tier: 'gold',
    check: (s) => ({
      unlocked: s.profile.totalSets >= 1000,
      progress: { current: Math.min(s.profile.totalSets, 1000), target: 1000 },
    }),
  },
  {
    id: 'first-pr',
    title: 'New Heights',
    description: 'Set your first personal record',
    tier: 'bronze',
    check: (s) => ({
      unlocked: Object.keys(s.personalRecords).length >= 1,
    }),
  },
  {
    id: 'streak-7',
    title: 'On a Roll',
    description: 'Train 7 days in a row',
    tier: 'silver',
    check: (s) => {
      const streak = computeStreak(s.profile.workoutHistory)
      return { unlocked: streak >= 7, progress: { current: Math.min(streak, 7), target: 7 } }
    },
  },
  {
    id: 'streak-30',
    title: 'Unbreakable',
    description: 'Train 30 days in a row',
    tier: 'platinum',
    check: (s) => {
      const streak = computeStreak(s.profile.workoutHistory)
      return { unlocked: streak >= 30, progress: { current: Math.min(streak, 30), target: 30 } }
    },
  },
  {
    id: 'all-muscles-5',
    title: 'Balanced Build',
    description: 'Every muscle group at level 5+',
    tier: 'silver',
    check: (s) => {
      const levels = Object.values(s.profile.muscleGroups).map((m) => m.level)
      const min = Math.min(...levels)
      const passing = levels.filter((l) => l >= 5).length
      return {
        unlocked: min >= 5,
        progress: { current: passing, target: levels.length },
      }
    },
  },
  {
    id: 'all-muscles-10',
    title: 'Complete Hunter',
    description: 'Every muscle group at level 10+',
    tier: 'gold',
    check: (s) => {
      const levels = Object.values(s.profile.muscleGroups).map((m) => m.level)
      const min = Math.min(...levels)
      const passing = levels.filter((l) => l >= 10).length
      return {
        unlocked: min >= 10,
        progress: { current: passing, target: levels.length },
      }
    },
  },
  {
    id: 'rank-D',
    title: 'Awakened',
    description: 'Reach rank D',
    tier: 'bronze',
    check: (s) => ({
      unlocked: RANK_ORDER.indexOf(s.profile.rank) >= RANK_ORDER.indexOf('D'),
    }),
  },
  {
    id: 'rank-A',
    title: 'Elite',
    description: 'Reach rank A',
    tier: 'gold',
    check: (s) => ({
      unlocked: RANK_ORDER.indexOf(s.profile.rank) >= RANK_ORDER.indexOf('A'),
    }),
  },
  {
    id: 'rank-S',
    title: 'Monarch',
    description: 'Reach rank S',
    tier: 'platinum',
    check: (s) => ({
      unlocked: RANK_ORDER.indexOf(s.profile.rank) >= RANK_ORDER.indexOf('S'),
    }),
  },
  {
    id: 'rank-SS',
    title: 'Sovereign',
    description: 'Reach rank SS — the top of the mountain',
    tier: 'mythic',
    check: (s) => ({
      unlocked: s.profile.rank === 'SS',
    }),
  },
]

export const TIER_STYLES: Record<Achievement['tier'], { gradient: string; border: string; text: string }> = {
  bronze:   { gradient: 'linear-gradient(135deg, #d68a3c, #8b4513)', border: '#a0522d', text: '#fdba74' },
  silver:   { gradient: 'linear-gradient(135deg, #e2e8f0, #64748b)', border: '#94a3b8', text: '#e2e8f0' },
  gold:     { gradient: 'linear-gradient(135deg, #fde68a, #d97706)', border: '#f59e0b', text: '#fbbf24' },
  platinum: { gradient: 'linear-gradient(135deg, #a5f3fc, #06b6d4)', border: '#22d3ee', text: '#67e8f9' },
  mythic:   { gradient: 'linear-gradient(135deg, #fecaca, #ef4444, #9333ea)', border: '#ec4899', text: '#fbcfe8' },
}

export const evaluateAchievements = (state: AppState): EvaluatedAchievement[] =>
  ACHIEVEMENTS.map((a) => {
    const { unlocked, progress } = a.check(state)
    return { id: a.id, title: a.title, description: a.description, tier: a.tier, unlocked, progress }
  })
