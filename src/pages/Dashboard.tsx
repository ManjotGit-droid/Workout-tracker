import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/AppContext'
import { BodyDiagram } from '../components/svg/BodyDiagram'
import { RankBadge } from '../components/progression/RankBadge'
import { NeonCard } from '../components/ui/NeonCard'
import { GlowButton } from '../components/ui/GlowButton'
import { RANK_COLORS } from '../data/levelConfig'
import { MUSCLE_GROUPS } from '../data/muscleGroups'
import { formatDate } from '../utils/formatters'
import type { MuscleGroupId } from '../types'
import { EXERCISES } from '../data/exercises'

export function Dashboard() {
  const { state } = useAppStore()
  const navigate = useNavigate()
  const { profile, activeWorkout } = state

  const recentWorkouts = profile.workoutHistory.slice(0, 3)
  const rankColors = RANK_COLORS[profile.rank]

  // Top 5 muscle groups by level for the sidebar
  const topMuscles = Object.values(profile.muscleGroups)
    .sort((a, b) => b.level - a.level)
    .slice(0, 5)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-1">Hunter Status</div>
          <h1 className="text-2xl font-display font-bold text-sl-text">Solo Gym Tracker</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-1">
            <div className="text-xs font-mono text-sl-muted">{profile.totalWorkouts} workouts</div>
            <div className="text-xs font-mono" style={{ color: rankColors.text }}>
              Rank {profile.rank}
            </div>
          </div>
          <RankBadge rank={profile.rank} size="lg" />
        </div>
      </div>

      {/* Active workout banner */}
      {activeWorkout && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mx-4 mb-3 p-3 rounded-lg border border-sl-purple/60 bg-sl-purple/10 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sl-purple animate-pulse" />
            <span className="text-sm font-display font-semibold text-sl-purple">Workout in progress</span>
          </div>
          <GlowButton size="sm" onClick={() => navigate('/workout')}>Resume</GlowButton>
        </motion.div>
      )}

      {/* Body Diagram */}
      <div className="px-4 mb-4">
        <NeonCard className="p-3" glow="purple">
          <div className="text-xs font-mono text-sl-muted text-center mb-2 uppercase tracking-widest">
            Tap a muscle to see details
          </div>
          <BodyDiagram
            interactive
            onMuscleClick={(id) => navigate(`/muscles/${id}`)}
            className="max-h-96"
          />
        </NeonCard>
      </div>

      {/* Stats row */}
      <div className="px-4 mb-4 grid grid-cols-3 gap-3">
        <NeonCard className="p-3 text-center">
          <div className="text-xl font-mono font-bold text-sl-purple">{profile.totalWorkouts}</div>
          <div className="text-xs font-mono text-sl-muted uppercase tracking-wider mt-0.5">Workouts</div>
        </NeonCard>
        <NeonCard className="p-3 text-center">
          <div className="text-xl font-mono font-bold text-sl-blue">{profile.totalSets}</div>
          <div className="text-xs font-mono text-sl-muted uppercase tracking-wider mt-0.5">Sets</div>
        </NeonCard>
        <NeonCard className="p-3 text-center" onClick={() => navigate('/muscles/' + topMuscles[0]?.id)}>
          <div className="text-xl font-mono font-bold text-sl-gold">
            {Math.max(...Object.values(profile.muscleGroups).map((m) => m.level))}
          </div>
          <div className="text-xs font-mono text-sl-muted uppercase tracking-wider mt-0.5">Top Level</div>
        </NeonCard>
      </div>

      {/* Start workout CTA */}
      {!activeWorkout && (
        <div className="px-4 mb-4">
          <GlowButton
            className="w-full py-4 text-lg"
            onClick={() => navigate('/workout')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M6 6h2M16 6h2M8 6v3a4 4 0 0 0 8 0V6M4 9h2M18 9h2M4 9v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Start Workout
          </GlowButton>
        </div>
      )}

      {/* Top muscles */}
      <div className="px-4 mb-4">
        <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-2">Strongest Muscles</div>
        <div className="flex flex-col gap-2">
          {topMuscles.map((muscle) => {
            const meta = MUSCLE_GROUPS[muscle.id]
            const pct = Math.min(100, (muscle.xp / muscle.xpToNextLevel) * 100)
            return (
              <NeonCard
                key={muscle.id}
                className="p-3 flex items-center gap-3"
                onClick={() => navigate(`/muscles/${muscle.id}`)}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-mono font-bold text-white flex-shrink-0"
                  style={{
                    background: `radial-gradient(circle, ${getLevelFill(muscle.level)}, #0f0f1a)`,
                    boxShadow: muscle.level > 4 ? `0 0 8px ${getLevelGlow(muscle.level)}` : 'none',
                  }}
                >
                  {muscle.level}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-display font-semibold">{meta.shortName}</div>
                  <div className="w-full h-1.5 bg-sl-border rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: getLevelGlow(muscle.level) || '#4a1a7a' }}
                    />
                  </div>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-sl-muted flex-shrink-0">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </NeonCard>
            )
          })}
        </div>
      </div>

      {/* Recent workouts */}
      {recentWorkouts.length > 0 && (
        <div className="px-4 mb-6">
          <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-2">Recent Sessions</div>
          <div className="flex flex-col gap-2">
            {recentWorkouts.map((w) => {
              const workedMuscles = Object.keys(w.xpGained) as MuscleGroupId[]
              const exerciseNames = w.exercises
                .map((e) => {
                  const ex = EXERCISES.find((x) => x.id === e.exerciseId) ??
                    state.customExercises.find((x) => x.id === e.exerciseId)
                  return ex?.name ?? e.exerciseId
                })
                .slice(0, 3)

              return (
                <NeonCard key={w.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-sl-muted">{formatDate(w.date)}</div>
                      <div className="text-sm font-display mt-0.5 truncate">
                        {exerciseNames.join(' · ')}
                        {w.exercises.length > 3 && ` +${w.exercises.length - 3}`}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end max-w-[120px]">
                      {workedMuscles.slice(0, 4).map((mId) => (
                        <span
                          key={mId}
                          className="text-xs px-1.5 py-0.5 rounded font-mono"
                          style={{ backgroundColor: `${getLevelFill(profile.muscleGroups[mId]?.level ?? 1)}80`, color: getLevelGlow(profile.muscleGroups[mId]?.level ?? 1) || '#9333ea' }}
                        >
                          {MUSCLE_GROUPS[mId]?.shortName}
                        </span>
                      ))}
                    </div>
                  </div>
                </NeonCard>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function getLevelFill(level: number): string {
  if (level < 3)  return '#2d1a3d'
  if (level < 5)  return '#4a1a7a'
  if (level < 10) return '#6b21a8'
  if (level < 15) return '#7c3aed'
  if (level < 20) return '#4f46e5'
  if (level < 30) return '#3b82f6'
  if (level < 50) return '#0ea5e9'
  if (level < 75) return '#eab308'
  return '#f59e0b'
}

function getLevelGlow(level: number): string {
  if (level < 3)  return '#4a1060'
  if (level < 5)  return '#6a2090'
  if (level < 10) return '#9333ea'
  if (level < 15) return '#a855f7'
  if (level < 20) return '#818cf8'
  if (level < 30) return '#60a5fa'
  if (level < 50) return '#38bdf8'
  if (level < 75) return '#facc15'
  return '#fde68a'
}
