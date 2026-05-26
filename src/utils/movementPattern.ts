import type { Exercise } from '../types'

/**
 * The movement-pattern animation each exercise maps to.
 * Each pattern has a corresponding looping SVG animation in
 * `src/components/exercise-vis/animations/`.
 *
 * Picking a pattern is a heuristic — the name + category + equipment of the
 * exercise are matched against keyword rules. If nothing matches, we fall
 * back to `default`.
 */
export type MovementPattern =
  | 'squat'              // knee-dominant standing lower body
  | 'hinge'              // hip-dominant (deadlift, RDL, good morning)
  | 'lunge'              // split stance
  | 'press-horizontal'   // bench press, push-up
  | 'press-vertical'     // overhead press, pike push-up
  | 'pull-vertical'      // pull-up, lat pulldown
  | 'pull-horizontal'    // row variants
  | 'curl'               // bicep flexion
  | 'extension'          // tricep extension
  | 'raise-lateral'      // lateral raise, front raise, face pull
  | 'shrug'              // shrug
  | 'core-flexion'       // crunch, sit-up, leg raise
  | 'plank'              // static core hold
  | 'glute-bridge'       // hip thrust, bridge
  | 'calf-raise'         // calf raise
  | 'cardio-run'         // running, walking, mountain climbers
  | 'cardio-bike'        // cycling, elliptical, stair climber
  | 'cardio-row'         // rowing machine
  | 'cardio-swim'        // swimming
  | 'jump'               // jump squat, box jump, broad jump
  | 'jump-rope'          // jump rope
  | 'burpee'             // burpees
  | 'carry'              // farmer's carry, plate pinch carry
  | 'rotation'           // russian twist, woodchopper, bicycle crunch
  | 'combat'             // bag work, shadow boxing
  | 'stretch'            // mobility / stretching
  | 'default'            // anything else — generic figure

interface Rule {
  pattern: MovementPattern
  test: (ex: Exercise) => boolean
}

const nameMatch = (name: string, ...needles: string[]) => {
  const n = name.toLowerCase()
  return needles.some((s) => n.includes(s))
}

/* Rules are checked in order — first match wins. So more specific rules go
 * first (e.g. "jump squat" must match `jump` before `squat`). */
