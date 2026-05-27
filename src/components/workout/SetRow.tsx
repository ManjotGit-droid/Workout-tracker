import { useState } from 'react'
import { motion } from 'framer-motion'
import { estimate1RM } from '../../utils/strength'
import type { LoggedSet, TrackingType } from '../../types'

// Format seconds → mm:ss display. Re-declared here so SetRow stays
// self-contained (also used by WorkoutActive for parsing).
const fmtDuration = (secs: number): string => {
  const m = Math.floor(secs / 60).toString()
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

interface ColConfig {
  grid: string
  labels: string[]
  fields: string[]
}

export const getColConfig = (type: TrackingType): ColConfig => {
  switch (type) {
    case 'strength':
      return { grid: 'grid-cols-[28px_1fr_1fr_44px]', labels: ['Reps', 'kg'], fields: ['reps', 'weight'] }
    case 'bodyweight':
      return { grid: 'grid-cols-[28px_1fr_1fr_44px]', labels: ['Reps', 'kg +'], fields: ['reps', 'weight'] }
    case 'duration':
      return { grid: 'grid-cols-[28px_1fr_1fr_44px]', labels: ['Time', 'kg +'], fields: ['duration', 'weight'] }
    case 'cardio':
      return { grid: 'grid-cols-[28px_1fr_1fr_44px]', labels: ['Time', 'Dist(m)'], fields: ['duration', 'distance'] }
  }
}

interface SetHeadersProps {
  trackingType: TrackingType
  weightUnit: string
}

export const SetHeaders = ({ trackingType, weightUnit }: SetHeadersProps) => {
  const cols = getColConfig(trackingType)
  return (
    <div className={`grid ${cols.grid} gap-2 text-xs font-mono text-sl-muted uppercase tracking-wider mb-1.5 px-1`}>
      <span>#</span>
      {cols.labels.map((l) => <span key={l}>{l === 'kg' ? weightUnit : l}</span>)}
      <span></span>
    </div>
  )
}

interface SetRowProps {
  idx: number
  set: LoggedSet
  trackingType: TrackingType
  weightUnit: string
  onPatch: (field: string, val: string) => void
  onToggle: () => void
  onRemove: () => void
  onOpenNotes: () => void
}

export const SetRow = ({
  idx,
  set,
  trackingType,
  weightUnit,
  onPatch,
  onToggle,
  onRemove,
  onOpenNotes,
}: SetRowProps) => {
  const cols = getColConfig(trackingType)
  // One-shot bg pulse fired when the user marks a set complete.
  const [justCompleted, setJustCompleted] = useState(false)

  const displayValue = (field: string): string => {
    if (field === 'reps') return String(set.reps ?? 10)
    if (field === 'weight') {
      if (!set.weight) return ''
      return weightUnit === 'lbs' ? (set.weight * 2.20462).toFixed(1) : set.weight.toFixed(1)
    }
    if (field === 'duration') return set.duration ? fmtDuration(set.duration) : ''
    if (field === 'distance') return set.distance ? String(set.distance) : ''
    return ''
  }

  const handleToggle = () => {
    if (!set.completed) {
      setJustCompleted(true)
      window.setTimeout(() => setJustCompleted(false), 650)
    }
    onToggle()
  }

  // Estimated 1RM (Epley) — only meaningful for strength tracking with both
  // reps and weight present.
  const showEst1RM = trackingType === 'strength' && (set.reps ?? 0) > 0 && (set.weight ?? 0) > 0
  const est1RMKg = showEst1RM ? estimate1RM(set.weight!, set.reps!) : 0
  const est1RMDisp = weightUnit === 'lbs' ? est1RMKg * 2.20462 : est1RMKg

  return (
    <div className={`rounded-lg px-1 py-1 transition-colors ${set.completed ? 'bg-sl-purple/10' : ''} ${justCompleted ? 'set-row-pulse' : ''}`}>
      <div className={`grid ${cols.grid} gap-2 items-center`}>
        <span className="text-xs font-mono text-sl-muted text-center tabular-nums">{idx + 1}</span>
        {cols.fields.map((field) => (
          <input
            key={field}
            type="text"
            inputMode={field === 'duration' ? 'text' : 'decimal'}
            defaultValue={displayValue(field)}
            placeholder={field === 'duration' ? '0:00' : field === 'distance' ? 'm' : '0'}
            onBlur={(e) => onPatch(field, e.target.value)}
            className="bg-sl-border/50 border border-sl-border rounded px-2 py-1 text-sm font-mono text-center text-sl-text focus:border-sl-purple outline-none w-full tabular-nums"
          />
        ))}
        <div className="flex gap-1">
          <button
            onClick={handleToggle}
            aria-label={set.completed ? 'Unmark set complete' : 'Mark set complete'}
            aria-pressed={set.completed}
            className={`w-7 h-8 rounded-lg border flex items-center justify-center transition-all ${
              set.completed ? 'bg-sl-purple border-sl-purple text-white' : 'border-sl-border text-sl-muted hover:border-sl-purple'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
              <motion.path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{ pathLength: set.completed ? 1 : 0, opacity: set.completed ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </svg>
          </button>
          <button
            onClick={onRemove}
            aria-label="Remove set"
            className="w-5 h-8 flex items-center justify-center text-sl-muted hover:text-sl-danger opacity-40 hover:opacity-100 transition-opacity"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pr-12 mt-0.5 text-[10px] font-mono">
        {showEst1RM && (
          <span className="text-text-muted/70 tabular-nums">
            est. 1RM {est1RMDisp.toFixed(1)} {weightUnit}
          </span>
        )}
        {(set.rpe !== undefined && set.rpe !== null) && (
          <span className="text-brand bg-brand/10 rounded px-1.5 py-0.5 tabular-nums">
            RPE {set.rpe}
          </span>
        )}
        <button
          onClick={onOpenNotes}
          aria-label="Edit set notes or RPE"
          className={`flex items-center gap-1 transition-colors ${set.notes || set.rpe ? 'text-brand' : 'text-text-muted/60 hover:text-text-muted'}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {set.notes ? <span className="max-w-[80px] truncate">{set.notes}</span> : <span>Note · RPE</span>}
        </button>
      </div>
    </div>
  )
}
