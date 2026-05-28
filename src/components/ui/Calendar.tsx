import { useState } from 'react'

interface Props {
  /** Currently-selected date in YYYY-MM-DD format. */
  value: string
  /** Called when the user picks a day (YYYY-MM-DD). */
  onChange: (date: string) => void
  /** Dates with logged workouts — rendered with a dotted marker. */
  highlightDates?: Set<string>
  /** Max selectable date (default = today). */
  max?: string
  className?: string
}

const dayKey = (d: Date): string => d.toISOString().slice(0, 10)

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

/**
 * Lightweight month-grid calendar. Stays internal-state for the visible
 * month (no controlled-month prop) so it pages independently of `value`.
 *
 * No external dep — we work in UTC date strings so day boundaries don't
 * shift across timezones.
 */
export const Calendar = ({
  value,
  onChange,
  highlightDates,
  max,
  className = '',
}: Props) => {
  const today = dayKey(new Date())
  const cap = max ?? today

  const initial = value ? new Date(value) : new Date()
  const [viewMonth, setViewMonth] = useState<{ y: number; m: number }>({
    y: initial.getFullYear(),
    m: initial.getMonth(),
  })

  const firstOfMonth = new Date(viewMonth.y, viewMonth.m, 1)
  const lastOfMonth = new Date(viewMonth.y, viewMonth.m + 1, 0)
  // Monday-first column offset (JS getDay() returns 0 = Sun).
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = lastOfMonth.getDate()

  const cells: (string | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewMonth.y, viewMonth.m, d)
    cells.push(dayKey(date))
  }

  const monthLabel = firstOfMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  const step = (delta: number) => {
    setViewMonth((cur) => {
      const m = cur.m + delta
      if (m < 0) return { y: cur.y - 1, m: 11 }
      if (m > 11) return { y: cur.y + 1, m: 0 }
      return { ...cur, m }
    })
  }

  return (
    <div className={`bg-elevated border border-border rounded-xl p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => step(-1)}
          aria-label="Previous month"
          className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-text"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-sm font-display font-semibold tabular-nums">{monthLabel}</div>
        <button
          onClick={() => step(1)}
          aria-label="Next month"
          className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-text"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-[10px] font-mono text-text-muted/70 uppercase mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((iso, i) => {
          if (iso === null) return <div key={`pad-${i}`} />
          const isSelected = iso === value
          const isToday = iso === today
          const isFuture = iso > cap
          const hasWorkout = highlightDates?.has(iso) ?? false
          return (
            <button
              key={iso}
              disabled={isFuture}
              onClick={() => onChange(iso)}
              className={`relative aspect-square rounded-md text-xs font-mono tabular-nums transition-colors ${
                isSelected
                  ? 'bg-accent text-accent-ink'
                  : isFuture
                    ? 'text-text-muted/30 cursor-not-allowed'
                    : 'text-text hover:bg-brand/10'
              } ${isToday && !isSelected ? 'ring-1 ring-brand/40' : ''}`}
            >
              {parseInt(iso.slice(8, 10), 10)}
              {hasWorkout && !isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
