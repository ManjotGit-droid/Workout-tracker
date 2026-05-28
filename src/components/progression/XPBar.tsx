import { motion } from 'framer-motion'

interface Props {
  xp: number
  xpToNext: number
  level: number
  color?: string
  showLabel?: boolean
  delay?: number
}

export const XPBar = ({
  xp,
  xpToNext,
  level,
  color,
  showLabel = true,
  delay = 0,
}: Props) => {
  const pct = xpToNext > 0 ? Math.min(100, (xp / xpToNext) * 100) : 100
  const fill = color ?? 'var(--accent)'

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[11px] font-mono text-text-muted uppercase tracking-widest">
            Level {level}
          </span>
          <span className="text-[11px] font-mono text-text-soft tabular-nums">
            {xp.toLocaleString()} / {xpToNext.toLocaleString()} XP
          </span>
        </div>
      )}
      <div className="h-1.5 bg-sunken rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, var(--brand-bright), ${fill})`,
            boxShadow: pct > 0 ? 'var(--glow-brand)' : 'none',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay }}
        />
      </div>
    </div>
  )
}
