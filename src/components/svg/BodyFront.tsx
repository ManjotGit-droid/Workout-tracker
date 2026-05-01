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

// All paths use viewBox="0 0 200 420"
// Paths are simplified but anatomically placed silhouettes

const SILHOUETTE = `M 100 18
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

export function BodyFront({ colors, activated = new Set(), interactive = false, onMuscleClick }: Props) {
  const click = (id: MuscleGroupId) => () => onMuscleClick?.(id)
  const act = (svgId: string) => activated.has(svgId)

  return (
    <svg viewBox="0 0 200 420" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <defs>
        <filter id="body-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Body silhouette base */}
      <path d={SILHOUETTE} fill="#111120" filter="url(#body-shadow)" />

      {/* ── NECK ── */}
      <path d="M 94 28 C 92 30, 91 36, 92 42 C 94 44, 100 46, 100 46 C 100 46, 106 44, 108 42 C 109 36, 108 30, 106 28 Z" fill="#1a1a2e" />

      {/* ── CHEST ── */}
      <MuscleRegion id="chest-l" d="M 68 74 C 62 78, 58 88, 58 98 C 58 108, 62 114, 72 118 C 80 120, 90 118, 95 112 C 96 106, 95 96, 92 88 C 89 80, 82 72, 68 74 Z"
        fill={colors.chest.fill} glow={colors.chest.glow} isActivated={act('chest-l')} isInteractive={interactive} onClick={click('chest')} />
      <MuscleRegion id="chest-r" d="M 132 74 C 118 72, 111 80, 108 88 C 105 96, 104 106, 105 112 C 110 118, 120 120, 128 118 C 138 114, 142 108, 142 98 C 142 88, 138 78, 132 74 Z"
        fill={colors.chest.fill} glow={colors.chest.glow} isActivated={act('chest-r')} isInteractive={interactive} onClick={click('chest')} />

      {/* ── FRONT DELTS ── */}
      <MuscleRegion id="front-delt-l" d="M 62 68 C 56 66, 50 70, 48 78 C 46 84, 48 90, 54 92 C 60 90, 66 82, 68 74 C 66 72, 64 70, 62 68 Z"
        fill={colors.front_delts.fill} glow={colors.front_delts.glow} isActivated={act('front-delt-l')} isInteractive={interactive} onClick={click('front_delts')} />
      <MuscleRegion id="front-delt-r" d="M 138 68 C 136 70, 134 72, 132 74 C 134 82, 140 90, 146 92 C 152 90, 154 84, 152 78 C 150 70, 144 66, 138 68 Z"
        fill={colors.front_delts.fill} glow={colors.front_delts.glow} isActivated={act('front-delt-r')} isInteractive={interactive} onClick={click('front_delts')} />

      {/* ── SIDE DELTS (front visible portion) ── */}
      <MuscleRegion id="side-delt-l" d="M 44 80 C 40 80, 38 86, 39 94 C 40 100, 44 104, 50 104 C 52 96, 50 86, 48 78 C 47 78, 45 79, 44 80 Z"
        fill={colors.side_delts.fill} glow={colors.side_delts.glow} isActivated={act('side-delt-l')} isInteractive={interactive} onClick={click('side_delts')} />
      <MuscleRegion id="side-delt-r" d="M 156 80 C 155 79, 153 78, 152 78 C 150 86, 148 96, 150 104 C 156 104, 160 100, 161 94 C 162 86, 160 80, 156 80 Z"
        fill={colors.side_delts.fill} glow={colors.side_delts.glow} isActivated={act('side-delt-r')} isInteractive={interactive} onClick={click('side_delts')} />

      {/* ── BICEPS ── */}
      <MuscleRegion id="bicep-l" d="M 40 106 C 36 110, 34 120, 36 132 C 37 140, 42 146, 48 146 C 54 144, 56 138, 56 130 C 56 120, 54 110, 50 106 C 46 104, 42 104, 40 106 Z"
        fill={colors.biceps.fill} glow={colors.biceps.glow} isActivated={act('bicep-l')} isInteractive={interactive} onClick={click('biceps')} />
      <MuscleRegion id="bicep-r" d="M 160 106 C 158 104, 154 104, 150 106 C 146 110, 144 120, 144 130 C 144 138, 146 144, 152 146 C 158 146, 163 140, 164 132 C 166 120, 164 110, 160 106 Z"
        fill={colors.biceps.fill} glow={colors.biceps.glow} isActivated={act('bicep-r')} isInteractive={interactive} onClick={click('biceps')} />

      {/* ── FOREARMS (front) ── */}
      <MuscleRegion id="forearm-l" d="M 34 150 C 32 158, 32 170, 34 182 C 36 190, 40 196, 44 196 C 48 194, 50 188, 50 180 C 50 168, 48 156, 44 148 C 40 146, 36 147, 34 150 Z"
        fill={colors.forearms.fill} glow={colors.forearms.glow} isActivated={act('forearm-l')} isInteractive={interactive} onClick={click('forearms')} />
      <MuscleRegion id="forearm-r" d="M 166 150 C 164 147, 160 146, 156 148 C 152 156, 150 168, 150 180 C 150 188, 152 194, 156 196 C 160 196, 164 190, 166 182 C 168 170, 168 158, 166 150 Z"
        fill={colors.forearms.fill} glow={colors.forearms.glow} isActivated={act('forearm-r')} isInteractive={interactive} onClick={click('forearms')} />

      {/* ── UPPER ABS ── */}
      <MuscleRegion id="upper-abs" d="M 75 120 C 74 128, 74 138, 75 148 C 78 152, 86 154, 100 154 C 114 154, 122 152, 125 148 C 126 138, 126 128, 125 120 C 118 116, 82 116, 75 120 Z"
        fill={colors.upper_abs.fill} glow={colors.upper_abs.glow} isActivated={act('upper-abs')} isInteractive={interactive} onClick={click('upper_abs')} />

      {/* ── LOWER ABS ── */}
      <MuscleRegion id="lower-abs" d="M 76 156 C 75 164, 76 174, 78 180 C 82 184, 90 186, 100 186 C 110 186, 118 184, 122 180 C 124 174, 125 164, 124 156 C 116 154, 84 154, 76 156 Z"
        fill={colors.lower_abs.fill} glow={colors.lower_abs.glow} isActivated={act('lower-abs')} isInteractive={interactive} onClick={click('lower_abs')} />

      {/* ── OBLIQUES ── */}
      <MuscleRegion id="oblique-l" d="M 58 118 C 56 128, 55 140, 55 154 C 55 164, 56 172, 58 178 C 62 182, 68 184, 73 182 C 74 172, 75 162, 76 152 C 76 140, 76 128, 75 118 C 70 116, 62 116, 58 118 Z"
        fill={colors.obliques.fill} glow={colors.obliques.glow} isActivated={act('oblique-l')} isInteractive={interactive} onClick={click('obliques')} />
      <MuscleRegion id="oblique-r" d="M 125 118 C 124 128, 124 140, 124 152 C 125 162, 126 172, 127 182 C 132 184, 138 182, 142 178 C 144 172, 145 164, 145 154 C 145 140, 144 128, 142 118 C 138 116, 130 116, 125 118 Z"
        fill={colors.obliques.fill} glow={colors.obliques.glow} isActivated={act('oblique-r')} isInteractive={interactive} onClick={click('obliques')} />

      {/* ── HIP FLEXORS ── */}
      <MuscleRegion id="hip-l" d="M 58 188 C 56 194, 56 202, 58 210 C 62 216, 70 220, 78 218 C 80 212, 80 204, 78 196 C 72 188, 64 186, 58 188 Z"
        fill={colors.hip_flexors.fill} glow={colors.hip_flexors.glow} isActivated={act('hip-l')} isInteractive={interactive} onClick={click('hip_flexors')} />
      <MuscleRegion id="hip-r" d="M 142 188 C 136 186, 128 188, 122 196 C 120 204, 120 212, 122 218 C 130 220, 138 216, 142 210 C 144 202, 144 194, 142 188 Z"
        fill={colors.hip_flexors.fill} glow={colors.hip_flexors.glow} isActivated={act('hip-r')} isInteractive={interactive} onClick={click('hip_flexors')} />

      {/* ── QUADS ── */}
      <MuscleRegion id="quad-l" d="M 54 222 C 50 228, 48 240, 48 256 C 48 272, 50 288, 54 300 C 58 308, 64 312, 70 310 C 76 308, 80 300, 82 288 C 84 274, 84 258, 82 244 C 80 232, 76 224, 70 220 C 64 218, 58 218, 54 222 Z"
        fill={colors.quads.fill} glow={colors.quads.glow} isActivated={act('quad-l')} isInteractive={interactive} onClick={click('quads')} />
      <MuscleRegion id="quad-r" d="M 146 222 C 142 218, 136 218, 130 220 C 124 224, 120 232, 118 244 C 116 258, 116 274, 118 288 C 120 300, 124 308, 130 310 C 136 312, 142 308, 146 300 C 150 288, 152 272, 152 256 C 152 240, 150 228, 146 222 Z"
        fill={colors.quads.fill} glow={colors.quads.glow} isActivated={act('quad-r')} isInteractive={interactive} onClick={click('quads')} />

      {/* ── INNER THIGHS ── */}
      <MuscleRegion id="inner-thigh-l" d="M 82 230 C 80 240, 80 256, 80 268 C 80 280, 82 292, 86 302 C 90 308, 96 310, 100 308 C 100 294, 98 278, 96 264 C 94 250, 90 238, 86 228 C 84 226, 82 228, 82 230 Z"
        fill={colors.inner_thighs.fill} glow={colors.inner_thighs.glow} isActivated={act('inner-thigh-l')} isInteractive={interactive} onClick={click('inner_thighs')} />
      <MuscleRegion id="inner-thigh-r" d="M 118 230 C 118 228, 116 226, 114 228 C 110 238, 106 250, 104 264 C 102 278, 100 294, 100 308 C 104 310, 110 308, 114 302 C 118 292, 120 280, 120 268 C 120 256, 120 240, 118 230 Z"
        fill={colors.inner_thighs.fill} glow={colors.inner_thighs.glow} isActivated={act('inner-thigh-r')} isInteractive={interactive} onClick={click('inner_thighs')} />

      {/* ── CALVES (front shin visible) ── */}
      <MuscleRegion id="calf-l" d="M 54 316 C 52 326, 52 340, 54 354 C 56 366, 60 376, 65 382 C 68 386, 72 388, 74 386 C 76 380, 76 368, 74 354 C 72 340, 68 326, 62 316 C 59 314, 56 314, 54 316 Z"
        fill={colors.calves.fill} glow={colors.calves.glow} isActivated={act('calf-l')} isInteractive={interactive} onClick={click('calves')} />
      <MuscleRegion id="calf-r" d="M 146 316 C 144 314, 141 314, 138 316 C 132 326, 128 340, 126 354 C 124 368, 124 380, 126 386 C 128 388, 132 386, 135 382 C 140 376, 144 366, 146 354 C 148 340, 148 326, 146 316 Z"
        fill={colors.calves.fill} glow={colors.calves.glow} isActivated={act('calf-r')} isInteractive={interactive} onClick={click('calves')} />

      {/* Body outline stroke */}
      <path d={SILHOUETTE} fill="none" stroke="#2a2a4a" strokeWidth="1" />
    </svg>
  )
}
