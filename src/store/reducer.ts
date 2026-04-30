import type { AppState, MuscleGroupState, MuscleGroupId, WorkoutSession, LevelUpEvent, PersonalRecord } from '../types'
import type { AppAction } from './actions'
import { calculateWorkoutXP } from '../utils/xpCalculator'
import { calculateRank } from '../utils/rankCalculator'
import { getXPThreshold } from '../data/levelConfig'
import { EXERCISES } from '../data/exercises'

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function applyXP(
  muscleState: MuscleGroupState,
  xpGain: number,
): { updated: MuscleGroupState; levelUps: number } {
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

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'START_WORKOUT': {
      if (state.activeWorkout) return state
      const workout: WorkoutSession = {
        id: uid(),
        date: new Date().toISOString().slice(0, 10),
        startTime: Date.now(),
        exercises: [],
        completed: false,
        xpGained: {},
      }
      return { ...state, activeWorkout: workout }
    }

    case 'ADD_EXERCISE': {
      if (!state.activeWorkout) return state
      const updated: WorkoutSession = {
        ...state.activeWorkout,
        exercises: [
          ...state.activeWorkout.exercises,
          { id: uid(), exerciseId: action.exerciseId, sets: [] },
        ],
      }
      return { ...state, activeWorkout: updated }
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

    case 'LOG_SET': {
      if (!state.activeWorkout) return state
      const newSet = {
        id: uid(),
        ...action.set,
        timestamp: Date.now(),
      }
      return {
        ...state,
        activeWorkout: {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.map((e) =>
            e.id === action.loggedExerciseId ? { ...e, sets: [...e.sets, newSet] } : e,
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

    case 'FINISH_WORKOUT': {
      if (!state.activeWorkout) return state

      const allExercises = [...EXERCISES, ...state.customExercises]
      const xpGained = calculateWorkoutXP(state.activeWorkout.exercises, allExercises)

      // Update muscle groups + collect level-up events
      const newMuscleGroups = { ...state.profile.muscleGroups }
      const pendingLevelUps: LevelUpEvent[] = []

      for (const [muscleId, xp] of Object.entries(xpGained) as [MuscleGroupId, number][]) {
        const current = newMuscleGroups[muscleId]
        const { updated, levelUps } = applyXP(current, xp)
        newMuscleGroups[muscleId] = updated
        if (levelUps > 0) {
          pendingLevelUps.push({ muscleId, newLevel: updated.level })
        }
      }

      // Update personal records
      const newPRs = { ...state.personalRecords }
      for (const loggedEx of state.activeWorkout.exercises) {
        for (const set of loggedEx.sets.filter((s) => s.completed)) {
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

      // Check if rank changed
      if (newProfile.rank !== state.profile.rank) {
        pendingLevelUps.forEach((e) => {
          if (!e.newRank) e.newRank = newProfile.rank
        })
        if (pendingLevelUps.length === 0) {
          pendingLevelUps.push({ muscleId: 'chest', newLevel: 0, newRank: newProfile.rank })
        }
      }

      return {
        ...state,
        profile: {
          ...newProfile,
          workoutHistory: [completedWorkout, ...newProfile.workoutHistory].slice(0, 200),
        },
        activeWorkout: null,
        lastCompletedWorkout: completedWorkout,
        pendingLevelUps,
        personalRecords: newPRs,
      }
    }

    case 'DISCARD_WORKOUT':
      return { ...state, activeWorkout: null }

    case 'DISMISS_LEVEL_UP':
      return {
        ...state,
        pendingLevelUps: state.pendingLevelUps.filter((e) => e.muscleId !== action.muscleId),
      }

    case 'SET_WEIGHT_UNIT':
      return { ...state, weightUnit: action.unit }

    case 'ADD_BODY_ENTRY':
      return {
        ...state,
        bodyLog: [{ ...action.entry, id: uid() }, ...state.bodyLog].slice(0, 500),
      }

    case 'ADD_CUSTOM_EXERCISE':
      return {
        ...state,
        customExercises: [...state.customExercises, action.exercise],
      }

    case 'CLEAR_LAST_COMPLETED':
      return { ...state, lastCompletedWorkout: null }

    default:
      return state
  }
}
