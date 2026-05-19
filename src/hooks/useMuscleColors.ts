import { useAppStore } from '../store/AppContext'
import type { MuscleGroupId } from '../types'

/**
 * Returns the visual rendering colors for every muscle group on the body
 * diagram.  Each muscle has TWO states:
 *
 *  fill  — the default colour used when the muscle is NOT activated.
 *          We always use the same neutral "body muscle tone" so the figure
 *          reads as a unified anatomical drawing, regardless of XP level.
 *
 *  glow  — the colour used when the muscle IS activated (highlighted).
 *          This is the brand neon-cyan plus an outer glow.
 *
 * Both are CSS variables, so they automatically switch with the theme.
 *
 * The XP-level-based colour ramp lives on the MuscleDetail screen and the
 * muscles list — keeping it out of the silhouette removes the "dark blobs
 * on a white body" look and makes the figure look like a real anatomy chart.
 */
export const useMuscleColors = (): Record<MuscleGroupId, { fill: string; glow: string }> => {
  const { state } = useAppStore()
  const result = {} as Record<MuscleGroupId, { fill: string; glow: string }>

  const BODY_FILL = 'var(--body-muscle)'
  const BRAND_GLOW = 'var(--brand)'

  for (const id of Object.keys(state.profile.muscleGroups) as MuscleGroupId[]) {
    result[id] = { fill: BODY_FILL, glow: BRAND_GLOW }
  }
  return result
}
