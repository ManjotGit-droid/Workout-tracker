import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { AppState } from '../types'
import type { AppAction } from './actions'
import { appReducer } from './reducer'
import { MUSCLE_GROUP_IDS } from '../data/muscleGroups'
import { getXPThreshold } from '../data/levelConfig'

const STORAGE_KEY = 'sl-gym-state-v1'

function createDefaultState(): AppState {
  const muscleGroups = Object.fromEntries(
    MUSCLE_GROUP_IDS.map((id) => [
      id,
      { id, level: 1, xp: 0, xpToNextLevel: getXPThreshold(1) },
    ]),
  ) as AppState['profile']['muscleGroups']

  return {
    profile: {
      id: crypto.randomUUID(),
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
    weightUnit: 'kg',
    personalRecords: {},
    bodyLog: [],
    customExercises: [],
  }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    const defaults = createDefaultState()
    return {
      ...defaults,
      ...parsed,
      profile: { ...defaults.profile, ...parsed.profile },
      activeWorkout: null, // never restore mid-workout (prevents corrupted state)
      pendingLevelUps: [],
      lastCompletedWorkout: null,
    }
  } catch {
    return createDefaultState()
  }
}

interface ContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<ContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // quota exceeded
    }
  }, [state])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
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
