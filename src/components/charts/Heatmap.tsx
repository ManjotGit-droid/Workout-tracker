import { useMemo } from 'react'
import type { WorkoutSession } from '../../types'

interface Props {
  workouts: WorkoutSession[]
  /** How many weeks back to render. Default 12. */
  weeks?: number
  onDayClick?: (date: string) => void
}

const dayKey = (d: Date): string => d.toISOString().slice(0, 10)

const buildCells = (workouts: WorkoutSession[], weeks: number): { date: string; sets: number; isFuture: boolean }[] => {
  const sets: Record<string, number> = {}
  for (const w of workouts) {
    if (!w.completed) continue
    const k = w.date
    let count = 0
    for (const we of w.exercises) for (const s of we.sets) if (s.completed) count++
    sets[k] = (sets[k] ?? 0) + count
  }
  // Walk back from this Sunday (column N-1, last row) to fill the grid.
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sunday = new Date(today)
  sunday.setDate(sunday.getDate() + (7 - sunday.getDay()) % 7) // align to next Sunday or today if Sun
  const startCol = new Date(sunday)
  startCol.setDate(startCol.getDate() - 6 - (weeks - 1) * 7) // Monday of first column

  const cells: { date: string; sets: number; isFuture: boolean }[] = []
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(startCol)
    d.setDate(d.getDate() + i)
    const iso = dayKey(d)
    cells.push({
      date: iso,
      sets: sets[iso] ?? 0,
      isFuture: d.getTime() > today.getTime(),
    })
  }
  return cells
}

const intensityFill = (sets: number): string => {
  if (sets === 0) return 'rgba(125, 130, 150, 0.10)'
  if (sets <= 4)  return 'rgba(56, 198, 240, 0.30)'
  if (sets <= 9)  return 'rgba(56, 198, 240, 0.55)'
  if (sets <= 15) return 'rgba(56, 198, 240, 0.80)'
  return 'var(--brand)'
}

/**
 * GitHub-style contribution heatmap. Each column is a Mon–Sun week, the
 * rightmost column is the current week. Cell intensity scales with completed
 * sets logged on that day. Future days render at low opacity.
 */
export const Heatmap = ({ workouts, weeks = 12, onDayClick }: Props) => {
  const cells = useMemo(() => buildCells(workouts, weeks), [workouts, weeks])

  // Column index → month name (only when the first day of that column is
  // the first time we encounter a new month in scan order).
  const monthLabels: Array<{ col: number; label: string }> = []
  let lastMonth = -1
  for (let c = 0; c < weeks; c++) {
    const top = cells[c * 7]
    if (!top) continue
    const monthIdx = new Date(top.date).getMonth()
    if (monthIdx !== lastMonth) {
      monthLabels.push({ col: c, label: new Date(top.date).toLocaleDateString(undefined, { month: 'short' }) })
      lastMonth = monthIdx
    }
  }

  const total = cells.reduce((acc, c) => acc + c.sets, 0)
  const trainedDays = cells.filter((c) => c.sets > 0).length

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
          {weeks} weeks · {trainedDays} trained · {total} sets
        </div>
      </div>

      <div className="relative">
        {/* Month labels row */}
        <div className="grid grid-flow-col gap-0.5 mb-1" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
          {Array.from({ length: weeks }).map((_, col) => {
            const found = monthLabels.find((m) => m.col === col)
            return (
              <div key={col} className="text-[8px] font-mono text-text-muted/60 text-center h-3">
                {found ? found.label : ''}
              </div>
            )
          })}
        </div>

        <div className="grid grid-flow-col gap-0.5" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
          {Array.from({ length: weeks }).map((_, col) => (
            <div key={col} className="grid grid-rows-7 gap-0.5">
              {Array.from({ length: 7 }).map((_, row) => {
                const cell = cells[col * 7 + row]
                if (!cell) return <div key={row} />
                const fill = intensityFill(cell.sets)
                const opacity = cell.isFuture ? 0.2 : 1
                return (
                  <button
                    key={row}
                    onClick={() => !cell.isFuture && onDayClick?.(cell.date)}
                    disabled={cell.isFuture || cell.sets === 0}
                    title={`${cell.date} · ${cell.sets} sets`}
                    className="aspect-square rounded-[2px] transition-transform hover:scale-110"
                    style={{ background: fill, opacity }}
                    aria-label={`${cell.date}, ${cell.sets} completed sets`}
                  />
                )
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1 mt-2 text-[9px] font-mono text-text-muted/70">
          <span>Less</span>
          {[0, 4, 9, 15, 20].map((n) => (
            <span
              key={n}
              className="w-2 h-2 rounded-[2px]"
              style={{ background: intensityFill(n) }}
              aria-hidden="true"
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
