import { MuscleRegion } from './MuscleRegion'
import type { MuscleGroupId } from '../../types'

interface MuscleColors {
  fill: string
  glow: string
}

interface Props {
  colors: Record<MuscleGroupId, MuscleColors>
  activated?: Set<string>
  interactive?: boolean
  onMuscleClick?: (id: MuscleGroupId) => void
}

const SILHOUETTE_BACK = `M 100 18
  C 92 18, 85 22, 82 28
  C 79 34, 79 42, 82 48
  C 78 50, 72 54, 68 62
  C 62 74, 60 88, 58 102
  C 56 114, 55 122, 54 132
  C 52 142, 50 155, 50 168
  C 50 180, 51 192, 52 202
  C 53 212, 54 218, 54 226
  L 40 228
  C 36 228, 33 232, 33 236
  C 33 260, 35 290, 38 308
  C 40 318, 43 324, 46 330
  C 48 334, 50 338, 50 344
  C 50 358, 49 372, 48 384
  C 47 392, 46 398, 46 404
  L 58 404
  C 59 398, 60 392, 61 384
  C 62 372, 63 358, 64 344
  C 64 338, 66 334, 68 330
  L 72 322
  L 75 336
  C 76 342, 77 350, 78 358
  C 79 368, 79 380, 79 390
  C 79 396, 79 400, 79 404
  L 92 404
  C 92 398, 92 392, 91 384
  C 90 372, 89 360, 90 348
  C 91 338, 93 330, 95 320
  C 97 310, 99 302, 100 294
  C 101 302, 103 310, 105 320
  C 107 330, 109 338, 110 348
  C 111 360, 110 372, 109 384
  C 108 392, 108 398, 108 404
  L 121 404
  C 121 400, 121 396, 121 390
  C 121 380, 121 368, 122 358
  C 123 350, 124 342, 125 336
  L 128 322
  L 132 330
  C 134 334, 136 338, 136 344
  C 136 358, 137 372, 138 384
  C 139 392, 140 398, 141 404
  L 154 404
  C 154 398, 153 392, 152 384
  C 151 372, 150 358, 150 344
  C 150 338, 152 334, 154 330
  C 157 324, 160 318, 162 308
  C 165 290, 167 260, 167 236
  C 167 232, 164 228, 160 228
  L 146 226
  C 146 218, 147 212, 148 202
  C 149 192, 150 180, 150 168
  C 150 155, 148 142, 146 132
  C 145 122, 144 114, 142 102
  C 140 88, 138 74, 132 62
  C 128 54, 122 50, 118 48
  C 121 42, 121 34, 118 28
  C 115 22, 108 18, 100 18 Z`

