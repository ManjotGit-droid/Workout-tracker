export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface PlanSetSpec {
  sets: number
  reps?: number | 'AMRAP'   // 'AMRAP' = As Many Reps As Possible
  duration?: number          // seconds
  distance?: number          // metres
  weight?: number            // kg, optional suggestion
  note?: string
}

export interface PlanExercise extends PlanSetSpec {
  exerciseId: string         // DB id — must match src/data/exercises.ts
  displayName?: string       // override the DB exercise name in display
}

export interface PlanWorkout {
  dayType: string            // user-readable type name (matches values in weeklySchedule)
  exercises: PlanExercise[]
}

export interface AnimePlan {
  id: string
  character: string
  anime: string
  style: string
  goal: string
  mantra: string
  nutritionTip: string
  accentColor: string        // hex, used for the plan card glow
  weeklySchedule: Record<DayOfWeek, string>
  workouts: PlanWorkout[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Plans
// ─────────────────────────────────────────────────────────────────────────────

export const ANIME_PLANS: AnimePlan[] = [
  // ── GOKU ────────────────────────────────────────────────────────────────────
  {
    id: 'goku',
    character: 'Goku',
    anime: 'Dragon Ball Z',
    style: 'Full-Body Power + Cardio God Mode',
    goal: 'Superhuman strength, explosive power, and limitless endurance.',
    mantra: 'Plus Ultra — always push past your limits.',
    nutritionTip: 'Eat 6+ high-protein meals a day. Carb load before training. Sleep 9 hours minimum.',
    accentColor: '#f59e0b',
    weeklySchedule: {
      monday: 'Strength + Cardio',
      tuesday: 'Explosive Power',
      wednesday: 'Active Recovery + Core',
      thursday: 'Strength + Cardio',
      friday: 'Explosive Power',
      saturday: 'Full Body Beast Mode',
      sunday: 'Rest',
    },
    workouts: [
      {
        dayType: 'Strength + Cardio',
        exercises: [
          { exerciseId: 'barbell-squat', displayName: 'Barbell Back Squat', sets: 5, reps: 5, note: 'Go as heavy as possible' },
          { exerciseId: 'barbell-bench-press', displayName: 'Bench Press', sets: 5, reps: 5, note: 'Max weight' },
          { exerciseId: 'deadlift', sets: 4, reps: 4, note: 'Heavy — channel your Super Saiyan energy' },
          { exerciseId: 'pull-up', displayName: 'Pull-Ups', sets: 4, reps: 12 },
          { exerciseId: 'running', displayName: '5K Run', sets: 1, distance: 5000, note: 'Daily, no skipping' },
        ],
      },
      {
        dayType: 'Explosive Power',
        exercises: [
          { exerciseId: 'box-jump', displayName: 'Plyometric Box Jumps', sets: 5, reps: 10 },
          { exerciseId: 'power-clean', displayName: 'Power Cleans', sets: 5, reps: 5 },
          { exerciseId: 'battle-rope', displayName: 'Battle Ropes', sets: 5, duration: 45 },
          { exerciseId: 'sprint', displayName: 'Sprint Intervals (100m)', sets: 10, distance: 100, note: 'Max effort each sprint' },
          { exerciseId: 'med-ball-slam', displayName: 'Medicine Ball Slams', sets: 4, reps: 15 },
        ],
      },
      {
        dayType: 'Active Recovery + Core',
        exercises: [
          { exerciseId: 'plank', displayName: 'Plank Hold', sets: 4, duration: 60 },
          { exerciseId: 'leg-raise', displayName: 'Hanging Leg Raises', sets: 4, reps: 20 },
          { exerciseId: 'running', displayName: 'Light Jog', sets: 1, duration: 1800 },
          { exerciseId: 'mobility', displayName: 'Stretching / Mobility', sets: 1, duration: 1200 },
        ],
      },
      {
        dayType: 'Full Body Beast Mode',
        exercises: [
          { exerciseId: 'barbell-squat', displayName: 'Squat', sets: 6, reps: 6 },
          { exerciseId: 'pull-up', displayName: 'Weighted Pull-Ups', sets: 5, reps: 8, note: 'Add weight' },
          { exerciseId: 'overhead-press', sets: 4, reps: 8 },
          { exerciseId: 'farmers-carry', displayName: "Farmer's Carry", sets: 4, distance: 50 },
          { exerciseId: 'running', displayName: '10K Run', sets: 1, distance: 10000 },
        ],
      },
    ],
  },

  // ── BAKI ────────────────────────────────────────────────────────────────────
  {
    id: 'baki',
    character: 'Baki Hanma',
    anime: 'Baki the Grappler',
    style: 'Combat Strength + Muscle Control + Endurance',
    goal: 'Become the strongest creature on Earth — raw, brutal, functional muscle.',
    mantra: 'Stronger than yesterday — no matter what it takes.',
    nutritionTip: 'High protein, high calorie. Eat like a warrior preparing for battle.',
    accentColor: '#ef4444',
    weeklySchedule: {
      monday: 'Upper Body Strength',
      tuesday: 'Combat + Grip',
      wednesday: 'Lower Body + Core',
      thursday: 'Full Body Compound',
      friday: 'Combat + Endurance',
      saturday: 'Max Effort Day',
      sunday: 'Rest / Visualization',
    },
    workouts: [
      {
        dayType: 'Upper Body Strength',
        exercises: [
          { exerciseId: 'pull-up', displayName: 'Weighted Pull-Ups', sets: 5, reps: 10, note: 'Add weight every week' },
          { exerciseId: 'dumbbell-bench-press', sets: 5, reps: 8 },
          { exerciseId: 'barbell-row', sets: 4, reps: 8 },
          { exerciseId: 'dip', displayName: 'Weighted Dips', sets: 4, reps: 12, note: 'Add weight' },
          { exerciseId: 'push-up', displayName: 'Incline Push-Ups', sets: 3, reps: 25 },
        ],
      },
      {
        dayType: 'Combat + Grip',
        exercises: [
          { exerciseId: 'heavy-bag', displayName: 'Heavy Bag Punching', sets: 8, duration: 180, note: '3 min rounds, 1 min rest' },
          { exerciseId: 'rope-climb', sets: 5, reps: 1, note: 'No legs — arms only' },
          { exerciseId: 'plate-pinch-carry', sets: 4, duration: 45 },
          { exerciseId: 'pull-up', displayName: 'Towel Pull-Ups', sets: 3, reps: 8, note: 'Builds crushing grip strength' },
          { exerciseId: 'wrist-roller', sets: 4, reps: 10 },
        ],
      },
      {
        dayType: 'Lower Body + Core',
        exercises: [
          { exerciseId: 'barbell-squat', sets: 5, reps: 6 },
          { exerciseId: 'bulgarian-split-squat', sets: 4, reps: 10 },
          { exerciseId: 'box-jump', sets: 4, reps: 10 },
          { exerciseId: 'dragon-flag', sets: 4, reps: 8, note: "Bruce Lee's signature move — Baki approves" },
          { exerciseId: 'ab-wheel', displayName: 'Ab Wheel Rollout', sets: 4, reps: 15 },
        ],
      },
      {
        dayType: 'Full Body Compound',
        exercises: [
          { exerciseId: 'deadlift', sets: 5, reps: 5, note: 'Heavy' },
          { exerciseId: 'overhead-press', sets: 4, reps: 8 },
          { exerciseId: 'dip', displayName: 'Weighted Dips', sets: 4, reps: 10 },
          { exerciseId: 'barbell-curl', sets: 3, reps: 12 },
          { exerciseId: 'neck-bridge', sets: 3, duration: 30, note: 'Baki trains his neck religiously' },
        ],
      },
      {
        dayType: 'Combat + Endurance',
        exercises: [
          { exerciseId: 'shadow-boxing', displayName: 'Sparring / Shadow Boxing', sets: 10, duration: 180 },
          { exerciseId: 'burpee', displayName: 'Burpees', sets: 5, reps: 20 },
          { exerciseId: 'jump-rope', sets: 10, duration: 120 },
          { exerciseId: 'sprint', displayName: 'Hill Sprints', sets: 10, distance: 100 },
        ],
      },
      {
        dayType: 'Max Effort Day',
        exercises: [
          { exerciseId: 'deadlift', displayName: '1 Rep Max Deadlift', sets: 1, reps: 1 },
          { exerciseId: 'barbell-squat', displayName: '1 Rep Max Squat', sets: 1, reps: 1 },
          { exerciseId: 'pull-up', displayName: 'Max Pull-Ups (one set)', sets: 1, reps: 'AMRAP' },
          { exerciseId: 'push-up', displayName: 'Max Push-Ups (one set)', sets: 1, reps: 'AMRAP' },
        ],
      },
    ],
  },

  // ── ZORO ────────────────────────────────────────────────────────────────────
  {
    id: 'zoro',
    character: 'Roronoa Zoro',
    anime: 'One Piece',
    style: 'Raw Strength + Mental Fortitude + Sword Power',
    goal: "World's greatest swordsman physique — thick, powerful, relentless.",
    mantra: 'I will not die until I become the greatest. Don\'t ask for directions.',
    nutritionTip: 'Eat 3 massive meals. High protein. Drink water like you\'re crossing the Grand Line.',
    accentColor: '#10b981',
    weeklySchedule: {
      monday: 'Heavy Upper Body',
      tuesday: 'Leg + Posterior Chain',
      wednesday: 'Core + Grip',
      thursday: 'Heavy Upper Body',
      friday: 'Full Body Power',
      saturday: 'Endurance + Mental Toughness',
      sunday: 'Rest',
    },
    workouts: [
      {
        dayType: 'Heavy Upper Body',
        exercises: [
          { exerciseId: 'pull-up', displayName: 'Weighted Pull-Ups', sets: 5, reps: 8, note: 'Add a dumbbell between your feet' },
          { exerciseId: 'barbell-bench-press', sets: 5, reps: 5 },
          { exerciseId: 'barbell-row', sets: 4, reps: 8 },
          { exerciseId: 'overhead-press', sets: 4, reps: 6 },
          { exerciseId: 'push-up', displayName: 'One-Arm Push-Ups', sets: 3, reps: 10, note: 'Each side' },
        ],
      },
      {
        dayType: 'Leg + Posterior Chain',
        exercises: [
          { exerciseId: 'deadlift', sets: 5, reps: 5, note: 'Heavy — this is your bread and butter' },
          { exerciseId: 'barbell-squat', sets: 4, reps: 6 },
          { exerciseId: 'romanian-deadlift', sets: 4, reps: 10 },
          { exerciseId: 'lunge', displayName: 'Walking Lunges', sets: 4, reps: 20 },
          { exerciseId: 'calf-raise', sets: 4, reps: 25 },
        ],
      },
      {
        dayType: 'Core + Grip',
        exercises: [
          { exerciseId: 'farmers-carry', displayName: "Farmer's Carry", sets: 5, distance: 40, note: 'Heavy' },
          { exerciseId: 'ab-wheel', displayName: 'Ab Wheel Rollout', sets: 4, reps: 15 },
          { exerciseId: 'leg-raise', displayName: 'Hanging Leg Raises', sets: 4, reps: 20 },
          { exerciseId: 'rope-climb', sets: 4, reps: 1 },
          { exerciseId: 'plank', sets: 4, duration: 60 },
        ],
      },
      {
        dayType: 'Full Body Power',
        exercises: [
          { exerciseId: 'power-clean', sets: 5, reps: 5 },
          { exerciseId: 'barbell-squat', displayName: 'Squat', sets: 4, reps: 5 },
          { exerciseId: 'dip', displayName: 'Weighted Dips', sets: 4, reps: 10 },
          { exerciseId: 'muscle-up', displayName: 'Muscle-Ups', sets: 4, reps: 6 },
          { exerciseId: 'sled-push', sets: 5, distance: 30 },
        ],
      },
      {
        dayType: 'Endurance + Mental Toughness',
        exercises: [
          { exerciseId: 'running', displayName: '10K Run', sets: 1, distance: 10000, note: 'No stopping' },
          { exerciseId: 'push-up', displayName: '100 Push-Ups', sets: 1, reps: 100, note: 'Break into sets if needed' },
          { exerciseId: 'pull-up', displayName: '100 Pull-Ups', sets: 1, reps: 100 },
          { exerciseId: 'barbell-squat', displayName: '100 Squats', sets: 1, reps: 100 },
        ],
      },
    ],
  },

  // ── NARUTO ──────────────────────────────────────────────────────────────────
  {
    id: 'naruto',
    character: 'Naruto Uzumaki',
    anime: 'Naruto Shippuden',
    style: 'Endurance + Explosive Power + Never-Give-Up Grit',
    goal: 'Ninja-level cardio, explosive athleticism, and iron will.',
    mantra: 'Believe it! Never give up, no matter what.',
    nutritionTip: 'Carb load. Stay hydrated. High protein snacks between missions.',
    accentColor: '#f97316',
    weeklySchedule: {
      monday: 'Explosive Power',
      tuesday: 'Cardio + Agility',
      wednesday: 'Upper Body + Core',
      thursday: 'Explosive Power',
      friday: 'Cardio + Agility',
      saturday: 'Full Body Circuit',
      sunday: 'Rest',
    },
    workouts: [
      {
        dayType: 'Explosive Power',
        exercises: [
          { exerciseId: 'jump-squat', sets: 4, reps: 20 },
          { exerciseId: 'plyometric-push-up', sets: 4, reps: 15 },
          { exerciseId: 'box-jump', sets: 5, reps: 10 },
          { exerciseId: 'broad-jump', sets: 4, reps: 10 },
          { exerciseId: 'tuck-jump', sets: 4, reps: 15 },
        ],
      },
      {
        dayType: 'Cardio + Agility',
        exercises: [
          { exerciseId: 'running', displayName: '5K Run', sets: 1, distance: 5000, note: 'Push your pace each week' },
          { exerciseId: 'ladder-drill', sets: 5, duration: 120 },
          { exerciseId: 'sprint', displayName: '100m Sprint Intervals', sets: 10, distance: 100 },
          { exerciseId: 'jump-rope', sets: 8, duration: 180 },
          { exerciseId: 'cone-drill', sets: 5, duration: 120 },
        ],
      },
      {
        dayType: 'Upper Body + Core',
        exercises: [
          { exerciseId: 'push-up', sets: 5, reps: 30 },
          { exerciseId: 'pull-up', sets: 4, reps: 15 },
          { exerciseId: 'dip', sets: 4, reps: 15 },
          { exerciseId: 'plank', sets: 4, duration: 60 },
          { exerciseId: 'leg-raise', displayName: 'Hanging Knee Raises', sets: 4, reps: 20 },
        ],
      },
      {
        dayType: 'Full Body Circuit',
        exercises: [
          { exerciseId: 'burpee', sets: 5, reps: 20, note: 'No rest between sets' },
          { exerciseId: 'pull-up', sets: 4, reps: 15 },
          { exerciseId: 'jump-squat', sets: 4, reps: 20 },
          { exerciseId: 'push-up', sets: 4, reps: 30 },
          { exerciseId: 'running', displayName: '10K Run', sets: 1, distance: 10000, note: 'Finish strong' },
        ],
      },
    ],
  },

  // ── ROCK LEE ────────────────────────────────────────────────────────────────
  {
    id: 'rock-lee',
    character: 'Rock Lee',
    anime: 'Naruto',
    style: 'Pure Taijutsu — Leg Power + Insane Endurance',
    goal: 'Maximum leg speed, kicking power, and cardiovascular dominance.',
    mantra: 'A dropout will beat a genius through hard work.',
    nutritionTip: 'Carb heavy. Pre-workout meal 1 hour before training. Protein recovery shake post-workout.',
    accentColor: '#22c55e',
    weeklySchedule: {
      monday: 'Leg Power',
      tuesday: 'Kick Drills + Cardio',
      wednesday: 'Full Body Endurance',
      thursday: 'Leg Power',
      friday: 'Kick Drills + Cardio',
      saturday: 'The Rock Lee Challenge',
      sunday: 'Rest',
    },
    workouts: [
      {
        dayType: 'Leg Power',
        exercises: [
          { exerciseId: 'barbell-squat', sets: 5, reps: 8, note: 'Wear ankle weights during warm-up' },
          { exerciseId: 'leg-press', sets: 5, reps: 15 },
          { exerciseId: 'jump-squat', sets: 5, reps: 20 },
          { exerciseId: 'calf-raise', sets: 5, reps: 50, note: 'Rock Lee has elite calves' },
          { exerciseId: 'bulgarian-split-squat', sets: 4, reps: 12, note: 'Each leg' },
        ],
      },
      {
        dayType: 'Kick Drills + Cardio',
        exercises: [
          { exerciseId: 'roundhouse-kick', displayName: 'Roundhouse Kick Drills', sets: 1, reps: 200, note: '100 each leg on bag or pad' },
          { exerciseId: 'jump-rope', sets: 10, duration: 180 },
          { exerciseId: 'sprint', displayName: 'Sprint Intervals (50m)', sets: 15, distance: 50 },
          { exerciseId: 'high-knees', sets: 5, duration: 45 },
          { exerciseId: 'wall-sit', sets: 5, duration: 90 },
        ],
      },
      {
        dayType: 'Full Body Endurance',
        exercises: [
          { exerciseId: 'push-up', sets: 5, reps: 50 },
          { exerciseId: 'pull-up', sets: 5, reps: 20 },
          { exerciseId: 'sit-up', sets: 5, reps: 50 },
          { exerciseId: 'burpee', sets: 5, reps: 20 },
          { exerciseId: 'running', displayName: '5K Run with Ankle Weights', sets: 1, distance: 5000 },
        ],
      },
      {
        dayType: 'The Rock Lee Challenge',
        exercises: [
          { exerciseId: 'push-up', displayName: '500 Push-Ups', sets: 1, reps: 500, note: 'Break into sets — finish them all' },
          { exerciseId: 'sit-up', displayName: '500 Sit-Ups', sets: 1, reps: 500 },
          { exerciseId: 'barbell-squat', displayName: '500 Squats (bodyweight)', sets: 1, reps: 500 },
          { exerciseId: 'running', displayName: '10K Run', sets: 1, distance: 10000, note: 'After completing the above' },
        ],
      },
    ],
  },

  // ── LUFFY ───────────────────────────────────────────────────────────────────
  {
    id: 'luffy',
    character: 'Monkey D. Luffy',
    anime: 'One Piece',
    style: 'Functional Strength + Agility + Rubber-Band Flexibility',
    goal: 'Wild, unpredictable athleticism — core strength, reach, and relentless forward momentum.',
    mantra: "I'm gonna be King of the Pirates! Just keep moving forward.",
    nutritionTip: 'Eat massive amounts — especially meat. Fuel accordingly.',
    accentColor: '#dc2626',
    weeklySchedule: {
      monday: 'Core + Functional',
      tuesday: 'Agility + Cardio',
      wednesday: 'Upper Body Pull + Grip',
      thursday: 'Core + Functional',
      friday: 'Agility + Cardio',
      saturday: 'Adventure Mode',
      sunday: 'Rest',
    },
    workouts: [
      {
        dayType: 'Core + Functional',
        exercises: [
          { exerciseId: 'leg-raise', displayName: 'Hanging Leg Raises', sets: 4, reps: 20 },
          { exerciseId: 'dragon-flag', sets: 4, reps: 8 },
          { exerciseId: 'med-ball-slam', sets: 5, reps: 15 },
          { exerciseId: 'tire-flip', sets: 5, reps: 10, note: 'Gum-Gum power vibes' },
          { exerciseId: 'l-sit-hold', displayName: 'L-Sit Hold', sets: 4, duration: 30 },
        ],
      },
      {
        dayType: 'Agility + Cardio',
        exercises: [
          { exerciseId: 'ladder-drill', sets: 6, duration: 120 },
          { exerciseId: 'broad-jump', sets: 5, reps: 10 },
          { exerciseId: 'sprint', displayName: 'Sprint Intervals (100m)', sets: 8, distance: 100 },
          { exerciseId: 'jump-rope', sets: 8, duration: 120 },
          { exerciseId: 'cone-drill', sets: 5, duration: 120 },
        ],
      },
      {
        dayType: 'Upper Body Pull + Grip',
        exercises: [
          { exerciseId: 'pull-up', sets: 5, reps: 15 },
          { exerciseId: 'rope-climb', sets: 5, reps: 1 },
          { exerciseId: 'trx-row', displayName: 'TRX Rows', sets: 4, reps: 15 },
          { exerciseId: 'dead-hang', sets: 4, duration: 60, note: "Builds Luffy's stretchy grip" },
          { exerciseId: 'barbell-row', sets: 4, reps: 10 },
        ],
      },
      {
        dayType: 'Adventure Mode',
        exercises: [
          { exerciseId: 'burpee', sets: 5, reps: 20 },
          { exerciseId: 'farmers-carry', displayName: 'Weighted Carry', sets: 5, distance: 50 },
          { exerciseId: 'running', displayName: '5K Trail Run', sets: 1, distance: 5000 },
          { exerciseId: 'rope-climb', sets: 3, reps: 2 },
        ],
      },
    ],
  },

  // ── SUNG JIN-WOO ────────────────────────────────────────────────────────────
  {
    id: 'jin-woo',
    character: 'Sung Jin-Woo',
    anime: 'Solo Leveling',
    style: 'Progressive Overload — The System Approach',
    goal: 'Start from the bottom. Level up every single day. Become the Shadow Monarch.',
    mantra: 'I alone level up. Miss the daily quest and face the penalty zone.',
    nutritionTip: 'Track everything. Protein first. Calorie surplus for strength days.',
    accentColor: '#9333ea',
    weeklySchedule: {
      monday: 'Daily Quest',
      tuesday: 'Strength Focus',
      wednesday: 'Agility Focus',
      thursday: 'Strength Focus',
      friday: 'Agility Focus',
      saturday: 'Boss Raid',
      sunday: 'Daily Quest',
    },
    workouts: [
      {
        dayType: 'Daily Quest',
        exercises: [
          { exerciseId: 'push-up', sets: 1, reps: 100 },
          { exerciseId: 'sit-up', sets: 1, reps: 100 },
          { exerciseId: 'barbell-squat', displayName: 'Squats (bodyweight ok)', sets: 1, reps: 100 },
          { exerciseId: 'running', displayName: '10K Run', sets: 1, distance: 10000, note: "Jin-Woo's punishment quest — daily or face the penalty" },
        ],
      },
      {
        dayType: 'Strength Focus',
        exercises: [
          { exerciseId: 'deadlift', sets: 5, reps: 5, note: 'Add weight every week — level up your stats' },
          { exerciseId: 'pull-up', displayName: 'Weighted Pull-Ups', sets: 4, reps: 8 },
          { exerciseId: 'barbell-squat', sets: 4, reps: 6 },
          { exerciseId: 'overhead-press', sets: 4, reps: 8 },
          { exerciseId: 'dip', displayName: 'Weighted Dips', sets: 4, reps: 10 },
        ],
      },
      {
        dayType: 'Agility Focus',
        exercises: [
          { exerciseId: 'sprint', displayName: 'Sprint Intervals (100m)', sets: 10, distance: 100 },
          { exerciseId: 'box-jump', sets: 5, reps: 10 },
          { exerciseId: 'ladder-drill', sets: 6, duration: 120 },
          { exerciseId: 'single-leg-hop', sets: 4, reps: 20, note: 'Each leg' },
          { exerciseId: 'jump-rope', sets: 8, duration: 180 },
        ],
      },
      {
        dayType: 'Boss Raid',
        exercises: [
          { exerciseId: 'deadlift', displayName: '1 Rep Max Deadlift', sets: 1, reps: 1, note: 'Test your level every week' },
          { exerciseId: 'barbell-squat', displayName: '1 Rep Max Squat', sets: 1, reps: 1 },
          { exerciseId: 'pull-up', displayName: 'Max Pull-Ups (one set)', sets: 1, reps: 'AMRAP' },
          { exerciseId: 'running', displayName: '5K Run — PR Attempt', sets: 1, distance: 5000, note: 'Beat your last time' },
          { exerciseId: 'push-up', displayName: 'Max Push-Ups (one set)', sets: 1, reps: 'AMRAP' },
        ],
      },
    ],
  },

  // ── YUJI ITADORI ────────────────────────────────────────────────────────────
  {
    id: 'yuji',
    character: 'Yuji Itadori',
    anime: 'Jujutsu Kaisen',
    style: 'Athletic Powerhouse — Speed + Striking + Durability',
    goal: 'Elite striker physique — fast-twitch explosiveness, punch force, and tank-like toughness.',
    mantra: 'Train hard, protect everyone.',
    nutritionTip: 'High protein + creatine. Lean bulk approach. Pre-workout for striking days.',
    accentColor: '#ec4899',
    weeklySchedule: {
      monday: 'Striking Power',
      tuesday: 'Speed + Agility',
      wednesday: 'Strength + Durability',
      thursday: 'Striking Power',
      friday: 'Speed + Agility',
      saturday: 'Full Combat Sim',
      sunday: 'Rest',
    },
    workouts: [
      {
        dayType: 'Striking Power',
        exercises: [
          { exerciseId: 'heavy-bag', displayName: 'Heavy Bag Punching', sets: 8, duration: 180, note: 'Full power — imagine cursed energy in every hit' },
          { exerciseId: 'plyometric-push-up', sets: 5, reps: 20 },
          { exerciseId: 'med-ball-slam', displayName: 'Medicine Ball Chest Pass', sets: 4, reps: 15 },
          { exerciseId: 'power-clean', sets: 5, reps: 5 },
          { exerciseId: 'overhead-tricep', displayName: 'Overhead Tricep Extension', sets: 4, reps: 12 },
        ],
      },
      {
        dayType: 'Speed + Agility',
        exercises: [
          { exerciseId: 'sprint', displayName: 'Sprint Intervals (40m)', sets: 12, distance: 40 },
          { exerciseId: 'cone-drill', displayName: 'Lateral Cone Drills', sets: 6, duration: 120 },
          { exerciseId: 'box-jump', sets: 5, reps: 10 },
          { exerciseId: 'shadow-boxing', displayName: 'Footwork Shadowboxing', sets: 6, duration: 180 },
          { exerciseId: 'jump-rope', displayName: 'Jump Rope (double unders)', sets: 8, duration: 120 },
        ],
      },
      {
        dayType: 'Strength + Durability',
        exercises: [
          { exerciseId: 'barbell-squat', sets: 5, reps: 5, note: "Heavy — Itadori's engine" },
          { exerciseId: 'deadlift', sets: 4, reps: 5 },
          { exerciseId: 'pull-up', displayName: 'Weighted Pull-Ups', sets: 4, reps: 8 },
          { exerciseId: 'farmers-carry', sets: 5, distance: 40 },
          { exerciseId: 'neck-bridge', displayName: 'Neck Bridge + Shrugs', sets: 3, duration: 30, note: 'Durability — absorb hits like Black Flash' },
        ],
      },
      {
        dayType: 'Full Combat Sim',
        exercises: [
          { exerciseId: 'shadow-boxing', displayName: 'Sparring / Shadowboxing', sets: 10, duration: 180, note: '10 rounds — go hard' },
          { exerciseId: 'burpee', displayName: 'Burpee Box Jumps', sets: 5, reps: 15 },
          { exerciseId: 'tire-flip', sets: 5, reps: 10 },
          { exerciseId: 'sled-push', sets: 6, distance: 30 },
          { exerciseId: 'running', displayName: '5K Run', sets: 1, distance: 5000, note: 'Finish strong' },
        ],
      },
    ],
  },
]
