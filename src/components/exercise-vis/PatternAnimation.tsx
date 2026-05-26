import { motion } from 'framer-motion'
import type { MovementPattern } from '../../utils/movementPattern'

/* ─────────────────────────────────────────────────────────────────────────────
   Movement-pattern stick-figure animations
   ─────────────────────────────────────────────────────────────────────────────
   Each pattern below is a small <svg> drawn around a 100×120 viewBox with a
   simple stick figure: head, torso, arms, legs. Framer-motion drives the
   keyframes — the figure oscillates between two postures with easeInOut on
   loop so the motion reads cleanly.

   Conventions:
     viewBox = 0 0 100 120   (centered figure, ground line implied at y≈115)
     stroke  = var(--brand)
     stroke width 3, round caps
     2-second cycle by default

   These are deliberately stylised — they show the *pattern*, not the exact
   exercise.  Pair the animation with the bullet-point cues from
   `PATTERN_CUES` for verbal precision.
   ───────────────────────────────────────────────────────────────────────── */

const cycle = {
  duration: 2.2,
  repeat: Infinity,
  ease: 'easeInOut' as const,
  repeatType: 'mirror' as const,
}

const stroke = 'var(--brand)'
const sw = 3

// Common SVG wrapper
const Stage = ({ children }: { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 100 120"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', height: '100%', display: 'block' }}
  >
    {/* Ground */}
    <line x1="5" y1="115" x2="95" y2="115" stroke="var(--border)" strokeWidth="1" strokeDasharray="2,3" />
    {children}
  </svg>
)

// ── Squat ───────────────────────────────────────────────────────────────────
const SquatAnim = () => (
  <Stage>
    {/* Whole figure descends */}
    <motion.g animate={{ y: [0, 18] }} transition={cycle}>
      <circle cx="50" cy="20" r="6" fill={stroke} />
      <line x1="50" y1="26" x2="50" y2="55" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* arms forward */}
      <motion.line
        x1="50" y1="32" x2="65" y2="50"
        stroke={stroke} strokeWidth={sw} strokeLinecap="round"
        animate={{ x2: [65, 78], y2: [50, 35] }} transition={cycle}
      />
      <motion.line
        x1="50" y1="32" x2="35" y2="50"
        stroke={stroke} strokeWidth={sw} strokeLinecap="round"
        animate={{ x2: [35, 22], y2: [50, 35] }} transition={cycle}
      />
    </motion.g>
    {/* Legs bend deeply */}
    <motion.polyline
      fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      animate={{
        points: ['50,55 42,85 42,115', '50,73 28,92 42,115'],
      }} transition={cycle}
    />
    <motion.polyline
      fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      animate={{
        points: ['50,55 58,85 58,115', '50,73 72,92 58,115'],
      }} transition={cycle}
    />
  </Stage>
)

// ── Hinge (deadlift) ────────────────────────────────────────────────────────
const HingeAnim = () => (
  <Stage>
    {/* Torso pivots forward from hips at ~y=70 */}
    <motion.g
      style={{ originX: '50px', originY: '70px' }}
      animate={{ rotate: [0, -55] }}
      transition={cycle}
    >
      <circle cx="50" cy="20" r="6" fill={stroke} />
      <line x1="50" y1="26" x2="50" y2="70" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* arms hang straight down */}
      <line x1="50" y1="40" x2="50" y2="78" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </motion.g>
    {/* legs nearly straight */}
    <motion.line x1="50" y1="70" x2="40" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      animate={{ x2: [40, 43] }} transition={cycle} />
    <motion.line x1="50" y1="70" x2="60" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      animate={{ x2: [60, 57] }} transition={cycle} />
    {/* Bar on the floor → up to hips */}
    <motion.line
      x1="40" x2="60" stroke={stroke} strokeWidth="2"
      animate={{ y1: [108, 70], y2: [108, 70] }} transition={cycle}
    />
  </Stage>
)

