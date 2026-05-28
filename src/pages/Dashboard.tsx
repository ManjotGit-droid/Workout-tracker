import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/AppContext'
import { BodyDiagram } from '../components/svg/BodyDiagram'
import { RankBadge } from '../components/progression/RankBadge'
import { NeonCard } from '../components/ui/NeonCard'
import { GlowButton } from '../components/ui/GlowButton'
import { EmptyState } from '../components/ui/EmptyState'
import { AnimatedNumber } from '../components/ui/AnimatedNumber'
import { Skeleton } from '../components/ui/Skeleton'
import { LevelRing } from '../components/progression/LevelRing'
import { RANK_COLORS, getLevelColor } from '../data/levelConfig'
import { MUSCLE_GROUPS } from '../data/muscleGroups'
import { formatDate } from '../utils/formatters'
import { computeStreak, isStreakAtRisk } from '../utils/streak'
import { computeMuscleRecency, recencyFill } from '../utils/muscleRecency'
import { useLongPress } from '../hooks/useLongPress'
import { WorkoutContextMenu } from '../components/workout/WorkoutContextMenu'
import type { Exercise, MuscleGroupId, MuscleGroupState, WorkoutSession } from '../types'

// Stagger variants reused for the top-muscles and recent-sessions lists.
const listContainer = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
}
const listItem = {
  hidden: { y: 6, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.25, ease: 'easeOut' as const } },
}

const greetingFor = (hour: number): string => {
  if (hour < 5)  return 'Late night, Hunter'
  if (hour < 12) return 'Good morning, Hunter'
  if (hour < 17) return 'Good afternoon, Hunter'
  if (hour < 21) return 'Good evening, Hunter'
  return 'Good night, Hunter'
}

// Hue overlay tint per time-of-day. Kept very subtle (alpha < 0.05) so it
// reads as ambience rather than chrome.
const timeOfDayTint = (hour: number): string => {
  if (hour < 5)  return 'radial-gradient(circle at 0% 0%, rgba(120, 80, 200, 0.05), transparent 55%)'
  if (hour < 12) return 'radial-gradient(circle at 0% 0%, rgba(255, 200, 120, 0.05), transparent 55%)'
  if (hour < 17) return 'radial-gradient(circle at 0% 0%, rgba(120, 220, 255, 0.04), transparent 55%)'
  if (hour < 21) return 'radial-gradient(circle at 0% 0%, rgba(255, 160, 80, 0.05), transparent 55%)'
  return 'radial-gradient(circle at 0% 0%, rgba(60, 100, 200, 0.05), transparent 55%)'
}