const RULES: Rule[] = [
  // Cardio specifics
  { pattern: 'cardio-bike', test: (e) => nameMatch(e.name, 'cycl', 'elliptical', 'stair') },
  { pattern: 'cardio-row',  test: (e) => nameMatch(e.name, 'rowing machine', 'rowing m') },
  { pattern: 'cardio-swim', test: (e) => nameMatch(e.name, 'swim') },
  { pattern: 'jump-rope',   test: (e) => nameMatch(e.name, 'jump rope', 'jump-rope') },
  { pattern: 'burpee',      test: (e) => nameMatch(e.name, 'burpee') },
  { pattern: 'combat',      test: (e) => nameMatch(e.name, 'bag', 'box', 'kick', 'shadow') && e.category === 'cardio' },
  // Jumping (must come before squat / lunge)
  { pattern: 'jump',        test: (e) => nameMatch(e.name, 'jump', 'broad jump', 'tuck', 'hop', 'plyometric') },
  // Carries
  { pattern: 'carry',       test: (e) => nameMatch(e.name, 'carry', 'farmer') },
  // Mobility
  { pattern: 'stretch',     test: (e) => nameMatch(e.name, 'stretch', 'mobility') },
  // Core / static
  { pattern: 'plank',       test: (e) => nameMatch(e.name, 'plank', 'hollow', 'superman', 'dead hang', 'l-sit', 'wall sit', 'bird dog') },
  { pattern: 'rotation',    test: (e) => nameMatch(e.name, 'twist', 'bicycle crunch', 'woodchopper', 'scorpion', 'roundhouse') },
  { pattern: 'core-flexion',test: (e) => e.category === 'core' || nameMatch(e.name, 'crunch', 'sit-up', 'sit up', 'v-up', 'leg raise', 'flutter', 'ab wheel', 'dragon flag', 'med ball slam') },
  // Glute bridge / hip thrust
  { pattern: 'glute-bridge',test: (e) => nameMatch(e.name, 'hip thrust', 'glute bridge', 'kickback', 'glute') && !nameMatch(e.name, 'jump') },
  // Calf raise
  { pattern: 'calf-raise',  test: (e) => nameMatch(e.name, 'calf raise') },
  // Raises
  { pattern: 'raise-lateral', test: (e) => nameMatch(e.name, 'lateral raise', 'front raise', 'reverse fly', 'reverse dumbbell fly', 'face pull') },
  // Shrug
  { pattern: 'shrug',       test: (e) => nameMatch(e.name, 'shrug') },
  // Curl / extension
  { pattern: 'extension',   test: (e) => nameMatch(e.name, 'pushdown', 'skull', 'tricep extension', 'overhead tricep') },
  { pattern: 'curl',        test: (e) => nameMatch(e.name, 'curl') && !nameMatch(e.name, 'wrist curl', 'leg curl', 'nordic') },
  { pattern: 'extension',   test: (e) => nameMatch(e.name, 'leg curl', 'nordic') }, // hamstring curl looks like extension reversed
  // Press
  { pattern: 'press-vertical', test: (e) => nameMatch(e.name, 'overhead press', 'arnold press', 'pike push', 'thruster', 'upright row') },
  { pattern: 'press-horizontal', test: (e) => nameMatch(e.name, 'bench press', 'push-up', 'push up', 'chest press', 'pec deck', 'fly', 'dumbbell fly', 'cable fly', 'dip ', 'dip', 'close-grip bench', 'decline bench', 'dumbbell bench', 'chest press', 'plyometric push', 'bench dip') },
  // Pull
  { pattern: 'pull-vertical', test: (e) => nameMatch(e.name, 'pull-up', 'pull up', 'chin-up', 'chin up', 'pulldown', 'muscle-up', 'rope climb') },
  { pattern: 'pull-horizontal', test: (e) => nameMatch(e.name, 'row', 'inverted', 'trx') },
  // Hinge
  { pattern: 'hinge',       test: (e) => nameMatch(e.name, 'deadlift', 'romanian', 'good morning', 'hyperextension', 'stiff-leg', 'sumo deadlift', 'tire flip', 'jefferson') },
  // Lunge
  { pattern: 'lunge',       test: (e) => nameMatch(e.name, 'lunge', 'split squat', 'step-up', 'step up', 'pistol') },
  // Squat
  { pattern: 'squat',       test: (e) => nameMatch(e.name, 'squat', 'leg press', 'leg extension', 'sissy', 'air squat', 'goblet') },
  // Running / cardio fallback
  { pattern: 'cardio-run',  test: (e) => e.category === 'cardio' || nameMatch(e.name, 'run', 'sprint', 'walk', 'mountain climber', 'high knees', 'ladder', 'cone', 'sled') },
]

export const getMovementPattern = (ex: Exercise): MovementPattern => {
  for (const r of RULES) if (r.test(ex)) return r.pattern
  return 'default'
}

// ── Form cues per pattern (3–5 bullets) ──────────────────────────────────────

