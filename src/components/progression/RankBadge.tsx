import { RANK_COLORS } from '../../data/levelConfig'
import type { Rank } from '../../types'

interface Props {
  rank: Rank
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  sm: 'w-8 h-8 text-base',
  md: 'w-12 h-12 text-xl',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-24 h-24 text-4xl',
}

// Tier-aware glow intensity. Low ranks read as a subtle ring; high ranks
// pulse and bloom outward — the badge becomes its own status indicator.
const tierGlow: Record<Rank, { shadow: string; pulse: boolean }> = {
  E: { shadow: '0 0 10px {g}, 0 0 18px {g}30', pulse: false },
  D: { shadow: '0 0 12px {g}, 0 0 22px {g}35', pulse: false },
  C: { shadow: '0 0 14px {g}, 0 0 26px {g}40', pulse: false },
  B: { shadow: '0 0 16px {g}, 0 0 30px {g}45', pulse: false },
  A: { shadow: '0 0 18px {g}, 0 0 34px {g}50', pulse: false },
  S: { shadow: '0 0 22px {g}, 0 0 44px {g}60, 0 0 64px {g}25', pulse: true },
  SS: { shadow: '0 0 26px {g}, 0 0 52px #fbbf2480, 0 0 72px #ec489955, 0 0 96px #8b5cf640', pulse: true },
}

export const RankBadge = ({ rank, size = 'md' }: Props) => {
  const colors = RANK_COLORS[rank]
  const tier = tierGlow[rank]
  const shadow = tier.shadow.replace(/\{g\}/g, colors.glow)

  return (
    <div
      className={`${sizeMap[size]} rounded-lg flex items-center justify-center font-display font-bold border-2 flex-shrink-0 ${tier.pulse ? 'rank-breathe' : ''}`}
      style={{
        color: colors.text,
        borderColor: colors.border,
        backgroundColor: colors.bg,
        boxShadow: shadow,
      }}
    >
      {rank}
    </div>
  )
}
