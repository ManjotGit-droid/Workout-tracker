import { useCallback, useRef } from 'react'

interface Options {
  /** Hold duration to fire in ms. Default 500. */
  threshold?: number
}

/**
 * Returns a set of pointer handlers that fire `onLongPress` when the user
 * holds for `threshold` ms without lifting / moving more than ~10px. A short
 * tap fires `onTap` instead (when provided). Mouse, touch, and stylus all
 * route through Pointer Events, so a single set of handlers covers them.
 */
export const useLongPress = (
  onLongPress: () => void,
  onTap?: () => void,
  { threshold = 500 }: Options = {},
) => {
  const timer = useRef<number | null>(null)
  const fired = useRef(false)
  const startPos = useRef<{ x: number; y: number } | null>(null)

  const cancel = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      fired.current = false
      startPos.current = { x: e.clientX, y: e.clientY }
      timer.current = window.setTimeout(() => {
        fired.current = true
        onLongPress()
      }, threshold)
    },
    [onLongPress, threshold],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startPos.current) return
      const dx = e.clientX - startPos.current.x
      const dy = e.clientY - startPos.current.y
      if (Math.hypot(dx, dy) > 10) cancel()
    },
    [cancel],
  )

  const onPointerUp = useCallback(() => {
    if (!fired.current && timer.current !== null) {
      cancel()
      onTap?.()
    } else {
      cancel()
    }
  }, [cancel, onTap])

  const onPointerCancel = useCallback(() => {
    cancel()
  }, [cancel])

  const onPointerLeave = useCallback(() => {
    cancel()
  }, [cancel])

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onPointerLeave }
}
