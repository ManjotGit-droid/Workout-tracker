import type { Rank } from '../types'

export const XP_THRESHOLDS: number[] = [
  0,      // placeholder — level 0 unused
  100,    // level 1 → 2
  250,    // level 2 → 3
  500,    // level 3 → 4
  1000,   // level 4 → 5
  2000,   // level 5 → 6
  3500,   // level 6 → 7
  5500,   // level 7 → 8
  8000,   // level 8 → 9
  11000,  // level 9 → 10
  15000,  // level 10 → 11
  21000,  // level 11 → 12
  29000,  // level 12 → 13
  40000,  // level 13 → 14
  55000,  // level 14 → 15
]

export function getXPThreshold(level: number): number {
  if (level < XP_THRESHOLDS.length) return XP_THRESHOLDS[level]
  // Beyond the table: scale by 1.4x each level
  let val = XP_THRESHOLDS[XP_THRESHOLDS.length - 1]
  for (let i = XP_THRESHOLDS.length; i <= level; i++) {
    val = Math.round(val * 1.4 / 500) * 500
  }
  return val
}

export const RANK_THRESHOLDS: Record<Rank, number> = {
  E: 0,
  D: 5,
  C: 10,
  B: 20,
  A: 30,
  S: 50,
  SS: 75,
}

export const RANK_ORDER: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S', 'SS']

export const RANK_COLORS: Record<Rank, { text: string; border: string; glow: string; bg: string }> = {
  E:  { text: '#9ca3af', border: '#6b7280', glow: '#4b5563',  bg: 'rgba(75,85,99,0.15)' },
  D:  { text: '#a3e635', border: '#84cc16', glow: '#65a30d',  bg: 'rgba(101,163,13,0.15)' },
  C:  { text: '#60a5fa', border: '#3b82f6', glow: '#2563eb',  bg: 'rgba(37,99,235,0.15)' },
  B:  { text: '#818cf8', border: '#6366f1', glow: '#4f46e5',  bg: 'rgba(79,70,229,0.15)' },
  A:  { text: '#c084fc', border: '#a855f7', glow: '#9333ea',  bg: 'rgba(147,51,234,0.15)' },
  S:  { text: '#fbbf24', border: '#f59e0b', glow: '#d97706',  bg: 'rgba(217,119,6,0.15)' },
  SS: { text: '#f9fafb', border: '#fde68a', glow: '#facc15',  bg: 'rgba(250,204,21,0.15)' },
}

export function getLevelColor(level: number): { fill: string; glow: string } {
  if (level <= 0) return { fill: '#1c1c2e', glow: '' }
  if (level < 3)  return { fill: '#2d1a3d', glow: '#4a1060' }
  if (level < 5)  return { fill: '#4a1a7a', glow: '#6a2090' }
  if (level < 10) return { fill: '#6b21a8', glow: '#9333ea' }
  if (level < 15) return { fill: '#7c3aed', glow: '#a855f7' }
  if (level < 20) return { fill: '#4f46e5', glow: '#818cf8' }
  if (level < 30) return { fill: '#3b82f6', glow: '#60a5fa' }
  if (level < 50) return { fill: '#0ea5e9', glow: '#38bdf8' }
  if (level < 75) return { fill: '#eab308', glow: '#facc15' }
  return { fill: '#f59e0b', glow: '#fde68a' }
}