export const Dashboard = () => {
  const { state, ready } = useAppStore()
  const navigate = useNavigate()
  const { profile, activeWorkout, customExercises } = state

  const recentWorkouts = profile.workoutHistory.slice(0, 3)
  const rankColors = RANK_COLORS[profile.rank]

  // Top 5 muscle groups by level for the sidebar
  const topMuscles = Object.values(profile.muscleGroups)
    .sort((a, b) => b.level - a.level)
    .slice(0, 5)

  const topLevel = Math.max(...Object.values(profile.muscleGroups).map((m) => m.level))
  const streak = computeStreak(profile.workoutHistory)
  const streakAtRisk = isStreakAtRisk(profile.workoutHistory)

  const hour = new Date().getHours()
  const greeting = greetingFor(hour)

  // Long-press context menu on Recent Sessions (B10)
  const [contextWorkout, setContextWorkout] = useState<WorkoutSession | null>(null)

  // Body-diagram color mode (A6) — toggle between level-based default and a
  // recency-tint that surfaces "what's getting neglected" at a glance.
  const [diagramMode, setDiagramMode] = useState<'level' | 'recency'>('level')
  const recencyMap = useMemo(
    () => computeMuscleRecency(profile.workoutHistory, customExercises),
    [profile.workoutHistory, customExercises],
  )
  const recencyFillMap = useMemo<Partial<Record<MuscleGroupId, string>>>(
    () => Object.fromEntries(
      (Object.keys(recencyMap) as MuscleGroupId[]).map((k) => [k, recencyFill(recencyMap[k])]),
    ),
    [recencyMap],
  )

  if (!ready) return <DashboardSkeleton />

  return (
    <div className="min-h-screen relative">
      {/* Time-of-day ambient tint (A2) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: timeOfDayTint(hour) }}
      />

      {/* Header */}
      <div className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-1 truncate">{greeting}</div>
          <h1 className="text-2xl font-display font-bold text-sl-text">Solo Gym Tracker</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/settings')}
            aria-label="Open settings"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-elevated transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="text-right mr-1">
            <div className="text-xs font-mono text-sl-muted tabular-nums">{profile.totalWorkouts} workouts</div>
            <div className="text-xs font-mono" style={{ color: rankColors.text }}>
              Rank {profile.rank}
            </div>
          </div>
          <RankBadge rank={profile.rank} size="lg" />
        </div>
      </div>

      {/* Streak pill (C7) — shown when streak > 0 */}
      {streak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 mb-3"
        >
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-full border w-fit ${
              streakAtRisk
                ? 'border-gold/50 bg-gold/10 text-gold'
                : 'border-brand/40 bg-brand/10 text-brand'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 2c-1 4-4 5-4 9a4 4 0 0 0 8 0c0-2-1-3-2-4 0 1-1 2-2 2 0-2 1-4 0-7z" opacity="0.85" />
              <path d="M9 14c0 2 1 4 3 4s3-2 3-4-1-3-2-3c0 1-1 2-2 2 0-1 0-2-1-2-1 1-1 2-1 3z" fill="white" opacity="0.35" />
            </svg>
            <span className="text-xs font-mono font-semibold tabular-nums">
              {streak}-day streak
            </span>
            {streakAtRisk && (
              <span className="text-[10px] font-mono opacity-80 ml-1">· train today to keep it</span>
            )}
          </div>
        </motion.div>
      )}

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
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="text-xs font-mono text-sl-muted uppercase tracking-widest flex-1">
              {diagramMode === 'level' ? 'Tap a muscle to see details' : 'Warm = recent · Cool = neglected'}
            </div>
            <div className="flex border border-border rounded-full text-[10px] font-mono overflow-hidden">
              {(['level', 'recency'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setDiagramMode(m)}
                  className={`px-2.5 py-0.5 transition-colors ${
                    diagramMode === m ? 'bg-accent text-accent-ink' : 'text-text-muted hover:text-text'
                  }`}
                  aria-pressed={diagramMode === m}
                >
                  {m === 'level' ? 'Level' : 'Recency'}
                </button>
              ))}
            </div>
          </div>
          <BodyDiagram
            interactive
            onMuscleClick={(id) => navigate(`/muscles/${id}`)}
            className="max-h-96"
            fillOverride={diagramMode === 'recency' ? recencyFillMap : undefined}
          />
        </NeonCard>
      </div>

      {/* Stats — bento layout: Workouts on top (hero), Sets + Top Level below.
          Each card carries its own tinted gradient so the three sections
          read as distinct partitions (Dribbble-style colored cards). */}
      <div className="px-4 mb-4 grid grid-cols-2 gap-3">
        <NeonCard className="col-span-2 p-4 flex items-center justify-between" tint="cyan" glow="purple">
          <div>
            <div className="text-xs font-mono text-text/80 uppercase tracking-wider mb-1">Workouts</div>
            <div className="text-3xl text-white hero-number">
              <AnimatedNumber value={profile.totalWorkouts} />
            </div>
            <div className="text-[11px] font-mono text-text/70 mt-0.5">
              {profile.workoutHistory.length > 0 ? `Last: ${formatDate(profile.workoutHistory[0].date)}` : 'No sessions yet'}
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10 text-white/80">
            <path d="M4 9v6M7 6v12M17 6v12M20 9v6M7 12h10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </NeonCard>
        <NeonCard className="p-3 text-center" tint="violet">
          <div className="text-2xl text-white hero-number">
            <AnimatedNumber value={profile.totalSets} />
          </div>
          <div className="text-xs font-mono text-text/80 uppercase tracking-wider mt-0.5">Sets</div>
        </NeonCard>
        <NeonCard
          className="p-3 flex flex-col items-center justify-center"
          tint="amber"
          onClick={() => topMuscles[0] && navigate('/muscles/' + topMuscles[0].id)}
        >
          {topMuscles[0] ? (
            <LevelRing
              level={topMuscles[0].level}
              pct={topMuscles[0].xp / topMuscles[0].xpToNextLevel}
              color={getLevelColor(topMuscles[0].level).glow || 'var(--brand)'}
              size={56}
            />
          ) : (
            <div className="text-2xl text-white hero-number">
              <AnimatedNumber value={topLevel} />
            </div>
          )}
          <div className="text-xs font-mono text-text/80 uppercase tracking-wider mt-1">Top Level</div>
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
              <path d="M4 9v6M7 6v12M17 6v12M20 9v6M7 12h10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Start Workout
          </GlowButton>
        </div>
      )}

      {/* Top muscles */}
      <div className="px-4 mb-4">
        <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-2">Strongest Muscles</div>
        <motion.div
          className="flex flex-col gap-2"
          variants={listContainer}
          initial="hidden"
          animate="show"
        >
          {topMuscles.map((muscle) => {
            const meta = MUSCLE_GROUPS[muscle.id]
            const pct = Math.min(100, (muscle.xp / muscle.xpToNextLevel) * 100)
            const { fill, glow } = getLevelColor(muscle.level)
            return (
              <motion.div key={muscle.id} variants={listItem}>
              <NeonCard
                className="p-3 flex items-center gap-3"
                onClick={() => navigate(`/muscles/${muscle.id}`)}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-mono font-bold flex-shrink-0"
                  style={{
                    background: `radial-gradient(circle, ${fill}, var(--bg-sunken))`,
                    color: muscle.level > 4 ? 'var(--accent-ink)' : 'var(--text)',
                    boxShadow: muscle.level > 4 ? `0 0 8px ${glow}` : 'none',
                  }}
                >
                  {muscle.level}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-display font-semibold">{meta.shortName}</div>
                  <div className="w-full h-1.5 bg-sunken rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: glow || 'var(--accent)' }}
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
        </motion.div>
      </div>

      {/* Long-press context menu (B10) */}
      <WorkoutContextMenu workout={contextWorkout} onClose={() => setContextWorkout(null)} />

      {/* Recent workouts */}
      <div className="px-4 mb-6">
        <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-2">Recent Sessions</div>
        {recentWorkouts.length === 0 ? (
          <NeonCard className="p-1">
            <EmptyState
              glyph="history"
              title="No sessions yet"
              subtitle="Once you log a workout it'll show up here so you can scroll your last few at a glance."
              action={
                !activeWorkout && (
                  <GlowButton size="sm" onClick={() => navigate('/workout')}>
                    Log your first workout
                  </GlowButton>
                )
              }
            />
          </NeonCard>
        ) : (
          <motion.div
            className="flex flex-col gap-2"
            variants={listContainer}
            initial="hidden"
            animate="show"
          >
            {recentWorkouts.map((w) => (
              <RecentWorkoutCard
                key={w.id}
                workout={w}
                customExercises={state.customExercises}
                muscleGroups={profile.muscleGroups}
                variants={listItem}
                onLongPress={() => setContextWorkout(w)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Initial-hydration placeholder. Mirrors the post-load layout so the page
// shape doesn't jump when real data arrives.
const DashboardSkeleton = () => (
  <div className="min-h-screen">
    <div className="px-4 pt-6 pb-3 flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-44" />
      </div>
      <Skeleton className="w-14 h-14" rounded />
    </div>
    <div className="px-4 mb-4">
      <Skeleton className="h-72 w-full" />
    </div>
    <div className="px-4 mb-4 grid grid-cols-2 gap-3">
      <Skeleton className="col-span-2 h-24" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </div>
    <div className="px-4">
      <Skeleton className="h-12 w-full mb-2" />
      <Skeleton className="h-12 w-full mb-2" />
      <Skeleton className="h-12 w-full" />
    </div>
  </div>
)

// Module-scope card so the inputs / refs stay stable across re-renders and
// long-press handlers don't end up bound to a freshly-recreated closure on
// every tick.
interface RecentCardProps {
  workout: WorkoutSession
  customExercises: Exercise[]
  muscleGroups: Record<MuscleGroupId, MuscleGroupState>
  variants: typeof listItem
  onLongPress: () => void
}

const RecentWorkoutCard = ({ workout, customExercises, muscleGroups, variants, onLongPress }: RecentCardProps) => {
  const press = useLongPress(onLongPress, undefined, { threshold: 520 })
  const workedMuscles = Object.keys(workout.xpGained) as MuscleGroupId[]
  const exerciseNames = workout.exercises
    .map((e) => {
      const ex = customExercises.find((x) => x.id === e.exerciseId)
      return ex?.name ?? e.exerciseId
    })
    .slice(0, 3)

  return (
    <motion.div variants={variants}>
      <NeonCard className="p-3" >
        <div className="flex items-start justify-between gap-2" {...press}>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono text-sl-muted">{formatDate(workout.date)}</div>
            <div className="text-sm font-display mt-0.5 truncate">
              {exerciseNames.join(' · ')}
              {workout.exercises.length > 3 && ` +${workout.exercises.length - 3}`}
            </div>
          </div>
          <div className="flex gap-1 flex-wrap justify-end max-w-[120px]">
            {workedMuscles.slice(0, 4).map((mId) => {
              const { fill, glow } = getLevelColor(muscleGroups[mId]?.level ?? 1)
              return (
                <span
                  key={mId}
                  className="text-xs px-1.5 py-0.5 rounded font-mono"
                  style={{ backgroundColor: `${fill}80`, color: glow || 'var(--accent)' }}
                >
                  {MUSCLE_GROUPS[mId]?.shortName}
                </span>
              )
            })}
          </div>
        </div>
      </NeonCard>
    </motion.div>
  )
}

