import type { Exercise } from '../types'

export const EXERCISES: Exercise[] = [
  // ── CHEST ─────────────────────────────────────────────────────────────
  {
    id: 'barbell-bench-press', name: 'Barbell Bench Press', category: 'push', equipment: 'barbell',
    muscles: [{ muscleId: 'chest', type: 'primary' }, { muscleId: 'front_delts', type: 'secondary' }, { muscleId: 'triceps', type: 'secondary' }],
    recommendedLevelRange: [1, 30], description: 'Classic horizontal chest press.',
  },
  {
    id: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', category: 'push', equipment: 'dumbbell',
    muscles: [{ muscleId: 'chest', type: 'primary' }, { muscleId: 'front_delts', type: 'secondary' }, { muscleId: 'triceps', type: 'secondary' }],
    recommendedLevelRange: [3, 35], description: 'Upper chest emphasis with dumbbells.',
  },
  {
    id: 'cable-fly', name: 'Cable Fly', category: 'push', equipment: 'cable',
    muscles: [{ muscleId: 'chest', type: 'primary' }, { muscleId: 'front_delts', type: 'secondary' }],
    recommendedLevelRange: [5, 40], description: 'Full chest stretch at peak contraction.',
  },
  {
    id: 'push-up', name: 'Push-Up', category: 'push', equipment: 'bodyweight',
    muscles: [{ muscleId: 'chest', type: 'primary' }, { muscleId: 'front_delts', type: 'secondary' }, { muscleId: 'triceps', type: 'secondary' }],
    recommendedLevelRange: [1, 15], description: 'Foundational chest movement.',
  },
  {
    id: 'dip', name: 'Dip', category: 'push', equipment: 'bodyweight',
    muscles: [{ muscleId: 'chest', type: 'primary' }, { muscleId: 'triceps', type: 'primary' }, { muscleId: 'front_delts', type: 'secondary' }],
    recommendedLevelRange: [4, 25], description: 'Compound chest + tricep movement.',
  },
  {
    id: 'machine-chest-press', name: 'Machine Chest Press', category: 'push', equipment: 'machine',
    muscles: [{ muscleId: 'chest', type: 'primary' }, { muscleId: 'front_delts', type: 'secondary' }, { muscleId: 'triceps', type: 'secondary' }],
    recommendedLevelRange: [1, 20], description: 'Beginner-friendly chest press.',
  },
  {
    id: 'pec-deck', name: 'Pec Deck Fly', category: 'push', equipment: 'machine',
    muscles: [{ muscleId: 'chest', type: 'primary' }],
    recommendedLevelRange: [2, 25], description: 'Machine isolation fly.',
  },
  {
    id: 'incline-barbell-press', name: 'Incline Barbell Press', category: 'push', equipment: 'barbell',
    muscles: [{ muscleId: 'chest', type: 'primary' }, { muscleId: 'front_delts', type: 'primary' }, { muscleId: 'triceps', type: 'secondary' }],
    recommendedLevelRange: [5, 40], description: 'Upper chest focus with barbell.',
  },

  // ── SHOULDERS ─────────────────────────────────────────────────────────
  {
    id: 'overhead-press', name: 'Overhead Press', category: 'push', equipment: 'barbell',
    muscles: [{ muscleId: 'front_delts', type: 'primary' }, { muscleId: 'side_delts', type: 'secondary' }, { muscleId: 'triceps', type: 'secondary' }, { muscleId: 'traps', type: 'secondary' }],
    recommendedLevelRange: [2, 35], description: 'King of shoulder movements.',
  },
  {
    id: 'lateral-raise', name: 'Lateral Raise', category: 'push', equipment: 'dumbbell',
    muscles: [{ muscleId: 'side_delts', type: 'primary' }],
    recommendedLevelRange: [1, 30], description: 'Isolation for shoulder width.',
  },
  {
    id: 'face-pull', name: 'Face Pull', category: 'pull', equipment: 'cable',
    muscles: [{ muscleId: 'rear_delts', type: 'primary' }, { muscleId: 'rhomboids', type: 'secondary' }],
    recommendedLevelRange: [1, 25], description: 'Shoulder health and rear delt staple.',
  },
  {
    id: 'reverse-fly', name: 'Reverse Dumbbell Fly', category: 'pull', equipment: 'dumbbell',
    muscles: [{ muscleId: 'rear_delts', type: 'primary' }, { muscleId: 'rhomboids', type: 'secondary' }],
    recommendedLevelRange: [2, 20], description: 'Posterior delt isolation.',
  },
  {
    id: 'arnold-press', name: 'Arnold Press', category: 'push', equipment: 'dumbbell',
    muscles: [{ muscleId: 'front_delts', type: 'primary' }, { muscleId: 'side_delts', type: 'primary' }, { muscleId: 'rear_delts', type: 'secondary' }],
    recommendedLevelRange: [5, 35], description: 'Rotational dumbbell press for all three delt heads.',
  },
  {
    id: 'upright-row', name: 'Upright Row', category: 'pull', equipment: 'barbell',
    muscles: [{ muscleId: 'traps', type: 'primary' }, { muscleId: 'side_delts', type: 'primary' }, { muscleId: 'front_delts', type: 'secondary' }],
    recommendedLevelRange: [3, 30], description: 'Trap and delt compound row.',
  },

  // ── BACK ──────────────────────────────────────────────────────────────
  {
    id: 'pull-up', name: 'Pull-Up', category: 'pull', equipment: 'bodyweight',
    muscles: [{ muscleId: 'lats', type: 'primary' }, { muscleId: 'biceps', type: 'secondary' }, { muscleId: 'rhomboids', type: 'secondary' }],
    recommendedLevelRange: [3, 50], description: 'Elite upper body vertical pulling movement.',
  },
  {
    id: 'lat-pulldown', name: 'Lat Pulldown', category: 'pull', equipment: 'cable',
    muscles: [{ muscleId: 'lats', type: 'primary' }, { muscleId: 'biceps', type: 'secondary' }],
    recommendedLevelRange: [1, 30], description: 'Machine-assisted vertical pull.',
  },
  {
    id: 'barbell-row', name: 'Barbell Row', category: 'pull', equipment: 'barbell',
    muscles: [{ muscleId: 'lats', type: 'primary' }, { muscleId: 'rhomboids', type: 'primary' }, { muscleId: 'biceps', type: 'secondary' }, { muscleId: 'lower_back', type: 'secondary' }],
    recommendedLevelRange: [3, 40], description: 'Mass-builder for the back.',
  },
  {
    id: 'seated-cable-row', name: 'Seated Cable Row', category: 'pull', equipment: 'cable',
    muscles: [{ muscleId: 'rhomboids', type: 'primary' }, { muscleId: 'lats', type: 'secondary' }, { muscleId: 'biceps', type: 'secondary' }],
    recommendedLevelRange: [1, 30], description: 'Horizontal pull for mid-back thickness.',
  },
  {
    id: 'deadlift', name: 'Deadlift', category: 'compound', equipment: 'barbell',
    muscles: [{ muscleId: 'lower_back', type: 'primary' }, { muscleId: 'glutes', type: 'primary' }, { muscleId: 'hamstrings', type: 'primary' }, { muscleId: 'traps', type: 'secondary' }, { muscleId: 'lats', type: 'secondary' }, { muscleId: 'quads', type: 'secondary' }],
    recommendedLevelRange: [5, 60], description: 'The king of all lifts.',
  },
  {
    id: 'hyperextension', name: 'Hyperextension', category: 'pull', equipment: 'bodyweight',
    muscles: [{ muscleId: 'lower_back', type: 'primary' }, { muscleId: 'glutes', type: 'secondary' }, { muscleId: 'hamstrings', type: 'secondary' }],
    recommendedLevelRange: [1, 20], description: 'Lower back and posterior chain isolation.',
  },
  {
    id: 'barbell-shrug', name: 'Barbell Shrug', category: 'pull', equipment: 'barbell',
    muscles: [{ muscleId: 'traps', type: 'primary' }],
    recommendedLevelRange: [2, 35], description: 'Upper trap isolation.',
  },
  {
    id: 'good-morning', name: 'Good Morning', category: 'pull', equipment: 'barbell',
    muscles: [{ muscleId: 'lower_back', type: 'primary' }, { muscleId: 'hamstrings', type: 'primary' }, { muscleId: 'glutes', type: 'secondary' }],
    recommendedLevelRange: [5, 40], description: 'Hip hinge erector movement.',
  },

  // ── ARMS ──────────────────────────────────────────────────────────────
  {
    id: 'barbell-curl', name: 'Barbell Curl', category: 'pull', equipment: 'barbell',
    muscles: [{ muscleId: 'biceps', type: 'primary' }, { muscleId: 'forearms', type: 'secondary' }],
    recommendedLevelRange: [1, 35], description: 'Classic mass builder for biceps.',
  },
  {
    id: 'hammer-curl', name: 'Hammer Curl', category: 'pull', equipment: 'dumbbell',
    muscles: [{ muscleId: 'biceps', type: 'primary' }, { muscleId: 'forearms', type: 'primary' }],
    recommendedLevelRange: [2, 30], description: 'Hits brachialis and forearms.',
  },
  {
    id: 'cable-curl', name: 'Cable Curl', category: 'pull', equipment: 'cable',
    muscles: [{ muscleId: 'biceps', type: 'primary' }],
    recommendedLevelRange: [3, 25], description: 'Constant tension bicep curl.',
  },
  {
    id: 'tricep-pushdown', name: 'Tricep Pushdown', category: 'push', equipment: 'cable',
    muscles: [{ muscleId: 'triceps', type: 'primary' }],
    recommendedLevelRange: [1, 30], description: 'Cable isolation for all three tricep heads.',
  },
  {
    id: 'skull-crusher', name: 'Skull Crusher', category: 'push', equipment: 'barbell',
    muscles: [{ muscleId: 'triceps', type: 'primary' }],
    recommendedLevelRange: [4, 35], description: 'Long-head tricep focus.',
  },
  {
    id: 'overhead-tricep', name: 'Overhead Tricep Extension', category: 'push', equipment: 'dumbbell',
    muscles: [{ muscleId: 'triceps', type: 'primary' }],
    recommendedLevelRange: [2, 25], description: 'Long-head tricep stretch under load.',
  },
  {
    id: 'wrist-curl', name: 'Wrist Curl', category: 'pull', equipment: 'dumbbell',
    muscles: [{ muscleId: 'forearms', type: 'primary' }],
    recommendedLevelRange: [1, 20], description: 'Forearm flexor isolation.',
  },
  {
    id: 'farmers-carry', name: "Farmer's Carry", category: 'compound', equipment: 'dumbbell',
    muscles: [{ muscleId: 'forearms', type: 'primary' }, { muscleId: 'traps', type: 'secondary' }, { muscleId: 'calves', type: 'secondary' }],
    recommendedLevelRange: [3, 40], description: 'Loaded carry for grip strength and stability.',
  },

  // ── LEGS ──────────────────────────────────────────────────────────────
  {
    id: 'barbell-squat', name: 'Barbell Back Squat', category: 'legs', equipment: 'barbell',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'primary' }, { muscleId: 'hamstrings', type: 'secondary' }, { muscleId: 'lower_back', type: 'secondary' }],
    recommendedLevelRange: [3, 60], description: 'Foundational lower body compound.',
  },
  {
    id: 'leg-press', name: 'Leg Press', category: 'legs', equipment: 'machine',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'secondary' }, { muscleId: 'hamstrings', type: 'secondary' }],
    recommendedLevelRange: [1, 40], description: 'Machine quad and glute compound.',
  },
  {
    id: 'leg-extension', name: 'Leg Extension', category: 'legs', equipment: 'machine',
    muscles: [{ muscleId: 'quads', type: 'primary' }],
    recommendedLevelRange: [1, 25], description: 'Quad isolation machine.',
  },
  {
    id: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'legs', equipment: 'barbell',
    muscles: [{ muscleId: 'hamstrings', type: 'primary' }, { muscleId: 'glutes', type: 'primary' }, { muscleId: 'lower_back', type: 'secondary' }],
    recommendedLevelRange: [3, 45], description: 'Hip hinge for posterior chain development.',
  },
  {
    id: 'leg-curl', name: 'Lying Leg Curl', category: 'legs', equipment: 'machine',
    muscles: [{ muscleId: 'hamstrings', type: 'primary' }],
    recommendedLevelRange: [1, 25], description: 'Hamstring isolation machine.',
  },
  {
    id: 'hip-thrust', name: 'Hip Thrust', category: 'legs', equipment: 'barbell',
    muscles: [{ muscleId: 'glutes', type: 'primary' }, { muscleId: 'hamstrings', type: 'secondary' }],
    recommendedLevelRange: [2, 40], description: 'Glute-dominant hip extension.',
  },
  {
    id: 'calf-raise', name: 'Standing Calf Raise', category: 'legs', equipment: 'machine',
    muscles: [{ muscleId: 'calves', type: 'primary' }],
    recommendedLevelRange: [1, 30], description: 'Calf isolation movement.',
  },
  {
    id: 'sumo-squat', name: 'Sumo Squat', category: 'legs', equipment: 'dumbbell',
    muscles: [{ muscleId: 'inner_thighs', type: 'primary' }, { muscleId: 'glutes', type: 'secondary' }, { muscleId: 'quads', type: 'secondary' }],
    recommendedLevelRange: [2, 30], description: 'Wide stance targeting adductors.',
  },
  {
    id: 'lunge', name: 'Dumbbell Lunge', category: 'legs', equipment: 'dumbbell',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'secondary' }, { muscleId: 'hip_flexors', type: 'secondary' }],
    recommendedLevelRange: [2, 30], description: 'Unilateral leg exercise for balance and strength.',
  },
  {
    id: 'sissy-squat', name: 'Sissy Squat', category: 'legs', equipment: 'bodyweight',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'hip_flexors', type: 'secondary' }],
    recommendedLevelRange: [8, 40], description: 'Extreme quad stretch movement.',
  },
  {
    id: 'nordic-curl', name: 'Nordic Hamstring Curl', category: 'legs', equipment: 'bodyweight',
    muscles: [{ muscleId: 'hamstrings', type: 'primary' }],
    recommendedLevelRange: [10, 50], description: 'Advanced eccentric hamstring strengthener.',
  },
  {
    id: 'cable-kickback', name: 'Cable Glute Kickback', category: 'legs', equipment: 'cable',
    muscles: [{ muscleId: 'glutes', type: 'primary' }],
    recommendedLevelRange: [2, 25], description: 'Glute isolation via cable.',
  },

  // ── CORE ──────────────────────────────────────────────────────────────
  {
    id: 'crunch', name: 'Crunch', category: 'core', equipment: 'bodyweight',
    muscles: [{ muscleId: 'upper_abs', type: 'primary' }],
    recommendedLevelRange: [1, 15], description: 'Basic abdominal crunch.',
  },
  {
    id: 'leg-raise', name: 'Hanging Leg Raise', category: 'core', equipment: 'bodyweight',
    muscles: [{ muscleId: 'lower_abs', type: 'primary' }, { muscleId: 'hip_flexors', type: 'secondary' }],
    recommendedLevelRange: [3, 30], description: 'Lower abs and hip flexor movement.',
  },
  {
    id: 'cable-crunch', name: 'Cable Crunch', category: 'core', equipment: 'cable',
    muscles: [{ muscleId: 'upper_abs', type: 'primary' }, { muscleId: 'lower_abs', type: 'secondary' }],
    recommendedLevelRange: [4, 30], description: 'Weighted ab crunch for progressive overload.',
  },
  {
    id: 'russian-twist', name: 'Russian Twist', category: 'core', equipment: 'bodyweight',
    muscles: [{ muscleId: 'obliques', type: 'primary' }, { muscleId: 'upper_abs', type: 'secondary' }],
    recommendedLevelRange: [2, 25], description: 'Rotational core movement.',
  },
  {
    id: 'plank', name: 'Plank', category: 'core', equipment: 'bodyweight',
    muscles: [{ muscleId: 'upper_abs', type: 'primary' }, { muscleId: 'lower_abs', type: 'primary' }, { muscleId: 'obliques', type: 'secondary' }],
    recommendedLevelRange: [1, 20], description: 'Isometric core stabilizer.',
  },

  // ── COMPOUNDS ─────────────────────────────────────────────────────────
  {
    id: 'power-clean', name: 'Power Clean', category: 'compound', equipment: 'barbell',
    muscles: [{ muscleId: 'traps', type: 'primary' }, { muscleId: 'glutes', type: 'primary' }, { muscleId: 'hamstrings', type: 'secondary' }, { muscleId: 'quads', type: 'secondary' }, { muscleId: 'lower_back', type: 'secondary' }],
    recommendedLevelRange: [10, 60], description: 'Olympic full-body power movement.',
  },
  {
    id: 'thruster', name: 'Dumbbell Thruster', category: 'compound', equipment: 'dumbbell',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'front_delts', type: 'primary' }, { muscleId: 'glutes', type: 'secondary' }, { muscleId: 'triceps', type: 'secondary' }],
    recommendedLevelRange: [8, 40], description: 'Squat-to-press combo for total body conditioning.',
  },
]
