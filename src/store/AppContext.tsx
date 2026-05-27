import {
  createContext, useContext, useReducer, useEffect,
  useCallback, useRef, useState,
} from 'react'
import type { ReactNode } from 'react'
import type { AppState, MuscleGroupId, WorkoutTemplate } from '../types'
import type { AppAction } from './actions'
import { appReducer } from './reducer'
import { MUSCLE_GROUP_IDS } from '../data/muscleGroups'
import { getXPThreshold } from '../data/levelConfig'
import { fetchExercises } from '../api/exercises'
import { fetchWorkouts, createWorkout, addExerciseToWorkout, removeExerciseFromWorkout, logSet, updateSet, deleteSet, completeWorkout, deleteWorkout, pauseWorkout as apiPauseWorkout, resumeWorkout as apiResumeWorkout } from '../api/workouts'
import { fetchMuscleXp } from '../api/stats'
import { fetchBodyEntries } from '../api/body'

const createDefaultState = (): AppState => {
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
    workoutTemplates: [],
  }
}

const TEMPLATES_LS_KEY = 'workoutTemplates'

interface ContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  ready: boolean
  // Async workout actions that sync to API
  startWorkout: (opts?: { date?: string }) => Promise<void>
  addExercise: (exerciseId: string) => Promise<void>
  removeExercise: (loggedExerciseId: string) => Promise<void>
  logNewSet: (loggedExerciseId: string, data: {
    reps?: number; weight?: number; duration?: number; distance?: number; notes?: string; rpe?: number
  }) => Promise<void>
  patchSet: (loggedExerciseId: string, setId: string, patch: {
    reps?: number; weight?: number; duration?: number; distance?: number; completed?: boolean; notes?: string; rpe?: number
  }) => Promise<void>
  removeSet: (loggedExerciseId: string, setId: string) => Promise<void>
  finishWorkout: () => Promise<void>
  discardWorkout: () => Promise<void>
  pauseWorkout: () => Promise<void>
  resumeWorkout: () => Promise<void>
  startWorkoutFromPlan: (
    exercises: Array<{
      exerciseId: string
      sets: number
      reps?: number | 'AMRAP'
      duration?: number
      distance?: number
      weight?: number
    }>,
    onProgress?: (done: number, total: number) => void,
  ) => Promise<void>
}

