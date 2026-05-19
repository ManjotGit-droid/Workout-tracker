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

/*
 * Anatomically-accurate muscle polygons adapted from `react-body-highlighter`
 * (MIT licensed — https://github.com/giavinh79/react-body-highlighter).
 * Only the polygon coordinates are reused; all surrounding code, the
 * silhouette, and the styling are our own.
 *
 * viewBox is 100 × 220 — head sits at the top, feet at the bottom, body
 * centered around x = 50.
 *
 * Each `MuscleRegion` receives a single SVG path string composed of one or
 * more sub-paths (so a "muscle" that's made of several polygons in the
 * source data still becomes one tap target).
 */

const SKIN = 'var(--body-skin)'
const LINE = 'var(--body-line)'
const OUTLINE = 'var(--body-outline)'

// ── Helper: build a path "d" string from a polygon's point coordinates ──────
const poly = (s: string) => {
  const nums = s.trim().split(/\s+/)
  let d = `M ${nums[0]} ${nums[1]}`
  for (let i = 2; i < nums.length; i += 2) d += ` L ${nums[i]} ${nums[i + 1]}`
  return d + ' Z'
}
// Combine multiple polygons into one path (single tap target).
const combine = (...polys: string[]) => polys.map(poly).join(' ')

export const BodyFront = ({
  colors,
  activated = new Set(),
  interactive = false,
  onMuscleClick,
}: Props) => {
  const click = (id: MuscleGroupId) => () => onMuscleClick?.(id)
  const act = (svgId: string) => activated.has(svgId)

  return (
    <svg
      viewBox="0 0 100 220"
      xmlns="http://www.w3.org/2000/svg"
      className="body-svg body-svg--front"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {/* Head (kept — not part of the body outline) */}
      <ellipse cx="50" cy="11.5" rx="9.5" ry="11" className="body-decoration body-decoration--head" fill={SKIN} stroke={OUTLINE} strokeWidth="0.7" />

      {/* Neck */}
      <MuscleRegion id="neck"
        d={combine(
          '55.5102041 23.6734694 50.6122449 33.4693878 50.6122449 39.1836735 61.6326531 40 70.6122449 44.8979592 69.3877551 36.7346939 63.2653061 35.1020408 58.3673469 30.6122449',
          '28.9795918 44.8979592 30.2040816 37.1428571 36.3265306 35.1020408 41.2244898 30.2040816 44.4897959 24.4897959 48.9795918 33.877551 48.5714286 39.1836735 37.9591837 39.5918367',
        )}
        fill={LINE} glow={LINE} stroke="none"
      />

      {/* ── DELTOIDS (front) ─────────────────────────────────────────── */}
      <MuscleRegion id="front-delt-l"
        d={poly('28.1632653 47.3469388 21.2244898 53.0612245 20 47.755102 20.4081633 40.8163265 24.4897959 37.1428571 28.5714286 37.1428571 26.9387755 43.2653061')}
        fill={colors.front_delts.fill} glow={colors.front_delts.glow}
        isActivated={act('front-delt-l')} isInteractive={interactive} onClick={click('front_delts')} />
      <MuscleRegion id="front-delt-r"
        d={poly('78.3673469 53.0612245 79.5918367 47.755102 79.1836735 41.2244898 75.9183673 37.9591837 71.0204082 36.3265306 72.244898 42.8571429 71.4285714 47.3469388')}
        fill={colors.front_delts.fill} glow={colors.front_delts.glow}
        isActivated={act('front-delt-r')} isInteractive={interactive} onClick={click('front_delts')} />

      {/* ── SIDE DELTOIDS (slim cap on outer shoulder) ──────────────── */}
      <MuscleRegion id="side-delt-l"
        d="M 17 44 C 14 46, 14 52, 16 56 C 18 58, 20 56, 20 54 L 20 47 Z"
        fill={colors.side_delts.fill} glow={colors.side_delts.glow}
        isActivated={act('side-delt-l')} isInteractive={interactive} onClick={click('side_delts')} />
      <MuscleRegion id="side-delt-r"
        d="M 83 44 C 86 46, 86 52, 84 56 C 82 58, 80 56, 80 54 L 80 47 Z"
        fill={colors.side_delts.fill} glow={colors.side_delts.glow}
        isActivated={act('side-delt-r')} isInteractive={interactive} onClick={click('side_delts')} />

      {/* ── CHEST / PECTORALS ───────────────────────────────────────── */}
      <MuscleRegion id="chest-l"
        d={poly('29.7959184 46.5306122 31.4285714 55.5102041 40.8163265 57.9591837 48.1632653 55.1020408 47.755102 42.0408163 37.5510204 42.0408163')}
        fill={colors.chest.fill} glow={colors.chest.glow}
        isActivated={act('chest-l')} isInteractive={interactive} onClick={click('chest')} />
      <MuscleRegion id="chest-r"
        d={poly('51.8367347 41.6326531 51.0204082 55.1020408 57.9591837 57.9591837 67.755102 55.5102041 70.6122449 47.3469388 62.0408163 41.6326531')}
        fill={colors.chest.fill} glow={colors.chest.glow}
        isActivated={act('chest-r')} isInteractive={interactive} onClick={click('chest')} />

      {/* ── BICEPS ──────────────────────────────────────────────────── */}
      <MuscleRegion id="bicep-l"
        d={poly('16.7346939 68.1632653 17.9591837 71.4285714 22.8571429 66.122449 28.9795918 53.877551 27.755102 49.3877551 20.4081633 55.9183673')}
        fill={colors.biceps.fill} glow={colors.biceps.glow}
        isActivated={act('bicep-l')} isInteractive={interactive} onClick={click('biceps')} />
      <MuscleRegion id="bicep-r"
        d={poly('71.4285714 49.3877551 70.2040816 54.6938776 76.3265306 66.122449 81.6326531 71.8367347 82.8571429 68.9795918 78.7755102 55.5102041')}
        fill={colors.biceps.fill} glow={colors.biceps.glow}
        isActivated={act('bicep-r')} isInteractive={interactive} onClick={click('biceps')} />

      {/* ── FOREARMS (front) ────────────────────────────────────────── */}
      <MuscleRegion id="forearm-l"
        d={combine(
          '6.12244898 88.5714286 10.2040816 75.1020408 14.6938776 70.2040816 16.3265306 74.2857143 19.1836735 73.4693878 4.48979592 97.5510204 0 100',
          '6.93877551 101.22449 13.4693878 90.6122449 18.7755102 84.0816327 21.6326531 77.1428571 21.2244898 71.8367347 4.89795918 98.7755102',
        )}
        fill={colors.forearms.fill} glow={colors.forearms.glow}
        isActivated={act('forearm-l')} isInteractive={interactive} onClick={click('forearms')} />
      <MuscleRegion id="forearm-r"
        d={combine(
          '84.4897959 69.7959184 83.2653061 73.4693878 80 73.0612245 95.1020408 98.3673469 100 100.408163 93.4693878 89.3877551 89.7959184 76.3265306',
          '77.5510204 72.244898 77.5510204 77.5510204 80.4081633 84.0816327 85.3061224 89.7959184 92.244898 101.22449 94.6938776 99.5918367',
        )}
        fill={colors.forearms.fill} glow={colors.forearms.glow}
        isActivated={act('forearm-r')} isInteractive={interactive} onClick={click('forearms')} />

      {/* ── UPPER ABS (top half of rectus abdominis) ────────────────── */}
      <MuscleRegion id="upper-abs"
        d={combine(
          '56.3265306 59.1836735 57.9591837 64.0816327 58.3673469 77.9591837 58.3673469 83 51 83 51 67.3469388 51.0204082 57.1428571',
          '43.6734694 58.7755102 48.5714286 57.1428571 48.9795918 67.3469388 48.5714286 83 41 83 40.8163265 78.3673469 41.2244898 64.4897959',
        )}
        fill={colors.upper_abs.fill} glow={colors.upper_abs.glow}
        isActivated={act('upper-abs')} isInteractive={interactive} onClick={click('upper_abs')} />

      {/* ── LOWER ABS (bottom half) ─────────────────────────────────── */}
      <MuscleRegion id="lower-abs"
        d={combine(
          '58.3 83 58.3 92.6 56.3 98.4 55.1 104.1 51.4 107.8 51 84.5',
          '48.6 84.5 48.2 107.3 44.5 103.7 40.8 91.4 40.8 83',
        )}
        fill={colors.lower_abs.fill} glow={colors.lower_abs.glow}
        isActivated={act('lower-abs')} isInteractive={interactive} onClick={click('lower_abs')} />

      {/* 6-pack division lines */}
      <g className="body-anatomy-lines body-anatomy-lines--abs" stroke={LINE} strokeWidth="0.4" opacity="0.5" fill="none">
        <path className="body-anatomy-line body-anatomy-line--abs-center" d="M 50 58 L 50 107" />
        <path className="body-anatomy-line body-anatomy-line--abs-row" d="M 42 70 L 58 70" />
        <path className="body-anatomy-line body-anatomy-line--abs-row" d="M 42 80 L 58 80" />
        <path className="body-anatomy-line body-anatomy-line--abs-row" d="M 42 92 L 58 92" />
      </g>

      {/* ── OBLIQUES ────────────────────────────────────────────────── */}
      <MuscleRegion id="oblique-l"
        d={poly('33.877551 78.3673469 33.0612245 71.8367347 31.0204082 63.2653061 32.244898 57.1428571 40.8163265 59.1836735 39.1836735 63.2653061 39.1836735 83.6734694')}
        fill={colors.obliques.fill} glow={colors.obliques.glow}
        isActivated={act('oblique-l')} isInteractive={interactive} onClick={click('obliques')} />
      <MuscleRegion id="oblique-r"
        d={poly('68.5714286 63.2653061 67.3469388 57.1428571 58.7755102 59.5918367 60 64.0816327 60.4081633 83.2653061 65.7142857 78.7755102 66.5306122 69.7959184')}
        fill={colors.obliques.fill} glow={colors.obliques.glow}
        isActivated={act('oblique-r')} isInteractive={interactive} onClick={click('obliques')} />

      {/* ── HIP FLEXORS (top of pelvis, V-shape) ────────────────────── */}
      <MuscleRegion id="hip-l"
        d="M 38 107 L 48 108 L 48 116 L 42 118 L 39 114 Z"
        fill={colors.hip_flexors.fill} glow={colors.hip_flexors.glow}
        isActivated={act('hip-l')} isInteractive={interactive} onClick={click('hip_flexors')} />
      <MuscleRegion id="hip-r"
        d="M 62 107 L 52 108 L 52 116 L 58 118 L 61 114 Z"
        fill={colors.hip_flexors.fill} glow={colors.hip_flexors.glow}
        isActivated={act('hip-r')} isInteractive={interactive} onClick={click('hip_flexors')} />

      {/* ── QUADRICEPS (5 polygons per leg in source — combine into one) */}
      <MuscleRegion id="quad-l"
        d={combine(
          '34.6938776 98.7755102 37.1428571 108.163265 37.1428571 127.755102 34.2857143 137.142857 31.0204082 132.653061 29.3877551 120 28.1632653 111.428571 29.3877551 100.816327 32.244898 94.6938776',
          '38.7755102 129.387755 38.3673469 112.244898 41.2244898 118.367347 44.4897959 129.387755 42.8571429 135.102041 40 146.122449 36.3265306 146.530612 35.5102041 140',
          '32.6530612 138.367347 26.5306122 145.714286 25.7142857 136.734694 25.7142857 127.346939 26.9387755 114.285714 29.3877551 133.469388',
        )}
        fill={colors.quads.fill} glow={colors.quads.glow}
        isActivated={act('quad-l')} isInteractive={interactive} onClick={click('quads')} />
      <MuscleRegion id="quad-r"
        d={combine(
          '63.2653061 105.714286 64.4897959 100 66.9387755 94.6938776 70.2040816 101.22449 71.0204082 111.836735 68.1632653 133.061224 65.3061224 137.55102 62.4489796 128.571429 62.0408163 111.428571',
          '59.5918367 145.714286 55.5102041 128.979592 60.8163265 113.877551 61.2244898 130.204082 64.0816327 139.591837 62.8571429 146.530612',
          '71.8367347 113.061224 73.877551 124.081633 73.877551 140.408163 72.6530612 145.714286 66.5306122 138.367347 70.2040816 133.469388',
        )}
        fill={colors.quads.fill} glow={colors.quads.glow}
        isActivated={act('quad-r')} isInteractive={interactive} onClick={click('quads')} />

      {/* ── INNER THIGHS (adductors) ────────────────────────────────── */}
      <MuscleRegion id="inner-thigh-l"
        d={poly('47.755102 110.612245 44.8979592 125.306122 42.0408163 115.918367 40.4081633 113.061224 39.5918367 107.346939 37.9591837 102.44898 34.6938776 93.877551 39.5918367 92.244898 41.6326531 99.1836735 43.6734694 105.306122')}
        fill={colors.inner_thighs.fill} glow={colors.inner_thighs.glow}
        isActivated={act('inner-thigh-l')} isInteractive={interactive} onClick={click('inner_thighs')} />
      <MuscleRegion id="inner-thigh-r"
        d={poly('52.6530612 110.204082 54.2857143 124.897959 60 110.204082 62.0408163 100 64.8979592 94.2857143 60 92.6530612 56.7346939 104.489796')}
        fill={colors.inner_thighs.fill} glow={colors.inner_thighs.glow}
        isActivated={act('inner-thigh-r')} isInteractive={interactive} onClick={click('inner_thighs')} />

      {/* Knees (cosmetic, not a muscle group) */}
      <g className="body-decoration body-decoration--knees" fill={LINE} opacity="0.5">
        <ellipse className="body-decoration body-decoration--knee" cx="32" cy="151" rx="4" ry="2" />
        <ellipse className="body-decoration body-decoration--knee" cx="68" cy="151" rx="4" ry="2" />
      </g>

      {/* ── CALVES (front, tibialis) ────────────────────────────────── */}
      <MuscleRegion id="calf-l"
        d={combine(
          '24.8979592 194.693878 27.755102 164.897959 28.1632653 160.408163 26.122449 154.285714 24.8979592 157.55102 22.4489796 161.632653 20.8163265 167.755102 22.0408163 188.163265 20.8163265 195.510204',
          '35.5102041 158.367347 35.9183673 162.44898 35.9183673 166.938776 35.1020408 172.244898 35.1020408 176.734694 32.244898 182.040816 30.6122449 187.346939 26.9387755 194.693878 27.3469388 187.755102 28.1632653 180.408163 28.5714286 175.510204 28.9795918 169.795918 29.7959184 164.081633 30.2040816 158.77551',
        )}
        fill={colors.calves.fill} glow={colors.calves.glow}
        isActivated={act('calf-l')} isInteractive={interactive} onClick={click('calves')} />
      <MuscleRegion id="calf-r"
        d={combine(
          '71.4285714 160.408163 73.4693878 153.469388 76.7346939 161.22449 79.5918367 167.755102 78.3673469 187.755102 79.5918367 195.510204 74.6938776 195.510204',
          '72.6530612 195.102041 69.7959184 159.183673 65.3061224 158.367347 64.0816327 162.44898 64.0816327 165.306122 65.7142857 177.142857',
        )}
        fill={colors.calves.fill} glow={colors.calves.glow}
        isActivated={act('calf-r')} isInteractive={interactive} onClick={click('calves')} />

    </svg>
  )
}
