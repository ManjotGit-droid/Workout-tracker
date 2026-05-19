interface Props {
  value: number          // 0..total
  total: number
  label?: string
  className?: string
  indeterminate?: boolean
}

export const ProgressBar = ({ value, total, label, className = '', indeterminate }: Props) => {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-[12px] font-medium text-text-soft tracking-tight">{label}</span>
          {!indeterminate && <span className="text-[11px] font-mono text-text-muted tabular-nums">{value} / {total}</span>}
        </div>
      )}
      <div className="h-1.5 bg-sunken rounded-full overflow-hidden">
        {indeterminate ? (
          <div
            className="h-full w-1/3 bg-brand rounded-full"
            style={{ animation: 'shimmerSlide 1.4s linear infinite' }}
          />
        ) : (
          <div
            className="h-full bg-brand rounded-full transition-all duration-200 ease-out"
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  )
}
