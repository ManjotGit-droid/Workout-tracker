import type { WeightUnit } from '../types'

export const KG_PER_LB = 0.453592

export const toKg = (value: number, unit: WeightUnit): number =>
  unit === 'lbs' ? value * KG_PER_LB : value

export const fromKg = (kg: number, unit: WeightUnit): number =>
  unit === 'lbs' ? kg / KG_PER_LB : kg

export const displayWeight = (kg: number, unit: WeightUnit): string => {
  const v = fromKg(kg, unit)
  return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)} ${unit}`
}

export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const formatDate = (iso: string): string => {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export const todayISO = (): string => {
  const d = new Date()
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 10)
}
