import { api } from './client'

export async function exportData(): Promise<void> {
  const res = await fetch('/api/data/export')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `workout-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importData(file: File): Promise<{ imported: { exercises: number; workouts: number } }> {
  const text = await file.text()
  const json = JSON.parse(text)
  return api.post('/data/import', json)
}

export async function resetData(): Promise<void> {
  await api.post('/data/reset')
}
