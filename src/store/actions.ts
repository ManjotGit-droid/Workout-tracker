import type {
  MuscleGroupId,
  LoggedSet,
  WeightUnit,
  BodyEntry,
  Exercise,
} from '../types'

export type AppAction =
  | { type: 'START_WORKOUT' }
  | { type: 'ADD_EXERCISE'; exerciseId: string }
  | { type: 'REMOVE_EXERCISE'; loggedExerciseId: string }
  | { type: 'LOG_SET'; loggedExerciseId: string; set: Omit<LoggedSet, 'id' | 'timestamp'> }
  | { type: 'UPDATE_SET'; loggedExerciseId: string; setId: string; patch: Partial<Pick<LoggedSet, 'reps' | 'weight' | 'completed'>> }
  | { type: 'REMOVE_SET'; loggedExerciseId: string; setId: string }
  | { type: 'FINISH_WORKOUT' }
  | { type: 'DISCARD_WORKOUT' }
  | { type: 'DISMISS_LEVEL_UP'; muscleId: MuscleGroupId }
  | { type: 'SET_WEIGHT_UNIT'; unit: WeightUnit }
  | { type: 'ADD_BODY_ENTRY'; entry: Omit<BodyEntry, 'id'> }
  | { type: 'ADD_CUSTOM_EXERCISE'; exercise: Exercise }
  | { type: 'CLEAR_LAST_COMPLETED' }