// ── Lunge ───────────────────────────────────────────────────────────────────
const LungeAnim = () => (
  <Stage>
    <motion.g animate={{ y: [0, 10] }} transition={cycle}>
      <circle cx="50" cy="22" r="6" fill={stroke} />
      <line x1="50" y1="28" x2="50" y2="58" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="36" x2="42" y2="62" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="36" x2="58" y2="62" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </motion.g>
    {/* front leg bends */}
    <motion.polyline
      fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      animate={{ points: ['50,58 65,90 65,115', '50,68 72,90 72,115'] }} transition={cycle}
    />
    {/* back leg extends back */}
    <motion.polyline
      fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      animate={{ points: ['50,58 35,90 35,115', '50,68 28,105 22,115'] }} transition={cycle}
    />
  </Stage>
)

// ── Horizontal press (push-up / bench) ─────────────────────────────────────
const PressHorizontalAnim = () => (
  <Stage>
    {/* Whole figure horizontal */}
    <g>
      <circle cx="22" cy="55" r="6" fill={stroke} />
      {/* body */}
      <line x1="28" y1="55" x2="80" y2="55" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* legs back */}
      <line x1="80" y1="55" x2="92" y2="62" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="80" y1="55" x2="92" y2="48" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </g>
    {/* arms bend & extend */}
    <motion.polyline
      fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      animate={{ points: ['30,55 35,75 32,90', '30,55 30,75 30,95'] }} transition={cycle}
    />
    <motion.polyline
      fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      animate={{ points: ['30,55 25,75 28,90', '30,55 35,75 35,95'] }} transition={cycle}
    />
    {/* body rises/lowers slightly */}
    <motion.line x1="28" y1="55" x2="80" y2="55" stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      animate={{ y1: [55, 62], y2: [55, 62] }} transition={cycle} opacity={0} />
  </Stage>
)

// ── Vertical press (overhead) ──────────────────────────────────────────────
const PressVerticalAnim = () => (
  <Stage>
    <circle cx="50" cy="22" r="6" fill={stroke} />
    <line x1="50" y1="28" x2="50" y2="70" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <line x1="50" y1="70" x2="42" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <line x1="50" y1="70" x2="58" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    {/* arms press overhead */}
    <motion.polyline
      fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      animate={{ points: ['50,35 30,45 32,30', '50,35 38,20 30,8'] }} transition={cycle}
    />
    <motion.polyline
      fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      animate={{ points: ['50,35 70,45 68,30', '50,35 62,20 70,8'] }} transition={cycle}
    />
    {/* bar */}
    <motion.line
      stroke={stroke} strokeWidth="2.5"
      animate={{ x1: [28, 28], y1: [30, 8], x2: [72, 72], y2: [30, 8] }} transition={cycle}
    />
  </Stage>
)

// ── Vertical pull (pull-up) ────────────────────────────────────────────────
const PullVerticalAnim = () => (
  <Stage>
    {/* Bar at top */}
    <line x1="20" y1="15" x2="80" y2="15" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    {/* Body moves up */}
    <motion.g animate={{ y: [0, -20] }} transition={cycle}>
      <circle cx="50" cy="38" r="6" fill={stroke} />
      <line x1="50" y1="44" x2="50" y2="85" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="85" x2="42" y2="110" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="85" x2="58" y2="110" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* arms reach up to the bar (stay attached at y=15) */}
      <motion.polyline
        fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
        animate={{ points: ['50,48 38,30 34,15', '50,48 40,38 34,35'] }} transition={cycle}
      />
      <motion.polyline
        fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
        animate={{ points: ['50,48 62,30 66,15', '50,48 60,38 66,35'] }} transition={cycle}
      />
    </motion.g>
  </Stage>
)

// ── Horizontal pull (row) ──────────────────────────────────────────────────
const PullHorizontalAnim = () => (
  <Stage>
    <g style={{ transform: 'rotate(-25deg)', transformOrigin: '50px 50px' }}>
      <circle cx="50" cy="22" r="6" fill={stroke} />
      <line x1="50" y1="28" x2="50" y2="72" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="72" x2="42" y2="105" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="72" x2="58" y2="105" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </g>
    {/* arms pull a bar toward chest */}
    <motion.polyline
      fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      animate={{ points: ['62,52 78,72 90,90', '62,52 70,55 80,55'] }} transition={cycle}
    />
    <motion.polyline
      fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      animate={{ points: ['62,42 78,62 90,80', '62,42 70,45 80,45'] }} transition={cycle}
    />
    {/* bar */}
    <motion.line stroke={stroke} strokeWidth="2.5"
      animate={{ x1: [88, 78], y1: [85, 50], x2: [92, 82], y2: [85, 50] }} transition={cycle}
    />
  </Stage>
)

