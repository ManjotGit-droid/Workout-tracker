import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(join(DATA_DIR, 'workout.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ── Schema ────────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS exercises (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL,
    equipment   TEXT NOT NULL,
    tracking_type TEXT NOT NULL DEFAULT 'strength',
    description TEXT DEFAULT '',
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS exercise_muscles (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    muscle_id   TEXT NOT NULL,
    type        TEXT NOT NULL CHECK(type IN ('primary','secondary'))
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id          TEXT PRIMARY KEY,
    date        TEXT NOT NULL,
    start_time  INTEGER NOT NULL,
    end_time    INTEGER,
    completed   INTEGER DEFAULT 0,
    notes       TEXT DEFAULT '',
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS workout_exercises (
    id          TEXT PRIMARY KEY,
    workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL REFERENCES exercises(id),
    sort_order  INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS sets (
    id                  TEXT PRIMARY KEY,
    workout_exercise_id TEXT NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
    reps                INTEGER,
    weight              REAL,
    duration            INTEGER,
    distance            REAL,
    completed           INTEGER DEFAULT 0,
    notes               TEXT DEFAULT '',
    timestamp           INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS muscle_xp (
    muscle_id     TEXT PRIMARY KEY,
    level         INTEGER DEFAULT 1,
    xp            INTEGER DEFAULT 0,
    xp_to_next    INTEGER DEFAULT 100
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT
  );
`)

// ── Seed ──────────────────────────────────────────────────────────────────────

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

const SEED_EXERCISES = [
  // Strength
  { id: 'bench-press',        name: 'Bench Press',         category: 'push',  equipment: 'barbell',    tracking_type: 'strength',
    muscles: [['chest','primary'],['front_delts','secondary'],['triceps','secondary']] },
  { id: 'push-up',            name: 'Push Up',             category: 'push',  equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [['chest','primary'],['front_delts','secondary'],['triceps','secondary']] },
  { id: 'pull-up',            name: 'Pull Up',             category: 'pull',  equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [['lats','primary'],['biceps','secondary'],['rhomboids','secondary']] },
  { id: 'squat',              name: 'Squat',               category: 'legs',  equipment: 'barbell',    tracking_type: 'strength',
    muscles: [['quads','primary'],['glutes','primary'],['hamstrings','secondary']] },
  { id: 'deadlift',           name: 'Deadlift',            category: 'compound', equipment: 'barbell', tracking_type: 'strength',
    muscles: [['hamstrings','primary'],['glutes','primary'],['lower_back','primary'],['traps','secondary']] },
  { id: 'overhead-press',     name: 'Shoulder Press',      category: 'push',  equipment: 'barbell',    tracking_type: 'strength',
    muscles: [['front_delts','primary'],['side_delts','secondary'],['triceps','secondary']] },
  { id: 'biceps-curl',        name: 'Biceps Curl',         category: 'pull',  equipment: 'dumbbell',   tracking_type: 'strength',
    muscles: [['biceps','primary'],['forearms','secondary']] },
  { id: 'triceps-pushdown',   name: 'Triceps Pushdown',    category: 'push',  equipment: 'cable',      tracking_type: 'strength',
    muscles: [['triceps','primary']] },
  { id: 'lat-pulldown',       name: 'Lat Pulldown',        category: 'pull',  equipment: 'machine',    tracking_type: 'strength',
    muscles: [['lats','primary'],['biceps','secondary'],['rear_delts','secondary']] },
  { id: 'row',                name: 'Row',                 category: 'pull',  equipment: 'barbell',    tracking_type: 'strength',
    muscles: [['lats','primary'],['rhomboids','primary'],['biceps','secondary']] },
  { id: 'leg-press',          name: 'Leg Press',           category: 'legs',  equipment: 'machine',    tracking_type: 'strength',
    muscles: [['quads','primary'],['glutes','secondary'],['hamstrings','secondary']] },
  { id: 'calf-raise',         name: 'Calf Raise',          category: 'legs',  equipment: 'machine',    tracking_type: 'strength',
    muscles: [['calves','primary']] },
  // Duration-based
  { id: 'plank',              name: 'Plank',               category: 'core',  equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [['upper_abs','primary'],['lower_abs','primary'],['obliques','secondary'],['lower_back','secondary']] },
  { id: 'crunch',             name: 'Crunch',              category: 'core',  equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [['upper_abs','primary'],['obliques','secondary']] },
  // More compound
  { id: 'incline-bench-press',name: 'Incline Bench Press', category: 'push',  equipment: 'barbell',    tracking_type: 'strength',
    muscles: [['chest','primary'],['front_delts','primary'],['triceps','secondary']] },
  { id: 'dumbbell-fly',       name: 'Dumbbell Fly',        category: 'push',  equipment: 'dumbbell',   tracking_type: 'strength',
    muscles: [['chest','primary'],['front_delts','secondary']] },
  { id: 'lateral-raise',      name: 'Lateral Raise',       category: 'push',  equipment: 'dumbbell',   tracking_type: 'strength',
    muscles: [['side_delts','primary']] },
  { id: 'face-pull',          name: 'Face Pull',           category: 'pull',  equipment: 'cable',      tracking_type: 'strength',
    muscles: [['rear_delts','primary'],['rhomboids','secondary']] },
  { id: 'hip-thrust',         name: 'Hip Thrust',          category: 'legs',  equipment: 'barbell',    tracking_type: 'strength',
    muscles: [['glutes','primary'],['hamstrings','secondary']] },
  { id: 'leg-curl',           name: 'Leg Curl',            category: 'legs',  equipment: 'machine',    tracking_type: 'strength',
    muscles: [['hamstrings','primary']] },
  { id: 'leg-extension',      name: 'Leg Extension',       category: 'legs',  equipment: 'machine',    tracking_type: 'strength',
    muscles: [['quads','primary']] },
  { id: 'cable-fly',          name: 'Cable Fly',           category: 'push',  equipment: 'cable',      tracking_type: 'strength',
    muscles: [['chest','primary'],['front_delts','secondary']] },
  { id: 'dip',                name: 'Dip',                 category: 'push',  equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [['chest','primary'],['triceps','primary'],['front_delts','secondary']] },
  // Cardio
  { id: 'running',            name: 'Running',             category: 'cardio', equipment: 'bodyweight', tracking_type: 'cardio',
    muscles: [['quads','secondary'],['hamstrings','secondary'],['calves','secondary']] },
  { id: 'cycling',            name: 'Cycling',             category: 'cardio', equipment: 'machine',    tracking_type: 'cardio',
    muscles: [['quads','secondary'],['calves','secondary']] },
  { id: 'rowing-machine',     name: 'Rowing Machine',      category: 'cardio', equipment: 'machine',    tracking_type: 'cardio',
    muscles: [['lats','secondary'],['rhomboids','secondary'],['hamstrings','secondary']] },
  { id: 'jump-rope',          name: 'Jump Rope',           category: 'cardio', equipment: 'bodyweight', tracking_type: 'duration',
    muscles: [['calves','primary'],['quads','secondary']] },
  { id: 'burpee',             name: 'Burpee',              category: 'cardio', equipment: 'bodyweight', tracking_type: 'bodyweight',
    muscles: [['chest','secondary'],['quads','secondary'],['upper_abs','secondary']] },
]

const insertEx = db.prepare(`
  INSERT OR IGNORE INTO exercises (id, name, category, equipment, tracking_type, description)
  VALUES (@id, @name, @category, @equipment, @tracking_type, @description)
`)
const insertMuscle = db.prepare(`
  INSERT OR IGNORE INTO exercise_muscles (exercise_id, muscle_id, type)
  VALUES (?, ?, ?)
`)

const seedAll = db.transaction(() => {
  for (const ex of SEED_EXERCISES) {
    insertEx.run({ ...ex, description: ex.description ?? '' })
    for (const [muscleId, type] of ex.muscles) {
      insertMuscle.run(ex.id, muscleId, type)
    }
  }
})

// Only seed if exercises table is empty
const count = db.prepare('SELECT count(*) as n FROM exercises').get()
if (count.n === 0) seedAll()

export default db
