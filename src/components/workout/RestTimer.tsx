import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  /** Epoch ms when the rest started. Null = timer hidden. */
  startedAt: number | null
  /** Target rest duration in seconds. */
  duration: number
  onSkip: () => void
  onAdjust: (deltaSec: number) => void
}

const fmt = (s: number): string => {
  if (s < 0) s = 0
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

/**
 * Sticky rest-timer bar that floats above the BottomNav while a rest is in
 * progress. The visible countdown is derived from `startedAt + duration`,
 * advanced on a 250 ms interval so the seconds tick smoothly.
 *
 * When the countdown reaches zero the bar pulses and triggers a short
 * vibration (where supported) — the user dismisses it with the X.
 */
export const RestTimer = ({ startedAt, duration, onSkip, onAdjust }: Props) => {
  const [now, setNow] = useState<number>(() => Date.now())
  const [didVibrate, setDidVibrate] = useState(false)

  useEffect(() => {
    if (startedAt === null) return
    setDidVibrate(false)
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [startedAt])

  if (startedAt === null) return null

  const elapsedSec = Math.floor((now - startedAt) / 1000)
  const remainingSec = duration - elapsedSec
  const done = remainingSec <= 0
  const pct = Math.max(0, Math.min(100, (elapsedSec / duration) * 100))

  if (done && !didVibrate) {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.([100, 50, 100])
      }
    } catch {
      // best-effort — Safari etc. may reject
    }
    setDidVibrate(true)
  }

  return (
    <AnimatePresence>
      <motion.div
        key="rest-timer"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="fixed left-3 right-3 bottom-[78px] z-40 safe-bottom"
        role="timer"
        aria-label={`Rest timer ${fmt(remainingSec)}`}
      >
        <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl shadow-card ${done ? 'border-success/50 bg-success/10' : 'border-brand/40 bg-elevated/85'}`}>
          {/* Progress fill underlay */}
          <div
            className="absolute inset-0 origin-left transition-transform"
            style={{
              transform: `scaleX(${pct / 100})`,
              background: done ? 'var(--success)' : 'var(--brand)',
              opacity: done ? 0.18 : 0.12,
            }}
          />
          <div className="relative px-4 py-2.5 flex items-center gap-3">
            <div className={`text-[10px] font-mono uppercase tracking-widest ${done ? 'text-success' : 'text-text-muted'}`}>
              {done ? 'Rest done' : 'Rest'}
            </div>
            <div className={`text-base font-mono font-bold tabular-nums flex-1 ${done ? 'text-success' : 'text-text'}`}>
              {fmt(Math.max(0, remainingSec))}
            </div>
            <button
              onClick={() => onAdjust(-15)}
              aria-label="Subtract 15 seconds"
              className="text-text-muted hover:text-text border border-border rounded-md px-1.5 py-0.5 text-[11px] font-mono"
            >
              −15
            </button>
            <button
              onClick={() => onAdjust(15)}
              aria-label="Add 15 seconds"
              className="text-text-muted hover:text-text border border-border rounded-md px-1.5 py-0.5 text-[11px] font-mono"
            >
              +15
            </button>
            <button
              onClick={onSkip}
              aria-label="Skip rest"
              className="text-text-muted hover:text-text -mr-1 w-7 h-7 flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
