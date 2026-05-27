import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/AppContext'
import { PageHeader } from '../components/layout/PageHeader'
import { XPBar } from '../components/progression/XPBar'
import { LevelBadge } from '../components/progression/LevelBadge'
import { NeonCard } from '../components/ui/NeonCard'
import { GlowButton } from '../components/ui/GlowButton'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { MUSCLE_GROUPS } from '../data/muscleGroups'

import { getRecommendations } from '../utils/recommendations'
import { getLevelColor } from '../data/levelConfig'
import { formatDate, fromKg } from '../utils/formatters'
import type { MuscleGroupId } from '../types'

export const MuscleDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state, ready } = useAppStore()
  const muscleId = id as MuscleGroupId

  // Skeleton while IDB hydrates so the page doesn't flash "not found" before
  // the muscleGroups map is populated.
  if (!ready) {
    return (
      <div className="min-h-screen">
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <Skeleton className="w-7 h-7" rounded />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="px-4 py-3 flex flex-col gap-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  const meta = MUSCLE_GROUPS[muscleId]
  const muscleState = state.profile.muscleGroups[muscleId]

  if (!meta || !muscleState) {
    return (
      <div className="p-4 text-center text-sl-muted">
        <p>Muscle group not found.</p>
        <GlowButton className="mt-4" onClick={() => navigate('/')}>Back</GlowButton>
      </div>
    )
  }

  const allExercises = state.customExercises
  const { glow } = getLevelColor(muscleState.level)

  // Recent workouts that hit this muscle
  const recentSessions = state.profile.workoutHistory
    .filter((w) => w.xpGained[muscleId] !== undefined)
    .slice(0, 8)

  // Recommendations
  const recs = getRecommendations(muscleId, muscleState.level, allExercises, [], 6)

  // Personal record for exercises targeting this muscle
  const muscleExercises = allExercises.filter((e) =>
    e.muscles.some((m) => m.muscleId === muscleId && m.type === 'primary'),
  )
  const prsForMuscle = muscleExercises
    .map((ex) => ({ ex, pr: state.personalRecords[ex.id] }))
    .filter((x) => x.pr)
    .sort((a, b) => (b.pr?.weightKg ?? 0) - (a.pr?.weightKg ?? 0))

  return (
    <div className="min-h-screen">
      <PageHeader
        title={meta.displayName}
        subtitle={meta.shortName}
        back
      />

      {/* Level hero */}
      <div
        className="mx-4 mt-4 p-5 rounded-2xl border flex items-center gap-4"
        style={{
          borderColor: glow || '#4a1a7a',
          background: `linear-gradient(135deg, ${glow}15 0%, transparent 70%)`,
          boxShadow: glow ? `0 0 20px ${glow}30` : 'none',
        }}
      >
        <LevelBadge level={muscleState.level} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="text-xl font-display font-bold">{meta.displayName}</div>
          <div className="text-xs font-mono text-sl-muted capitalize mt-0.5">{meta.view} view</div>
          <div className="mt-2">
            <XPBar
              xp={muscleState.xp}
              xpToNext={muscleState.xpToNextLevel}
              level={muscleState.level}
              color={glow || '#9333ea'}
              delay={0.2}
            />
          </div>
        </div>
      </div>

      {/* PRs */}
      {prsForMuscle.length > 0 && (
        <div className="px-4 mt-4">
          <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-2">Personal Records</div>
          <div className="flex flex-col gap-2">
            {prsForMuscle.slice(0, 3).map(({ ex, pr }) => (
              <NeonCard key={ex.id} className="px-3 py-2 flex items-center justify-between" tint="indigo">
                <div>
                  <div className="text-sm font-display font-semibold">{ex.name}</div>
                  <div className="text-xs font-mono text-sl-muted">{formatDate(pr!.date)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-sl-gold">
                    {fromKg(pr!.weightKg, state.weightUnit).toFixed(1)} {state.weightUnit}
                  </div>
                  <div className="text-xs font-mono text-sl-muted">{pr!.reps} reps</div>
                </div>
              </NeonCard>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="px-4 mt-4">
        <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-2">
          Recommended Exercises (Level {muscleState.level})
        </div>
        <div className="flex flex-col gap-2">
          {recs.map((ex, idx) => {
            const isPrimary = ex.muscles.some((m) => m.muscleId === muscleId && m.type === 'primary')
            return (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <NeonCard className="px-3 py-2.5 flex items-start justify-between gap-2" tint="amber">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-display font-semibold">{ex.name}</span>
                      {isPrimary && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-sl-purple/20 text-sl-purple font-mono">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-sl-muted font-mono mt-0.5 capitalize">
                      {ex.equipment} · {ex.category}
                    </div>
                    <div className="text-xs text-sl-muted mt-0.5">{ex.description}</div>
                  </div>
                  <div className="text-xs font-mono text-sl-muted flex-shrink-0 text-right">
                    <div>Lv.{ex.recommendedLevelRange[0]}–{ex.recommendedLevelRange[1]}</div>
                  </div>
                </NeonCard>
              </motion.div>
            )
          })}
          {recs.length === 0 && (
            <div className="text-center text-sl-muted font-mono text-sm py-4">
              Max level — no further recommendations
            </div>
          )}
        </div>
      </div>

      {/* Recent sessions */}
      <div className="px-4 mt-4 mb-4">
        <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-2">Recent Sessions</div>
        {recentSessions.length === 0 ? (
          <NeonCard className="p-1">
            <EmptyState
              glyph="muscle"
              title={`No ${meta.shortName.toLowerCase()} work logged yet`}
              subtitle="Log a workout that targets this muscle and recent sessions will appear here."
            />
          </NeonCard>
        ) : (
          <div className="flex flex-col gap-1.5">
            {recentSessions.map((w) => {
              const xp = w.xpGained[muscleId] ?? 0
              return (
                <NeonCard key={w.id} className="px-3 py-2 flex items-center justify-between" tint="cyan">
                  <span className="text-xs font-mono text-sl-muted">{formatDate(w.date)}</span>
                  <span className="text-xs font-mono" style={{ color: glow || '#9333ea' }}>
                    +{xp} XP
                  </span>
                </NeonCard>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
