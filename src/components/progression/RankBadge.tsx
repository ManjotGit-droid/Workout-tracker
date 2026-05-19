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

export const RankBadge = ({ rank, size = 'md' }: Props) => {
  const colors = RANK_COLORS[rank]

  return (
    <div
      className={`${sizeMap[size]} rounded-lg flex items-center justify-center font-display font-bold border-2 flex-shrink-0`}
      style={{
        color: colors.text,
        borderColor: colors.border,
        backgroundColor: colors.bg,
        boxShadow: `0 0 16px ${colors.glow}, 0 0 32px ${colors.glow}40`,
      }}
    >
      {rank}
    </div>
  )
}
