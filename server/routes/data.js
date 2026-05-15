import { Router } from 'express'
import db from '../db.js'

const router = Router()

// GET /api/data/export
router.get('/export', (_req, res) => {
  const exercises = db.prepare('SELECT * FROM exercises').all()
  for (const ex of exercises) {
    ex.muscles = db.prepare('SELECT muscle_id, type FROM exercise_muscles WHERE exercise_id = ?').all(ex.id)
  }
  const workouts = db.prepare('SELECT * FROM workouts ORDER BY start_time ASC').all()
  for (const w of workouts) {
    const wexs = db.prepare('SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY sort_order ASC').all(w.id)
    for (const we of wexs) {
      we.sets = db.prepare('SELECT * FROM sets WHERE workout_exercise_id = ? ORDER BY timestamp ASC').all(we.id)
    }
    w.exercises = wexs
  }
  const muscleXp = db.prepare('SELECT * FROM muscle_xp').all()
  const settings = db.prepare('SELECT * FROM settings').all()

  res.setHeader('Content-Disposition', `attachment; filename="workout-backup-${new Date().toISOString().slice(0,10)}.json"`)
  res.json({ version: 1, exportedAt: new Date().toISOString(), exercises, workouts, muscleXp, settings })
})

// POST /api/data/import
router.post('/import', (req, res) => {
  const { exercises = [], workouts = [], muscleXp = [] } = req.body
  if (!Array.isArray(exercises) || !Array.isArray(workouts)) {
    return res.status(400).json({ error: 'Invalid backup format' })
  }

  db.transaction(() => {
    // Clear existing data (except seed exercises, we'll merge)
    db.prepare('DELETE FROM sets').run()
    db.prepare('DELETE FROM workout_exercises').run()
    db.prepare('DELETE FROM workouts').run()
    db.prepare('DELETE FROM exercises').run()
    db.prepare('DELETE FROM exercise_muscles').run()
    db.prepare('DELETE FROM muscle_xp').run()

    const insEx = db.prepare('INSERT OR REPLACE INTO exercises (id, name, category, equipment, tracking_type, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    const insMuscle = db.prepare('INSERT INTO exercise_muscles (exercise_id, muscle_id, type) VALUES (?, ?, ?)')
    for (const ex of exercises) {
      insEx.run(ex.id, ex.name, ex.category, ex.equipment, ex.tracking_type ?? 'strength', ex.description ?? '', ex.created_at ?? new Date().toISOString())
      for (const m of (ex.muscles ?? [])) {
        insMuscle.run(ex.id, m.muscle_id, m.type)
      }
    }

    const insW = db.prepare('INSERT OR REPLACE INTO workouts (id, date, start_time, end_time, completed, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    const insWE = db.prepare('INSERT OR REPLACE INTO workout_exercises (id, workout_id, exercise_id, sort_order) VALUES (?, ?, ?, ?)')
    const insS = db.prepare('INSERT OR REPLACE INTO sets (id, workout_exercise_id, reps, weight, duration, distance, completed, notes, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    for (const w of workouts) {
      insW.run(w.id, w.date, w.start_time, w.end_time ?? null, w.completed ?? 0, w.notes ?? '', w.created_at ?? new Date().toISOString())
      for (const we of (w.exercises ?? [])) {
        insWE.run(we.id, w.id, we.exercise_id, we.sort_order ?? 0)
        for (const s of (we.sets ?? [])) {
          insS.run(s.id, we.id, s.reps ?? null, s.weight ?? null, s.duration ?? null, s.distance ?? null, s.completed ?? 0, s.notes ?? '', s.timestamp)
        }
      }
    }

    const insXp = db.prepare('INSERT OR REPLACE INTO muscle_xp (muscle_id, level, xp, xp_to_next) VALUES (?, ?, ?, ?)')
    for (const m of muscleXp) {
      insXp.run(m.muscle_id, m.level, m.xp, m.xp_to_next)
    }
  })()

  res.json({ ok: true, imported: { exercises: exercises.length, workouts: workouts.length } })
})

// POST /api/data/reset
router.post('/reset', (_req, res) => {
  db.transaction(() => {
    db.prepare('DELETE FROM sets').run()
    db.prepare('DELETE FROM workout_exercises').run()
    db.prepare('DELETE FROM workouts').run()
    db.prepare('DELETE FROM muscle_xp').run()
    // Keep exercises (seed data)
  })()
  res.json({ ok: true })
})

export default router
