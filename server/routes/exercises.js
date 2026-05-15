import { Router } from 'express'
import db from '../db.js'

const router = Router()

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function getExerciseWithMuscles(id) {
  const ex = db.prepare('SELECT * FROM exercises WHERE id = ?').get(id)
  if (!ex) return null
  ex.muscles = db.prepare('SELECT muscle_id, type FROM exercise_muscles WHERE exercise_id = ?').all(id)
  return ex
}

// GET /api/exercises
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM exercises ORDER BY name ASC').all()
  for (const r of rows) {
    r.muscles = db.prepare('SELECT muscle_id, type FROM exercise_muscles WHERE exercise_id = ?').all(r.id)
  }
  res.json(rows)
})

// GET /api/exercises/:id
router.get('/:id', (req, res) => {
  const ex = getExerciseWithMuscles(req.params.id)
  if (!ex) return res.status(404).json({ error: 'Not found' })
  res.json(ex)
})

// POST /api/exercises
router.post('/', (req, res) => {
  const { name, category, equipment, tracking_type = 'strength', description = '', muscles = [] } = req.body
  if (!name || !category || !equipment) {
    return res.status(400).json({ error: 'name, category, equipment required' })
  }
  const id = uid()
  const insertEx = db.prepare(`
    INSERT INTO exercises (id, name, category, equipment, tracking_type, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  const insertMuscle = db.prepare(`
    INSERT INTO exercise_muscles (exercise_id, muscle_id, type) VALUES (?, ?, ?)
  `)
  db.transaction(() => {
    insertEx.run(id, name.trim(), category, equipment, tracking_type, description.trim())
    for (const m of muscles) {
      if (m.muscle_id && m.type) insertMuscle.run(id, m.muscle_id, m.type)
    }
  })()
  res.status(201).json(getExerciseWithMuscles(id))
})

// PUT /api/exercises/:id
router.put('/:id', (req, res) => {
  const { name, category, equipment, tracking_type, description, muscles } = req.body
  const ex = db.prepare('SELECT id FROM exercises WHERE id = ?').get(req.params.id)
  if (!ex) return res.status(404).json({ error: 'Not found' })

  const updateEx = db.prepare(`
    UPDATE exercises
    SET name = COALESCE(?, name),
        category = COALESCE(?, category),
        equipment = COALESCE(?, equipment),
        tracking_type = COALESCE(?, tracking_type),
        description = COALESCE(?, description)
    WHERE id = ?
  `)
  db.transaction(() => {
    updateEx.run(name ?? null, category ?? null, equipment ?? null, tracking_type ?? null, description ?? null, req.params.id)
    if (muscles) {
      db.prepare('DELETE FROM exercise_muscles WHERE exercise_id = ?').run(req.params.id)
      const ins = db.prepare('INSERT INTO exercise_muscles (exercise_id, muscle_id, type) VALUES (?, ?, ?)')
      for (const m of muscles) {
        if (m.muscle_id && m.type) ins.run(req.params.id, m.muscle_id, m.type)
      }
    }
  })()
  res.json(getExerciseWithMuscles(req.params.id))
})

// DELETE /api/exercises/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM exercises WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ ok: true })
})

export default router
