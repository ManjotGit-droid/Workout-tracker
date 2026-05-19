import { useState, useEffect, useRef } from 'react'

interface TimerOpts {
  /** Timestamp the workout started (ms). */
  startTime: number | null
  /** Timestamp the workout is currently paused at, or null when running. */
  pausedAt?: number | null
  /** Total accumulated paused duration so far (ms). */
  pausedDuration?: number
}

/**
 * Formats the elapsed active workout time as mm:ss / h:mm:ss.
 * Frozen while `pausedAt` is set so a paused workout shows a stable value.
 */
export const useWorkoutTimer = ({
  startTime,
  pausedAt,
  pausedDuration = 0,
}: TimerOpts): string => {
  const [elapsed, setElapsed] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!startTime) {
      setElapsed(0)
      return
    }

    // When paused, freeze the elapsed value at the moment of pause.
    if (pausedAt) {
      setElapsed(Math.floor((pausedAt - startTime - pausedDuration) / 1000))
      return
    }

    const tick = (): void => {
      const ms = Date.now() - startTime - pausedDuration
      setElapsed(Math.max(0, Math.floor(ms / 1000)))
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [startTime, pausedAt, pausedDuration])

  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
