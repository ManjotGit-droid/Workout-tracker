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
}

export interface MuscleXpRecord {
  muscle_id: string
  level: number
  xp: number
  xp_to_next: number
}