// ── Curl ────────────────────────────────────────────────────────────────────
const CurlAnim = () => (
  <Stage>
    <circle cx="50" cy="22" r="6" fill={stroke} />
    <line x1="50" y1="28" x2="50" y2="75" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <line x1="50" y1="75" x2="42" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <line x1="50" y1="75" x2="58" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    {/* upper arms pinned to side */}
    <line x1="42" y1="36" x2="40" y2="65" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <line x1="58" y1="36" x2="60" y2="65" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    {/* forearms curl up */}
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="40" y1="65"
      animate={{ x2: [50, 48], y2: [85, 40] }} transition={cycle}
    />
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="60" y1="65"
      animate={{ x2: [50, 52], y2: [85, 40] }} transition={cycle}
    />
  </Stage>
)

// ── Extension (tricep pushdown) ────────────────────────────────────────────
const ExtensionAnim = () => (
  <Stage>
    <circle cx="50" cy="22" r="6" fill={stroke} />
    <line x1="50" y1="28" x2="50" y2="75" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <line x1="50" y1="75" x2="42" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <line x1="50" y1="75" x2="58" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    {/* upper arms pinned to side */}
    <line x1="42" y1="36" x2="40" y2="65" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <line x1="58" y1="36" x2="60" y2="65" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    {/* forearms extend down (opposite of curl) */}
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="40" y1="65"
      animate={{ x2: [45, 40], y2: [40, 90] }} transition={cycle}
    />
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="60" y1="65"
      animate={{ x2: [55, 60], y2: [40, 90] }} transition={cycle}
    />
  </Stage>
)

// ── Lateral raise ──────────────────────────────────────────────────────────
const RaiseLateralAnim = () => (
  <Stage>
    <circle cx="50" cy="22" r="6" fill={stroke} />
    <line x1="50" y1="28" x2="50" y2="75" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <line x1="50" y1="75" x2="42" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <line x1="50" y1="75" x2="58" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    {/* arms lift sideways */}
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="42" y1="36"
      animate={{ x2: [40, 16], y2: [70, 38] }} transition={cycle}
    />
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="58" y1="36"
      animate={{ x2: [60, 84], y2: [70, 38] }} transition={cycle}
    />
  </Stage>
)

// ── Shrug ──────────────────────────────────────────────────────────────────
const ShrugAnim = () => (
  <Stage>
    <circle cx="50" cy="22" r="6" fill={stroke} />
    <motion.line x1="50" y1="28" x2="50" y2="75" stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      animate={{ y1: [28, 24] }} transition={cycle} />
    {/* shoulders raise */}
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="42" x2="58" animate={{ y1: [36, 32], y2: [36, 32] }} transition={cycle} />
    <line x1="50" y1="75" x2="42" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <line x1="50" y1="75" x2="58" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    {/* arms hang down */}
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round" x1="42" x2="42"
      animate={{ y1: [36, 32], y2: [85, 81] }} transition={cycle} />
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round" x1="58" x2="58"
      animate={{ y1: [36, 32], y2: [85, 81] }} transition={cycle} />
  </Stage>
)

// ── Core flexion (crunch / sit-up) ─────────────────────────────────────────
const CoreFlexionAnim = () => (
  <Stage>
    {/* Body lying on back; torso curls up */}
    <motion.g
      style={{ originX: '50px', originY: '90px' }}
      animate={{ rotate: [-90, -45] }}
      transition={cycle}
    >
      <circle cx="50" cy="22" r="6" fill={stroke} />
      <line x1="50" y1="28" x2="50" y2="80" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* arms behind head */}
      <line x1="50" y1="34" x2="38" y2="22" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="34" x2="62" y2="22" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </motion.g>
    {/* legs bent, on the floor */}
    <polyline points="50,90 40,105 25,105" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="50,90 60,105 75,105" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
  </Stage>
)

// ── Plank / static hold ────────────────────────────────────────────────────
const PlankAnim = () => (
  <Stage>
    {/* slight breathing bounce */}
    <motion.g animate={{ y: [0, -2] }} transition={cycle}>
      <circle cx="22" cy="65" r="6" fill={stroke} />
      <line x1="28" y1="65" x2="88" y2="70" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* forearms */}
      <polyline points="28,65 24,80 30,90" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="28,65 35,80 32,90" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      {/* feet */}
      <line x1="88" y1="70" x2="95" y2="78" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="88" y1="70" x2="95" y2="62" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </motion.g>
  </Stage>
)

