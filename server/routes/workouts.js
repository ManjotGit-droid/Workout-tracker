import { Router } from 'express'
import db from '../db.js'

const router = Router()

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function getXPThreshold(level) {
  return Math.floor(100 * Math.pow(1.15, level - 1))
}

function applyXP(muscleId, gain) {
  let row = db.prepare('SELECT * FROM muscle_xp WHERE muscle_id = ?').get(muscleId)
  if (!row) {
    db.prepare('INSERT INTO muscle_xp (muscle_id, level, xp, xp_to_next) VALUES (?, 1, 0, 100)').run(muscleId)
    row = { muscle_id: muscleId, level: 1, xp: 0, xp_to_next: 100 }
  }
  let { level, xp, xp_to_next } = row
  xp += gain
  while (xp >= xp_to_next) {
    xp -= xp_to_next
    level++
    xp_to_next = getXPThreshold(level)
  }
  db.prepare('UPDATE muscle_xp SET level = ?, xp = ?, xp_to_next = ? WHERE muscle_id = ?')
    .run(level, xp, xp_to_next, muscleId)
}

function fullWorkout(id) {
  const w = db.prepare('SELECT * FROM workouts WHERE id = ?').get(id)
  if (!w) return null
  const wexs = db.prepare('SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY sort_order ASC').all(id)
  for (const we of wexs) {
    we.sets = db.prepare('SELECT * FROM sets WHERE workout_exercise_id = ? ORDER BY timestamp ASC').all(we.id)
    we.exercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get(we.exercise_id)
    if (we.exercise) {
      we.exercise.muscles = db.prepare('SELECT muscle_id, type FROM exercise_muscles WHERE exercise_id = ?').all(we.exercise_id)
    }
  }
  w.exercises = wexs
  return w
}

// GET /api/workouts
router.get('/', (_req, res) => {
  const rows = db.prepare(`
    SELECT w.*, count(we.id) as exercise_count
    FROM workouts w
    LEFT JOIN workout_exercises we ON we.workout_id = w.id
    GROUP BY w.id
    ORDER BY w.start_time DESC
  `).all()
  res.json(rows)
})

// GET /api/workouts/:id
router.get('/:id', (req, res) => {
  const w = fullWorkout(req.params.id)
  if (!w) return res.status(404).json({ error: 'Not found' })
  res.json(w)
})

// POST /api/workouts
router.post('/', (req, res) => {
  const id = uid()
  const now = Date.now()
  const date = req.body?.date ?? new Date().toISOString().slice(0, 10)
  db.prepare('INSERT INTO workouts (id, date, start_time, notes) VALUES (?, ?, ?, ?)').run(id, date, now, '')
  res.status(201).json(fullWorkout(id))
})

// PUT /api/workouts/:id
router.put('/:id', (req, res) => {
  const { notes, date } = req.body
  const w = db.prepare('SELECT id FROM workouts WHERE id = ?').get(req.params.id)
  if (!w) return res.status(404).json({ error: 'Not found' })
  db.prepare('UPDATE workouts SET notes = COALESCE(?, notes), date = COALESCE(?, date) WHERE id = ?')
    .run(notes ?? null, date ?? null, req.params.id)
  res.json(fullWorkout(req.params.id))
})

// DELETE /api/workouts/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM workouts WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ ok: true })
})

// POST /api/workouts/:id/complete
router.post('/:id/complete', (req, res) => {
  const w = db.prepare('SELECT * FROM workouts WHERE id = ?').get(req.params.id)
  if (!w) return res.status(404).json({ error: 'Not found' })
  db.prepare('UPDATE workouts SET completed = 1, end_time = ? WHERE id = ?').run(Date.now(), req.params.id)

  // Compute XP per muscle from completed sets
  const wexs = db.prepare('SELECT we.*, e.id as eid FROM workout_exercises we JOIN exercises e ON e.id = we.exercise_id WHERE we.workout_id = ?').all(req.params.id)
  const muscleXp = {}
  for (const we of wexs) {
    const sets = db.prepare('SELECT * FROM sets WHERE workout_exercise_id = ? AND completed = 1').all(we.id)
    const muscles = db.prepare('SELECT * FROM exercise_muscles WHERE exercise_id = ?').all(we.exercise_id)
    let setXp = 0
    for (const s of sets) {
      if (s.reps) setXp += s.reps * (s.weight ? 0.5 : 1)
      if (s.duration) setXp += Math.floor(s.duration / 30) * 5
      if (s.distance) setXp += Math.floor(s.distance / 100) * 3
    }
    for (const m of muscles) {
      const mult = m.type === 'primary' ? 1 : 0.5
      muscleXp[m.muscle_id] = (muscleXp[m.muscle_id] ?? 0) + Math.round(setXp * mult)
    }
  }

  db.transaction(() => {
    for (const [muscleId, xp] of Object.entries(muscleXp)) {
      if (xp > 0) applyXP(muscleId, xp)
    }
  })()

  res.json({ ok: true, muscleXp })
})

