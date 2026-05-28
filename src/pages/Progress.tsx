import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/AppContext'
import { PageHeader } from '../components/layout/PageHeader'
import { NeonCard } from '../components/ui/NeonCard'
import { EmptyState } from '../components/ui/EmptyState'
import { LevelBadge } from '../components/progression/LevelBadge'
import { XPBar } from '../components/progression/XPBar'
import { MUSCLE_GROUPS, MUSCLE_GROUP_IDS } from '../data/muscleGroups'

import { getLevelColor } from '../data/levelConfig'
import { fromKg, formatDate } from '../utils/formatters'
import { RankBadge } from '../components/progression/RankBadge'
import { BodyTab } from '../components/body/BodyTab'
import { ChartsTab } from '../components/charts/ChartsTab'
import { WorkoutContextMenu } from '../components/workout/WorkoutContextMenu'
import { useLongPress } from '../hooks/useLongPress'
import { evaluateAchievements, TIER_STYLES } from '../utils/achievements'
import type { Exercise, WorkoutSession } from '../types'

type Tab = 'muscles' | 'records' | 'body' | 'charts' | 'history'

export const Progress = () => {
  const { state } = useAppStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('muscles')
  const [contextWorkout, setContextWorkout] = useState<WorkoutSession | null>(null)
  const [showAchievements, setShowAchievements] = useState(false)

  const allExercises = state.customExercises

  // Sort muscles by level desc
  const sortedMuscles = MUSCLE_GROUP_IDS
    .map((id) => state.profile.muscleGroups[id])
    .sort((a, b) => b.level - a.level)

  const achievements = evaluateAchievements(state)
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Progress"
        subtitle={`${state.profile.totalWorkouts} total workouts`}
        right={<RankBadge rank={state.profile.rank} size="sm" />}
      />

      {/* Tabs */}
      <div className="flex border-b border-sl-border overflow-x-auto hide-scrollbar">
        {(['muscles', 'records', 'history', 'body', 'charts'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 min-w-[68px] py-2.5 text-xs font-mono uppercase tracking-widest transition-colors border-b-2 ${
              tab === t
                ? 'text-sl-purple border-sl-purple'
                : 'text-sl-muted border-transparent hover:text-sl-text'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <WorkoutContextMenu workout={contextWorkout} onClose={() => setContextWorkout(null)} />

      <div className="px-4 py-3">
        {/* ── MUSCLES TAB ── */}
        {tab === 'muscles' && (
          <div>
            {/* Overall stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <NeonCard className="p-3 text-center" tint="cyan" glow="purple">
                <div className="text-2xl font-mono font-bold text-white">{state.profile.totalWorkouts}</div>
                <div className="text-xs font-mono text-text/80 uppercase tracking-wider mt-0.5">Total Workouts</div>
              </NeonCard>
              <NeonCard className="p-3 text-center" tint="violet" glow="blue">
                <div className="text-2xl font-mono font-bold text-white">{state.profile.totalSets}</div>
                <div className="text-xs font-mono text-text/80 uppercase tracking-wider mt-0.5">Total Sets</div>
              </NeonCard>
            </div>

            {/* Achievements — collapsible. Default closed so the grid
                doesn't dominate the page. Counter on the trigger keeps
                the unlock progress visible without expanding. */}
            <NeonCard className="p-0 mb-4 overflow-hidden">
              <button
                onClick={() => setShowAchievements((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                aria-expanded={showAchievements}
              >
                <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
                  Achievements
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-text-soft tabular-nums">
                    {unlockedCount} / {achievements.length}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`w-4 h-4 text-text-muted transition-transform ${showAchievements ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
              {showAchievements && (
                <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                  {achievements.map((a) => {
                    const style = TIER_STYLES[a.tier]
                    const pct = a.progress
                      ? Math.min(100, (a.progress.current / a.progress.target) * 100)
                      : a.unlocked ? 100 : 0
                    return (
                      <div
                        key={a.id}
                        className="rounded-xl p-3 border relative overflow-hidden"
                        style={{
                          borderColor: a.unlocked ? style.border : 'var(--border)',
                          background: 'var(--bg-elevated)',
                          opacity: a.unlocked ? 1 : 0.65,
                        }}
                      >
                        {a.unlocked && (
                          <div
                            aria-hidden="true"
                            className="absolute -top-4 -right-4 w-12 h-12 rounded-full opacity-25"
                            style={{ background: style.gradient }}
                          />
                        )}
                        <div className="relative">
                          <div
                            className="text-xs font-mono uppercase tracking-widest mb-1"
                            style={{ color: a.unlocked ? style.text : 'var(--text-muted)' }}
                          >
                            {a.unlocked ? 'Unlocked' : 'Locked'}
                          </div>
                          <div className="text-sm font-display font-bold text-text leading-tight">{a.title}</div>
                          <div className="text-[10px] font-mono text-text-muted leading-snug mt-0.5">
                            {a.description}
                          </div>
                          {a.progress && !a.unlocked && (
                            <div className="mt-2">
                              <div className="w-full h-1 bg-border/40 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${pct}%`, background: style.gradient }}
                                />
                              </div>
                              <div className="text-[9px] font-mono text-text-muted/70 mt-0.5 tabular-nums">
                                {a.progress.current} / {a.progress.target}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </NeonCard>

            {/* All muscles with XP bars */}
            <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-2">All Muscle Groups</div>
            <div className="flex flex-col gap-2">
              {sortedMuscles.map(({ id, level, xp, xpToNextLevel }, idx) => {
                const meta = MUSCLE_GROUPS[id]
                const { glow } = getLevelColor(level)
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <NeonCard
                      className="px-3 py-2.5 flex items-center gap-3"
                      onClick={() => navigate(`/muscles/${id}`)}
                    >
                      <LevelBadge level={level} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-display font-semibold">{meta.shortName}</div>
                        <div className="mt-1">
                          <XPBar
                            xp={xp}
                            xpToNext={xpToNextLevel}
                            level={level}
                            color={glow || undefined}
                            showLabel={false}
                          />
                        </div>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-sl-muted flex-shrink-0">
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </NeonCard>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── RECORDS TAB ── */}
        {tab === 'records' && (
          <div>
            {Object.keys(state.personalRecords).length === 0 ? (
              <div className="text-center text-sl-muted font-mono text-sm py-12">
                <div className="text-4xl mb-3">🏋️</div>
                Complete workouts to unlock personal records
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-1">Best Lifts</div>
                {Object.values(state.personalRecords)
                  .sort((a, b) => b.weightKg - a.weightKg)
                  .map((pr) => {
                    const ex = allExercises.find((e) => e.id === pr.exerciseId)
                    if (!ex) return null
                    return (
                      <NeonCard key={pr.exerciseId} className="p-3" glow="gold">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-display font-semibold">{ex.name}</div>
                            <div className="text-xs font-mono text-sl-muted capitalize mt-0.5">
                              {ex.equipment} · {formatDate(pr.date)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-mono font-bold text-sl-gold">
                              {fromKg(pr.weightKg, state.weightUnit).toFixed(1)}
                              <span className="text-xs text-sl-muted ml-1">{state.weightUnit}</span>
                            </div>
                            <div className="text-xs font-mono text-sl-muted">{pr.reps} reps</div>
                          </div>
                        </div>
                      </NeonCard>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === 'history' && (
          <div>
            {state.profile.workoutHistory.length === 0 ? (
              <NeonCard className="p-1">
                <EmptyState
                  glyph="history"
                  title="No workouts yet"
                  subtitle="Once you finish a session it'll appear here. Long-press a row to duplicate or delete it."
                />
              </NeonCard>
            ) : (
              <>
                <div className="text-[11px] font-mono text-text-muted/70 mb-2">
                  Long-press a workout to duplicate or delete it.
                </div>
                <div className="flex flex-col gap-2">
                  {state.profile.workoutHistory.map((w) => (
                    <HistoryRow
                      key={w.id}
                      workout={w}
                      customExercises={state.customExercises}
                      onLongPress={() => setContextWorkout(w)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── BODY TAB ── */}
        {tab === 'body' && <BodyTab />}

        {/* ── CHARTS TAB ── */}
        {tab === 'charts' && <ChartsTab />}
      </div>
    </div>
  )
}

// Module-scope row so long-press handlers stay bound to stable references.
interface HistoryRowProps {
  workout: WorkoutSession
  customExercises: Exercise[]
  onLongPress: () => void
}

const HistoryRow = ({ workout, customExercises, onLongPress }: HistoryRowProps) => {
  const press = useLongPress(onLongPress, undefined, { threshold: 520 })
  const setCount = workout.exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.completed).length, 0)
  const exerciseNames = workout.exercises
    .map((e) => customExercises.find((x) => x.id === e.exerciseId)?.name ?? e.exerciseId)
    .slice(0, 3)
  const durationMin = workout.endTime
    ? Math.max(0, Math.floor((workout.endTime - workout.startTime) / 60000))
    : null

  return (
    <NeonCard className="p-3">
      <div className="flex items-start justify-between gap-3" {...press} style={{ touchAction: 'pan-y' }}>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono text-text-muted">
            {formatDate(workout.date)}{durationMin !== null && ` · ${durationMin} min`}
          </div>
          <div className="text-sm font-display mt-0.5 truncate">
            {exerciseNames.join(' · ')}
            {workout.exercises.length > 3 && ` +${workout.exercises.length - 3}`}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm font-mono font-bold text-brand tabular-nums">{setCount}</div>
          <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider">sets</div>
        </div>
      </div>
    </NeonCard>
  )
}
