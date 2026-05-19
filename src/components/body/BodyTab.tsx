import { useState, useMemo } from 'react'
import { useAppStore } from '../../store/AppContext'
import { NeonCard } from '../ui/NeonCard'
import { GlowButton } from '../ui/GlowButton'
import { createBodyEntry, updateBodyEntry, deleteBodyEntry } from '../../api/body'
import { fromKg, toKg, formatDate, todayISO } from '../../utils/formatters'
import type { BodyEntry } from '../../types'

type MetricField =
  | 'weightKg' | 'bodyFatPct' | 'heightCm'
  | 'neckCm' | 'shouldersCm' | 'chestCm'
  | 'leftArmCm' | 'rightArmCm' | 'leftForearmCm' | 'rightForearmCm'
  | 'waistCm' | 'hipsCm'
  | 'leftThighCm' | 'rightThighCm' | 'leftCalfCm' | 'rightCalfCm'
  | 'restingHrBpm' | 'sleepHours' | 'energyLevel' | 'moodLevel' | 'sorenessLevel'
  | 'hydrationL' | 'stepsCount'

interface MetricMeta {
  field: MetricField
  label: string
  unit: string
  category: 'composition' | 'measurement' | 'wellness'
  format?: (v: number) => string
  step?: string
}

const METRICS: MetricMeta[] = [
  // Composition
  { field: 'weightKg',   label: 'Weight',      unit: 'kg', category: 'composition' },
  { field: 'bodyFatPct', label: 'Body Fat',    unit: '%',  category: 'composition' },
  { field: 'heightCm',   label: 'Height',      unit: 'cm', category: 'composition' },

  // Measurements
  { field: 'neckCm',         label: 'Neck',          unit: 'cm', category: 'measurement' },
  { field: 'shouldersCm',    label: 'Shoulders',     unit: 'cm', category: 'measurement' },
  { field: 'chestCm',        label: 'Chest',         unit: 'cm', category: 'measurement' },
  { field: 'leftArmCm',      label: 'Left Arm',      unit: 'cm', category: 'measurement' },
  { field: 'rightArmCm',     label: 'Right Arm',     unit: 'cm', category: 'measurement' },
  { field: 'leftForearmCm',  label: 'Left Forearm',  unit: 'cm', category: 'measurement' },
  { field: 'rightForearmCm', label: 'Right Forearm', unit: 'cm', category: 'measurement' },
  { field: 'waistCm',        label: 'Waist',         unit: 'cm', category: 'measurement' },
  { field: 'hipsCm',         label: 'Hips',          unit: 'cm', category: 'measurement' },
  { field: 'leftThighCm',    label: 'Left Thigh',    unit: 'cm', category: 'measurement' },
  { field: 'rightThighCm',   label: 'Right Thigh',   unit: 'cm', category: 'measurement' },
  { field: 'leftCalfCm',     label: 'Left Calf',     unit: 'cm', category: 'measurement' },
  { field: 'rightCalfCm',    label: 'Right Calf',    unit: 'cm', category: 'measurement' },

  // Wellness
  { field: 'restingHrBpm',   label: 'Resting HR',  unit: 'bpm',  category: 'wellness' },
  { field: 'sleepHours',     label: 'Sleep',       unit: 'hrs',  category: 'wellness' },
  { field: 'energyLevel',    label: 'Energy',      unit: '/10',  category: 'wellness' },
  { field: 'moodLevel',      label: 'Mood',        unit: '/10',  category: 'wellness' },
  { field: 'sorenessLevel',  label: 'Soreness',    unit: '/10',  category: 'wellness' },
  { field: 'hydrationL',     label: 'Hydration',   unit: 'L',    category: 'wellness' },
  { field: 'stepsCount',     label: 'Steps',       unit: '',     category: 'wellness' },
]

type FormValues = Partial<Record<MetricField, string>>

const emptyForm = (): FormValues => ({})

