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
    muscles: [{ muscleId: 'chest', type: 'primary' }, { muscleId: 'front_delts', type: 'secondary' }],
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
    muscles: [{ muscleId: 'side_delts', type: 'primary' }, { muscleId: 'front_delts', type: 'secondary' }],
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
    muscles: [{ muscleId: 'traps', type: 'primary' }, { muscleId: 'forearms', type: 'secondary' }],
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
    muscles: [{ muscleId: 'biceps', type: 'primary' }, { muscleId: 'forearms', type: 'secondary' }],
    recommendedLevelRange: [3, 25], description: 'Constant tension bicep curl.',
  },
  {
    id: 'tricep-pushdown', name: 'Tricep Pushdown', category: 'push', equipment: 'cable',
    muscles: [{ muscleId: 'triceps', type: 'primary' }, { muscleId: 'forearms', type: 'secondary' }],
    recommendedLevelRange: [1, 30], description: 'Cable isolation for all three tricep heads.',
  },
  {
    id: 'skull-crusher', name: 'Skull Crusher', category: 'push', equipment: 'barbell',
    muscles: [{ muscleId: 'triceps', type: 'primary' }, { muscleId: 'forearms', type: 'secondary' }],
    recommendedLevelRange: [4, 35], description: 'Long-head tricep focus.',
  },
  {
    id: 'overhead-tricep', name: 'Overhead Tricep Extension', category: 'push', equipment: 'dumbbell',
    muscles: [{ muscleId: 'triceps', type: 'primary' }, { muscleId: 'traps', type: 'secondary' }],
    recommendedLevelRange: [2, 25], description: 'Long-head tricep stretch under load.',
  },
  {
    id: 'wrist-curl', name: 'Wrist Curl', category: 'pull', equipment: 'dumbbell',
    muscles: [{ muscleId: 'forearms', type: 'primary' }, { muscleId: 'biceps', type: 'secondary' }],
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
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'hip_flexors', type: 'secondary' }],
    recommendedLevelRange: [1, 25], description: 'Quad isolation machine.',
  },
  {
    id: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'legs', equipment: 'barbell',
    muscles: [{ muscleId: 'hamstrings', type: 'primary' }, { muscleId: 'glutes', type: 'primary' }, { muscleId: 'lower_back', type: 'secondary' }],
    recommendedLevelRange: [3, 45], description: 'Hip hinge for posterior chain development.',
  },
  {
    id: 'leg-curl', name: 'Lying Leg Curl', category: 'legs', equipment: 'machine',
    muscles: [{ muscleId: 'hamstrings', type: 'primary' }, { muscleId: 'calves', type: 'secondary' }],
    recommendedLevelRange: [1, 25], description: 'Hamstring isolation machine.',
  },
  {
    id: 'hip-thrust', name: 'Hip Thrust', category: 'legs', equipment: 'barbell',
    muscles: [{ muscleId: 'glutes', type: 'primary' }, { muscleId: 'hamstrings', type: 'secondary' }],
    recommendedLevelRange: [2, 40], description: 'Glute-dominant hip extension.',
  },
  {
    id: 'calf-raise', name: 'Standing Calf Raise', category: 'legs', equipment: 'machine',
    muscles: [{ muscleId: 'calves', type: 'primary' }, { muscleId: 'hamstrings', type: 'secondary' }],
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
    muscles: [{ muscleId: 'glutes', type: 'primary' }, { muscleId: 'hamstrings', type: 'secondary' }],
    recommendedLevelRange: [2, 25], description: 'Glute isolation via cable.',
  },

  // ── CORE ──────────────────────────────────────────────────────────────
  {
    id: 'crunch', name: 'Crunch', category: 'core', equipment: 'bodyweight',
    muscles: [{ muscleId: 'upper_abs', type: 'primary' }, { muscleId: 'hip_flexors', type: 'secondary' }],
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

  // ── CARDIO ────────────────────────────────────────────────────────────
  {
    id: 'running', name: 'Running', category: 'cardio', equipment: 'bodyweight', tracking_type: 'cardio',
    muscles: [{ muscleId: 'quads', type: 'secondary' }, { muscleId: 'hamstrings', type: 'secondary' }, { muscleId: 'calves', type: 'secondary' }],
    recommendedLevelRange: [1, 100], description: 'Steady-state running. Log distance and duration.',
  },
  {
    id: 'sprint', name: 'Sprint Intervals', category: 'cardio', equipment: 'bodyweight', tracking_type: 'cardio',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'hamstrings', type: 'primary' }, { muscleId: 'calves', type: 'secondary' }, { muscleId: 'glutes', type: 'secondary' }],
    recommendedLevelRange: [3, 80], description: 'Max-effort short sprints. Each set = one sprint.',
  },
  {
    id: 'cycling', name: 'Cycling', category: 'cardio', equipment: 'machine', tracking_type: 'cardio',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'calves', type: 'secondary' }, { muscleId: 'glutes', type: 'secondary' }],
    recommendedLevelRange: [1, 80], description: 'Stationary or outdoor cycling.',
  },
  {
    id: 'rowing-machine', name: 'Rowing Machine', category: 'cardio', equipment: 'machine', tracking_type: 'cardio',
    muscles: [{ muscleId: 'lats', type: 'primary' }, { muscleId: 'rhomboids', type: 'secondary' }, { muscleId: 'hamstrings', type: 'secondary' }, { muscleId: 'quads', type: 'secondary' }],
    recommendedLevelRange: [1, 80], description: 'Full-body cardio ergometer.',
  },
  {
    id: 'jump-rope', name: 'Jump Rope', category: 'cardio', equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [{ muscleId: 'calves', type: 'primary' }, { muscleId: 'quads', type: 'secondary' }, { muscleId: 'forearms', type: 'secondary' }],
    recommendedLevelRange: [1, 60], description: 'Jump rope rounds.',
  },
  {
    id: 'burpee', name: 'Burpee', category: 'cardio', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'chest', type: 'secondary' }, { muscleId: 'quads', type: 'secondary' }, { muscleId: 'upper_abs', type: 'secondary' }, { muscleId: 'front_delts', type: 'secondary' }],
    recommendedLevelRange: [1, 60], description: 'Full-body conditioning movement.',
  },
  {
    id: 'sled-push', name: 'Sled Push', category: 'cardio', equipment: 'machine', tracking_type: 'cardio',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'primary' }, { muscleId: 'calves', type: 'secondary' }, { muscleId: 'hamstrings', type: 'secondary' }],
    recommendedLevelRange: [3, 60], description: 'Sled-resisted push for power and conditioning.',
  },
  {
    id: 'mobility', name: 'Stretching / Mobility', category: 'cardio', equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [{ muscleId: 'hamstrings', type: 'secondary' }, { muscleId: 'quads', type: 'secondary' }],
    recommendedLevelRange: [1, 100], description: 'Active recovery, dynamic stretching, mobility flow.',
  },

  // ── PLYOMETRICS ───────────────────────────────────────────────────────
  {
    id: 'box-jump', name: 'Box Jump', category: 'legs', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'primary' }, { muscleId: 'calves', type: 'secondary' }],
    recommendedLevelRange: [2, 50], description: 'Explosive vertical jump onto a box.',
  },
  {
    id: 'jump-squat', name: 'Jump Squat', category: 'legs', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'primary' }, { muscleId: 'calves', type: 'secondary' }],
    recommendedLevelRange: [1, 40], description: 'Squat with an explosive jump at the top.',
  },
  {
    id: 'broad-jump', name: 'Broad Jump', category: 'legs', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'primary' }, { muscleId: 'calves', type: 'secondary' }, { muscleId: 'hip_flexors', type: 'secondary' }],
    recommendedLevelRange: [2, 50], description: 'Maximum-distance forward jump.',
  },
  {
    id: 'tuck-jump', name: 'Tuck Jump', category: 'legs', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'hip_flexors', type: 'primary' }, { muscleId: 'calves', type: 'secondary' }],
    recommendedLevelRange: [2, 40], description: 'Jump pulling knees to chest.',
  },
  {
    id: 'plyometric-push-up', name: 'Plyometric Push-Up', category: 'push', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'chest', type: 'primary' }, { muscleId: 'triceps', type: 'primary' }, { muscleId: 'front_delts', type: 'secondary' }],
    recommendedLevelRange: [5, 50], description: 'Explosive push-up with hands leaving the floor.',
  },
  {
    id: 'single-leg-hop', name: 'Single-Leg Hop', category: 'legs', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'primary' }, { muscleId: 'calves', type: 'secondary' }],
    recommendedLevelRange: [2, 40], description: 'Unilateral hop for power and balance.',
  },

  // ── CONDITIONING / COMBAT ─────────────────────────────────────────────
  {
    id: 'battle-rope', name: 'Battle Ropes', category: 'cardio', equipment: 'machine', tracking_type: 'duration',
    muscles: [{ muscleId: 'front_delts', type: 'primary' }, { muscleId: 'forearms', type: 'primary' }, { muscleId: 'upper_abs', type: 'secondary' }, { muscleId: 'lats', type: 'secondary' }],
    recommendedLevelRange: [2, 50], description: 'High-intensity rope waves for conditioning.',
  },
  {
    id: 'heavy-bag', name: 'Heavy Bag Punching', category: 'cardio', equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [{ muscleId: 'front_delts', type: 'primary' }, { muscleId: 'upper_abs', type: 'secondary' }, { muscleId: 'obliques', type: 'secondary' }, { muscleId: 'triceps', type: 'secondary' }],
    recommendedLevelRange: [2, 80], description: 'Round-based bag work. Log time per round.',
  },
  {
    id: 'shadow-boxing', name: 'Shadow Boxing', category: 'cardio', equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [{ muscleId: 'front_delts', type: 'primary' }, { muscleId: 'upper_abs', type: 'secondary' }, { muscleId: 'obliques', type: 'secondary' }, { muscleId: 'calves', type: 'secondary' }],
    recommendedLevelRange: [1, 60], description: 'Shadow boxing or sparring footwork.',
  },
  {
    id: 'roundhouse-kick', name: 'Roundhouse Kick', category: 'cardio', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'hip_flexors', type: 'primary' }, { muscleId: 'obliques', type: 'primary' }, { muscleId: 'quads', type: 'secondary' }, { muscleId: 'glutes', type: 'secondary' }],
    recommendedLevelRange: [2, 60], description: 'Kick drills on a bag or pad.',
  },
  {
    id: 'tire-flip', name: 'Tire Flip', category: 'compound', equipment: 'machine', tracking_type: 'strength',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'primary' }, { muscleId: 'lower_back', type: 'primary' }, { muscleId: 'traps', type: 'secondary' }, { muscleId: 'biceps', type: 'secondary' }],
    recommendedLevelRange: [5, 70], description: 'Heavy tire flip for total-body strength and power.',
  },
  {
    id: 'med-ball-slam', name: 'Medicine Ball Slam', category: 'core', equipment: 'machine', tracking_type: 'strength',
    muscles: [{ muscleId: 'upper_abs', type: 'primary' }, { muscleId: 'lats', type: 'primary' }, { muscleId: 'front_delts', type: 'secondary' }],
    recommendedLevelRange: [1, 50], description: 'Overhead medicine ball slam for explosive power.',
  },

  // ── GRIP / FUNCTIONAL ─────────────────────────────────────────────────
  {
    id: 'rope-climb', name: 'Rope Climb', category: 'pull', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'lats', type: 'primary' }, { muscleId: 'biceps', type: 'primary' }, { muscleId: 'forearms', type: 'primary' }, { muscleId: 'upper_abs', type: 'secondary' }],
    recommendedLevelRange: [5, 70], description: 'Climb a rope using arms (and optionally legs).',
  },
  {
    id: 'plate-pinch-carry', name: 'Plate Pinch Carry', category: 'compound', equipment: 'barbell', tracking_type: 'duration',
    muscles: [{ muscleId: 'forearms', type: 'primary' }, { muscleId: 'traps', type: 'secondary' }],
    recommendedLevelRange: [3, 50], description: 'Pinch plates between fingers and walk — pure grip.',
  },
  {
    id: 'wrist-roller', name: 'Wrist Roller', category: 'pull', equipment: 'machine', tracking_type: 'strength',
    muscles: [{ muscleId: 'forearms', type: 'primary' }],
    recommendedLevelRange: [2, 40], description: 'Roll weight up and down on a wrist roller.',
  },
  {
    id: 'dead-hang', name: 'Dead Hang', category: 'pull', equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [{ muscleId: 'forearms', type: 'primary' }, { muscleId: 'lats', type: 'secondary' }],
    recommendedLevelRange: [1, 40], description: 'Hang from a bar as long as possible.',
  },
  {
    id: 'muscle-up', name: 'Muscle-Up', category: 'pull', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'lats', type: 'primary' }, { muscleId: 'chest', type: 'primary' }, { muscleId: 'triceps', type: 'primary' }, { muscleId: 'biceps', type: 'secondary' }],
    recommendedLevelRange: [10, 80], description: 'Pull-up transitioning into a dip — elite movement.',
  },

  // ── ADVANCED CORE ─────────────────────────────────────────────────────
  {
    id: 'dragon-flag', name: 'Dragon Flag', category: 'core', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'upper_abs', type: 'primary' }, { muscleId: 'lower_abs', type: 'primary' }, { muscleId: 'obliques', type: 'secondary' }],
    recommendedLevelRange: [10, 70], description: "Bruce Lee's signature core movement.",
  },
  {
    id: 'ab-wheel', name: 'Ab Wheel Rollout', category: 'core', equipment: 'machine', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'upper_abs', type: 'primary' }, { muscleId: 'lower_abs', type: 'primary' }, { muscleId: 'obliques', type: 'secondary' }, { muscleId: 'lats', type: 'secondary' }],
    recommendedLevelRange: [3, 50], description: 'Rollout from kneeling using an ab wheel.',
  },
  {
    id: 'sit-up', name: 'Sit-Up', category: 'core', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'upper_abs', type: 'primary' }, { muscleId: 'hip_flexors', type: 'secondary' }],
    recommendedLevelRange: [1, 30], description: 'Classic full sit-up movement.',
  },
  {
    id: 'l-sit-hold', name: 'L-Sit Hold', category: 'core', equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [{ muscleId: 'lower_abs', type: 'primary' }, { muscleId: 'hip_flexors', type: 'primary' }, { muscleId: 'triceps', type: 'secondary' }],
    recommendedLevelRange: [5, 60], description: 'Isometric L-sit hold — extreme core and hip flexor strength.',
  },
  {
    id: 'wall-sit', name: 'Wall Sit', category: 'legs', equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'secondary' }],
    recommendedLevelRange: [1, 30], description: 'Isometric squat against a wall.',
  },
  {
    id: 'high-knees', name: 'High Knees', category: 'cardio', equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [{ muscleId: 'hip_flexors', type: 'primary' }, { muscleId: 'quads', type: 'secondary' }, { muscleId: 'calves', type: 'secondary' }],
    recommendedLevelRange: [1, 40], description: 'Run in place driving knees high.',
  },
  {
    id: 'neck-bridge', name: 'Neck Bridge', category: 'core', equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [{ muscleId: 'traps', type: 'primary' }, { muscleId: 'lower_back', type: 'secondary' }],
    recommendedLevelRange: [5, 50], description: "Wrestler's neck bridge — train the neck.",
  },

  // ── EXTRAS ────────────────────────────────────────────────────────────
  {
    id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', category: 'legs', equipment: 'dumbbell', tracking_type: 'strength',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'primary' }, { muscleId: 'hamstrings', type: 'secondary' }],
    recommendedLevelRange: [2, 50], description: 'Unilateral squat with rear foot elevated.',
  },
  {
    id: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', category: 'push', equipment: 'dumbbell', tracking_type: 'strength',
    muscles: [{ muscleId: 'chest', type: 'primary' }, { muscleId: 'front_delts', type: 'secondary' }, { muscleId: 'triceps', type: 'secondary' }],
    recommendedLevelRange: [2, 40], description: 'Flat bench press with dumbbells.',
  },
  {
    id: 'trx-row', name: 'TRX / Inverted Row', category: 'pull', equipment: 'machine', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'lats', type: 'primary' }, { muscleId: 'rhomboids', type: 'primary' }, { muscleId: 'biceps', type: 'secondary' }, { muscleId: 'rear_delts', type: 'secondary' }],
    recommendedLevelRange: [1, 30], description: 'Suspension or inverted row.',
  },
  {
    id: 'ladder-drill', name: 'Agility Ladder', category: 'cardio', equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [{ muscleId: 'calves', type: 'primary' }, { muscleId: 'hip_flexors', type: 'secondary' }, { muscleId: 'quads', type: 'secondary' }],
    recommendedLevelRange: [1, 50], description: 'Footwork through an agility ladder.',
  },
  {
    id: 'cone-drill', name: 'Cone Zigzag Drill', category: 'cardio', equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'calves', type: 'secondary' }, { muscleId: 'glutes', type: 'secondary' }],
    recommendedLevelRange: [1, 50], description: 'Direction-change drill between cones.',
  },

  // ── COMMON STRENGTH (added) ─────────────────────────────────────────────
  {
    id: 'goblet-squat', name: 'Goblet Squat', category: 'legs', equipment: 'dumbbell', tracking_type: 'strength',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'secondary' }],
    recommendedLevelRange: [1, 30], description: 'Front-loaded dumbbell squat — great for technique.',
  },
  {
    id: 'front-squat', name: 'Front Squat', category: 'legs', equipment: 'barbell', tracking_type: 'strength',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'upper_abs', type: 'secondary' }],
    recommendedLevelRange: [5, 50], description: 'Bar held at the shoulders — quad-dominant squat.',
  },
  {
    id: 'sumo-deadlift', name: 'Sumo Deadlift', category: 'compound', equipment: 'barbell', tracking_type: 'strength',
    muscles: [{ muscleId: 'glutes', type: 'primary' }, { muscleId: 'inner_thighs', type: 'secondary' }],
    recommendedLevelRange: [5, 60], description: 'Wide-stance deadlift — glute and adductor focus.',
  },
  {
    id: 'stiff-leg-deadlift', name: 'Stiff-Leg Deadlift', category: 'pull', equipment: 'barbell', tracking_type: 'strength',
    muscles: [{ muscleId: 'hamstrings', type: 'primary' }, { muscleId: 'lower_back', type: 'secondary' }],
    recommendedLevelRange: [3, 45], description: 'Minimal knee bend — hamstring stretch.',
  },
  {
    id: 't-bar-row', name: 'T-Bar Row', category: 'pull', equipment: 'machine', tracking_type: 'strength',
    muscles: [{ muscleId: 'lats', type: 'primary' }, { muscleId: 'rhomboids', type: 'secondary' }],
    recommendedLevelRange: [3, 40], description: 'Landmine row — back thickness builder.',
  },
  {
    id: 'one-arm-dumbbell-row', name: 'One-Arm Dumbbell Row', category: 'pull', equipment: 'dumbbell', tracking_type: 'strength',
    muscles: [{ muscleId: 'lats', type: 'primary' }, { muscleId: 'biceps', type: 'secondary' }],
    recommendedLevelRange: [2, 40], description: 'Single-arm row from a bench.',
  },
  {
    id: 'pendlay-row', name: 'Pendlay Row', category: 'pull', equipment: 'barbell', tracking_type: 'strength',
    muscles: [{ muscleId: 'lats', type: 'primary' }, { muscleId: 'rhomboids', type: 'secondary' }],
    recommendedLevelRange: [5, 45], description: 'Explosive bent-over row from the floor.',
  },
  {
    id: 'close-grip-bench', name: 'Close-Grip Bench Press', category: 'push', equipment: 'barbell', tracking_type: 'strength',
    muscles: [{ muscleId: 'triceps', type: 'primary' }, { muscleId: 'chest', type: 'secondary' }],
    recommendedLevelRange: [3, 40], description: 'Narrow-grip bench — tricep emphasis.',
  },
  {
    id: 'dumbbell-fly', name: 'Dumbbell Fly', category: 'push', equipment: 'dumbbell', tracking_type: 'strength',
    muscles: [{ muscleId: 'chest', type: 'primary' }, { muscleId: 'front_delts', type: 'secondary' }],
    recommendedLevelRange: [2, 30], description: 'Flat-bench chest fly.',
  },
  {
    id: 'preacher-curl', name: 'Preacher Curl', category: 'pull', equipment: 'barbell', tracking_type: 'strength',
    muscles: [{ muscleId: 'biceps', type: 'primary' }, { muscleId: 'forearms', type: 'secondary' }],
    recommendedLevelRange: [3, 35], description: 'Strict curl on a preacher bench.',
  },
  {
    id: 'concentration-curl', name: 'Concentration Curl', category: 'pull', equipment: 'dumbbell', tracking_type: 'strength',
    muscles: [{ muscleId: 'biceps', type: 'primary' }, { muscleId: 'forearms', type: 'secondary' }],
    recommendedLevelRange: [2, 30], description: 'Seated single-arm bicep isolation.',
  },
  {
    id: 'cable-lateral-raise', name: 'Cable Lateral Raise', category: 'push', equipment: 'cable', tracking_type: 'strength',
    muscles: [{ muscleId: 'side_delts', type: 'primary' }, { muscleId: 'front_delts', type: 'secondary' }],
    recommendedLevelRange: [2, 30], description: 'Constant-tension lateral raise.',
  },
  {
    id: 'front-raise', name: 'Front Raise', category: 'push', equipment: 'dumbbell', tracking_type: 'strength',
    muscles: [{ muscleId: 'front_delts', type: 'primary' }, { muscleId: 'side_delts', type: 'secondary' }],
    recommendedLevelRange: [1, 25], description: 'Anterior delt isolation.',
  },
  {
    id: 'dumbbell-shrug', name: 'Dumbbell Shrug', category: 'pull', equipment: 'dumbbell', tracking_type: 'strength',
    muscles: [{ muscleId: 'traps', type: 'primary' }, { muscleId: 'forearms', type: 'secondary' }],
    recommendedLevelRange: [1, 35], description: 'Upper trap shrug with dumbbells.',
  },
  {
    id: 'seated-calf-raise', name: 'Seated Calf Raise', category: 'legs', equipment: 'machine', tracking_type: 'strength',
    muscles: [{ muscleId: 'calves', type: 'primary' }, { muscleId: 'hamstrings', type: 'secondary' }],
    recommendedLevelRange: [1, 30], description: 'Soleus-emphasis calf raise.',
  },
  {
    id: 'step-up', name: 'Step-Up', category: 'legs', equipment: 'dumbbell', tracking_type: 'strength',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'secondary' }],
    recommendedLevelRange: [1, 35], description: 'Single-leg step up onto a bench or box.',
  },
  {
    id: 'walking-lunge', name: 'Walking Lunge', category: 'legs', equipment: 'dumbbell', tracking_type: 'strength',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'secondary' }],
    recommendedLevelRange: [2, 35], description: 'Lunges walking forward across the floor.',
  },
  {
    id: 'reverse-lunge', name: 'Reverse Lunge', category: 'legs', equipment: 'dumbbell', tracking_type: 'strength',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'secondary' }],
    recommendedLevelRange: [1, 30], description: 'Lunge stepping backward — knee-friendly.',
  },

  // ── CARDIO (added) ──────────────────────────────────────────────────────
  {
    id: 'elliptical', name: 'Elliptical', category: 'cardio', equipment: 'machine', tracking_type: 'cardio',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'secondary' }],
    recommendedLevelRange: [1, 80], description: 'Low-impact full-body cardio machine.',
  },
  {
    id: 'stair-climber', name: 'Stair Climber', category: 'cardio', equipment: 'machine', tracking_type: 'cardio',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'secondary' }],
    recommendedLevelRange: [1, 80], description: 'Continuous stair-stepping machine.',
  },
  {
    id: 'swimming', name: 'Swimming', category: 'cardio', equipment: 'bodyweight', tracking_type: 'cardio',
    muscles: [{ muscleId: 'lats', type: 'primary' }, { muscleId: 'chest', type: 'secondary' }],
    recommendedLevelRange: [1, 90], description: 'Pool laps — log distance and time.',
  },
  {
    id: 'brisk-walking', name: 'Brisk Walking', category: 'cardio', equipment: 'bodyweight', tracking_type: 'cardio',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'calves', type: 'secondary' }],
    recommendedLevelRange: [1, 60], description: 'Fast-paced walking, indoors or outdoors.',
  },
  {
    id: 'incline-walk', name: 'Incline Treadmill Walk', category: 'cardio', equipment: 'machine', tracking_type: 'cardio',
    muscles: [{ muscleId: 'glutes', type: 'primary' }, { muscleId: 'calves', type: 'secondary' }],
    recommendedLevelRange: [1, 60], description: 'Uphill walking on a treadmill — glute focus.',
  },
  {
    id: 'mountain-climber', name: 'Mountain Climbers', category: 'cardio', equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [{ muscleId: 'upper_abs', type: 'primary' }, { muscleId: 'hip_flexors', type: 'secondary' }],
    recommendedLevelRange: [1, 50], description: 'Plank position knee drives — core + cardio.',
  },

  // ── CALISTHENICS (added) ────────────────────────────────────────────────
  {
    id: 'chin-up', name: 'Chin-Up', category: 'pull', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'biceps', type: 'primary' }, { muscleId: 'lats', type: 'secondary' }],
    recommendedLevelRange: [3, 50], description: 'Underhand-grip pull-up — bicep-dominant.',
  },
  {
    id: 'wide-grip-pull-up', name: 'Wide-Grip Pull-Up', category: 'pull', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'lats', type: 'primary' }, { muscleId: 'rhomboids', type: 'secondary' }],
    recommendedLevelRange: [4, 55], description: 'Wide-grip pull-up — lat width focus.',
  },
  {
    id: 'diamond-push-up', name: 'Diamond Push-Up', category: 'push', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'triceps', type: 'primary' }, { muscleId: 'chest', type: 'secondary' }],
    recommendedLevelRange: [3, 35], description: 'Hands together push-up — tricep focus.',
  },
  {
    id: 'wide-grip-push-up', name: 'Wide-Grip Push-Up', category: 'push', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'chest', type: 'primary' }, { muscleId: 'front_delts', type: 'secondary' }],
    recommendedLevelRange: [2, 30], description: 'Hands wider than shoulders — outer chest.',
  },
  {
    id: 'decline-push-up', name: 'Decline Push-Up', category: 'push', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'chest', type: 'primary' }, { muscleId: 'front_delts', type: 'secondary' }],
    recommendedLevelRange: [3, 35], description: 'Feet elevated on a bench — upper chest emphasis.',
  },
  {
    id: 'incline-push-up', name: 'Incline Push-Up', category: 'push', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'chest', type: 'primary' }, { muscleId: 'triceps', type: 'secondary' }],
    recommendedLevelRange: [1, 20], description: 'Hands elevated — easier push-up variant.',
  },
  {
    id: 'pike-push-up', name: 'Pike Push-Up', category: 'push', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'front_delts', type: 'primary' }, { muscleId: 'triceps', type: 'secondary' }],
    recommendedLevelRange: [3, 40], description: 'Inverted-V push-up — shoulder press progression.',
  },
  {
    id: 'pistol-squat', name: 'Pistol Squat', category: 'legs', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'secondary' }],
    recommendedLevelRange: [8, 60], description: 'Single-leg bodyweight squat — advanced.',
  },
  {
    id: 'air-squat', name: 'Air Squat', category: 'legs', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'quads', type: 'primary' }, { muscleId: 'glutes', type: 'secondary' }],
    recommendedLevelRange: [1, 25], description: 'Bodyweight squat — fundamental movement.',
  },
  {
    id: 'bench-dip', name: 'Bench Dip', category: 'push', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'triceps', type: 'primary' }, { muscleId: 'front_delts', type: 'secondary' }],
    recommendedLevelRange: [1, 25], description: 'Hands on a bench, feet on floor — tricep dip.',
  },
  {
    id: 'glute-bridge', name: 'Glute Bridge', category: 'legs', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'glutes', type: 'primary' }, { muscleId: 'hamstrings', type: 'secondary' }],
    recommendedLevelRange: [1, 25], description: 'Floor hip thrust — glute activation.',
  },
  {
    id: 'side-plank', name: 'Side Plank', category: 'core', equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [{ muscleId: 'obliques', type: 'primary' }, { muscleId: 'upper_abs', type: 'secondary' }],
    recommendedLevelRange: [1, 30], description: 'Isometric side hold — obliques and stability.',
  },
  {
    id: 'hollow-body-hold', name: 'Hollow Body Hold', category: 'core', equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [{ muscleId: 'lower_abs', type: 'primary' }, { muscleId: 'upper_abs', type: 'secondary' }],
    recommendedLevelRange: [2, 40], description: 'Gymnastics core hold — banana shape on back.',
  },
  {
    id: 'superman-hold', name: 'Superman Hold', category: 'core', equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [{ muscleId: 'lower_back', type: 'primary' }, { muscleId: 'glutes', type: 'secondary' }],
    recommendedLevelRange: [1, 30], description: 'Prone arms-and-legs lift — posterior chain.',
  },
  {
    id: 'v-up', name: 'V-Up', category: 'core', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'upper_abs', type: 'primary' }, { muscleId: 'lower_abs', type: 'secondary' }],
    recommendedLevelRange: [3, 35], description: 'Simultaneous leg/torso raise — full ab contraction.',
  },
  {
    id: 'bicycle-crunch', name: 'Bicycle Crunch', category: 'core', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'obliques', type: 'primary' }, { muscleId: 'upper_abs', type: 'secondary' }],
    recommendedLevelRange: [1, 25], description: 'Alternating elbow-to-knee crunch.',
  },
  {
    id: 'flutter-kicks', name: 'Flutter Kicks', category: 'core', equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [{ muscleId: 'lower_abs', type: 'primary' }, { muscleId: 'hip_flexors', type: 'secondary' }],
    recommendedLevelRange: [1, 25], description: 'Alternating leg flutters lying on back.',
  },
  {
    id: 'reverse-crunch', name: 'Reverse Crunch', category: 'core', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'lower_abs', type: 'primary' }, { muscleId: 'upper_abs', type: 'secondary' }],
    recommendedLevelRange: [1, 25], description: 'Hips off the floor — lower ab emphasis.',
  },
  {
    id: 'bird-dog', name: 'Bird Dog', category: 'core', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [{ muscleId: 'lower_back', type: 'primary' }, { muscleId: 'glutes', type: 'secondary' }],
    recommendedLevelRange: [1, 20], description: 'Opposite arm/leg extension from quadruped — core stability.',
  },
]