export const PATTERN_CUES: Record<MovementPattern, { title: string; cues: string[] }> = {
  squat: {
    title: 'Squat',
    cues: [
      'Brace your core, chest up. Hips and shoulders should descend together.',
      'Push the knees out so they track over the toes — not collapsing inward.',
      'Sit between your legs, weight balanced over the mid-foot.',
      'Drive the floor away on the way up; squeeze glutes at the top.',
    ],
  },
  hinge: {
    title: 'Hip hinge',
    cues: [
      'Push the hips back first, knees bend only as the bar passes them.',
      'Keep the spine neutral — bar travels in a straight vertical line.',
      'Lats tight, the bar should feel "glued" to your legs.',
      'Stand by driving the floor away and squeezing the glutes hard.',
    ],
  },
  lunge: {
    title: 'Lunge',
    cues: [
      'Step out far enough that the front knee stays over the front foot.',
      'Lower the back knee toward the floor — torso upright.',
      'Push through the front heel to return — front quad and glute do the work.',
      'Switch legs each rep or alternate as prescribed.',
    ],
  },
  'press-horizontal': {
    title: 'Horizontal press',
    cues: [
      'Set the shoulders back and down before unracking.',
      'Bar / hands lower to the mid-chest with elbows ~45–60° from the torso.',
      'Press up and slightly back over the shoulders — full lockout.',
      'Feet planted, glutes tight throughout.',
    ],
  },
  'press-vertical': {
    title: 'Vertical press',
    cues: [
      'Bar starts at the front of the shoulders, elbows just in front of the bar.',
      'Squeeze the glutes — no lower-back lean back.',
      'Press straight up; pass the head, then move the head slightly forward at lockout.',
      'Finish with biceps near the ears, lats tight.',
    ],
  },
  'pull-vertical': {
    title: 'Vertical pull',
    cues: [
      'Dead-hang start. Engage the lats by pulling the shoulders down and back.',
      'Lead with the chest, drive the elbows down to the hips.',
      'Full chin-over-the-bar — control the descent, no kipping.',
      'Avoid shrugging the traps — keep the lats doing the work.',
    ],
  },
  'pull-horizontal': {
    title: 'Horizontal pull',
    cues: [
      'Hinge slightly forward; chest up, lats packed.',
      'Pull the bar / handle to the lower ribs — elbows tucked.',
      'Squeeze the shoulder blades together briefly at the top.',
      'Lower under control — don\'t let the weight yank you forward.',
    ],
  },
  curl: {
    title: 'Curl',
    cues: [
      'Elbows pinned to your sides — they shouldn\'t drift forward.',
      'Curl by flexing the biceps, not by swinging the body.',
      'Squeeze hard at the top, control the eccentric (lowering) slowly.',
      'Full range — fully straighten at the bottom each rep.',
    ],
  },
  extension: {
    title: 'Tricep extension',
    cues: [
      'Lock the upper arm in position — only the forearm moves.',
      'Lower under control with a slight stretch on the long head.',
      'Extend until the elbow is straight; squeeze the tricep.',
      'No flaring elbows out wide — keep them in close.',
    ],
  },
  'raise-lateral': {
    title: 'Lateral raise',
    cues: [
      'Slight bend in the elbows, locked for the set.',
      'Lead with the elbows, not the hands — pinky slightly up.',
      'Raise to about shoulder height — no higher.',
      'Lower slowly; this lift is all about strict form, not weight.',
    ],
  },
  shrug: {
    title: 'Shrug',
    cues: [
      'Stand tall, weight in straight arms at the sides.',
      'Lift the shoulders straight UP toward the ears — no rolling.',
      'Pause and squeeze at the top.',
      'Lower under control; let the traps fully stretch at the bottom.',
    ],
  },
  'core-flexion': {
    title: 'Crunch / sit-up',
    cues: [
      'Curl the spine — bring the ribs toward the hips.',
      'Don\'t yank on the neck; chin slightly tucked.',
      'Exhale on the crunch up, inhale on the return.',
      'Slow and deliberate beats fast and bouncy.',
    ],
  },
  plank: {
    title: 'Plank / hold',
    cues: [
      'Straight line from ears to ankles — no sagging hips, no piking up.',
      'Squeeze glutes and quads; brace the abs hard.',
      'Pack the shoulders down and back; push the floor away.',
      'Breathe normally — don\'t hold your breath.',
    ],
  },
  'glute-bridge': {
    title: 'Glute bridge / hip thrust',
    cues: [
      'Drive through the heels; shins stay roughly vertical at the top.',
      'Squeeze the glutes hard — push the hips to the ceiling.',
      'Chin slightly tucked, ribs down (no lower-back arching).',
      'Pause briefly at lockout, lower under control.',
    ],
  },
  'calf-raise': {
    title: 'Calf raise',
    cues: [
      'Rise as high as you can onto the balls of the feet.',
      'Pause and squeeze the calves at the top.',
      'Lower SLOWLY into a full stretch at the bottom.',
      'Quality over quantity — full range matters most.',
    ],
  },
  'cardio-run': {
    title: 'Running / cardio',
    cues: [
      'Land mid-foot, under the centre of mass — not heel-striking far out front.',
      'Cadence high (around 170–180 steps/min for most adults).',
      'Relaxed shoulders, light fists; arms swing forward not across.',
      'Breathe through the nose when possible; pace what you can sustain.',
    ],
  },
  'cardio-bike': {
    title: 'Cycling / stepper',
    cues: [
      'Saddle / handle set so the knee has a slight bend at full extension.',
      'Spin smoothly — drive down AND pull up through the pedal stroke.',
      'Keep the upper body quiet; let the legs do the work.',
      'Use resistance + cadence to control intensity, not knees.',
    ],
  },
  'cardio-row': {
    title: 'Rowing',
    cues: [
      'Drive order: legs → hips → arms. Reverse on the recovery.',
      'Lean back ~110° at the finish; pull the handle to the lower sternum.',
      'Recovery is slow and controlled; the drive is explosive.',
      'Aim for ~24–28 strokes/min for steady-state.',
    ],
  },
  'cardio-swim': {
    title: 'Swim',
    cues: [
      'Head neutral, eyes slightly forward — not lifting to breathe.',
      'Body rotates on the long axis — hips drive each stroke.',
      'Bilateral breathing keeps stroke symmetric.',
      'Exhale fully underwater so the inhale is fast and complete.',
    ],
  },
  jump: {
    title: 'Jump',
    cues: [
      'Quick dip, then explode — full triple extension (ankle, knee, hip).',
      'Arms swing back then drive UP into the jump.',
      'Land softly with bent knees absorbing the impact.',
      'Reset before the next rep — quality over speed.',
    ],
  },
  'jump-rope': {
    title: 'Jump rope',
    cues: [
      'Wrists turn the rope, not the whole arms.',
      'Small jumps — barely clear the rope each pass.',
      'Land on the balls of the feet, knees soft.',
      'Eyes forward, relaxed shoulders.',
    ],
  },
  burpee: {
    title: 'Burpee',
    cues: [
      'Squat down, hands plant on the floor.',
      'Kick / step the feet back to a plank; chest taps the floor.',
      'Drive the feet back forward into a squat.',
      'Stand and jump — clap overhead optional.',
    ],
  },
  carry: {
    title: 'Loaded carry',
    cues: [
      'Stand tall, ribs down, abs braced.',
      'Shoulders packed back and down — no shrug.',
      'Walk smoothly; the weight should not swing.',
      'Breathe rhythmically; the goal is grip + posture endurance.',
    ],
  },
  rotation: {
    title: 'Rotation',
    cues: [
      'Initiate the rotation from the trunk, not the arms.',
      'Hips stay relatively still while the rib-cage rotates.',
      'Move slowly through the full range; no bouncy momentum.',
      'Brace the core throughout so the spine stays stable.',
    ],
  },
  combat: {
    title: 'Bag work / shadow boxing',
    cues: [
      'Hands up, chin down; turn the hip and rear foot into power shots.',
      'Snap punches back rather than pushing them.',
      'Stay on the balls of your feet — light and bouncy.',
      'Round-based: full effort during the round, rest fully between.',
    ],
  },
  stretch: {
    title: 'Stretch / mobility',
    cues: [
      'Move slowly into the stretch — no bouncing.',
      'Breathe steadily; relax into each position on the exhale.',
      'Hold each position 20–45 s; back off if it gets sharp.',
      'Both sides if it\'s unilateral.',
    ],
  },
  default: {
    title: 'General form',
    cues: [
      'Set a stable base — feet planted, core braced.',
      'Move with control through the full range of motion.',
      'Match breathing to effort — exhale on the harder phase.',
      'Quality reps beat heavy sloppy ones.',
    ],
  },
}

/** Build a YouTube search URL for an exercise (opens a curated tutorial query). */
export const youtubeSearchUrl = (exercise: Exercise): string => {
  const q = `${exercise.name} proper form tutorial`
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
}
