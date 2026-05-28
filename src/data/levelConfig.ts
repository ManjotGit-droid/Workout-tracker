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

export const getXPThreshold = (level: number): number => {
  if (level < XP_THRESHOLDS.length) return XP_THRESHOLDS[level]
  let val = XP_THRESHOLDS[XP_THRESHOLDS.length - 1]
  for (let i = XP_THRESHOLDS.length; i <= level; i++) {
    val = Math.round((val * 1.4) / 500) * 500
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

// Solo-Leveling-style rank colours.
// E (green) → D (blue) → C (purple) → B (gold) → A (orange) → S (red) → SS (white-gold legendary)
export const RANK_COLORS: Record<Rank, { text: string; border: string; glow: string; bg: string }> = {
  E:  { text: '#4ade80', border: '#22c55e', glow: '#16a34a',  bg: 'rgba(34,197,94,0.15)'  },
  D:  { text: '#60a5fa', border: '#3b82f6', glow: '#2563eb',  bg: 'rgba(59,130,246,0.15)' },
  C:  { text: '#c084fc', border: '#a855f7', glow: '#9333ea',  bg: 'rgba(168,85,247,0.15)' },
  B:  { text: '#fbbf24', border: '#f59e0b', glow: '#d97706',  bg: 'rgba(245,158,11,0.15)' },
  A:  { text: '#fb923c', border: '#f97316', glow: '#ea580c',  bg: 'rgba(249,115,22,0.15)' },
  S:  { text: '#f87171', border: '#ef4444', glow: '#dc2626',  bg: 'rgba(239,68,68,0.15)'  },
  SS: { text: '#fef3c7', border: '#fbbf24', glow: '#f59e0b',  bg: 'rgba(251,191,36,0.20)' },
}

// ── Muscle tier system ─────────────────────────────────────────────────────
// Each muscle has a tier awarded by level: Bronze → Silver → Gold → Platinum →
// Diamond → Mythic.  Tiers are independent of the player Rank — they apply to
// individual muscle groups.

export type MuscleTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Mythic'

// Ordered high → low so callers can do a top-down scan.
export const MUSCLE_TIER_THRESHOLDS: { tier: MuscleTier; minLevel: number }[] = [
  { tier: 'Mythic',   minLevel: 30 },
  { tier: 'Diamond',  minLevel: 20 },
  { tier: 'Platinum', minLevel: 13 },
  { tier: 'Gold',     minLevel: 8  },
  { tier: 'Silver',   minLevel: 4  },
  { tier: 'Bronze',   minLevel: 1  },
]

export const getMuscleTier = (level: number): MuscleTier => {
  for (const { tier, minLevel } of MUSCLE_TIER_THRESHOLDS) {
    if (level >= minLevel) return tier
  }
  return 'Bronze'
}

export const TIER_COLORS: Record<MuscleTier, {
  text: string; border: string; glow: string; bg: string; gradient: string
}> = {
  Bronze:   {
    text: '#cd7f32', border: '#a0522d', glow: '#8b4513',
    bg: 'rgba(205,127,50,0.14)',
    gradient: 'linear-gradient(135deg, #d68a3c, #8b4513)',
  },
  Silver:   {
    text: '#94a3b8', border: '#64748b', glow: '#475569',
    bg: 'rgba(148,163,184,0.18)',
    gradient: 'linear-gradient(135deg, #e2e8f0, #64748b)',
  },
  Gold:     {
    text: '#fbbf24', border: '#f59e0b', glow: '#d97706',
    bg: 'rgba(245,158,11,0.18)',
    gradient: 'linear-gradient(135deg, #fde68a, #d97706)',
  },
  Platinum: {
    text: '#22d3ee', border: '#0891b2', glow: '#06b6d4',
    bg: 'rgba(34,211,238,0.18)',
    gradient: 'linear-gradient(135deg, #a5f3fc, #06b6d4)',
  },
  Diamond:  {
    text: '#a78bfa', border: '#8b5cf6', glow: '#7c3aed',
    bg: 'rgba(167,139,250,0.20)',
    gradient: 'linear-gradient(135deg, #ddd6fe, #7c3aed)',
  },
  Mythic:   {
    text: '#f87171', border: '#ef4444', glow: '#dc2626',
    bg: 'rgba(248,113,113,0.22)',
    gradient: 'linear-gradient(135deg, #fecaca, #ef4444, #9333ea)',
  },
}

// Forge: levels scale a single accent (electric lime). Higher level = more
// saturated fill + stronger halo. Keeps the in-game signal that level 30
// "looks stronger" than level 3 without dragging in rainbow hues.
export const getLevelColor = (level: number): { fill: string; glow: string } => {
  if (level <= 0) return { fill: '#1c1c1c', glow: '' }
  if (level < 3)  return { fill: '#1f2410', glow: '#3a4a1a' }
  if (level < 5)  return { fill: '#2a3318', glow: '#5b7a26' }
  if (level < 10) return { fill: '#3a4d1d', glow: '#84cc16' }
  if (level < 15) return { fill: '#4d6b1f', glow: '#a3d92a' }
  if (level < 20) return { fill: '#5f8a24', glow: '#bdf233' }
  if (level < 30) return { fill: '#74a52a', glow: '#caff3a' }
  if (level < 50) return { fill: '#84cc16', glow: '#caff3a' }
  if (level < 75) return { fill: '#a3e635', glow: '#d8ff66' }
  return { fill: '#caff3a', glow: '#e6ff8c' }
}
