import {
  createContext, useContext, useReducer, useEffect,
  useCallback, useRef, useState,
} from 'react'
import type { ReactNode } from 'react'
import type { AppState, MuscleGroupId } from '../types'
import type { AppAction } from './actions'
import { appReducer } from './reducer'
import { MUSCLE_GROUP_IDS } from '../data/muscleGroups'
import { getXPThreshold } from '../data/levelConfig'
import { fetchExercises } from '../api/exercises'
import { fetchWorkouts, createWorkout, addExerciseToWorkout, removeExerciseFromWorkout, logSet, updateSet, deleteSet, completeWorkout } from '../api/workouts'
import { fetchMuscleXp } from '../api/stats'

function createDefaultState(): AppState {
  const muscleGroups = Object.fromEntries(
    MUSCLE_GROUP_IDS.map((id) => [
      id,
      { id, level: 1, xp: 0, xpToNextLevel: getXPThreshold(1) },
    ]),
  ) as AppState['profile']['muscleGroups']

  return {
    profile: {
      id: 'local-user',
      createdAt: new Date().toISOString(),
      totalWorkouts: 0,
      totalSets: 0,
      rank: 'E',
      muscleGroups,
      workoutHistory: [],
    },
    activeWorkout: null,
    pendingLevelUps: [],
    lastCompletedWorkout: null,
    weightUnit: (localStorage.getItem('weightUnit') as 'kg' | 'lbs') ?? 'kg',
    personalRecords: {},
    bodyLog: [],
    customExercises: [],
  }
}

interface ContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  ready: boolean
  // Async workout actions that sync to API
  startWorkout: () => Promise<void>
  addExercise: (exerciseId: string) => Promise<void>
  removeExercise: (loggedExerciseId: string) => Promise<void>
  logNewSet: (loggedExerciseId: string, data: {
    reps?: number; weight?: number; duration?: number; distance?: number; notes?: string
  }) => Promise<void>
  patchSet: (loggedExerciseId: string, setId: string, patch: {
    reps?: number; weight?: number; duration?: number; distance?: number; completed?: boolean; notes?: string
  }) => Promise<void>
  removeSet: (loggedExerciseId: string, setId: string) => Promise<void>
  finishWorkout: () => Promise<void>
  discardWorkout: () => Promise<void>
}

