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
 * Back-view anatomical polygons — same source and license as the front view
 * (react-body-highlighter, MIT).  Shares the silhouette path with the front
 * view for visual consistency.
 */

const SKIN = 'var(--body-skin)'
const LINE = 'var(--body-line)'
const OUTLINE = 'var(--body-outline)'

const poly = (s: string) => {
  const nums = s.trim().split(/\s+/)
  let d = `M ${nums[0]} ${nums[1]}`
  for (let i = 2; i < nums.length; i += 2) d += ` L ${nums[i]} ${nums[i + 1]}`
  return d + ' Z'
}
const combine = (...polys: string[]) => polys.map(poly).join(' ')

export const BodyBack = ({
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
      className="body-svg body-svg--back"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {/* Head (back of — kept; not part of the body outline) */}
      <ellipse cx="50" cy="11.5" rx="9.5" ry="11" className="body-decoration body-decoration--head" fill={SKIN} stroke={OUTLINE} strokeWidth="0.7" />

      {/* Spine line */}
      <path className="body-anatomy-line body-anatomy-line--spine" d="M 50 25 L 50 102" stroke={LINE} strokeWidth="0.4" opacity="0.5" fill="none" />

      {/* ── TRAPS (upper back) ──────────────────────────────────────── */}
      <MuscleRegion id="trap-l"
        d={poly('44.6808511 21.7021277 47.6595745 21.7021277 47.2340426 38.2978723 47.6595745 50 38.2978723 53.1914894 35.3191489 40.8510638 31.0638298 36.5957447 39.1489362 33.1914894 43.8297872 27.2340426')}
        fill={colors.traps.fill} glow={colors.traps.glow}
        isActivated={act('trap-l')} isInteractive={interactive} onClick={click('traps')} />
      <MuscleRegion id="trap-r"
        d={poly('52.3404255 21.7021277 55.7446809 21.7021277 56.5957447 27.2340426 60.8510638 32.7659574 68.9361702 36.5957447 64.6808511 40.4255319 61.7021277 50 52.3404255 53.1914894 53.1914894 38.2978723')}
        fill={colors.traps.fill} glow={colors.traps.glow}
        isActivated={act('trap-r')} isInteractive={interactive} onClick={click('traps')} />

      {/* ── REAR DELTOIDS ───────────────────────────────────────────── */}
      <MuscleRegion id="rear-delt-l"
        d={poly('29.3617021 37.0212766 22.9787234 39.1489362 17.4468085 44.2553191 18.2978723 53.6170213 24.2553191 49.3617021 27.2340426 46.3829787')}
        fill={colors.rear_delts.fill} glow={colors.rear_delts.glow}
        isActivated={act('rear-delt-l')} isInteractive={interactive} onClick={click('rear_delts')} />
      <MuscleRegion id="rear-delt-r"
        d={poly('71.0638298 37.0212766 78.2978723 39.5744681 82.5531915 44.6808511 81.7021277 53.6170213 74.893617 48.9361702 72.3404255 45.106383')}
        fill={colors.rear_delts.fill} glow={colors.rear_delts.glow}
        isActivated={act('rear-delt-r')} isInteractive={interactive} onClick={click('rear_delts')} />

      {/* ── SIDE DELTS (outer cap, back view) ──────────────────────── */}
      <MuscleRegion id="side-delt-back-l"
        d="M 17 44 C 14 46, 14 52, 16 56 C 18 58, 20 56, 20 54 L 20 47 Z"
        fill={colors.side_delts.fill} glow={colors.side_delts.glow}
        isActivated={act('side-delt-back-l')} isInteractive={interactive} onClick={click('side_delts')} />
      <MuscleRegion id="side-delt-back-r"
        d="M 83 44 C 86 46, 86 52, 84 56 C 82 58, 80 56, 80 54 L 80 47 Z"
        fill={colors.side_delts.fill} glow={colors.side_delts.glow}
        isActivated={act('side-delt-back-r')} isInteractive={interactive} onClick={click('side_delts')} />

      {/* ── RHOMBOIDS (top portion of upper-back source polygon) ───── */}
      <MuscleRegion id="rhomboid-l"
        d="M 33.6 41.3 L 31 49 L 28.5 49 L 36.6 54 L 47.2 55 L 47.2 50 L 36.6 54 Z"
        fill={colors.rhomboids.fill} glow={colors.rhomboids.glow}
        isActivated={act('rhomboid-l')} isInteractive={interactive} onClick={click('rhomboids')} />
      <MuscleRegion id="rhomboid-r"
        d="M 66.4 41.7 L 69 49 L 71.5 49 L 63.4 54 L 52.7 55 L 52.7 50 L 63.4 54 Z"
        fill={colors.rhomboids.fill} glow={colors.rhomboids.glow}
        isActivated={act('rhomboid-r')} isInteractive={interactive} onClick={click('rhomboids')} />

      {/* ── LATS (lower portion of upper-back source polygon) ──────── */}
      <MuscleRegion id="lat-l"
        d="M 28.5 49 L 28.5 55 L 34 75 L 47.2 71 L 47.2 55 L 36.6 54 Z"
        fill={colors.lats.fill} glow={colors.lats.glow}
        isActivated={act('lat-l')} isInteractive={interactive} onClick={click('lats')} />
      <MuscleRegion id="lat-r"
        d="M 71.5 49 L 71.5 55 L 66 75 L 52.7 71 L 52.7 55 L 63.4 54 Z"
        fill={colors.lats.fill} glow={colors.lats.glow}
        isActivated={act('lat-r')} isInteractive={interactive} onClick={click('lats')} />

      {/* ── LOWER BACK / ERECTORS ──────────────────────────────────── */}
      <MuscleRegion id="lower-back"
        d={combine(
          '47.6595745 72.7659574 34.4680851 77.0212766 35.3191489 83.4042553 49.3617021 102.12766 46.8085106 82.9787234',
          '52.3404255 72.7659574 65.5319149 77.0212766 64.6808511 83.4042553 50.6382979 102.12766 53.1914894 83.8297872',
        )}
        fill={colors.lower_back.fill} glow={colors.lower_back.glow}
        isActivated={act('lower-back')} isInteractive={interactive} onClick={click('lower_back')} />

      {/* ── TRICEPS ─────────────────────────────────────────────────── */}
      <MuscleRegion id="tricep-l"
        d={combine(
          '26.8085106 49.787234 17.8723404 55.7446809 14.4680851 72.3404255 16.5957447 81.7021277 21.7021277 63.8297872 26.8085106 55.7446809',
          '26.8085106 58.2978723 26.8085106 68.5106383 22.9787234 75.3191489 19.1489362 77.4468085 22.5531915 65.5319149',
        )}
        fill={colors.triceps.fill} glow={colors.triceps.glow}
        isActivated={act('tricep-l')} isInteractive={interactive} onClick={click('triceps')} />
      <MuscleRegion id="tricep-r"
        d={combine(
          '73.6170213 50.212766 82.1276596 55.7446809 85.9574468 73.1914894 83.4042553 82.1276596 77.8723404 62.9787234 73.1914894 55.7446809',
          '72.7659574 58.2978723 77.0212766 64.6808511 80.4255319 77.4468085 76.5957447 75.3191489 72.7659574 68.9361702',
        )}
        fill={colors.triceps.fill} glow={colors.triceps.glow}
        isActivated={act('tricep-r')} isInteractive={interactive} onClick={click('triceps')} />

      {/* ── FOREARMS (back) ─────────────────────────────────────────── */}
      <MuscleRegion id="forearm-back-l"
        d={combine(
          '13.6170213 75.7446809 8.93617021 83.8297872 6.80851064 93.6170213 0 106.382979 3.82978723 104.255319 12.3404255 88.5106383 15.7446809 82.9787234',
          '18.7234043 79.5744681 22.1276596 77.8723404 20.8510638 84.2553191 9.36170213 102.978723 6.80851064 108.510638 5.10638298 104.680851',
        )}
        fill={colors.forearms.fill} glow={colors.forearms.glow}
        isActivated={act('forearm-back-l')} isInteractive={interactive} onClick={click('forearms')} />
      <MuscleRegion id="forearm-back-r"
        d={combine(
          '86.3829787 75.7446809 91.0638298 83.4042553 93.1914894 94.0425532 100 106.382979 96.1702128 104.255319 88.0851064 89.3617021 84.2553191 83.8297872',
          '81.2765957 79.5744681 77.4468085 77.8723404 79.1489362 84.6808511 91.0638298 103.829787 93.1914894 108.93617 94.4680851 104.680851',
        )}
        fill={colors.forearms.fill} glow={colors.forearms.glow}
        isActivated={act('forearm-back-r')} isInteractive={interactive} onClick={click('forearms')} />

      {/* ── GLUTES ──────────────────────────────────────────────────── */}
      <MuscleRegion id="glute-l"
        d={poly('44.6808511 99.5744681 30.212766 108.510638 29.787234 118.723404 31.4893617 125.957447 47.2340426 121.276596 49.3617021 114.893617')}
        fill={colors.glutes.fill} glow={colors.glutes.glow}
        isActivated={act('glute-l')} isInteractive={interactive} onClick={click('glutes')} />
      <MuscleRegion id="glute-r"
        d={poly('55.3191489 99.1489362 51.0638298 114.468085 52.3404255 120.851064 68.0851064 125.957447 69.787234 119.148936 69.3617021 108.510638')}
        fill={colors.glutes.fill} glow={colors.glutes.glow}
        isActivated={act('glute-r')} isInteractive={interactive} onClick={click('glutes')} />

      {/* ── HAMSTRINGS ──────────────────────────────────────────────── */}
      <MuscleRegion id="ham-l"
        d={combine(
          '28.9361702 122.12766 31.0638298 129.361702 36.5957447 125.957447 35.3191489 135.319149 34.4680851 150.212766 29.3617021 158.297872 28.9361702 146.808511 27.6595745 141.276596 27.2340426 131.489362',
          '38.7234043 125.531915 44.2553191 145.957447 40.4255319 166.808511 36.1702128 152.765957 37.0212766 135.319149',
        )}
        fill={colors.hamstrings.fill} glow={colors.hamstrings.glow}
        isActivated={act('ham-l')} isInteractive={interactive} onClick={click('hamstrings')} />
      <MuscleRegion id="ham-r"
        d={combine(
          '71.4893617 121.702128 69.3617021 128.93617 63.8297872 125.957447 65.5319149 136.595745 66.3829787 150.212766 71.0638298 158.297872 71.4893617 147.659574 72.7659574 142.12766 73.6170213 131.914894',
          '61.7021277 125.531915 63.4042553 136.170213 64.2553191 153.191489 60 166.808511 56.1702128 146.382979',
        )}
        fill={colors.hamstrings.fill} glow={colors.hamstrings.glow}
        isActivated={act('ham-r')} isInteractive={interactive} onClick={click('hamstrings')} />

      {/* Knees */}
      <g className="body-decoration body-decoration--knees" fill={LINE} opacity="0.5">
        <ellipse className="body-decoration body-decoration--knee" cx="34" cy="160" rx="4" ry="2" />
        <ellipse className="body-decoration body-decoration--knee" cx="66" cy="160" rx="4" ry="2" />
      </g>

      {/* ── CALVES + SOLEUS (back) ──────────────────────────────────── */}
      <MuscleRegion id="calf-back-l"
        d={combine(
          '29.3617021 160.425532 28.5106383 167.234043 24.6808511 179.574468 23.8297872 192.765957 25.5319149 197.021277 28.5106383 193.191489 29.787234 180 31.9148936 171.06383 31.9148936 166.808511',
          '37.4468085 165.106383 35.3191489 167.659574 33.1914894 171.914894 31.0638298 180.425532 30.212766 191.914894 34.0425532 200 38.7234043 190.638298 39.1489362 168.93617',
          '28.5106383 195.744681 30.212766 195.744681 33.6170213 201.702128 30.6382979 220 28.5106383 213.617021 26.8085106 198.297872',
        )}
        fill={colors.calves.fill} glow={colors.calves.glow}
        isActivated={act('calf-back-l')} isInteractive={interactive} onClick={click('calves')} />
      <MuscleRegion id="calf-back-r"
        d={combine(
          '70.6382979 160.425532 72.3404255 168.510638 75.7446809 179.148936 76.5957447 192.765957 74.4680851 196.595745 72.3404255 193.617021 70.6382979 179.574468 68.0851064 168.085106',
          '62.9787234 165.106383 61.2765957 168.510638 61.7021277 190.638298 66.3829787 199.574468 70.6382979 191.914894 68.9361702 179.574468 66.8085106 170.212766',
          '69.787234 195.744681 71.9148936 195.744681 73.6170213 198.297872 71.9148936 213.191489 70.212766 219.574468 67.2340426 202.12766',
        )}
        fill={colors.calves.fill} glow={colors.calves.glow}
        isActivated={act('calf-back-r')} isInteractive={interactive} onClick={click('calves')} />

    </svg>
  )
}