// ── Glute bridge ───────────────────────────────────────────────────────────
const GluteBridgeAnim = () => (
  <Stage>
    <circle cx="22" cy="95" r="6" fill={stroke} />
    {/* hips rise/fall */}
    <motion.polyline
      fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      animate={{ points: ['28,95 55,90 65,75', '28,95 55,72 65,68'] }} transition={cycle}
    />
    {/* legs */}
    <line x1="65" y1="75" x2="78" y2="105" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <line x1="78" y1="105" x2="82" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
  </Stage>
)

// ── Calf raise ─────────────────────────────────────────────────────────────
const CalfRaiseAnim = () => (
  <Stage>
    <motion.g animate={{ y: [0, -10] }} transition={cycle}>
      <circle cx="50" cy="22" r="6" fill={stroke} />
      <line x1="50" y1="28" x2="50" y2="75" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="75" x2="42" y2="110" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="75" x2="58" y2="110" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="34" x2="40" y2="62" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="34" x2="60" y2="62" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </motion.g>
  </Stage>
)

// ── Cardio: run ────────────────────────────────────────────────────────────
const CardioRunAnim = () => (
  <Stage>
    <motion.g animate={{ y: [0, -3] }} transition={{ ...cycle, duration: 0.55 }}>
      <circle cx="50" cy="22" r="6" fill={stroke} />
      <line x1="50" y1="28" x2="50" y2="65" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </motion.g>
    {/* legs alternating */}
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="50" y1="65" animate={{ x2: [35, 65], y2: [108, 80] }} transition={{ ...cycle, duration: 0.55 }} />
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="50" y1="65" animate={{ x2: [65, 35], y2: [80, 108] }} transition={{ ...cycle, duration: 0.55 }} />
    {/* arms swinging */}
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="50" y1="35" animate={{ x2: [38, 62], y2: [50, 50] }} transition={{ ...cycle, duration: 0.55 }} />
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="50" y1="35" animate={{ x2: [62, 38], y2: [50, 50] }} transition={{ ...cycle, duration: 0.55 }} />
  </Stage>
)

// ── Cardio: bike (seated, pedaling) ────────────────────────────────────────
const CardioBikeAnim = () => (
  <Stage>
    {/* seated upright */}
    <circle cx="50" cy="35" r="6" fill={stroke} />
    <line x1="50" y1="41" x2="50" y2="75" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    {/* arms forward to handlebar */}
    <line x1="50" y1="48" x2="68" y2="55" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <line x1="50" y1="48" x2="68" y2="58" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    {/* pedal circles — legs alternating around (75,90) */}
    <circle cx="75" cy="95" r="10" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="2,2" />
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="50" y1="75"
      animate={{ x2: [75, 75], y2: [85, 105] }} transition={{ ...cycle, duration: 1.0 }} />
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="50" y1="75"
      animate={{ x2: [75, 75], y2: [105, 85] }} transition={{ ...cycle, duration: 1.0 }} />
  </Stage>
)

// ── Cardio: row ────────────────────────────────────────────────────────────
const CardioRowAnim = () => (
  <Stage>
    {/* body slides back and forth */}
    <motion.g animate={{ x: [0, -15] }} transition={cycle}>
      <circle cx="60" cy="55" r="6" fill={stroke} />
      <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
        x1="60" y1="61" animate={{ x2: [60, 60], y2: [85, 95], rotate: [0, -25] }} transition={cycle} />
      {/* legs bent */}
      <motion.polyline fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
        animate={{ points: ['60,85 80,75 90,100', '60,95 80,95 90,100'] }} transition={cycle} />
      {/* arms pulling */}
      <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
        x1="60" y1="61" animate={{ x2: [88, 50], y2: [75, 60] }} transition={cycle} />
    </motion.g>
  </Stage>
)

