import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/AppContext'
import { PageHeader } from '../components/layout/PageHeader'
import { NeonCard } from '../components/ui/NeonCard'
import { GlowButton } from '../components/ui/GlowButton'
import { MUSCLE_GROUPS } from '../data/muscleGroups'
import { EXERCISES as SEED_EXERCISES } from '../data/exercises'
import { fromKg, formatDate } from '../utils/formatters'
import { createExercise, updateExercise, deleteExercise } from '../api/exercises'
import type { Exercise, MuscleGroupId, ExerciseCategory, Equipment, TrackingType } from '../types'

const CATEGORIES: ExerciseCategory[] = ['push', 'pull', 'legs', 'core', 'compound', 'cardio']
const EQUIPMENT: Equipment[] = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'band']
const TRACKING_TYPES: { value: TrackingType; label: string }[] = [
  { value: 'strength',   label: 'Strength (reps + weight)' },
  { value: 'bodyweight', label: 'Bodyweight (reps, weight optional)' },
  { value: 'duration',   label: 'Duration (time, weight optional)' },
  { value: 'cardio',     label: 'Cardio (time + distance)' },
]

interface ExerciseForm {
  name: string
  category: ExerciseCategory
  equipment: Equipment
  tracking_type: TrackingType
  primaryMuscle: MuscleGroupId
  /** 'none' = no secondary muscle. */
  secondaryMuscle: MuscleGroupId | 'none'
  description: string
}

const EMPTY_FORM: ExerciseForm = {
  name: '',
  category: 'push',
  equipment: 'bodyweight',
  tracking_type: 'strength',
  primaryMuscle: 'chest',
  secondaryMuscle: 'none',
  description: '',
}

const buildMuscleList = (
  primary: MuscleGroupId,
  secondary: MuscleGroupId | 'none',
): { muscle_id: string; type: 'primary' | 'secondary' }[] => {
  const list: { muscle_id: string; type: 'primary' | 'secondary' }[] = [
    { muscle_id: primary, type: 'primary' },
  ]
  if (secondary !== 'none' && secondary !== primary) {
    list.push({ muscle_id: secondary, type: 'secondary' })
  }
  return list
}

