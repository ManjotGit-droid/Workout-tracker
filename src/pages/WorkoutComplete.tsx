import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore, useDispatch } from '../store/AppContext'
import { BodyDiagram } from '../components/svg/BodyDiagram'
import { XPBar } from '../components/progression/XPBar'
import { GlowButton } from '../components/ui/GlowButton'
import { NeonCard } from '../components/ui/NeonCard'
import { Confetti } from '../components/effects/Confetti'
import { useToast } from '../components/ui/Toast'
import { MUSCLE_GROUPS } from '../data/muscleGroups'

import { getRecommendations } from '../utils/recommendations'
import { getLevelColor } from '../data/levelConfig'
import type { MuscleGroupId } from '../types'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { x: -20, opacity: 0 },
  show: { x: 0, opacity: 1 },
}

export const WorkoutComplete = () => {
  const { state } = useAppStore()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { lastCompletedWorkout, profile, customExercises, personalRecords } = state

  useEffect(() => {
    if (!lastCompletedWorkout) navigate('/', { replace: true })
  }, [lastCompletedWorkout, navigate])

  // Detect new PRs set in this workout. The reducer only updates a PR when
  // the new weight is strictly greater, so `pr.date === workout.date` for an
  // exercise the user just lifted means "fresh PR".
  const newPrExerciseIds = useMemo(() => {
    if (!lastCompletedWorkout) return [] as string[]
    const out: string[] = []
    for (const we of lastCompletedWorkout.exercises) {
      const pr = personalRecords[we.exerciseId]
      if (pr && pr.date === lastCompletedWorkout.date) {
        // Verify a completed set in *this* workout matches the PR — guards
        // against the case where the PR was set in an earlier workout today.
        const hit = we.sets.some((s) => s.completed && (s.weight ?? 0) === pr.weightKg)
        if (hit) out.push(we.exerciseId)
      }
    }
    return out
  }, [lastCompletedWorkout, personalRecords])

  // One-shot PR toast on mount when at least one fresh PR landed.
  useEffect(() => {
    if (newPrExerciseIds.length > 0) {
      toast({
        message: newPrExerciseIds.length === 1
          ? 'New personal record!'
          : `${newPrExerciseIds.length} new personal records!`,
        variant: 'success',
        duration: 3500,
      })
    }
    // newPrExerciseIds is memo'd; toast is stable from its provider
  }, [newPrExerciseIds.length, toast, newPrExerciseIds])

  if (!lastCompletedWorkout) return null

  const allExercises = customExercises
  const workedMuscles = Object.keys(lastCompletedWorkout.xpGained) as MuscleGroupId[]

  const durationSec = lastCompletedWorkout.endTime
    ? Math.floor((lastCompletedWorkout.endTime - lastCompletedWorkout.startTime) / 1000)
    : 0
  const durationMin = Math.floor(durationSec / 60)

  const totalXP = Object.values(lastCompletedWorkout.xpGained).reduce((a, b) => a + (b ?? 0), 0)
  const totalSets = lastCompletedWorkout.exercises.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.completed).length,
    0,
  )

  // For each worked muscle, get 2 recommendations
  const recommendationGroups = workedMuscles.slice(0, 4).map((muscleId) => {
    const muscleState = profile.muscleGroups[muscleId]
    const recs = getRecommendations(muscleId, muscleState.level, allExercises, [], 3)
    return { muscleId, recs }
  })

  const goHome = () => {
    dispatch({ type: 'CLEAR_LAST_COMPLETED' })
    navigate('/')
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-sl-purple/20 to-sl-bg pt-8 pb-4 px-4 text-center">
        {newPrExerciseIds.length > 0 && <Confetti />}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div
            className="text-5xl font-display font-bold tracking-widest"
            style={{ textShadow: '0 0 30px #9333ea, 0 0 60px #9333ea40' }}
          >
            COMPLETE
          </div>
          <div className="text-sl-muted font-mono text-sm mt-1">Quest finished</div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-8 mt-4"
        >
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-sl-purple">{totalXP}</div>
            <div className="text-xs font-mono text-sl-muted uppercase tracking-wider">Total XP</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-sl-blue">{totalSets}</div>
            <div className="text-xs font-mono text-sl-muted uppercase tracking-wider">Sets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-sl-gold">{durationMin}</div>
            <div className="text-xs font-mono text-sl-muted uppercase tracking-wider">Minutes</div>
          </div>
        </motion.div>
      </div>

      {/* Body diagram with activated muscles */}
      <div className="px-4 mt-4">
        <NeonCard className="p-3" glow="purple">
          <div className="text-xs font-mono text-sl-muted text-center mb-2 uppercase tracking-widest">
            Muscles Targeted
          </div>
          <BodyDiagram
            activatedMuscleIds={workedMuscles}
            className="max-h-80"
          />
        </NeonCard>
      </div>

      {/* XP gains per muscle */}
      <div className="px-4 mt-4">
        <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-2">XP Gained</div>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-2"
        >
          {workedMuscles.map((muscleId, idx) => {
            const xp = lastCompletedWorkout.xpGained[muscleId] ?? 0
            const muscleState = profile.muscleGroups[muscleId]
            const meta = MUSCLE_GROUPS[muscleId]
            const { glow } = getLevelColor(muscleState.level)

            return (
              <motion.div key={muscleId} variants={item}>
                <NeonCard className="px-3 py-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-display font-semibold">{meta.displayName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-sl-muted">Lv.{muscleState.level}</span>
                      <motion.span
                        className="text-sm font-mono font-bold"
                        style={{ color: glow || '#9333ea' }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.08 }}
                      >
                        +{xp} XP
                      </motion.span>
                    </div>
                  </div>
                  <XPBar
                    xp={muscleState.xp}
                    xpToNext={muscleState.xpToNextLevel}
                    level={muscleState.level}
                    color={glow || '#9333ea'}
                    showLabel={false}
                    delay={0.4 + idx * 0.08}
                  />
                </NeonCard>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Recommendations */}
      {recommendationGroups.length > 0 && (
        <div className="px-4 mt-4">
          <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-2">
            Recommended Next
          </div>
          {recommendationGroups.map(({ muscleId, recs }) => (
            <div key={muscleId} className="mb-3">
              <div className="text-xs font-mono text-sl-purple mb-1.5">
                {MUSCLE_GROUPS[muscleId].displayName} (Lv.{profile.muscleGroups[muscleId].level})
              </div>
              <div className="flex flex-col gap-1.5">
                {recs.map((ex) => (
                  <NeonCard key={ex.id} className="px-3 py-2 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-display">{ex.name}</div>
                      <div className="text-xs text-sl-muted font-mono capitalize">{ex.equipment}</div>
                    </div>
                    <span className="text-xs font-mono text-sl-muted flex-shrink-0">
                      Lv.{ex.recommendedLevelRange[0]}–{ex.recommendedLevelRange[1]}
                    </span>
                  </NeonCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exercises done */}
      <div className="px-4 mt-4">
        <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-2">Exercises Done</div>
        <div className="flex flex-col gap-1.5">
          {lastCompletedWorkout.exercises.map((loggedEx) => {
            const ex = allExercises.find((e) => e.id === loggedEx.exerciseId)
            const completed = loggedEx.sets.filter((s) => s.completed)
            return (
              <NeonCard key={loggedEx.id} className="px-3 py-2 flex justify-between items-center">
                <span className="text-sm font-display">{ex?.name ?? loggedEx.exerciseId}</span>
                <span className="text-xs font-mono text-sl-muted">{completed.length} sets</span>
              </NeonCard>
            )
          })}
        </div>
      </div>

      <div className="px-4 mt-6">
        <GlowButton className="w-full py-4" onClick={goHome}>
          Back to Dashboard
        </GlowButton>
      </div>
    </div>
  )
}
