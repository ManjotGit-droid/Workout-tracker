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

/**
 * Renders a side-by-side front + back anatomical body diagram.
 *
 * Styling hooks (CSS classes you can target from any stylesheet):
 *
 *   .body-diagram                — top-level wrapper around both views
 *   .body-diagram__col           — column wrapping a single SVG
 *   .body-diagram__col--front    — front-view column
 *   .body-diagram__col--back     — back-view column
 *
 *   .body-svg                    — every SVG root (front + back)
 *   .body-svg--front | .body-svg--back
 *
 *   .body-outline                — the silhouette path (applied twice:
 *                                   once with --fill, once with --stroke
 *                                   modifier so you can style them separately)
 *   .body-outline--fill          — the bottom layer (skin fill)
 *   .body-outline--stroke        — the top stroke pass (drawn over muscles)
 *
 *   .body-muscle                 — every individual muscle path.  Adds
 *                                   `.is-activated` and `data-activated="true"`
 *                                   when that muscle is highlighted.
 *                                   The muscle id is also exposed via
 *                                   `id="..."` and `data-muscle-id="..."`
 *                                   so you can target specific muscles.
 *
 *   .body-anatomy-line(s)        — thin guideline strokes (sternum, ab grid,
 *                                   clavicle, spine, knee folds, etc.).
 *                                   Each line has a more-specific modifier
 *                                   like `--sternum`, `--abs-row`, `--spine`.
 *
 *   .body-decoration             — small cosmetic shapes (knee caps, hand dots).
 *                                   Modifiers: `--knee`, `--hand`.
 *
 * Body theme colours are CSS variables set by the theme:
 *   --body-skin, --body-muscle, --body-line, --body-outline
 */
export const BodyDiagram = ({
  activatedMuscleIds = [],
  interactive = false,
  onMuscleClick,
  className,
}: Props) => {
  const colors = useMuscleColors()

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
    <div className={`body-diagram flex gap-2 items-center justify-center ${className ?? ''}`}>
      <div className="body-diagram__col body-diagram__col--front" style={{ width: '48%', maxWidth: 180 }}>
        <BodyFront
          colors={colors}
          activated={activatedSvgIds}
          interactive={interactive}
          onMuscleClick={onMuscleClick}
        />
      </div>
      <div className="body-diagram__col body-diagram__col--back" style={{ width: '48%', maxWidth: 180 }}>
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
