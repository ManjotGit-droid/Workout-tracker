import type { MuscleGroupId } from '../types'

export type MobilityCategory =
  | 'hips'
  | 'shoulders'
  | 'spine'
  | 'legs'
  | 'arms'
  | 'neck'
  | 'fullbody'

export interface MobilityStretch {
  id: string
  name: string
  category: MobilityCategory
  /** Recommended hold or work time. If `perSide` is true, this is per side. */
  durationSec: number
  /** Muscles / regions this primarily targets — used to match against the user's recent training. */
  muscles: MuscleGroupId[]
  /** One-line how-to. Plain text — rendered as a description under the name. */
  description: string
  /** When true, the UI shows "× 2 sides" and the session adds 2× durationSec to its total. */
  perSide?: boolean
}

/**
 * Curated list of common mobility & stretching movements.
 * Picked for: covers all the major joints, no equipment, safe for beginners,
 * and there's enough variety per region that the adaptive generator can
 * compose a different-feeling routine each day.
 */
export const MOBILITY_STRETCHES: MobilityStretch[] = [
  // ── NECK ─────────────────────────────────────────────────────────────────
  {
    id: 'neck-rolls', name: 'Slow Neck Rolls', category: 'neck',
    durationSec: 45, muscles: ['traps'],
    description: 'Roll the head slowly in a full circle, half-circles only if rolling back feels pinchy. Keep shoulders down.',
  },
  {
    id: 'neck-side-tilt', name: 'Side-to-Side Neck Stretch', category: 'neck',
    durationSec: 20, muscles: ['traps'], perSide: true,
    description: 'Tilt ear toward shoulder, opposite hand reaching down to lengthen the stretch.',
  },
  {
    id: 'chin-tucks', name: 'Chin Tucks', category: 'neck',
    durationSec: 30, muscles: ['traps'],
    description: 'Glide the head straight back (creating a double chin). Resets forward-head posture from phone use.',
  },

  // ── SHOULDERS ───────────────────────────────────────────────────────────
  {
    id: 'shoulder-rolls', name: 'Shoulder Rolls', category: 'shoulders',
    durationSec: 45, muscles: ['traps', 'rear_delts'],
    description: 'Big slow circles — forward 10, backward 10. Loosens the upper-back area.',
  },
  {
    id: 'shoulder-dislocates', name: 'Band / Towel Shoulder Dislocates', category: 'shoulders',
    durationSec: 60, muscles: ['front_delts', 'rear_delts', 'chest'],
    description: 'Hold a band or towel wide; sweep it overhead and behind the back. Widen grip if it pinches.',
  },
  {
    id: 'doorway-pec', name: 'Doorway Pec Stretch', category: 'shoulders',
    durationSec: 30, muscles: ['chest', 'front_delts'], perSide: true,
    description: 'Forearm on door frame at 90°, step through gently until the chest opens up.',
  },
  {
    id: 'cross-body-shoulder', name: 'Cross-Body Shoulder Stretch', category: 'shoulders',
    durationSec: 25, muscles: ['rear_delts'], perSide: true,
    description: 'Pull one arm across the chest, opposite hand at the elbow. Targets the rear delts.',
  },
  {
    id: 'tricep-overhead-stretch', name: 'Overhead Tricep Stretch', category: 'arms',
    durationSec: 25, muscles: ['triceps', 'lats'], perSide: true,
    description: 'Reach one hand behind the neck, other hand pushes the elbow gently down and inward.',
  },

  // ── SPINE / THORACIC ────────────────────────────────────────────────────
  {
    id: 'cat-cow', name: 'Cat–Cow', category: 'spine',
    durationSec: 60, muscles: ['lower_back', 'upper_abs'],
    description: 'On all fours, alternate arching and rounding the back. Move slowly with the breath.',
  },
  {
    id: 'open-book', name: 'Open-Book Thoracic Rotation', category: 'spine',
    durationSec: 30, muscles: ['lower_back', 'lats'], perSide: true,
    description: 'Side-lying, knees stacked. Sweep the top arm across the body to open the chest.',
  },
  {
    id: 'thread-needle', name: 'Thread the Needle', category: 'spine',
    durationSec: 30, muscles: ['rhomboids', 'lats'], perSide: true,
    description: 'From all fours, slide one arm under the body, shoulder and ear toward the floor.',
  },
  {
    id: 'cobra', name: 'Cobra Stretch', category: 'spine',
    durationSec: 30, muscles: ['upper_abs', 'lower_abs', 'lower_back'],
    description: 'Lie face-down, press the chest up keeping hips on the floor. Big front-body stretch.',
  },
  {
    id: 'child-pose', name: "Child's Pose", category: 'spine',
    durationSec: 60, muscles: ['lats', 'lower_back'],
    description: 'Sit hips back to heels, arms extended forward, forehead toward the floor.',
  },
  {
    id: 'supine-twist', name: 'Supine Spinal Twist', category: 'spine',
    durationSec: 30, muscles: ['lower_back', 'obliques'], perSide: true,
    description: 'Lying on back, drop bent knees to one side, opposite arm reaches out. Eyes follow the hand.',
  },
  {
    id: 'jefferson-curl', name: 'Slow Jefferson Curl', category: 'spine',
    durationSec: 45, muscles: ['lower_back', 'hamstrings'],
    description: 'Stand and roll down one vertebra at a time, hands toward toes. Roll up the same way.',
  },

  // ── HIPS ────────────────────────────────────────────────────────────────
  {
    id: 'hip-flexor-lunge', name: 'Half-Kneeling Hip Flexor Stretch', category: 'hips',
    durationSec: 30, muscles: ['hip_flexors', 'quads'], perSide: true,
    description: 'Half-kneeling, tuck the pelvis under and squeeze the back glute. Stretch is in the front of the hip.',
  },
  {
    id: 'pigeon-pose', name: 'Pigeon Pose', category: 'hips',
    durationSec: 45, muscles: ['glutes', 'hip_flexors'], perSide: true,
    description: 'Front shin on the floor at an angle, back leg extended. Lower the torso forward.',
  },
  {
    id: '90-90', name: '90/90 Hip Switch', category: 'hips',
    durationSec: 60, muscles: ['glutes', 'inner_thighs', 'hip_flexors'],
    description: 'Seated, both legs bent at 90°. Switch sides smoothly — opens internal and external rotation.',
  },
  {
    id: 'butterfly', name: 'Butterfly Stretch', category: 'hips',
    durationSec: 45, muscles: ['inner_thighs', 'glutes'],
    description: 'Sit, soles of feet together. Press knees down gently and lean forward from the hips.',
  },
  {
    id: 'deep-squat-hold', name: 'Deep Squat Hold', category: 'hips',
    durationSec: 60, muscles: ['glutes', 'quads', 'inner_thighs', 'calves'],
    description: 'Sit into a deep squat, elbows pressing knees outward. Holds open the ankles and hips.',
  },
  {
    id: 'frog-stretch', name: 'Frog Stretch', category: 'hips',
    durationSec: 60, muscles: ['inner_thighs', 'glutes'],
    description: 'Knees wide on the floor, hips back. Moves slowly side-to-side or holds. Strong adductor stretch.',
  },
  {
    id: 'world-greatest', name: "World's Greatest Stretch", category: 'fullbody',
    durationSec: 30, muscles: ['hip_flexors', 'glutes', 'lats', 'inner_thighs'], perSide: true,
    description: 'Lunge forward, plant the same-side hand inside the foot, rotate the other arm to the ceiling.',
  },

  // ── LEGS ────────────────────────────────────────────────────────────────
  {
    id: 'lying-hamstring', name: 'Lying Hamstring Stretch', category: 'legs',
    durationSec: 30, muscles: ['hamstrings'], perSide: true,
    description: 'On your back, one leg straight up. Loop a band or towel around the foot and pull gently.',
  },
  {
    id: 'standing-forward-fold', name: 'Standing Forward Fold', category: 'legs',
    durationSec: 45, muscles: ['hamstrings', 'lower_back', 'calves'],
    description: 'Stand, soft knees, fold from the hips. Let the head dangle. Sway side to side if you want.',
  },
  {
    id: 'couch-stretch', name: 'Couch Stretch', category: 'hips',
    durationSec: 45, muscles: ['quads', 'hip_flexors'], perSide: true,
    description: 'Back foot up on a couch or wall, front foot planted. Tall torso, squeeze the back glute.',
  },
  {
    id: 'downward-dog', name: 'Downward Dog Calf Pump', category: 'legs',
    durationSec: 45, muscles: ['calves', 'hamstrings', 'lats'],
    description: 'Inverted-V pose, alternate pressing each heel toward the floor. Wakes up the calves.',
  },
  {
    id: 'standing-calf-wall', name: 'Wall Calf Stretch', category: 'legs',
    durationSec: 30, muscles: ['calves'], perSide: true,
    description: 'Hands on a wall, one foot back, that heel pressing the floor. Switch sides.',
  },
  {
    id: 'scorpion', name: 'Scorpion (Prone Twist)', category: 'spine',
    durationSec: 30, muscles: ['obliques', 'lower_back', 'hip_flexors'], perSide: true,
    description: 'Face-down, one leg sweeps over to the opposite side. Arms wide. Mobile thoracic + hip flexor.',
  },

  // ── ARMS / WRIST / ANKLE (small joints) ─────────────────────────────────
  {
    id: 'wrist-circles', name: 'Wrist Circles + Flex/Extend', category: 'arms',
    durationSec: 45, muscles: ['forearms'],
    description: 'Big slow circles each way, then flex and extend the wrists. Essential for grip-heavy training.',
  },
  {
    id: 'ankle-circles', name: 'Ankle Circles', category: 'legs',
    durationSec: 45, muscles: ['calves'],
    description: 'Lift one foot off the floor, circle the ankle each way. Switch.',
  },
  {
    id: 'lat-stretch', name: 'Hanging / Doorway Lat Stretch', category: 'arms',
    durationSec: 30, muscles: ['lats'], perSide: true,
    description: 'Hold a doorframe or bar with one hand, sink the hips away to lengthen the lat. Or just hang.',
  },
]
