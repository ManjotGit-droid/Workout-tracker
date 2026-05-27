import type { AppState, MuscleGroupState, MuscleGroupId, WorkoutSession, LevelUpEvent, PersonalRecord } from '../types'
import type { AppAction } from './actions'
import { calculateRank } from '../utils/rankCalculator'
import { getXPThreshold } from '../data/levelConfig'

const applyXP = (
  muscleState: MuscleGroupState,
  xpGain: number,
): { updated: MuscleGroupState; levelUps: number } => {
  let { level, xp, xpToNextLevel } = muscleState
  let levelUps = 0
  xp += xpGain

  while (xp >= xpToNextLevel) {
    xp -= xpToNextLevel
    level++
    levelUps++
    xpToNextLevel = getXPThreshold(level)
  }

  return { updated: { ...muscleState, level, xp, xpToNextLevel }, levelUps }
}

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    // ── API-backed startup actions ──────────────────────────────────────────

    case 'LOAD_EXERCISES':
      return { ...state, customExercises: action.exercises }

    case 'LOAD_WORKOUTS': {
      const totalWorkouts = action.workouts.length
      const totalSets = action.workouts.reduce(
        (sum, w) => sum + w.exercises.reduce((s, e) => s + e.sets.filter((x) => x.completed).length, 0),
        0,
      )
      return {
        ...state,
        profile: {
          ...state.profile,
          workoutHistory: action.workouts,
          totalWorkouts,
          totalSets,
        },
      }
    }

    case 'LOAD_MUSCLE_XP': {
      const newProfile = { ...state.profile, muscleGroups: action.muscleGroups }
      newProfile.rank = calculateRank(newProfile)
      return { ...state, profile: newProfile }
    }

    case 'RESTORE_WORKOUT':
      return { ...state, activeWorkout: action.workout }

    // ── Workout CRUD (API-driven IDs) ───────────────────────────────────────

    case 'ADD_EXERCISE_WITH_ID': {
      if (!state.activeWorkout) return state
      return {
        ...state,
        activeWorkout: {
          ...state.activeWorkout,
          exercises: [
            ...state.activeWorkout.exercises,
            { id: action.loggedExerciseId, exerciseId: action.exerciseId, sets: [] },
          ],
        },
      }
    }

    case 'REMOVE_EXERCISE': {
      if (!state.activeWorkout) return state
      return {
        ...state,
        activeWorkout: {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.filter((e) => e.id !== action.loggedExerciseId),
        },
      }
    }

    case 'LOG_SET_WITH_ID': {
      if (!state.activeWorkout) return state
      return {
        ...state,
        activeWorkout: {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.map((e) =>
            e.id === action.loggedExerciseId ? { ...e, sets: [...e.sets, action.set] } : e,
          ),
        },
      }
    }

    case 'UPDATE_SET': {
      if (!state.activeWorkout) return state
      return {
        ...state,
        activeWorkout: {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.map((e) =>
            e.id === action.loggedExerciseId
              ? {
                  ...e,
                  sets: e.sets.map((s) =>
                    s.id === action.setId ? { ...s, ...action.patch } : s,
                  ),
                }
              : e,
          ),
        },
      }
    }

    case 'REMOVE_SET': {
      if (!state.activeWorkout) return state
      return {
        ...state,
        activeWorkout: {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.map((e) =>
            e.id === action.loggedExerciseId
              ? { ...e, sets: e.sets.filter((s) => s.id !== action.setId) }
              : e,
          ),
        },
      }
    }

    // ── Finish workout: server computed XP, we still do level-up animations ─

    case 'FINISH_WORKOUT_WITH_XP': {
      if (!state.activeWorkout) return state

      const xpGained = action.muscleXp ?? {}
      const newMuscleGroups = { ...state.profile.muscleGroups }
      const pendingLevelUps: LevelUpEvent[] = []

      for (const [muscleId, xp] of Object.entries(xpGained) as [MuscleGroupId, number][]) {
        const current = newMuscleGroups[muscleId]
        if (!current) continue
        const { updated, levelUps } = applyXP(current, xp)
        newMuscleGroups[muscleId] = updated
        if (levelUps > 0) pendingLevelUps.push({ muscleId, newLevel: updated.level })
      }

      // Update personal records for strength/bodyweight sets
      const newPRs = { ...state.personalRecords }
      for (const loggedEx of state.activeWorkout.exercises) {
        for (const set of loggedEx.sets.filter((s) => s.completed)) {
          if (!set.weight || !set.reps) continue
          const existing: PersonalRecord | undefined = newPRs[loggedEx.exerciseId]
          if (!existing || set.weight > existing.weightKg) {
            newPRs[loggedEx.exerciseId] = {
              exerciseId: loggedEx.exerciseId,
              weightKg: set.weight,
              reps: set.reps,
              date: state.activeWorkout!.date,
            }
          }
        }
      }

      const completedWorkout: WorkoutSession = {
        ...state.activeWorkout,
        endTime: Date.now(),
        completed: true,
        xpGained,
      }

      const newProfile = {
        ...state.profile,
        muscleGroups: newMuscleGroups,
        totalWorkouts: state.profile.totalWorkouts + 1,
        totalSets:
          state.profile.totalSets +
          state.activeWorkout.exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.completed).length, 0),
      }
      newProfile.rank = calculateRank(newProfile)

      if (newProfile.rank !== state.profile.rank) {
        pendingLevelUps.forEach((e) => { if (!e.newRank) e.newRank = newProfile.rank })
        if (pendingLevelUps.length === 0) {
          pendingLevelUps.push({ muscleId: 'chest', newLevel: 0, newRank: newProfile.rank })
        }
      }

      return {
        ...state,
        profile: {
          ...newProfile,
          // No in-memory cap. IDB holds the canonical store; the chart
          // helpers all bound their own windows (last N weeks, etc.) so
          // a large history never goes into a heavy render path.
          workoutHistory: [completedWorkout, ...newProfile.workoutHistory],
        },
        activeWorkout: null,
        lastCompletedWorkout: completedWorkout,
        pendingLevelUps,
        personalRecords: newPRs,
      }
    }

    case 'DISCARD_WORKOUT':
      return { ...state, activeWorkout: null }

    case 'DELETE_WORKOUT_FROM_HISTORY': {
      const target = state.profile.workoutHistory.find((w) => w.id === action.workoutId)
      if (!target) return state
      const removedSets = target.exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.completed).length, 0)
      return {
        ...state,
        profile: {
          ...state.profile,
          workoutHistory: state.profile.workoutHistory.filter((w) => w.id !== action.workoutId),
          totalWorkouts: Math.max(0, state.profile.totalWorkouts - 1),
          totalSets: Math.max(0, state.profile.totalSets - removedSets),
        },
      }
    }

    case 'PAUSE_WORKOUT': {
      if (!state.activeWorkout) return state
      return {
        ...state,
        activeWorkout: { ...state.activeWorkout, pausedAt: action.pausedAt },
      }
    }

    case 'RESUME_WORKOUT': {
      if (!state.activeWorkout) return state
      return {
        ...state,
        activeWorkout: {
          ...state.activeWorkout,
          pausedAt: null,
          pausedDuration: action.pausedDuration,
        },
      }
    }

    case 'DISMISS_LEVEL_UP':
      return {
        ...state,
        pendingLevelUps: state.pendingLevelUps.filter((e) => e.muscleId !== action.muscleId),
      }

    case 'SET_WEIGHT_UNIT':
      return { ...state, weightUnit: action.unit }

    case 'LOAD_BODY_ENTRIES':
      return { ...state, bodyLog: action.entries }

    case 'ADD_BODY_ENTRY':
      return {
        ...state,
        bodyLog: [action.entry, ...state.bodyLog]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 500),
      }

    case 'UPDATE_BODY_ENTRY':
      return {
        ...state,
        bodyLog: state.bodyLog
          .map((e) => (e.id === action.entry.id ? action.entry : e))
          .sort((a, b) => b.date.localeCompare(a.date)),
      }

    case 'DELETE_BODY_ENTRY':
      return {
        ...state,
        bodyLog: state.bodyLog.filter((e) => e.id !== action.id),
      }

    case 'ADD_CUSTOM_EXERCISE':
      return {
        ...state,
        customExercises: [...state.customExercises, action.exercise].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      }

    case 'UPDATE_EXERCISE':
      return {
        ...state,
        customExercises: state.customExercises
          .map((ex) => (ex.id === action.exercise.id ? action.exercise : ex))
          .sort((a, b) => a.name.localeCompare(b.name)),
      }

    case 'REMOVE_EXERCISE_LIBRARY':
      return {
        ...state,
        customExercises: state.customExercises.filter((ex) => ex.id !== action.exerciseId),
      }

    case 'CLEAR_LAST_COMPLETED':
      return { ...state, lastCompletedWorkout: null }

    case 'LOAD_TEMPLATES':
      return { ...state, workoutTemplates: action.templates }

    case 'SAVE_TEMPLATE':
      return {
        ...state,
        workoutTemplates: [action.template, ...state.workoutTemplates.filter((t) => t.id !== action.template.id)],
      }

    case 'DELETE_TEMPLATE':
      return {
        ...state,
        workoutTemplates: state.workoutTemplates.filter((t) => t.id !== action.templateId),
      }

    default:
      return state
  }
}