const AppContext = createContext<ContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, createDefaultState)
  const [ready, setReady] = useState(false)
  // Track workout_exercise IDs: loggedExerciseId (frontend) → weId (DB / same value)
  const workoutIdRef = useRef<string | null>(null)

  // ── Load initial state from API ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const [exercises, workouts, muscleXpMap] = await Promise.all([
          fetchExercises(),
          fetchWorkouts(),
          fetchMuscleXp(),
        ])

        if (cancelled) return

        // Update exercises in state (as customExercises — replaces hardcoded EXERCISES)
        dispatch({ type: 'LOAD_EXERCISES', exercises })

        // Rebuild workoutHistory
        const completed = workouts.filter((w) => w.completed)
        dispatch({ type: 'LOAD_WORKOUTS', workouts: completed })

        // Reconstruct muscle XP from API
        const muscleGroups = { ...createDefaultState().profile.muscleGroups }
        for (const [id, row] of Object.entries(muscleXpMap)) {
          const mid = id as MuscleGroupId
          if (muscleGroups[mid]) {
            muscleGroups[mid] = {
              id: mid,
              level: row.level,
              xp: row.xp,
              xpToNextLevel: row.xp_to_next,
            }
          }
        }
        dispatch({ type: 'LOAD_MUSCLE_XP', muscleGroups })

        // Restore in-progress workout if any (not completed)
        const active = workouts.find((w) => !w.completed)
        if (active) {
          workoutIdRef.current = active.id
          dispatch({ type: 'RESTORE_WORKOUT', workout: active })
        }
      } catch (e) {
        console.warn('API unavailable, running offline', e)
      } finally {
        if (!cancelled) setReady(true)
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  // Persist weight unit preference
  useEffect(() => {
    localStorage.setItem('weightUnit', state.weightUnit)
  }, [state.weightUnit])

  // ── Async workout actions ────────────────────────────────────────────────

  const startWorkout = useCallback(async () => {
    if (state.activeWorkout) return
    const w = await createWorkout()
    workoutIdRef.current = w.id
    dispatch({ type: 'RESTORE_WORKOUT', workout: w })
  }, [state.activeWorkout])

  const addExercise = useCallback(async (exerciseId: string) => {
    const wid = workoutIdRef.current
    if (!wid) return
    const updated = await addExerciseToWorkout(wid, exerciseId)
    // The new workout_exercise id is the last in the array
    const newWe = updated.exercises[updated.exercises.length - 1]
    dispatch({ type: 'ADD_EXERCISE_WITH_ID', exerciseId, loggedExerciseId: newWe.id })
  }, [])

  const removeExercise = useCallback(async (loggedExerciseId: string) => {
    const wid = workoutIdRef.current
    if (!wid) return
    dispatch({ type: 'REMOVE_EXERCISE', loggedExerciseId })
    await removeExerciseFromWorkout(wid, loggedExerciseId).catch(console.warn)
  }, [])

  const logNewSet = useCallback(async (loggedExerciseId: string, data: {
    reps?: number; weight?: number; duration?: number; distance?: number; notes?: string
  }) => {
    const wid = workoutIdRef.current
    if (!wid) return
    const s = await logSet(wid, loggedExerciseId, data)
    dispatch({
      type: 'LOG_SET_WITH_ID',
      loggedExerciseId,
      set: {
        id: s.id,
        reps: s.reps ?? undefined,
        weight: s.weight ?? undefined,
        duration: s.duration ?? undefined,
        distance: s.distance ?? undefined,
        completed: Boolean(s.completed),
        notes: s.notes ?? undefined,
        timestamp: s.timestamp,
      },
    })
  }, [])

  const patchSet = useCallback(async (loggedExerciseId: string, setId: string, patch: {
    reps?: number; weight?: number; duration?: number; distance?: number; completed?: boolean; notes?: string
  }) => {
    const wid = workoutIdRef.current
    if (wid) updateSet(wid, loggedExerciseId, setId, patch).catch(console.warn)
    dispatch({ type: 'UPDATE_SET', loggedExerciseId, setId, patch })
  }, [])

  const removeSet = useCallback(async (loggedExerciseId: string, setId: string) => {
    const wid = workoutIdRef.current
    if (wid) deleteSet(wid, loggedExerciseId, setId).catch(console.warn)
    dispatch({ type: 'REMOVE_SET', loggedExerciseId, setId })
  }, [])

  const finishWorkout = useCallback(async () => {
    const wid = workoutIdRef.current
    if (!wid) return
    const { muscleXp } = await completeWorkout(wid)
    workoutIdRef.current = null
    dispatch({ type: 'FINISH_WORKOUT_WITH_XP', muscleXp: muscleXp as Partial<Record<MuscleGroupId, number>> })
  }, [])

  const discardWorkout = useCallback(async () => {
    const wid = workoutIdRef.current
    workoutIdRef.current = null
    dispatch({ type: 'DISCARD_WORKOUT' })
    if (wid) {
      await fetch(`/api/workouts/${wid}`, { method: 'DELETE' }).catch(console.warn)
    }
  }, [])

  const value: ContextValue = {
    state, dispatch, ready,
    startWorkout, addExercise, removeExercise,
    logNewSet, patchSet, removeSet, finishWorkout, discardWorkout,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppStore() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore must be used inside AppProvider')
  return ctx
}

export function useDispatch() {
  const { dispatch } = useAppStore()
  return useCallback(dispatch, [dispatch])
}
