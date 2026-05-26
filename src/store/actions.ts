import type {
  MuscleGroupId,
  LoggedSet,
  WeightUnit,
  BodyEntry,
  Exercise,
  WorkoutSession,
  MuscleGroupState,
  WorkoutTemplate,
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
  | { type: 'UPDATE_SET'; loggedExerciseId: string; setId: string; patch: Partial<Pick<LoggedSet, 'reps' | 'weight' | 'duration' | 'distance' | 'completed' | 'notes' | 'rpe'>> }
  | { type: 'REMOVE_SET'; loggedExerciseId: string; setId: string }

  // ── Workout completion ─────────────────────────────────────────────────────
  | { type: 'FINISH_WORKOUT_WITH_XP'; muscleXp: Partial<Record<MuscleGroupId, number>> }
  | { type: 'DISCARD_WORKOUT' }

  // ── Pause / resume ─────────────────────────────────────────────────────────
  | { type: 'PAUSE_WORKOUT'; pausedAt: number }
  | { type: 'RESUME_WORKOUT'; pausedDuration: number }

  // ── Level / rank ───────────────────────────────────────────────────────────
  | { type: 'DISMISS_LEVEL_UP'; muscleId: MuscleGroupId }

  // ── Settings ───────────────────────────────────────────────────────────────
  | { type: 'SET_WEIGHT_UNIT'; unit: WeightUnit }
  | { type: 'LOAD_BODY_ENTRIES'; entries: BodyEntry[] }
  | { type: 'ADD_BODY_ENTRY'; entry: BodyEntry }
  | { type: 'UPDATE_BODY_ENTRY'; entry: BodyEntry }
  | { type: 'DELETE_BODY_ENTRY'; id: string }
  | { type: 'ADD_CUSTOM_EXERCISE'; exercise: Exercise }
  | { type: 'UPDATE_EXERCISE'; exercise: Exercise }
  | { type: 'REMOVE_EXERCISE_LIBRARY'; exerciseId: string }
  | { type: 'CLEAR_LAST_COMPLETED' }

  // ── Workout templates ──────────────────────────────────────────────────────
  | { type: 'LOAD_TEMPLATES'; templates: WorkoutTemplate[] }
  | { type: 'SAVE_TEMPLATE'; template: WorkoutTemplate }
  | { type: 'DELETE_TEMPLATE'; templateId: string }
