export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS'

export type MuscleGroupId =
  | 'chest'
  | 'front_delts'
  | 'side_delts'
  | 'rear_delts'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'upper_abs'
  | 'lower_abs'
  | 'obliques'
  | 'quads'
  | 'inner_thighs'
  | 'hip_flexors'
  | 'traps'
  | 'lats'
  | 'rhomboids'
  | 'lower_back'
  | 'glutes'
  | 'hamstrings'
  | 'calves'

export type ExerciseCategory = 'push' | 'pull' | 'legs' | 'core' | 'cardio' | 'compound'

export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'band'

export interface MuscleTarget {
  muscleId: MuscleGroupId
  type: 'primary' | 'secondary'
}

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  muscles: MuscleTarget[]
  description: string
  recommendedLevelRange: [number, number]
  equipment: Equipment
}

export interface LoggedSet {
  id: string
  reps: number
  weight: number
  completed: boolean
  timestamp: number
}

export interface LoggedExercise {
  id: string
  exerciseId: string
  sets: LoggedSet[]
}

export interface WorkoutSession {
  id: string
  date: string
  startTime: number
  endTime?: number
  exercises: LoggedExercise[]
  completed: boolean
  xpGained: Partial<Record<MuscleGroupId, number>>
}

export interface MuscleGroupState {
  id: MuscleGroupId
  level: number
  xp: number
  xpToNextLevel: number
}

export interface UserProfile {
  id: string
  createdAt: string
  totalWorkouts: number
  totalSets: number
  rank: Rank
  muscleGroups: Record<MuscleGroupId, MuscleGroupState>
  workoutHistory: WorkoutSession[]
}

export interface LevelUpEvent {
  muscleId: MuscleGroupId
  newLevel: number
  newRank?: Rank
}

export type WeightUnit = 'kg' | 'lbs'

export interface PersonalRecord {
  exerciseId: string
  weightKg: number
  reps: number
  date: string
}

export interface BodyEntry {
  id: string
  date: string
  weightKg?: number
  bodyFatPct?: number
}

export interface AppState {
  profile: UserProfile
  activeWorkout: WorkoutSession | null
  pendingLevelUps: LevelUpEvent[]
  lastCompletedWorkout: WorkoutSession | null
  weightUnit: WeightUnit
  personalRecords: Record<string, PersonalRecord>
  bodyLog: BodyEntry[]
  customExercises: Exercise[]
}

export interface MuscleGroupMeta {
  id: MuscleGroupId
  name: string
  svgIds: string[]
  view: 'front' | 'back' | 'both'
  displayName: string
  shortName: string
}
