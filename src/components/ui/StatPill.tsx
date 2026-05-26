interface Props {
  label: string
  value: string | number
  unit?: string
  color?: 'purple' | 'blue' | 'gold' | 'default'
}

const colorMap = {
  purple: 'text-sl-purple',
  blue:   'text-sl-blue',
  gold:   'text-sl-gold',
  default: 'text-sl-text',
}

export const StatPill = ({ label, value, unit, color = 'default' }: Props) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-mono text-sl-muted uppercase tracking-widest">{label}</span>
    <span className={`text-xl font-mono font-medium tabular-nums ${colorMap[color]}`}>
      {value}
      {unit && <span className="text-xs text-sl-muted ml-1">{unit}</span>}
    </span>
  </div>
)
