import { useState, useEffect, useRef } from 'react'

export function useWorkoutTimer(startTime: number | null): string {
  const [elapsed, setElapsed] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!startTime) {
      setElapsed(0)
      return
    }

    function tick() {
      setElapsed(Math.floor((Date.now() - startTime!) / 1000))
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [startTime])

  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