// ── Cardio: swim ───────────────────────────────────────────────────────────
const CardioSwimAnim = () => (
  <Stage>
    {/* horizontal body */}
    <line x1="15" y1="60" x2="80" y2="60" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <circle cx="15" cy="60" r="6" fill={stroke} />
    {/* legs flutter */}
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="80" y1="60" animate={{ x2: [92, 92], y2: [55, 68] }} transition={{ ...cycle, duration: 0.6 }} />
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="80" y1="60" animate={{ x2: [92, 92], y2: [68, 52] }} transition={{ ...cycle, duration: 0.6 }} />
    {/* arms cycle */}
    <motion.polyline fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      animate={{ points: ['18,60 8,40 5,25', '18,60 30,55 45,45'] }} transition={cycle} />
    {/* water lines */}
    <line x1="0" y1="80" x2="100" y2="80" stroke="var(--border)" strokeWidth="1" />
    <line x1="0" y1="88" x2="100" y2="88" stroke="var(--border)" strokeWidth="1" strokeDasharray="2,3" />
  </Stage>
)

// ── Jump ───────────────────────────────────────────────────────────────────
const JumpAnim = () => (
  <Stage>
    <motion.g animate={{ y: [10, -25, 10] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' as const, times: [0, 0.4, 1] }}>
      <circle cx="50" cy="22" r="6" fill={stroke} />
      <line x1="50" y1="28" x2="50" y2="60" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* arms */}
      <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
        x1="50" y1="35" animate={{ x2: [40, 35, 40], y2: [70, 18, 70] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' as const, times: [0, 0.4, 1] }} />
      <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
        x1="50" y1="35" animate={{ x2: [60, 65, 60], y2: [70, 18, 70] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' as const, times: [0, 0.4, 1] }} />
      {/* legs */}
      <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
        x1="50" y1="60" animate={{ x2: [42, 45, 42], y2: [105, 90, 105] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' as const, times: [0, 0.4, 1] }} />
      <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
        x1="50" y1="60" animate={{ x2: [58, 55, 58], y2: [105, 90, 105] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' as const, times: [0, 0.4, 1] }} />
    </motion.g>
  </Stage>
)

// ── Jump rope ──────────────────────────────────────────────────────────────
const JumpRopeAnim = () => (
  <Stage>
    <motion.g animate={{ y: [0, -8] }} transition={{ ...cycle, duration: 0.6 }}>
      <circle cx="50" cy="22" r="6" fill={stroke} />
      <line x1="50" y1="28" x2="50" y2="70" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="70" x2="42" y2="100" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="70" x2="58" y2="100" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="36" x2="38" y2="55" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="36" x2="62" y2="55" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </motion.g>
    {/* rope as ellipse rotating around figure */}
    <motion.ellipse cx="50" cy="80" rx="35" ry="35" fill="none" stroke={stroke} strokeWidth="1.5"
      animate={{ ry: [10, 35, 10] }} transition={{ ...cycle, duration: 0.6 }} />
  </Stage>
)

// ── Burpee ─────────────────────────────────────────────────────────────────
const BurpeeAnim = () => (
  <Stage>
    {/* alternates between standing and plank */}
    <motion.g
      animate={{ rotate: [0, -88, -88, 0] }}
      style={{ originX: '50px', originY: '90px' }}
      transition={{ duration: 2.2, repeat: Infinity, times: [0, 0.35, 0.65, 1], ease: 'easeInOut' as const }}
    >
      <circle cx="50" cy="20" r="6" fill={stroke} />
      <line x1="50" y1="26" x2="50" y2="68" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="68" x2="42" y2="90" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="68" x2="58" y2="90" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="36" x2="40" y2="65" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="36" x2="60" y2="65" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </motion.g>
  </Stage>
)

// ── Carry ──────────────────────────────────────────────────────────────────
const CarryAnim = () => (
  <Stage>
    {/* upright figure with weights at sides */}
    <motion.g animate={{ x: [-3, 3] }} transition={{ ...cycle, duration: 0.7 }}>
      <circle cx="50" cy="22" r="6" fill={stroke} />
      <line x1="50" y1="28" x2="50" y2="75" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* arms straight down */}
      <line x1="42" y1="36" x2="40" y2="78" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="58" y1="36" x2="60" y2="78" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* weights */}
      <rect x="32" y="80" width="16" height="6" rx="1.5" fill={stroke} />
      <rect x="52" y="80" width="16" height="6" rx="1.5" fill={stroke} />
    </motion.g>
    {/* alternating step legs */}
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="50" y1="75" animate={{ x2: [42, 44], y2: [115, 110] }} transition={{ ...cycle, duration: 0.7 }} />
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="50" y1="75" animate={{ x2: [58, 56], y2: [110, 115] }} transition={{ ...cycle, duration: 0.7 }} />
  </Stage>
)

// ── Rotation (twist) ───────────────────────────────────────────────────────
const RotationAnim = () => (
  <Stage>
    <circle cx="50" cy="22" r="6" fill={stroke} />
    {/* torso twists */}
    <motion.g
      style={{ originX: '50px', originY: '60px' }}
      animate={{ rotate: [-20, 20] }}
      transition={cycle}
    >
      <line x1="50" y1="28" x2="50" y2="75" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="35" y1="50" x2="65" y2="50" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </motion.g>
    <line x1="50" y1="75" x2="42" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <line x1="50" y1="75" x2="58" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
  </Stage>
)

// ── Combat (punching) ──────────────────────────────────────────────────────
const CombatAnim = () => (
  <Stage>
    <circle cx="40" cy="22" r="6" fill={stroke} />
    <line x1="40" y1="28" x2="50" y2="72" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <line x1="50" y1="72" x2="40" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <line x1="50" y1="72" x2="60" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    {/* lead arm jabs */}
    <motion.line stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      x1="44" y1="36" animate={{ x2: [60, 85], y2: [48, 30] }} transition={{ ...cycle, duration: 0.6 }} />
    {/* rear arm guard */}
    <line x1="44" y1="36" x2="35" y2="30" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
  </Stage>
)

// ── Stretch ────────────────────────────────────────────────────────────────
const StretchAnim = () => (
  <Stage>
    {/* slow gentle forward fold */}
    <motion.g
      style={{ originX: '50px', originY: '70px' }}
      animate={{ rotate: [0, -75] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const, repeatType: 'reverse' as const }}
    >
      <circle cx="50" cy="22" r="6" fill={stroke} />
      <line x1="50" y1="28" x2="50" y2="70" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="40" x2="50" y2="82" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </motion.g>
    {/* legs straight */}
    <line x1="50" y1="70" x2="42" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <line x1="50" y1="70" x2="58" y2="115" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
  </Stage>
)

// ── Default fallback ───────────────────────────────────────────────────────
const DefaultAnim = () => (
  <Stage>
    <motion.g animate={{ y: [0, -4] }} transition={{ ...cycle, duration: 1.2 }}>
      <circle cx="50" cy="22" r="6" fill={stroke} />
      <line x1="50" y1="28" x2="50" y2="70" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="36" x2="38" y2="55" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="36" x2="62" y2="55" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="70" x2="42" y2="110" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1="50" y1="70" x2="58" y2="110" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </motion.g>
  </Stage>
)

// ── Dispatcher ─────────────────────────────────────────────────────────────

const REGISTRY: Record<MovementPattern, () => JSX.Element> = {
  squat: SquatAnim,
  hinge: HingeAnim,
  lunge: LungeAnim,
  'press-horizontal': PressHorizontalAnim,
  'press-vertical': PressVerticalAnim,
  'pull-vertical': PullVerticalAnim,
  'pull-horizontal': PullHorizontalAnim,
  curl: CurlAnim,
  extension: ExtensionAnim,
  'raise-lateral': RaiseLateralAnim,
  shrug: ShrugAnim,
  'core-flexion': CoreFlexionAnim,
  plank: PlankAnim,
  'glute-bridge': GluteBridgeAnim,
  'calf-raise': CalfRaiseAnim,
  'cardio-run': CardioRunAnim,
  'cardio-bike': CardioBikeAnim,
  'cardio-row': CardioRowAnim,
  'cardio-swim': CardioSwimAnim,
  jump: JumpAnim,
  'jump-rope': JumpRopeAnim,
  burpee: BurpeeAnim,
  carry: CarryAnim,
  rotation: RotationAnim,
  combat: CombatAnim,
  stretch: StretchAnim,
  default: DefaultAnim,
}

export const PatternAnimation = ({ pattern }: { pattern: MovementPattern }) => {
  const Comp = REGISTRY[pattern] ?? DefaultAnim
  return <Comp />
}
