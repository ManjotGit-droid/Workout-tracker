export interface ExerciseRecord {
  id: string
  name: string
  category: string
  equipment: string
  tracking_type: string
  description: string
  muscles: { muscle_id: string; type: string }[]
}

export interface SetRecord {
  id: string
  reps: number | null
  weight: number | null
  duration: number | null
  distance: number | null
  completed: boolean
  notes: string
  timestamp: number
}

export interface WorkoutExerciseRecord {
  id: string
  exercise_id: string
  sort_order: number
  sets: SetRecord[]
}

export interface WorkoutRecord {
  id: string
  date: string
  start_time: number
  end_time: number | null
  completed: boolean
  notes: string
  xpGained: Record<string, number>
  exercises: WorkoutExerciseRecord[]
  paused_at?: number | null
  paused_duration?: number
}

export interface MuscleXpRecord {
  muscle_id: string
  level: number
  xp: number
  xp_to_next: number
}

export interface BodyEntryRecord {
  id: string
  date: string

  // Composition
  weight_kg?: number
  body_fat_pct?: number
  height_cm?: number

  // Measurements (cm)
  neck_cm?: number
  shoulders_cm?: number
  chest_cm?: number
  left_arm_cm?: number
  right_arm_cm?: number
  left_forearm_cm?: number
  right_forearm_cm?: number
  waist_cm?: number
  hips_cm?: number
  left_thigh_cm?: number
  right_thigh_cm?: number
  left_calf_cm?: number
  right_calf_cm?: number

  // Wellness
  resting_hr_bpm?: number
  sleep_hours?: number
  energy_level?: number
  mood_level?: number
  soreness_level?: number
  hydration_l?: number
  steps_count?: number

  notes?: string
}
