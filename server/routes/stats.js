import { Router } from 'express'
import db from '../db.js'

const router = Router()

// GET /api/stats/summary
router.get('/summary', (_req, res) => {
  const totalWorkouts = db.prepare('SELECT count(*) as n FROM workouts WHERE completed = 1').get().n
  const lastWorkout = db.prepare('SELECT * FROM workouts WHERE completed = 1 ORDER BY end_time DESC LIMIT 1').get() ?? null

  // Streak: consecutive days with a completed workout (most recent streak)
  const workoutDates = db.prepare(
    "SELECT DISTINCT date FROM workouts WHERE completed = 1 ORDER BY date DESC"
  ).all().map(r => r.date)
  let streak = 0
  if (workoutDates.length > 0) {
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    let current = workoutDates[0] === today || workoutDates[0] === yesterday ? workoutDates[0] : null
    if (current) {
      streak = 1
      for (let i = 1; i < workoutDates.length; i++) {
        const prev = new Date(current)
        prev.setDate(prev.getDate() - 1)
        const expected = prev.toISOString().slice(0, 10)
        if (workoutDates[i] === expected) { streak++; current = expected }
        else break
      }
    }
  }

  // Weekly volume (kg*reps, last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
  const volume = db.prepare(`
    SELECT COALESCE(SUM(CASE WHEN s.weight IS NOT NULL AND s.reps IS NOT NULL THEN s.weight * s.reps ELSE 0 END), 0) as total
    FROM sets s
    JOIN workout_exercises we ON we.id = s.workout_exercise_id
    JOIN workouts w ON w.id = we.workout_id
    WHERE w.date >= ? AND w.completed = 1
  `).get(weekAgo).total

  // Most trained muscle groups (last 30 days)
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const topMuscles = db.prepare(`
    SELECT em.muscle_id, em.type, count(*) as freq
    FROM sets s
    JOIN workout_exercises we ON we.id = s.workout_exercise_id
    JOIN workouts w ON w.id = we.workout_id
    JOIN exercise_muscles em ON em.exercise_id = we.exercise_id
    WHERE w.date >= ? AND w.completed = 1
    GROUP BY em.muscle_id
    ORDER BY freq DESC
    LIMIT 5
  `).all(monthAgo)

  res.json({ totalWorkouts, lastWorkout, streak, weeklyVolume: Math.round(volume), topMuscles })
})

// GET /api/stats/muscles
router.get('/muscles', (_req, res) => {
  const rows = db.prepare('SELECT * FROM muscle_xp').all()
  // Return as object keyed by muscle_id
  const map = {}
  for (const r of rows) map[r.muscle_id] = r
  res.json(map)
})

// GET /api/stats/prs
router.get('/prs', (_req, res) => {
  // Personal record per exercise = max weight for a given reps
  const prs = db.prepare(`
    SELECT we.exercise_id, s.reps, max(s.weight) as weight, w.date
    FROM sets s
    JOIN workout_exercises we ON we.id = s.workout_exercise_id
    JOIN workouts w ON w.id = we.workout_id
    WHERE s.weight IS NOT NULL AND s.reps IS NOT NULL AND w.completed = 1
    GROUP BY we.exercise_id, s.reps
    ORDER BY we.exercise_id, s.reps
  `).all()
  // Best single-rep-equivalent: weight * (1 + reps/30)
  const best = {}
  for (const pr of prs) {
    const orm = pr.weight * (1 + pr.reps / 30)
    if (!best[pr.exercise_id] || orm > best[pr.exercise_id].orm) {
      best[pr.exercise_id] = { ...pr, orm }
    }
  }
  res.json(Object.values(best))
})

// GET /api/stats/volume?days=30
router.get('/volume', (req, res) => {
  const days = parseInt(req.query.days ?? '30', 10)
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
  const rows = db.prepare(`
    SELECT w.date,
           COALESCE(SUM(CASE WHEN s.weight IS NOT NULL AND s.reps IS NOT NULL THEN s.weight * s.reps ELSE 0 END), 0) as volume,
           count(DISTINCT w.id) as workouts
    FROM workouts w
    LEFT JOIN workout_exercises we ON we.workout_id = w.id
    LEFT JOIN sets s ON s.workout_exercise_id = we.id
    WHERE w.date >= ? AND w.completed = 1
    GROUP BY w.date
    ORDER BY w.date ASC
  `).all(since)
  res.json(rows)
})

// GET /api/stats/exercise/:id
router.get('/exercise/:id', (req, res) => {
  const rows = db.prepare(`
    SELECT w.date, s.reps, s.weight, s.duration, s.distance
    FROM sets s
    JOIN workout_exercises we ON we.id = s.workout_exercise_id
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.exercise_id = ? AND w.completed = 1
    ORDER BY w.date ASC, s.timestamp ASC
  `).all(req.params.id)
  res.json(rows)
})

export default router
