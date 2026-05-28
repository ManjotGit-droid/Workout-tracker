interface Props {
  value: number          // 0..total
  total: number
  label?: string
  className?: string
  indeterminate?: boolean
}

/**
 * Forge bar — 4px track, accent gradient fill with a soft glow halo.
 */
export const ProgressBar = ({ value, total, label, className = '', indeterminate }: Props) => {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-[11px] font-mono text-text-muted uppercase tracking-widest">{label}</span>
          {!indeterminate && (
            <span className="text-[11px] font-mono text-text-soft tabular-nums">
              {value} / {total}
            </span>
          )}
        </div>
      )}
      <div className="h-1 bg-sunken rounded-full overflow-hidden">
        {indeterminate ? (
          <div
            className="h-full w-1/3 rounded-full"
            style={{
              background: 'linear-gradient(90deg, var(--brand-bright), var(--accent))',
              boxShadow: 'var(--glow-brand)',
              animation: 'shimmerSlide 1.4s linear infinite',
            }}
          />
        ) : (
          <div
            className="h-full rounded-full transition-all duration-200 ease-out"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--brand-bright), var(--accent))',
              boxShadow: pct > 0 ? 'var(--glow-brand)' : 'none',
            }}
          />
        )}
      </div>
    </div>
  )
}
