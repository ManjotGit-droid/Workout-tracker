interface Props {
  label: string
  value: string | number
  unit?: string
  color?: 'purple' | 'blue' | 'gold' | 'default'
}

/**
 * Forge stat: tiny mono eyebrow, hero-style tabular numeric value.
 * The colour prop is preserved for API stability — Forge uses one accent,
 * so 'purple'/'blue'/'gold' all resolve to accent and 'default' stays
 * text-coloured.
 */
const colorMap = {
  purple: 'text-accent',
  blue:   'text-accent',
  gold:   'text-gold',
  default: 'text-text',
}

export const StatPill = ({ label, value, unit, color = 'default' }: Props) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-mono text-text-muted uppercase tracking-[0.14em]">{label}</span>
    <span className={`text-xl font-mono font-medium tabular-nums ${colorMap[color]}`}>
      {value}
      {unit && <span className="text-xs text-text-muted ml-1">{unit}</span>}
    </span>
  </div>
)
