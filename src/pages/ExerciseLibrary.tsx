import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, useDispatch } from '../store/AppContext'
import { PageHeader } from '../components/layout/PageHeader'
import { NeonCard } from '../components/ui/NeonCard'
import { GlowButton } from '../components/ui/GlowButton'
import { EXERCISES } from '../data/exercises'
import { MUSCLE_GROUPS } from '../data/muscleGroups'
import { fromKg, formatDate } from '../utils/formatters'
import type { MuscleGroupId, ExerciseCategory, Equipment } from '../types'

const CATEGORIES: ExerciseCategory[] = ['push', 'pull', 'legs', 'core', 'compound', 'cardio']

export function ExerciseLibrary() {
  const { state } = useAppStore()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<ExerciseCategory | 'all'>('all')
  const [showAddCustom, setShowAddCustom] = useState(false)
  const [customForm, setCustomForm] = useState({
    name: '',
    category: 'push' as ExerciseCategory,
    equipment: 'bodyweight' as Equipment,
    primaryMuscle: 'chest' as MuscleGroupId,
    description: '',
  })

  const allExercises = [...EXERCISES, ...state.customExercises]

  const filtered = allExercises.filter((e) => {
    const matchesSearch =
      search.length === 0 ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.muscles.some((m) => MUSCLE_GROUPS[m.muscleId]?.name.toLowerCase().includes(search.toLowerCase()))
    const matchesCat = catFilter === 'all' || e.category === catFilter
    return matchesSearch && matchesCat
  })

  function addCustomExercise() {
    if (!customForm.name.trim()) return
    dispatch({
      type: 'ADD_CUSTOM_EXERCISE',
      exercise: {
        id: 'custom-' + Date.now(),
        name: customForm.name.trim(),
        category: customForm.category,
        equipment: customForm.equipment,
        description: customForm.description,
        muscles: [{ muscleId: customForm.primaryMuscle, type: 'primary' }],
        recommendedLevelRange: [1, 100],
      },
    })
    setShowAddCustom(false)
    setCustomForm({ name: '', category: 'push', equipment: 'bodyweight', primaryMuscle: 'chest', description: '' })
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Exercise Library"
        subtitle={`${allExercises.length} exercises`}
        right={
          <GlowButton size="sm" variant="secondary" onClick={() => setShowAddCustom(true)}>
            + Custom
          </GlowButton>
        }
      />

      <div className="px-4 py-3">
        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search exercises or muscles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-sl-surface border border-sl-border rounded-xl px-4 py-2.5 text-sm font-mono text-sl-text placeholder:text-sl-muted outline-none focus:border-sl-purple transition-colors"
          />
        </div>

        {/* Category filters */}
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
        </div>

        {/* PRs section */}
        {Object.keys(state.personalRecords).length > 0 && search.length === 0 && catFilter === 'all' && (
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

        {/* Exercise list */}
        <div className="flex flex-col gap-2">
          {filtered.map((ex) => {
            const primaryMuscles = ex.muscles
              .filter((m) => m.type === 'primary')
              .map((m) => MUSCLE_GROUPS[m.muscleId as MuscleGroupId]?.shortName)
            const pr = state.personalRecords[ex.id]
            const isCustom = state.customExercises.some((c) => c.id === ex.id)

            return (
              <NeonCard key={ex.id} className="px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-display font-semibold">{ex.name}</span>
                      {isCustom && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-sl-blue/20 text-sl-blue font-mono">Custom</span>
                      )}
                    </div>
                    <div className="text-xs text-sl-muted font-mono mt-0.5 capitalize">
                      {ex.equipment} · {primaryMuscles.join(', ')}
                    </div>
                    {pr && (
                      <div className="text-xs font-mono text-sl-gold mt-0.5">
                        PR: {fromKg(pr.weightKg, state.weightUnit).toFixed(1)} {state.weightUnit} × {pr.reps}
                      </div>
                    )}
                  </div>
                  <button
                    className="text-xs font-mono text-sl-muted hover:text-sl-purple border border-sl-border hover:border-sl-purple/40 rounded-lg px-2 py-1 transition-colors flex-shrink-0"
                    onClick={() => {
                      const primaryMuscle = ex.muscles.find((m) => m.type === 'primary')
                      if (primaryMuscle) navigate(`/muscles/${primaryMuscle.muscleId}`)
                    }}
                  >
                    Muscles
                  </button>
                </div>
              </NeonCard>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center text-sl-muted font-mono text-sm py-8">No exercises found</div>
          )}
        </div>
      </div>

      {/* Add custom exercise modal */}
      {showAddCustom && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddCustom(false)} />
          <div className="relative z-10 w-full max-w-lg bg-sl-surface border-t border-sl-border rounded-t-2xl p-5">
            <h3 className="text-lg font-display font-bold mb-4">Add Custom Exercise</h3>

            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                placeholder="Exercise name"
                value={customForm.name}
                onChange={(e) => setCustomForm((f) => ({ ...f, name: e.target.value }))}
                className="bg-sl-bg border border-sl-border rounded-lg px-3 py-2 text-sm font-mono text-sl-text outline-none focus:border-sl-purple"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-sl-muted uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={customForm.category}
                    onChange={(e) => setCustomForm((f) => ({ ...f, category: e.target.value as ExerciseCategory }))}
                    className="w-full bg-sl-bg border border-sl-border rounded-lg px-3 py-2 text-sm font-mono text-sl-text outline-none focus:border-sl-purple"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-sl-muted uppercase tracking-wider block mb-1">Equipment</label>
                  <select
                    value={customForm.equipment}
                    onChange={(e) => setCustomForm((f) => ({ ...f, equipment: e.target.value as Equipment }))}
                    className="w-full bg-sl-bg border border-sl-border rounded-lg px-3 py-2 text-sm font-mono text-sl-text outline-none focus:border-sl-purple"
                  >
                    {(['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'band'] as const).map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-mono text-sl-muted uppercase tracking-wider block mb-1">Primary Muscle</label>
                <select
                  value={customForm.primaryMuscle}
                  onChange={(e) => setCustomForm((f) => ({ ...f, primaryMuscle: e.target.value as MuscleGroupId }))}
                  className="w-full bg-sl-bg border border-sl-border rounded-lg px-3 py-2 text-sm font-mono text-sl-text outline-none focus:border-sl-purple"
                >
                  {Object.values(MUSCLE_GROUPS).map((m) => (
                    <option key={m.id} value={m.id}>{m.displayName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <GlowButton className="flex-1" onClick={addCustomExercise} disabled={!customForm.name.trim()}>
                Add Exercise
              </GlowButton>
              <GlowButton variant="secondary" className="flex-1" onClick={() => setShowAddCustom(false)}>
                Cancel
              </GlowButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