const AppContext = createContext<ContextValue | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, createDefaultState)
  const [ready, setReady] = useState(false)
  // Track workout_exercise IDs: loggedExerciseId (frontend) → weId (DB / same value)
  const workoutIdRef = useRef<string | null>(null)

  // ── Load initial state from API ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        const [exercises, workouts, muscleXpMap, bodyEntries] = await Promise.all([
          fetchExercises(),
          fetchWorkouts(),
          fetchMuscleXp(),
          fetchBodyEntries(),
        ])

        if (cancelled) return

        // Update exercises in state (as customExercises — replaces hardcoded EXERCISES)
        dispatch({ type: 'LOAD_EXERCISES', exercises })

        // Rebuild workoutHistory
        const completed = workouts.filter((w) => w.completed)
        dispatch({ type: 'LOAD_WORKOUTS', workouts: completed })

        // Load body entries
        dispatch({ type: 'LOAD_BODY_ENTRIES', entries: bodyEntries })

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

  // ── Workout templates: persisted to localStorage (not IDB to avoid schema bump) ─
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TEMPLATES_LS_KEY)
      if (!raw) return
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) return
      // Validate each entry's shape so a tampered or partially-corrupt LS
      // value can't surface as a render-time crash or render unexpected
      // props through the UI. Strings are truncated and exerciseIds are
      // string-coerced — every field is treated as untrusted input.
      const sanitised: WorkoutTemplate[] = []
      for (const t of parsed) {
        if (!t || typeof t !== 'object') continue
        const obj = t as Record<string, unknown>
        if (typeof obj.id !== 'string' || typeof obj.name !== 'string') continue
        if (!Array.isArray(obj.exerciseIds)) continue
        const exerciseIds = obj.exerciseIds.filter((x): x is string => typeof x === 'string').slice(0, 200)
        sanitised.push({
          id: obj.id.slice(0, 64),
          name: obj.name.slice(0, 120),
          exerciseIds,
          createdAt: typeof obj.createdAt === 'number' ? obj.createdAt : Date.now(),
        })
      }
      if (sanitised.length > 0) {
        dispatch({ type: 'LOAD_TEMPLATES', templates: sanitised })
      }
    } catch {
      // ignore — corrupt LS just resets the list
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(TEMPLATES_LS_KEY, JSON.stringify(state.workoutTemplates))
    } catch {
      // quota / serialization — best effort only
    }
  }, [state.workoutTemplates])

  // ── Async workout actions ────────────────────────────────────────────────

  const startWorkout = useCallback(async (opts?: { date?: string }) => {
    if (state.activeWorkout) return
    const w = await createWorkout(opts)
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
    reps?: number; weight?: number; duration?: number; distance?: number; notes?: string; rpe?: number
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
        rpe: s.rpe ?? undefined,
        timestamp: s.timestamp,
      },
    })
  }, [])

  const patchSet = useCallback(async (loggedExerciseId: string, setId: string, patch: {
    reps?: number; weight?: number; duration?: number; distance?: number; completed?: boolean; notes?: string; rpe?: number
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

  const pauseWorkout = useCallback(async () => {
    const wid = workoutIdRef.current
    if (!wid) return
    const updated = await apiPauseWorkout(wid)
    if (updated.pausedAt) {
      dispatch({ type: 'PAUSE_WORKOUT', pausedAt: updated.pausedAt })
    }
  }, [])

  const resumeWorkout = useCallback(async () => {
    const wid = workoutIdRef.current
    if (!wid) return
    const updated = await apiResumeWorkout(wid)
    dispatch({ type: 'RESUME_WORKOUT', pausedDuration: updated.pausedDuration ?? 0 })
  }, [])

  const discardWorkout = useCallback(async () => {
    const wid = workoutIdRef.current
    workoutIdRef.current = null
    dispatch({ type: 'DISCARD_WORKOUT' })
    if (wid) {
      await deleteWorkout(wid).catch(console.warn)
    }
  }, [])

  const startWorkoutFromPlan = useCallback(async (
    planExercises: Array<{
      exerciseId: string
      sets: number
      reps?: number | 'AMRAP'
      duration?: number
      distance?: number
      weight?: number
    }>,
    onProgress?: (done: number, total: number) => void,
  ) => {
    // Total steps = 1 (create workout) + each (exercise + sets)
    const totalSteps = 1 + planExercises.reduce((sum, e) => sum + 1 + e.sets, 0)
    let done = 0
    const tick = () => { done++; onProgress?.(done, totalSteps) }

    // Discard any active workout first so we start clean
    if (workoutIdRef.current) {
      const oldId = workoutIdRef.current
      workoutIdRef.current = null
      dispatch({ type: 'DISCARD_WORKOUT' })
      await deleteWorkout(oldId).catch(console.warn)
    }

    const workout = await createWorkout()
    workoutIdRef.current = workout.id
    dispatch({ type: 'RESTORE_WORKOUT', workout })
    tick()

    // Add each exercise sequentially, then pre-create the suggested sets (uncompleted)
    for (const planEx of planExercises) {
      const updated = await addExerciseToWorkout(workout.id, planEx.exerciseId)
      const newWe = updated.exercises[updated.exercises.length - 1]
      dispatch({ type: 'ADD_EXERCISE_WITH_ID', exerciseId: planEx.exerciseId, loggedExerciseId: newWe.id })
      tick()

      for (let i = 0; i < planEx.sets; i++) {
        const setData: { reps?: number; weight?: number; duration?: number; distance?: number } = {}
        // AMRAP gets logged as 0 reps so user can fill in actual count
        if (planEx.reps === 'AMRAP') setData.reps = 0
        else if (typeof planEx.reps === 'number') setData.reps = planEx.reps
        if (planEx.duration !== undefined) setData.duration = planEx.duration
        if (planEx.distance !== undefined) setData.distance = planEx.distance
        if (planEx.weight !== undefined) setData.weight = planEx.weight

        const s = await logSet(workout.id, newWe.id, setData)
        dispatch({
          type: 'LOG_SET_WITH_ID',
          loggedExerciseId: newWe.id,
          set: {
            id: s.id,
            reps: s.reps ?? undefined,
            weight: s.weight ?? undefined,
            duration: s.duration ?? undefined,
            distance: s.distance ?? undefined,
            completed: false,
            notes: s.notes ?? undefined,
            timestamp: s.timestamp,
          },
        })
        tick()
      }
    }
  }, [])

  const value: ContextValue = {
    state, dispatch, ready,
    startWorkout, addExercise, removeExercise,
    logNewSet, patchSet, removeSet, finishWorkout, discardWorkout,
    pauseWorkout, resumeWorkout,
    startWorkoutFromPlan,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppStore = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore must be used inside AppProvider')
  return ctx
}

export const useDispatch = () => {
  const { dispatch } = useAppStore()
  return useCallback(dispatch, [dispatch])
}
