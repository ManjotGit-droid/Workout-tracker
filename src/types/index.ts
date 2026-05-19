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

// strength = reps + weight, bodyweight = reps (weight optional), duration = time, cardio = time + distance
export type TrackingType = 'strength' | 'bodyweight' | 'duration' | 'cardio'

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
  tracking_type?: TrackingType
}

export interface LoggedSet {
  id: string
  reps?: number
  weight?: number
  duration?: number   // seconds
  distance?: number   // metres
  completed: boolean
  notes?: string
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
  // Pause state: pausedAt is the timestamp the user paused (or null when running).
  // pausedDuration is the total ms accumulated across past pauses — used so the
  // timer shows real "active" elapsed time minus the time the user was paused.
  pausedAt?: number | null
  pausedDuration?: number
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

  // ── Composition ──────────────────────────────────────────────
  weightKg?: number
  bodyFatPct?: number
  heightCm?: number       // usually set once, used for BMI

  // ── Circumference measurements (cm) ──────────────────────────
  neckCm?: number
  shouldersCm?: number
  chestCm?: number
  leftArmCm?: number      // flexed bicep
  rightArmCm?: number
  leftForearmCm?: number
  rightForearmCm?: number
  waistCm?: number
  hipsCm?: number
  leftThighCm?: number
  rightThighCm?: number
  leftCalfCm?: number
  rightCalfCm?: number

  // ── Recovery / wellness ──────────────────────────────────────
  restingHrBpm?: number
  sleepHours?: number
  energyLevel?: number    // 1–10
  moodLevel?: number      // 1–10
  sorenessLevel?: number  // 1–10
  hydrationL?: number     // litres
  stepsCount?: number

  notes?: string
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
