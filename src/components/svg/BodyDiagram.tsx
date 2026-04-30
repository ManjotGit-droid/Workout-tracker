import { BodyFront } from './BodyFront'
import { BodyBack } from './BodyBack'
import { useMuscleColors } from '../../hooks/useMuscleColors'
import type { MuscleGroupId } from '../../types'
import { MUSCLE_GROUPS } from '../../data/muscleGroups'

interface Props {
  activatedMuscleIds?: MuscleGroupId[]
  interactive?: boolean
  onMuscleClick?: (id: MuscleGroupId) => void
  className?: string
}

export function BodyDiagram({ activatedMuscleIds = [], interactive = false, onMuscleClick, className }: Props) {
  const colors = useMuscleColors()

  // Build a set of SVG path IDs that should be activated
  const activatedSvgIds = new Set<string>()
  for (const muscleId of activatedMuscleIds) {
    const meta = MUSCLE_GROUPS[muscleId]
    if (meta) {
      for (const svgId of meta.svgIds) {
        activatedSvgIds.add(svgId)
      }
    }
  }

  return (
    <div className={`flex gap-2 items-center justify-center ${className ?? ''}`}>
      <div style={{ width: '48%', maxWidth: 180 }}>
        <BodyFront
          colors={colors}
          activated={activatedSvgIds}
          interactive={interactive}
          onMuscleClick={onMuscleClick}
        />
      </div>
      <div style={{ width: '48%', maxWidth: 180 }}>
        <BodyBack
          colors={colors}
          activated={activatedSvgIds}
          interactive={interactive}
          onMuscleClick={onMuscleClick}
        />
      </div>
    </div>
  )
}