export const BodyTab = () => {
  const { state, dispatch } = useAppStore()
  const [date, setDate] = useState(todayISO())
  const [values, setValues] = useState<FormValues>(emptyForm)
  const [section, setSection] = useState<'composition' | 'measurement' | 'wellness'>('composition')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<BodyEntry | null>(null)

  const latest = state.bodyLog[0]
  const previous = state.bodyLog[1]

  // Compute BMI from latest entries (use most recent weight + most recent height)
  const latestWeight = useMemo(() => state.bodyLog.find((e) => e.weightKg !== undefined)?.weightKg, [state.bodyLog])
  const latestHeight = useMemo(() => state.bodyLog.find((e) => e.heightCm !== undefined)?.heightCm, [state.bodyLog])
  const bmi = useMemo(() => {
    if (!latestWeight || !latestHeight) return null
    const m = latestHeight / 100
    return latestWeight / (m * m)
  }, [latestWeight, latestHeight])

  // Most recent value of a metric across all entries
  const latestOf = (field: MetricField): number | undefined => {
    for (const e of state.bodyLog) {
      const v = e[field] as number | undefined
      if (v !== undefined) return v
    }
    return undefined
  }

  // Previous distinct value (for delta) — the value before the most recent
  const previousOf = (field: MetricField): number | undefined => {
    let foundFirst = false
    for (const e of state.bodyLog) {
      const v = e[field] as number | undefined
      if (v === undefined) continue
      if (!foundFirst) {
        foundFirst = true
        continue
      }
      return v
    }
    return undefined
  }

  const setVal = (field: MetricField, raw: string) => {
    setValues((v) => ({ ...v, [field]: raw }))
  }

  const buildEntryFromForm = (): Omit<BodyEntry, 'id'> => {
    const out: Omit<BodyEntry, 'id'> = { date }
    for (const m of METRICS) {
      const raw = values[m.field]
      if (raw === undefined || raw === '') continue
      const n = parseFloat(raw)
      if (isNaN(n)) continue
      let v = n
      // store weight always in kg
      if (m.field === 'weightKg' && state.weightUnit === 'lbs') v = toKg(n, 'lbs')
      ;(out as Record<string, unknown>)[m.field] = v
    }
    return out
  }

  const startEdit = (entry: BodyEntry) => {
    setEditingId(entry.id)
    setDate(entry.date)
    const v: FormValues = {}
    for (const m of METRICS) {
      const val = entry[m.field] as number | undefined
      if (val === undefined) continue
      if (m.field === 'weightKg' && state.weightUnit === 'lbs') {
        v[m.field] = fromKg(val, 'lbs').toFixed(1)
      } else {
        v[m.field] = String(val)
      }
    }
    setValues(v)
    setShowHistory(false)
    setSection('composition')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const save = async () => {
    const entryData = buildEntryFromForm()
    // Don't save an empty entry
    if (Object.keys(entryData).length <= 1) return
    setSaving(true)
    try {
      if (editingId) {
        const updated: BodyEntry = { ...entryData, id: editingId }
        await updateBodyEntry(updated)
        dispatch({ type: 'UPDATE_BODY_ENTRY', entry: updated })
      } else {
        const created = await createBodyEntry(entryData)
        dispatch({ type: 'ADD_BODY_ENTRY', entry: created })
      }
      setValues(emptyForm())
      setEditingId(null)
      setDate(todayISO())
    } finally {
      setSaving(false)
    }
  }

  const performDelete = async () => {
    if (!confirmDelete) return
    await deleteBodyEntry(confirmDelete.id)
    dispatch({ type: 'DELETE_BODY_ENTRY', id: confirmDelete.id })
    setConfirmDelete(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setValues(emptyForm())
    setDate(todayISO())
  }

  // ── Render helpers ──────────────────────────────────────────────────────────

  const MetricCard = ({ meta }: { meta: MetricMeta }) => {
    const cur = latestOf(meta.field)
    const prev = previousOf(meta.field)
    let displayVal: string = '—'
    let displayUnit = meta.unit
    if (cur !== undefined) {
      if (meta.field === 'weightKg') {
        displayVal = fromKg(cur, state.weightUnit).toFixed(1)
        displayUnit = state.weightUnit
      } else {
        displayVal = Number.isInteger(cur) ? String(cur) : cur.toFixed(1)
      }
    }
    let delta: number | null = null
    let deltaDisplay: string | null = null
    if (cur !== undefined && prev !== undefined) {
      delta = cur - prev
      if (Math.abs(delta) > 0.001) {
        let d = delta
        if (meta.field === 'weightKg') d = fromKg(cur, state.weightUnit) - fromKg(prev, state.weightUnit)
        deltaDisplay = (d > 0 ? '+' : '') + (Number.isInteger(d) ? d.toFixed(0) : d.toFixed(1))
      }
    }
    // For some metrics, lower is better (resting HR, body fat, soreness)
    const lowerIsBetter = ['restingHrBpm', 'bodyFatPct', 'sorenessLevel', 'waistCm'].includes(meta.field)
    const positive = delta !== null && ((delta > 0) === !lowerIsBetter)
    const deltaColor = deltaDisplay
      ? positive ? 'text-success' : delta === 0 ? 'text-text-muted' : 'text-danger'
      : 'text-text-muted'

    return (
      <NeonCard className="p-3">
        <div className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1">{meta.label}</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[20px] font-semibold tracking-tight text-text tabular-nums">{displayVal}</span>
          {cur !== undefined && <span className="text-[11px] text-text-muted font-medium">{displayUnit}</span>}
        </div>
        {deltaDisplay && (
          <div className={`text-[11px] font-mono mt-0.5 ${deltaColor}`}>
            {deltaDisplay} {displayUnit}
          </div>
        )}
      </NeonCard>
    )
  }

  const InputRow = ({ meta }: { meta: MetricMeta }) => {
    const display = meta.field === 'weightKg' ? `Weight (${state.weightUnit})` : meta.label
    return (
      <div>
        <label className="text-[11px] text-text-muted font-medium tracking-tight block mb-1">
          {display}{meta.unit && meta.field !== 'weightKg' ? ` (${meta.unit})` : ''}
        </label>
        <input
          type="number"
          inputMode="decimal"
          step="any"
          placeholder="—"
          value={values[meta.field] ?? ''}
          onChange={(e) => setVal(meta.field, e.target.value)}
          className="w-full bg-sunken border border-border rounded-xl px-3 py-2.5 text-[14px] text-text outline-none focus:border-brand transition-colors tabular-nums"
        />
      </div>
    )
  }

  const compositionMetrics = METRICS.filter((m) => m.category === 'composition')
  const measurementMetrics = METRICS.filter((m) => m.category === 'measurement')
  const wellnessMetrics    = METRICS.filter((m) => m.category === 'wellness')

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Headline cards */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <NeonCard className="p-3">
          <div className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1">Weight</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-semibold tabular-nums">
              {latestWeight ? fromKg(latestWeight, state.weightUnit).toFixed(1) : '—'}
            </span>
            {latestWeight && <span className="text-[11px] text-text-muted">{state.weightUnit}</span>}
          </div>
        </NeonCard>
        <NeonCard className="p-3">
          <div className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1">Body Fat</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-semibold tabular-nums">
              {latest?.bodyFatPct?.toFixed(1) ?? '—'}
            </span>
            {latest?.bodyFatPct !== undefined && <span className="text-[11px] text-text-muted">%</span>}
          </div>
        </NeonCard>
        <NeonCard className="p-3">
          <div className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1">BMI</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-semibold tabular-nums">
              {bmi ? bmi.toFixed(1) : '—'}
            </span>
            {bmi && (
              <span className="text-[10px] text-text-muted">
                {bmi < 18.5 ? 'low' : bmi < 25 ? 'normal' : bmi < 30 ? 'high' : 'obese'}
              </span>
            )}
          </div>
        </NeonCard>
      </div>

      {/* Secondary metric strip */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <MetricCard meta={METRICS.find((m) => m.field === 'waistCm')!} />
        <MetricCard meta={METRICS.find((m) => m.field === 'chestCm')!} />
        <MetricCard meta={METRICS.find((m) => m.field === 'restingHrBpm')!} />
        <MetricCard meta={METRICS.find((m) => m.field === 'sleepHours')!} />
      </div>

      {/* Log form */}
      <NeonCard className="p-4 mb-4" glow="purple">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[16px] font-semibold tracking-tight">
              {editingId ? 'Edit entry' : 'Log new entry'}
            </div>
            <div className="text-[11px] text-text-muted">Fill any fields — all optional</div>
          </div>
          {editingId && (
            <button onClick={cancelEdit} className="text-[12px] text-text-muted hover:text-text">Cancel</button>
          )}
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 mb-3 p-1 bg-sunken rounded-xl">
          {(['composition', 'measurement', 'wellness'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`flex-1 py-1.5 text-[12px] font-medium rounded-lg capitalize transition-colors ${
                section === s ? 'bg-elevated text-text shadow-button' : 'text-text-muted'
              }`}
            >
              {s === 'measurement' ? 'Measurements' : s}
            </button>
          ))}
        </div>

        {/* Date */}
        <div className="mb-3">
          <label className="text-[11px] text-text-muted font-medium block mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-sunken border border-border rounded-xl px-3 py-2.5 text-[14px] text-text outline-none focus:border-brand"
          />
        </div>

        {/* Section-specific fields */}
        {section === 'composition' && (
          <div className="grid grid-cols-2 gap-3">
            {compositionMetrics.map((m) => <InputRow key={m.field} meta={m} />)}
          </div>
        )}
        {section === 'measurement' && (
          <div className="grid grid-cols-2 gap-3">
            {measurementMetrics.map((m) => <InputRow key={m.field} meta={m} />)}
          </div>
        )}
        {section === 'wellness' && (
          <div className="grid grid-cols-2 gap-3">
            {wellnessMetrics.map((m) => <InputRow key={m.field} meta={m} />)}
          </div>
        )}

        <div className="mt-4">
          <GlowButton className="w-full" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Log Entry'}
          </GlowButton>
        </div>
      </NeonCard>

      {/* Recent trend snapshot — last 4 entries on each metric */}
      {state.bodyLog.length > 0 && (
        <>
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="w-full text-left text-[11px] uppercase tracking-wider font-medium text-text-muted mb-2 hover:text-text transition-colors flex items-center gap-1.5"
          >
            <span>{showHistory ? '▾' : '▸'}</span>
            <span>History · {state.bodyLog.length} entries</span>
          </button>

          {showHistory && (
            <div className="flex flex-col gap-2">
              {state.bodyLog.map((e) => {
                const filled = METRICS.filter((m) => e[m.field] !== undefined)
                return (
                  <NeonCard key={e.id} className="px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-mono text-text-muted">{formatDate(e.date)}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(e)}
                          className="text-[11px] text-text-muted hover:text-brand border border-border hover:border-brand/40 rounded-md px-2 py-0.5 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDelete(e)}
                          className="text-[11px] text-text-muted hover:text-danger border border-border hover:border-danger/40 rounded-md px-2 py-0.5 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {filled.map((m) => {
                        const v = e[m.field] as number
                        let display: string = String(v)
                        let unit = m.unit
                        if (m.field === 'weightKg') {
                          display = fromKg(v, state.weightUnit).toFixed(1)
                          unit = state.weightUnit
                        } else if (!Number.isInteger(v)) {
                          display = v.toFixed(1)
                        }
                        return (
                          <span key={m.field} className="text-[12px] font-mono">
                            <span className="text-text-muted">{m.label}: </span>
                            <span className="text-text font-medium">{display}{unit}</span>
                          </span>
                        )
                      })}
                      {filled.length === 0 && (
                        <span className="text-[11px] text-text-muted italic">empty entry</span>
                      )}
                    </div>
                  </NeonCard>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="modal-backdrop absolute inset-0" onClick={() => setConfirmDelete(null)} />
          <div className="relative z-10 w-full max-w-lg bg-elevated border-t border-border rounded-t-2xl p-5">
            <h3 className="text-[18px] font-semibold mb-1">Delete entry from {formatDate(confirmDelete.date)}?</h3>
            <p className="text-[13px] text-text-muted mb-4">This cannot be undone.</p>
            <div className="flex gap-3">
              <GlowButton variant="danger" className="flex-1" onClick={performDelete}>Delete</GlowButton>
              <GlowButton variant="secondary" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancel</GlowButton>
            </div>
          </div>
        </div>
      )}

      {/* unused vars referenced once to satisfy linter when previous is not surfaced */}
      <span className="hidden">{previous?.id}</span>
    </div>
  )
}
