import type {
  MuscleGroupId,
  LoggedSet,
  WeightUnit,
  BodyEntry,
  Exercise,
  WorkoutSession,
  MuscleGroupState,
} from '../types'

export type AppAction =
  // ── Startup / hydration ────────────────────────────────────────────────────
  | { type: 'LOAD_EXERCISES'; exercises: Exercise[] }
  | { type: 'LOAD_WORKOUTS'; workouts: WorkoutSession[] }
  | { type: 'LOAD_MUSCLE_XP'; muscleGroups: Record<MuscleGroupId, MuscleGroupState> }
  | { type: 'RESTORE_WORKOUT'; workout: WorkoutSession }

  // ── Active workout mutations ───────────────────────────────────────────────
  | { type: 'ADD_EXERCISE_WITH_ID'; exerciseId: string; loggedExerciseId: string }
  | { type: 'REMOVE_EXERCISE'; loggedExerciseId: string }
  | { type: 'LOG_SET_WITH_ID'; loggedExerciseId: string; set: LoggedSet }
  | { type: 'UPDATE_SET'; loggedExerciseId: string; setId: string; patch: Partial<Pick<LoggedSet, 'reps' | 'weight' | 'duration' | 'distance' | 'completed' | 'notes'>> }
  | { type: 'REMOVE_SET'; loggedExerciseId: string; setId: string }

  // ── Workout completion ─────────────────────────────────────────────────────
  | { type: 'FINISH_WORKOUT_WITH_XP'; muscleXp: Partial<Record<MuscleGroupId, number>> }
  | { type: 'DISCARD_WORKOUT' }

  // ── Level / rank ───────────────────────────────────────────────────────────
  | { type: 'DISMISS_LEVEL_UP'; muscleId: MuscleGroupId }

  // ── Settings ───────────────────────────────────────────────────────────────
  | { type: 'SET_WEIGHT_UNIT'; unit: WeightUnit }
  | { type: 'ADD_BODY_ENTRY'; entry: Omit<BodyEntry, 'id'> }
  | { type: 'ADD_CUSTOM_EXERCISE'; exercise: Exercise }
  | { type: 'CLEAR_LAST_COMPLETED' }