export const ExerciseLibrary = () => {
  const { state, dispatch } = useAppStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<ExerciseCategory | 'all'>('all')
  const [showOnlyCustom, setShowOnlyCustom] = useState(false)

  // Form modal state — null = closed; { mode: 'create' } or { mode: 'edit', id: '...' }
  const [editing, setEditing] = useState<{ mode: 'create' } | { mode: 'edit'; id: string } | null>(null)
  const [form, setForm] = useState<ExerciseForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Delete confirm modal
  const [confirmDelete, setConfirmDelete] = useState<Exercise | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Set of seed exercise IDs — used to distinguish user-added from built-in
  const seedIds = useMemo(() => new Set(SEED_EXERCISES.map((e) => e.id)), [])

  const allExercises = state.customExercises

  const filtered = allExercises.filter((e) => {
    const matchesSearch =
      search.length === 0 ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.muscles.some((m) => MUSCLE_GROUPS[m.muscleId]?.name.toLowerCase().includes(search.toLowerCase()))
    const matchesCat = catFilter === 'all' || e.category === catFilter
    const matchesCustom = !showOnlyCustom || !seedIds.has(e.id)
    return matchesSearch && matchesCat && matchesCustom
  })

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditing({ mode: 'create' })
  }

  const openEdit = (ex: Exercise) => {
    const primary = ex.muscles.find((m) => m.type === 'primary')
    const secondary = ex.muscles.find((m) => m.type === 'secondary')
    setForm({
      name: ex.name,
      category: ex.category,
      equipment: ex.equipment,
      tracking_type: ex.tracking_type ?? 'strength',
      primaryMuscle: (primary?.muscleId ?? 'chest') as MuscleGroupId,
      secondaryMuscle: (secondary?.muscleId ?? 'none') as MuscleGroupId | 'none',
      description: ex.description ?? '',
    })
    setEditing({ mode: 'edit', id: ex.id })
  }

  const saveExercise = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const muscles = buildMuscleList(form.primaryMuscle, form.secondaryMuscle)
      if (editing?.mode === 'create') {
        const ex = await createExercise({
          name: form.name.trim(),
          category: form.category,
          equipment: form.equipment,
          tracking_type: form.tracking_type,
          description: form.description.trim(),
          muscles,
        })
        dispatch({ type: 'ADD_CUSTOM_EXERCISE', exercise: ex })
      } else if (editing?.mode === 'edit') {
        const ex = await updateExercise(editing.id, {
          name: form.name.trim(),
          category: form.category,
          equipment: form.equipment,
          tracking_type: form.tracking_type,
          description: form.description.trim(),
          muscles,
        })
        dispatch({ type: 'UPDATE_EXERCISE', exercise: ex })
      }
      setEditing(null)
      setForm(EMPTY_FORM)
    } finally {
      setSaving(false)
    }
  }

  const performDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await deleteExercise(confirmDelete.id)
      dispatch({ type: 'REMOVE_EXERCISE_LIBRARY', exerciseId: confirmDelete.id })
      setConfirmDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const customCount = allExercises.filter((e) => !seedIds.has(e.id)).length

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Exercise Library"
        subtitle={`${allExercises.length} exercises · ${customCount} custom`}
        right={
          <GlowButton size="sm" variant="secondary" onClick={openCreate}>
            + Custom
          </GlowButton>
        }
      />

      <div className="px-4 py-3">
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search exercises or muscles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-sl-surface border border-sl-border rounded-xl px-4 py-2.5 text-sm font-mono text-sl-text placeholder:text-sl-muted outline-none focus:border-sl-purple transition-colors"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 hide-scrollbar">
          {(['all', ...CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border transition-colors ${
                catFilter === cat
                  ? 'bg-sl-purple border-sl-purple text-white'
                  : 'border-sl-border text-sl-muted hover:border-sl-purple/40'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => setShowOnlyCustom((v) => !v)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border transition-colors ${
              showOnlyCustom
                ? 'bg-sl-blue border-sl-blue text-white'
                : 'border-sl-border text-sl-muted hover:border-sl-blue/40'
            }`}
          >
            Custom only
          </button>
        </div>

        {/* PRs */}
        {Object.keys(state.personalRecords).length > 0 && search.length === 0 && catFilter === 'all' && !showOnlyCustom && (
          <div className="mb-4">
            <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-2">Personal Records</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(state.personalRecords)
                .sort((a, b) => b.weightKg - a.weightKg)
                .slice(0, 6)
                .map((pr) => {
                  const ex = allExercises.find((e) => e.id === pr.exerciseId)
                  if (!ex) return null
                  return (
                    <NeonCard key={pr.exerciseId} className="p-2.5" glow="gold">
                      <div className="text-xs font-display font-semibold truncate">{ex.name}</div>
                      <div className="text-lg font-mono font-bold text-sl-gold mt-0.5">
                        {fromKg(pr.weightKg, state.weightUnit).toFixed(1)}
                        <span className="text-xs text-sl-muted ml-1">{state.weightUnit}</span>
                      </div>
                      <div className="text-xs font-mono text-sl-muted">{pr.reps} reps · {formatDate(pr.date)}</div>
                    </NeonCard>
                  )
                })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 pb-20">
          {filtered.map((ex) => {
            const primaryMuscles = ex.muscles.filter((m) => m.type === 'primary').map((m) => MUSCLE_GROUPS[m.muscleId as MuscleGroupId]?.shortName)
            const pr = state.personalRecords[ex.id]
            const isCustom = !seedIds.has(ex.id)
            const trackingBadgeColor: Record<TrackingType, string> = {
              strength: 'bg-sl-purple/20 text-sl-purple',
              bodyweight: 'bg-sl-blue/20 text-sl-blue',
              duration: 'bg-emerald-500/20 text-emerald-400',
              cardio: 'bg-orange-500/20 text-orange-400',
            }
            return (
              <NeonCard key={ex.id} className="px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-display font-semibold">{ex.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${trackingBadgeColor[ex.tracking_type ?? 'strength']}`}>
                        {ex.tracking_type ?? 'strength'}
                      </span>
                      {isCustom && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-sl-blue/20 text-sl-blue uppercase tracking-wider">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-sl-muted font-mono mt-0.5 capitalize">
                      {ex.equipment} · {primaryMuscles.join(', ')}
                    </div>
                    {pr && pr.weightKg > 0 && (
                      <div className="text-xs font-mono text-sl-gold mt-0.5">
                        PR: {fromKg(pr.weightKg, state.weightUnit).toFixed(1)} {state.weightUnit} × {pr.reps}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      className="text-xs font-mono text-sl-muted hover:text-sl-purple border border-sl-border hover:border-sl-purple/40 rounded-lg px-2 py-1 transition-colors"
                      onClick={() => { const m = ex.muscles.find((m) => m.type === 'primary'); if (m) navigate(`/muscles/${m.muscleId}`) }}
                    >
                      Muscles
                    </button>
                    {isCustom && (
                      <div className="flex gap-1">
                        <button
                          aria-label="Edit"
                          className="flex-1 text-xs font-mono text-sl-muted hover:text-sl-blue border border-sl-border hover:border-sl-blue/40 rounded-lg px-2 py-1 transition-colors"
                          onClick={() => openEdit(ex)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 mx-auto">
                            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          aria-label="Delete"
                          className="flex-1 text-xs font-mono text-sl-muted hover:text-sl-danger border border-sl-border hover:border-sl-danger/40 rounded-lg px-2 py-1 transition-colors"
                          onClick={() => setConfirmDelete(ex)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 mx-auto">
                            <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </NeonCard>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center text-sl-muted font-mono text-sm py-8">No exercises found</div>
          )}
        </div>
      </div>

      {/* Create / Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !saving && setEditing(null)} />
          <div className="relative z-10 w-full max-w-lg bg-sl-surface border-t border-sl-border rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-display font-bold mb-4">
              {editing.mode === 'create' ? 'Add Custom Exercise' : 'Edit Exercise'}
            </h3>
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                placeholder="Exercise name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="bg-sl-bg border border-sl-border rounded-lg px-3 py-2 text-sm font-mono text-sl-text outline-none focus:border-sl-purple"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-sl-muted uppercase tracking-wider block mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExerciseCategory }))} className="w-full bg-sl-bg border border-sl-border rounded-lg px-3 py-2 text-sm font-mono text-sl-text outline-none focus:border-sl-purple">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-sl-muted uppercase tracking-wider block mb-1">Equipment</label>
                  <select value={form.equipment} onChange={(e) => setForm((f) => ({ ...f, equipment: e.target.value as Equipment }))} className="w-full bg-sl-bg border border-sl-border rounded-lg px-3 py-2 text-sm font-mono text-sl-text outline-none focus:border-sl-purple">
                    {EQUIPMENT.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-mono text-sl-muted uppercase tracking-wider block mb-1">Tracking Type</label>
                <select value={form.tracking_type} onChange={(e) => setForm((f) => ({ ...f, tracking_type: e.target.value as TrackingType }))} className="w-full bg-sl-bg border border-sl-border rounded-lg px-3 py-2 text-sm font-mono text-sl-text outline-none focus:border-sl-purple">
                  {TRACKING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-sl-muted uppercase tracking-wider block mb-1">Primary Muscle</label>
                  <select value={form.primaryMuscle} onChange={(e) => setForm((f) => ({ ...f, primaryMuscle: e.target.value as MuscleGroupId }))} className="w-full bg-sl-bg border border-sl-border rounded-lg px-3 py-2 text-sm font-mono text-sl-text outline-none focus:border-sl-purple">
                    {Object.values(MUSCLE_GROUPS).map((m) => (
                      <option key={m.id} value={m.id}>{m.displayName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-sl-muted uppercase tracking-wider block mb-1">Secondary Muscle</label>
                  <select
                    value={form.secondaryMuscle}
                    onChange={(e) => setForm((f) => ({ ...f, secondaryMuscle: e.target.value as MuscleGroupId | 'none' }))}
                    className="w-full bg-sl-bg border border-sl-border rounded-lg px-3 py-2 text-sm font-mono text-sl-text outline-none focus:border-sl-purple"
                  >
                    <option value="none">— None —</option>
                    {Object.values(MUSCLE_GROUPS)
                      .filter((m) => m.id !== form.primaryMuscle)
                      .map((m) => (
                        <option key={m.id} value={m.id}>{m.displayName}</option>
                      ))}
                  </select>
                </div>
              </div>
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="bg-sl-bg border border-sl-border rounded-lg px-3 py-2 text-sm font-mono text-sl-text outline-none focus:border-sl-purple resize-none"
              />
            </div>
            <div className="flex gap-3">
              <GlowButton className="flex-1" onClick={saveExercise} disabled={!form.name.trim() || saving}>
                {saving ? 'Saving…' : editing.mode === 'create' ? 'Add Exercise' : 'Save Changes'}
              </GlowButton>
              <GlowButton variant="secondary" className="flex-1" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </GlowButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !deleting && setConfirmDelete(null)} />
          <div className="relative z-10 w-full max-w-lg bg-sl-surface border-t border-sl-border rounded-t-2xl p-5">
            <h3 className="text-lg font-display font-bold mb-2">Delete "{confirmDelete.name}"?</h3>
            <p className="text-sm text-sl-muted font-mono mb-4">
              This cannot be undone. Past workouts that used this exercise will keep their records, but it will no longer appear in the library.
            </p>
            <div className="flex gap-3">
              <GlowButton variant="danger" className="flex-1" onClick={performDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </GlowButton>
              <GlowButton variant="secondary" className="flex-1" onClick={() => setConfirmDelete(null)} disabled={deleting}>
                Cancel
              </GlowButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
