import { motion } from 'framer-motion'

interface Props {
  xp: number
  xpToNext: number
  level: number
  color?: string
  showLabel?: boolean
  delay?: number
}

export function XPBar({ xp, xpToNext, level, color = '#9333ea', showLabel = true, delay = 0 }: Props) {
  const pct = xpToNext > 0 ? Math.min(100, (xp / xpToNext) * 100) : 100

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs font-mono text-sl-muted">Level {level}</span>
          <span className="text-xs font-mono text-sl-muted">
            {xp.toLocaleString()} / {xpToNext.toLocaleString()} XP
          </span>
        </div>
      )}
      <div className="h-2 bg-sl-border rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay }}
        />
      </div>
    </div>
  )
}
