import { getMuscleTier, TIER_COLORS } from '../../data/levelConfig'

interface Props {
  level: number
  size?: 'sm' | 'md' | 'lg'
  /** Show the tier name under the level number (only for md/lg). */
  showTierLabel?: boolean
}

const sizeMap = {
  sm: { outer: 'w-9 h-9 text-[13px]', label: 'text-[8px]' },
  md: { outer: 'w-12 h-12 text-[16px]', label: 'text-[9px]' },
  lg: { outer: 'w-16 h-16 text-[22px]', label: 'text-[10px]' },
}

/**
 * A square tier badge inspired by the Solo-Leveling rank icons.  The badge
 * shows the muscle level and is coloured by tier (Bronze → Mythic).
 */
export const LevelBadge = ({ level, size = 'md', showTierLabel = false }: Props) => {
  const tier = getMuscleTier(level)
  const colors = TIER_COLORS[tier]
  const { outer, label } = sizeMap[size]

  // Notch corners (top-left, bottom-right) — game-style polygon
  const clip = 'polygon(18% 0, 100% 0, 100% 82%, 82% 100%, 0 100%, 0 18%)'

  return (
    <div
      className={`${outer} flex flex-col items-center justify-center font-bold text-white flex-shrink-0 relative`}
      style={{
        background: colors.gradient,
        clipPath: clip,
        WebkitClipPath: clip,
        boxShadow: `0 0 12px ${colors.glow}80`,
      }}
      aria-label={`Level ${level} (${tier})`}
    >
      <span className="font-mono leading-none tabular-nums" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>{level}</span>
      {showTierLabel && (
        <span className={`${label} font-mono tracking-widest uppercase mt-0.5 opacity-90`}>
          {tier}
        </span>
      )}
    </div>
  )
}