// ── Workout exercises ─────────────────────────────────────────────────────────

// POST /api/workouts/:id/exercises
router.post('/:id/exercises', (req, res) => {
  const { exercise_id } = req.body
  if (!exercise_id) return res.status(400).json({ error: 'exercise_id required' })
  const w = db.prepare('SELECT id FROM workouts WHERE id = ?').get(req.params.id)
  if (!w) return res.status(404).json({ error: 'Workout not found' })
  const ex = db.prepare('SELECT id FROM exercises WHERE id = ?').get(exercise_id)
  if (!ex) return res.status(404).json({ error: 'Exercise not found' })

  const count = db.prepare('SELECT count(*) as n FROM workout_exercises WHERE workout_id = ?').get(req.params.id)
  const weId = uid()
  db.prepare('INSERT INTO workout_exercises (id, workout_id, exercise_id, sort_order) VALUES (?, ?, ?, ?)').run(weId, req.params.id, exercise_id, count.n)
  res.status(201).json(fullWorkout(req.params.id))
})

// DELETE /api/workouts/:id/exercises/:weId
router.delete('/:id/exercises/:weId', (req, res) => {
  db.prepare('DELETE FROM workout_exercises WHERE id = ? AND workout_id = ?').run(req.params.weId, req.params.id)
  res.json(fullWorkout(req.params.id))
})

// ── Sets ──────────────────────────────────────────────────────────────────────

// POST /api/workouts/:id/exercises/:weId/sets
router.post('/:id/exercises/:weId/sets', (req, res) => {
  const { reps, weight, duration, distance, notes = '', completed = false } = req.body
  const we = db.prepare('SELECT id FROM workout_exercises WHERE id = ? AND workout_id = ?').get(req.params.weId, req.params.id)
  if (!we) return res.status(404).json({ error: 'Not found' })
  const setId = uid()
  db.prepare(`
    INSERT INTO sets (id, workout_exercise_id, reps, weight, duration, distance, completed, notes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(setId, req.params.weId, reps ?? null, weight ?? null, duration ?? null, distance ?? null, completed ? 1 : 0, notes, Date.now())
  res.status(201).json(db.prepare('SELECT * FROM sets WHERE id = ?').get(setId))
})

// PUT /api/workouts/:id/exercises/:weId/sets/:setId
router.put('/:id/exercises/:weId/sets/:setId', (req, res) => {
  const { reps, weight, duration, distance, notes, completed } = req.body
  const s = db.prepare('SELECT id FROM sets WHERE id = ? AND workout_exercise_id = ?').get(req.params.setId, req.params.weId)
  if (!s) return res.status(404).json({ error: 'Not found' })
  db.prepare(`
    UPDATE sets SET
      reps = COALESCE(?, reps),
      weight = COALESCE(?, weight),
      duration = COALESCE(?, duration),
      distance = COALESCE(?, distance),
      notes = COALESCE(?, notes),
      completed = CASE WHEN ? IS NOT NULL THEN ? ELSE completed END
    WHERE id = ?
  `).run(reps ?? null, weight ?? null, duration ?? null, distance ?? null, notes ?? null,
         completed !== undefined ? 1 : null, completed ? 1 : 0, req.params.setId)
  res.json(db.prepare('SELECT * FROM sets WHERE id = ?').get(req.params.setId))
})

// DELETE /api/workouts/:id/exercises/:weId/sets/:setId
router.delete('/:id/exercises/:weId/sets/:setId', (req, res) => {
  db.prepare('DELETE FROM sets WHERE id = ? AND workout_exercise_id = ?').run(req.params.setId, req.params.weId)
  res.json({ ok: true })
})

export default router