export function BodyBack({ colors, activated = new Set(), interactive = false, onMuscleClick }: Props) {
  const click = (id: MuscleGroupId) => () => onMuscleClick?.(id)
  const act = (svgId: string) => activated.has(svgId)

  return (
    <svg viewBox="0 0 200 420" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* Body silhouette base */}
      <path d={SILHOUETTE_BACK} fill="#111120" />

      {/* ── TRAPS ── */}
      <MuscleRegion id="trap-l" d="M 82 50 C 76 52, 70 58, 68 66 C 66 72, 68 80, 74 82 C 80 78, 86 72, 90 64 C 88 56, 85 50, 82 50 Z"
        fill={colors.traps.fill} glow={colors.traps.glow} isActivated={act('trap-l')} isInteractive={interactive} onClick={click('traps')} />
      <MuscleRegion id="trap-r" d="M 118 50 C 115 50, 112 56, 110 64 C 114 72, 120 78, 126 82 C 132 80, 134 72, 132 66 C 130 58, 124 52, 118 50 Z"
        fill={colors.traps.fill} glow={colors.traps.glow} isActivated={act('trap-r')} isInteractive={interactive} onClick={click('traps')} />

      {/* ── REAR DELTS ── */}
      <MuscleRegion id="rear-delt-l" d="M 62 68 C 56 66, 50 70, 48 78 C 46 84, 48 90, 54 92 C 60 88, 66 80, 68 72 C 66 70, 64 68, 62 68 Z"
        fill={colors.rear_delts.fill} glow={colors.rear_delts.glow} isActivated={act('rear-delt-l')} isInteractive={interactive} onClick={click('rear_delts')} />
      <MuscleRegion id="rear-delt-r" d="M 138 68 C 136 68, 134 70, 132 72 C 134 80, 140 88, 146 92 C 152 90, 154 84, 152 78 C 150 70, 144 66, 138 68 Z"
        fill={colors.rear_delts.fill} glow={colors.rear_delts.glow} isActivated={act('rear-delt-r')} isInteractive={interactive} onClick={click('rear_delts')} />

      {/* ── SIDE DELTS (back view) ── */}
      <MuscleRegion id="side-delt-back-l" d="M 44 80 C 40 80, 38 86, 39 94 C 40 100, 44 104, 50 104 C 52 96, 50 86, 48 78 Z"
        fill={colors.side_delts.fill} glow={colors.side_delts.glow} isActivated={act('side-delt-back-l')} isInteractive={interactive} onClick={click('side_delts')} />
      <MuscleRegion id="side-delt-back-r" d="M 156 80 C 152 78, 150 86, 150 104 C 156 104, 160 100, 161 94 C 162 86, 160 80, 156 80 Z"
        fill={colors.side_delts.fill} glow={colors.side_delts.glow} isActivated={act('side-delt-back-r')} isInteractive={interactive} onClick={click('side_delts')} />

      {/* ── RHOMBOIDS ── */}
      <MuscleRegion id="rhomboid-l" d="M 75 84 C 72 88, 70 96, 71 106 C 72 114, 76 120, 84 122 C 90 120, 95 114, 96 106 C 96 96, 94 86, 90 80 C 84 78, 78 80, 75 84 Z"
        fill={colors.rhomboids.fill} glow={colors.rhomboids.glow} isActivated={act('rhomboid-l')} isInteractive={interactive} onClick={click('rhomboids')} />
      <MuscleRegion id="rhomboid-r" d="M 125 84 C 122 80, 116 78, 110 80 C 106 86, 104 96, 104 106 C 105 114, 110 120, 116 122 C 124 120, 128 114, 129 106 C 130 96, 128 88, 125 84 Z"
        fill={colors.rhomboids.fill} glow={colors.rhomboids.glow} isActivated={act('rhomboid-r')} isInteractive={interactive} onClick={click('rhomboids')} />

      {/* ── LATS ── */}
      <MuscleRegion id="lat-l" d="M 56 96 C 52 102, 52 116, 54 130 C 56 142, 60 152, 66 158 C 72 162, 78 162, 82 158 C 84 150, 83 138, 80 124 C 78 112, 74 100, 68 92 C 62 88, 58 90, 56 96 Z"
        fill={colors.lats.fill} glow={colors.lats.glow} isActivated={act('lat-l')} isInteractive={interactive} onClick={click('lats')} />
      <MuscleRegion id="lat-r" d="M 144 96 C 142 90, 138 88, 132 92 C 126 100, 122 112, 120 124 C 117 138, 116 150, 118 158 C 122 162, 128 162, 134 158 C 140 152, 144 142, 146 130 C 148 116, 148 102, 144 96 Z"
        fill={colors.lats.fill} glow={colors.lats.glow} isActivated={act('lat-r')} isInteractive={interactive} onClick={click('lats')} />

      {/* ── LOWER BACK ── */}
      <MuscleRegion id="lower-back" d="M 76 162 C 74 170, 74 180, 76 190 C 78 198, 84 204, 100 206 C 116 204, 122 198, 124 190 C 126 180, 126 170, 124 162 C 116 158, 84 158, 76 162 Z"
        fill={colors.lower_back.fill} glow={colors.lower_back.glow} isActivated={act('lower-back')} isInteractive={interactive} onClick={click('lower_back')} />

      {/* ── TRICEPS ── */}
      <MuscleRegion id="tricep-l" d="M 40 96 C 36 100, 34 112, 36 126 C 38 136, 44 144, 50 144 C 54 140, 56 132, 56 122 C 56 110, 54 98, 50 92 C 45 88, 42 90, 40 96 Z"
        fill={colors.triceps.fill} glow={colors.triceps.glow} isActivated={act('tricep-l')} isInteractive={interactive} onClick={click('triceps')} />
      <MuscleRegion id="tricep-r" d="M 160 96 C 158 90, 155 88, 150 92 C 146 98, 144 110, 144 122 C 144 132, 146 140, 150 144 C 156 144, 162 136, 164 126 C 166 112, 164 100, 160 96 Z"
        fill={colors.triceps.fill} glow={colors.triceps.glow} isActivated={act('tricep-r')} isInteractive={interactive} onClick={click('triceps')} />

      {/* ── FOREARMS (back) ── */}
      <MuscleRegion id="forearm-back-l" d="M 34 148 C 32 156, 32 168, 34 180 C 36 188, 40 194, 44 194 C 48 192, 50 186, 50 178 C 50 166, 48 154, 44 146 C 40 144, 36 145, 34 148 Z"
        fill={colors.forearms.fill} glow={colors.forearms.glow} isActivated={act('forearm-back-l')} isInteractive={interactive} onClick={click('forearms')} />
      <MuscleRegion id="forearm-back-r" d="M 166 148 C 164 145, 160 144, 156 146 C 152 154, 150 166, 150 178 C 150 186, 152 192, 156 194 C 160 194, 164 188, 166 180 C 168 168, 168 156, 166 148 Z"
        fill={colors.forearms.fill} glow={colors.forearms.glow} isActivated={act('forearm-back-r')} isInteractive={interactive} onClick={click('forearms')} />

      {/* ── GLUTES ── */}
      <MuscleRegion id="glute-l" d="M 55 210 C 52 218, 51 230, 53 242 C 55 252, 62 260, 72 260 C 82 258, 88 250, 90 240 C 90 228, 86 216, 78 208 C 70 202, 60 204, 55 210 Z"
        fill={colors.glutes.fill} glow={colors.glutes.glow} isActivated={act('glute-l')} isInteractive={interactive} onClick={click('glutes')} />
      <MuscleRegion id="glute-r" d="M 145 210 C 140 204, 130 202, 122 208 C 114 216, 110 228, 110 240 C 112 250, 118 258, 128 260 C 138 260, 145 252, 147 242 C 149 230, 148 218, 145 210 Z"
        fill={colors.glutes.fill} glow={colors.glutes.glow} isActivated={act('glute-r')} isInteractive={interactive} onClick={click('glutes')} />

      {/* ── HAMSTRINGS ── */}
      <MuscleRegion id="ham-l" d="M 54 264 C 50 272, 48 286, 48 300 C 48 312, 52 322, 58 326 C 64 328, 70 324, 74 316 C 78 306, 80 292, 80 278 C 80 266, 78 256, 74 252 C 68 248, 58 254, 54 264 Z"
        fill={colors.hamstrings.fill} glow={colors.hamstrings.glow} isActivated={act('ham-l')} isInteractive={interactive} onClick={click('hamstrings')} />
      <MuscleRegion id="ham-r" d="M 146 264 C 142 254, 132 248, 126 252 C 122 256, 120 266, 120 278 C 120 292, 122 306, 126 316 C 130 324, 136 328, 142 326 C 148 322, 152 312, 152 300 C 152 286, 150 272, 146 264 Z"
        fill={colors.hamstrings.fill} glow={colors.hamstrings.glow} isActivated={act('ham-r')} isInteractive={interactive} onClick={click('hamstrings')} />

      {/* ── CALVES (back) ── */}
      <MuscleRegion id="calf-back-l" d="M 54 330 C 52 340, 52 354, 54 368 C 56 380, 60 390, 65 394 C 68 396, 72 394, 74 390 C 76 382, 76 368, 74 354 C 72 340, 68 328, 62 326 C 58 326, 55 327, 54 330 Z"
        fill={colors.calves.fill} glow={colors.calves.glow} isActivated={act('calf-back-l')} isInteractive={interactive} onClick={click('calves')} />
      <MuscleRegion id="calf-back-r" d="M 146 330 C 145 327, 142 326, 138 326 C 132 328, 128 340, 126 354 C 124 368, 124 382, 126 390 C 128 394, 132 396, 135 394 C 140 390, 144 380, 146 368 C 148 354, 148 340, 146 330 Z"
        fill={colors.calves.fill} glow={colors.calves.glow} isActivated={act('calf-back-r')} isInteractive={interactive} onClick={click('calves')} />

      {/* Body outline stroke */}
      <path d={SILHOUETTE_BACK} fill="none" stroke="#2a2a4a" strokeWidth="1" />
    </svg>
  )
}
