import express from 'express'
import cors from 'cors'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import exercisesRouter from './routes/exercises.js'
import workoutsRouter from './routes/workouts.js'
import statsRouter from './routes/stats.js'
import dataRouter from './routes/data.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT ?? 3001

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// API routes
app.use('/api/exercises', exercisesRouter)
app.use('/api/workouts', workoutsRouter)
app.use('/api/stats', statsRouter)
app.use('/api/data', dataRouter)

// Serve built frontend in production
const distPath = join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('/{*path}', (_req, res) => {
  res.sendFile(join(distPath, 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  Workout Tracker API → http://localhost:${PORT}/api`)
  console.log(`  Phone access       → http://YOUR_LOCAL_IP:${PORT}\n`)
})
