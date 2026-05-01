import { getLevelColor } from '../../data/levelConfig'

interface Props {
  level: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { outer: 'w-8 h-8 text-sm', inner: 'text-xs' },
  md: { outer: 'w-12 h-12 text-base', inner: 'text-xs' },
  lg: { outer: 'w-16 h-16 text-xl', inner: 'text-sm' },
}

export function LevelBadge({ level, size = 'md' }: Props) {
  const { fill, glow } = getLevelColor(level)
  const { outer } = sizeMap[size]

  return (
    <div
      className={`${outer} rounded-full flex items-center justify-center font-mono font-bold text-white border-2 flex-shrink-0`}
      style={{
        backgroundColor: fill,
        borderColor: glow || fill,
        boxShadow: glow ? `0 0 10px ${glow}` : 'none',
      }}
    >
      {level}
    </div>
  )
}
