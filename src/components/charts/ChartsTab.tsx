import { useMemo } from 'react'
import { useAppStore } from '../../store/AppContext'
import { NeonCard } from '../ui/NeonCard'
import { MUSCLE_GROUPS, MUSCLE_GROUP_IDS } from '../../data/muscleGroups'
import { fromKg, formatDate } from '../../utils/formatters'
import { getLevelColor } from '../../data/levelConfig'
import type { BodyEntry, MuscleGroupId, WeightUnit, WorkoutSession } from '../../types'

/**
 * Inline SVG line chart for a sparse time series.
 *
 * Data is a list of { date, value } sorted oldest→newest. Renders an area+line
 * inside a 200×60 viewBox. If there are <2 points, shows a flat indicator.
 */
interface LineChartProps {
  data: { x: number; y: number; label?: string }[]
  color: string
  unit?: string
  height?: number
}
const LineChart = ({ data, color, unit, height = 70 }: LineChartProps) => {
  if (data.length === 0) {
    return (
      <div className="h-[70px] flex items-center justify-center text-[11px] font-mono text-text-muted/60">
        No data yet
      </div>
    )
  }
  const xs = data.map((d) => d.x)
  const ys = data.map((d) => d.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const w = 320
  const h = height
  const pad = 8

  const toPx = (d: { x: number; y: number }) => {
    const px = pad + ((d.x - minX) / rangeX) * (w - pad * 2)
    const py = h - pad - ((d.y - minY) / rangeY) * (h - pad * 2)
    return [px, py] as const
  }

  const pts = data.map(toPx)
  const linePath = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${pts[pts.length - 1][0].toFixed(1)} ${h - pad} L ${pts[0][0].toFixed(1)} ${h - pad} Z`

  const last = data[data.length - 1]
  const first = data[0]
  const delta = last.y - first.y
  const sign = delta > 0 ? '+' : ''

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        <path d={areaPath} fill={color} opacity="0.12" />
        <path d={linePath} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
        {pts.length <= 30 &&
          pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.8} fill={color} />)}
      </svg>
      <div className="flex justify-between text-[10px] font-mono text-text-muted mt-0.5 px-1">
        <span>{new Date(first.x).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        <span style={{ color }}>
          {sign}
          {Math.abs(delta) < 1 ? delta.toFixed(2) : delta.toFixed(1)}
          {unit ? ` ${unit}` : ''}
        </span>
        <span>{new Date(last.x).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  )
}

/**
 * Vertical bar chart inside an SVG. Used for per-week workout counts and
 * per-muscle current-level snapshots.
 */
interface BarChartProps {
  bars: { label: string; value: number; color?: string }[]
  unit?: string
}
const BarChart = ({ bars, unit }: BarChartProps) => {
  if (bars.length === 0 || bars.every((b) => b.value === 0)) {
    return (
      <div className="h-[80px] flex items-center justify-center text-[11px] font-mono text-text-muted/60">
        No data yet
      </div>
    )
  }
  const maxV = Math.max(...bars.map((b) => b.value), 1)
  return (
    <div>
      <div className="flex items-end justify-between gap-1 h-[80px] px-1">
        {bars.map((b, i) => {
          const pct = (b.value / maxV) * 100
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0">
              <div className="text-[9px] font-mono text-text-muted tabular-nums">{b.value > 0 ? b.value : ''}</div>
              <div
                className="w-full rounded-t transition-all"
                style={{
                  height: `${Math.max(pct, b.value > 0 ? 4 : 0)}%`,
                  background: b.color ?? 'var(--brand)',
                  opacity: b.value === 0 ? 0.15 : 1,
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex justify-between gap-1 mt-1 px-1">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 text-[9px] font-mono text-text-muted text-center truncate">
            {b.label}
          </div>
        ))}
      </div>
      {unit && <div className="text-[9px] font-mono text-text-muted/70 text-center mt-1">{unit}</div>}
    </div>
  )
}

// ── Data shaping ─────────────────────────────────────────────────────────────

const weekKey = (d: Date): string => {
  // ISO week label: yyyy-Www-day → group by Monday-week
  const day = new Date(d)
  day.setHours(0, 0, 0, 0)
  day.setDate(day.getDate() - ((day.getDay() + 6) % 7)) // back to Monday
  return day.toISOString().slice(0, 10)
}

const lastNWeeks = (n: number): string[] => {
  const out: string[] = []
  const monday = new Date()
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(monday)
    d.setDate(d.getDate() - i * 7)
    out.push(weekKey(d))
  }
  return out
}

const computeWorkoutsPerWeek = (workouts: WorkoutSession[], weeks: number) => {
  const buckets: Record<string, number> = {}
  for (const w of workouts) {
    if (!w.completed) continue
    const k = weekKey(new Date(w.date))
    buckets[k] = (buckets[k] ?? 0) + 1
  }
  return lastNWeeks(weeks).map((k) => ({
    label: new Date(k).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
    value: buckets[k] ?? 0,
  }))
}

const computeVolumePerWeek = (workouts: WorkoutSession[], weeks: number, unit: WeightUnit) => {
  const buckets: Record<string, number> = {}
  for (const w of workouts) {
    if (!w.completed) continue
    const k = weekKey(new Date(w.date))
    for (const we of w.exercises) {
      for (const s of we.sets) {
        if (!s.completed) continue
        const kg = s.weight ?? 0
        const reps = s.reps ?? 0
        if (kg > 0 && reps > 0) {
          buckets[k] = (buckets[k] ?? 0) + kg * reps
        }
      }
    }
  }
  return lastNWeeks(weeks).map((k) => ({
    label: new Date(k).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
    value: Math.round(unit === 'lbs' ? (buckets[k] ?? 0) * 2.20462 : buckets[k] ?? 0),
  }))
}

const computeSetsPerWeek = (workouts: WorkoutSession[], weeks: number) => {
  const buckets: Record<string, number> = {}
  for (const w of workouts) {
    if (!w.completed) continue
    const k = weekKey(new Date(w.date))
    let count = 0
    for (const we of w.exercises) {
      for (const s of we.sets) if (s.completed) count++
    }
    buckets[k] = (buckets[k] ?? 0) + count
  }
  return lastNWeeks(weeks).map((k) => buckets[k] ?? 0)
}

const pctChange = (current: number, prior: number): number | null => {
  if (prior === 0) return current === 0 ? 0 : null
  return ((current - prior) / prior) * 100
}

interface DeltaProps {
  label: string
  current: number
  prior: number
  unit?: string
}
const DeltaCard = ({ label, current, prior, unit }: DeltaProps) => {
  const pct = pctChange(current, prior)
  const direction = pct === null ? 'neutral' : pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral'
  const color = direction === 'up' ? '#22ee99' : direction === 'down' ? '#ff4d6d' : 'var(--text-muted)'
  const arrow = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '·'
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider">{label}</div>
      <div className="text-xl font-mono font-bold tabular-nums" style={{ letterSpacing: '-0.03em' }}>
        {current.toLocaleString()}
        {unit && <span className="text-[10px] font-mono text-text-muted ml-1">{unit}</span>}
      </div>
      <div className="text-[10px] font-mono flex items-center gap-1" style={{ color }}>
        <span>{arrow}</span>
        <span>
          {pct === null ? 'new' : pct === 0 ? 'no change' : `${pct > 0 ? '+' : ''}${pct.toFixed(0)}% vs last wk`}
        </span>
      </div>
    </div>
  )
}

const computeBodyMetric = (entries: BodyEntry[], field: keyof BodyEntry) => {
  return entries
    .filter((e) => typeof e[field] === 'number')
    .map((e) => ({
      x: new Date(e.date).getTime(),
      y: e[field] as number,
    }))
    .sort((a, b) => a.x - b.x)
}

// ── Per-muscle workouts-per-week mini sparkline data ────────────────────────

const computePerMuscleVolume = (
  workouts: WorkoutSession[],
  weeks: number,
  customExercises: { id: string; muscles: { muscleId: string; type: 'primary' | 'secondary' }[] }[],
) => {
  const weekKeys = lastNWeeks(weeks)
  const exMap = new Map(customExercises.map((e) => [e.id, e]))
  const out: Partial<Record<MuscleGroupId, number[]>> = {}
  for (const id of MUSCLE_GROUP_IDS) out[id] = weekKeys.map(() => 0)

  for (const w of workouts) {
    if (!w.completed) continue
    const k = weekKey(new Date(w.date))
    const idx = weekKeys.indexOf(k)
    if (idx === -1) continue
    for (const we of w.exercises) {
      const ex = exMap.get(we.exerciseId)
      if (!ex) continue
      const completedSets = we.sets.filter((s) => s.completed).length
      if (completedSets === 0) continue
      for (const m of ex.muscles) {
        const arr = out[m.muscleId as MuscleGroupId]
        if (arr) arr[idx] += completedSets * (m.type === 'primary' ? 1 : 0.5)
      }
    }
  }
  return out as Record<MuscleGroupId, number[]>
}

// ── Component ────────────────────────────────────────────────────────────────

export const ChartsTab = () => {
  const { state } = useAppStore()
  const { bodyLog, profile, weightUnit, customExercises } = state
  const completedWorkouts = profile.workoutHistory.filter((w) => w.completed)

  const weightData = useMemo(() => {
    const raw = computeBodyMetric(bodyLog, 'weightKg')
    return raw.map((p) => ({ ...p, y: fromKg(p.y, weightUnit) }))
  }, [bodyLog, weightUnit])

  const bodyFatData = useMemo(() => computeBodyMetric(bodyLog, 'bodyFatPct'), [bodyLog])
  const waistData = useMemo(() => computeBodyMetric(bodyLog, 'waistCm'), [bodyLog])
  const restingHrData = useMemo(() => computeBodyMetric(bodyLog, 'restingHrBpm'), [bodyLog])

  const workoutsPerWeek = useMemo(() => computeWorkoutsPerWeek(completedWorkouts, 8), [completedWorkouts])
  const volumePerWeek = useMemo(
    () => computeVolumePerWeek(completedWorkouts, 8, weightUnit),
    [completedWorkouts, weightUnit],
  )
  const setsPerWeek = useMemo(() => computeSetsPerWeek(completedWorkouts, 2), [completedWorkouts])
  const volumeLast2 = useMemo(
    () => computeVolumePerWeek(completedWorkouts, 2, weightUnit).map((b) => b.value),
    [completedWorkouts, weightUnit],
  )
  const workoutsLast2 = useMemo(
    () => computeWorkoutsPerWeek(completedWorkouts, 2).map((b) => b.value),
    [completedWorkouts],
  )

  const perMuscleVolume = useMemo(
    () => computePerMuscleVolume(completedWorkouts, 6, customExercises),
    [completedWorkouts, customExercises],
  )

  // Top muscles by current level — for the snapshot bar chart
  const topMuscles = useMemo(() => {
    return MUSCLE_GROUP_IDS
      .map((id) => profile.muscleGroups[id])
      .sort((a, b) => b.level - a.level)
      .slice(0, 8)
  }, [profile.muscleGroups])

  return (
    <div className="flex flex-col gap-3">
      {/* ── Body composition section ─────────────────────────────── */}
      <div className="text-[11px] font-mono text-text-muted uppercase tracking-widest mt-1">Body trends</div>

      <NeonCard className="p-3">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-sm font-display font-semibold">Body weight</div>
          <div className="text-[10px] font-mono text-text-muted">{weightData.length} entries</div>
        </div>
        <LineChart data={weightData} color="var(--brand)" unit={weightUnit} />
      </NeonCard>

      <div className="grid grid-cols-2 gap-3">
        <NeonCard className="p-3">
          <div className="text-xs font-display font-semibold mb-1.5">Body fat %</div>
          <LineChart data={bodyFatData} color="#f59e0b" unit="%" height={55} />
        </NeonCard>
        <NeonCard className="p-3">
          <div className="text-xs font-display font-semibold mb-1.5">Waist</div>
          <LineChart data={waistData} color="#a855f7" unit="cm" height={55} />
        </NeonCard>
      </div>

      <NeonCard className="p-3">
        <div className="text-xs font-display font-semibold mb-1.5">Resting HR</div>
        <LineChart data={restingHrData} color="#ef4444" unit="bpm" height={55} />
      </NeonCard>

      {/* ── Workout trends section ───────────────────────────────── */}
      <div className="text-[11px] font-mono text-text-muted uppercase tracking-widest mt-2">Workout trends · last 8 weeks</div>

      {/* Week-over-week deltas (C10) */}
      <NeonCard className="p-3">
        <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">This week vs last</div>
        <div className="grid grid-cols-3 gap-2">
          <DeltaCard
            label="Workouts"
            current={workoutsLast2[1] ?? 0}
            prior={workoutsLast2[0] ?? 0}
          />
          <DeltaCard
            label="Sets"
            current={setsPerWeek[1] ?? 0}
            prior={setsPerWeek[0] ?? 0}
          />
          <DeltaCard
            label="Volume"
            current={volumeLast2[1] ?? 0}
            prior={volumeLast2[0] ?? 0}
            unit={weightUnit}
          />
        </div>
      </NeonCard>

      <NeonCard className="p-3">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-sm font-display font-semibold">Workouts per week</div>
          <div className="text-[10px] font-mono text-text-muted">
            {workoutsPerWeek.reduce((a, b) => a + b.value, 0)} total
          </div>
        </div>
        <BarChart bars={workoutsPerWeek} />
      </NeonCard>

      <NeonCard className="p-3">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-sm font-display font-semibold">Weekly volume ({weightUnit})</div>
          <div className="text-[10px] font-mono text-text-muted">weight × reps</div>
        </div>
        <BarChart bars={volumePerWeek} />
      </NeonCard>

      {/* ── Per-muscle section ───────────────────────────────────── */}
      <div className="text-[11px] font-mono text-text-muted uppercase tracking-widest mt-2">Per muscle · current level</div>

      <NeonCard className="p-3">
        <BarChart
          bars={topMuscles.map((m) => ({
            label: MUSCLE_GROUPS[m.id].shortName,
            value: m.level,
            color: getLevelColor(m.level).glow || 'var(--brand)',
          }))}
          unit="level"
        />
      </NeonCard>

      {/* Per-muscle volume sparklines (last 6 weeks) */}
      <div className="text-[11px] font-mono text-text-muted uppercase tracking-widest mt-2">
        Per muscle · volume trend (6 wks)
      </div>
      <div className="grid grid-cols-2 gap-2">
        {MUSCLE_GROUP_IDS.map((id) => {
          const series = perMuscleVolume[id]
          const total = series.reduce((a, b) => a + b, 0)
          if (total === 0) return null
          const data = series.map((v, i) => ({ x: i, y: v }))
          const { glow } = getLevelColor(profile.muscleGroups[id].level)
          return (
            <NeonCard key={id} className="p-2.5">
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-[11px] font-display font-semibold truncate">{MUSCLE_GROUPS[id].shortName}</div>
                <div className="text-[9px] font-mono text-text-muted">{total.toFixed(0)} sets</div>
              </div>
              <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-7">
                {(() => {
                  const max = Math.max(...series, 1)
                  const pts = data.map((d, i) => {
                    const px = (i / (data.length - 1 || 1)) * 100
                    const py = 28 - (d.y / max) * 24
                    return [px, py]
                  })
                  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
                  return (
                    <>
                      <path d={`${line} L 100 28 L 0 28 Z`} fill={glow || 'var(--brand)'} opacity="0.18" />
                      <path d={line} stroke={glow || 'var(--brand)'} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
                    </>
                  )
                })()}
              </svg>
            </NeonCard>
          )
        })}
        {MUSCLE_GROUP_IDS.every((id) => perMuscleVolume[id].reduce((a, b) => a + b, 0) === 0) && (
          <div className="col-span-2 text-center text-[11px] font-mono text-text-muted/60 py-6">
            Log a few workouts to see per-muscle volume trends.
          </div>
        )}
      </div>

      {/* Footer hint */}
      {completedWorkouts.length === 0 && bodyLog.length === 0 && (
        <div className="text-center text-[12px] font-mono text-text-muted/70 py-6">
          Charts populate as you log workouts and body entries.
        </div>
      )}
      {bodyLog.length > 0 && completedWorkouts.length > 0 && (
        <div className="text-center text-[10px] font-mono text-text-muted/50 py-3">
          Last entry {formatDate(bodyLog[0].date)} · {completedWorkouts.length} workouts logged
        </div>
      )}
    </div>
  )
}
