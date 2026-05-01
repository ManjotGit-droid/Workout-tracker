import type { MuscleGroupId, MuscleGroupMeta } from '../types'

export const MUSCLE_GROUPS: Record<MuscleGroupId, MuscleGroupMeta> = {
  chest: {
    id: 'chest', name: 'Chest', displayName: 'Pectorals', shortName: 'Chest',
    svgIds: ['chest-l', 'chest-r'], view: 'front',
  },
  front_delts: {
    id: 'front_delts', name: 'Front Deltoids', displayName: 'Front Deltoids', shortName: 'F.Delts',
    svgIds: ['front-delt-l', 'front-delt-r'], view: 'front',
  },
  side_delts: {
    id: 'side_delts', name: 'Side Deltoids', displayName: 'Lateral Deltoids', shortName: 'S.Delts',
    svgIds: ['side-delt-l', 'side-delt-r', 'side-delt-back-l', 'side-delt-back-r'], view: 'both',
  },
  rear_delts: {
    id: 'rear_delts', name: 'Rear Deltoids', displayName: 'Rear Deltoids', shortName: 'R.Delts',
    svgIds: ['rear-delt-l', 'rear-delt-r'], view: 'back',
  },
  biceps: {
    id: 'biceps', name: 'Biceps', displayName: 'Biceps Brachii', shortName: 'Biceps',
    svgIds: ['bicep-l', 'bicep-r'], view: 'front',
  },
  triceps: {
    id: 'triceps', name: 'Triceps', displayName: 'Triceps Brachii', shortName: 'Triceps',
    svgIds: ['tricep-l', 'tricep-r'], view: 'back',
  },
  forearms: {
    id: 'forearms', name: 'Forearms', displayName: 'Forearms', shortName: 'Forearms',
    svgIds: ['forearm-l', 'forearm-r', 'forearm-back-l', 'forearm-back-r'], view: 'both',
  },
  upper_abs: {
    id: 'upper_abs', name: 'Upper Abs', displayName: 'Upper Rectus Abdominis', shortName: 'Upper Abs',
    svgIds: ['upper-abs'], view: 'front',
  },
  lower_abs: {
    id: 'lower_abs', name: 'Lower Abs', displayName: 'Lower Rectus Abdominis', shortName: 'Lower Abs',
    svgIds: ['lower-abs'], view: 'front',
  },
  obliques: {
    id: 'obliques', name: 'Obliques', displayName: 'Obliques', shortName: 'Obliques',
    svgIds: ['oblique-l', 'oblique-r'], view: 'front',
  },
  quads: {
    id: 'quads', name: 'Quadriceps', displayName: 'Quadriceps', shortName: 'Quads',
    svgIds: ['quad-l', 'quad-r'], view: 'front',
  },
  inner_thighs: {
    id: 'inner_thighs', name: 'Inner Thighs', displayName: 'Hip Adductors', shortName: 'Adductors',
    svgIds: ['inner-thigh-l', 'inner-thigh-r'], view: 'front',
  },
  hip_flexors: {
    id: 'hip_flexors', name: 'Hip Flexors', displayName: 'Hip Flexors', shortName: 'Hip Flex',
    svgIds: ['hip-l', 'hip-r'], view: 'front',
  },
  traps: {
    id: 'traps', name: 'Trapezius', displayName: 'Trapezius', shortName: 'Traps',
    svgIds: ['trap-l', 'trap-r'], view: 'back',
  },
  lats: {
    id: 'lats', name: 'Latissimus Dorsi', displayName: 'Latissimus Dorsi', shortName: 'Lats',
    svgIds: ['lat-l', 'lat-r'], view: 'back',
  },
  rhomboids: {
    id: 'rhomboids', name: 'Rhomboids', displayName: 'Rhomboids / Mid Traps', shortName: 'Rhomboids',
    svgIds: ['rhomboid-l', 'rhomboid-r'], view: 'back',
  },
  lower_back: {
    id: 'lower_back', name: 'Lower Back', displayName: 'Erector Spinae', shortName: 'Low Back',
    svgIds: ['lower-back'], view: 'back',
  },
  glutes: {
    id: 'glutes', name: 'Glutes', displayName: 'Gluteus Maximus', shortName: 'Glutes',
    svgIds: ['glute-l', 'glute-r'], view: 'back',
  },
  hamstrings: {
    id: 'hamstrings', name: 'Hamstrings', displayName: 'Hamstrings', shortName: 'Hamstrings',
    svgIds: ['ham-l', 'ham-r'], view: 'back',
  },
  calves: {
    id: 'calves', name: 'Calves', displayName: 'Gastrocnemius / Soleus', shortName: 'Calves',
    svgIds: ['calf-l', 'calf-r', 'calf-back-l', 'calf-back-r'], view: 'both',
  },
}

export const MUSCLE_GROUP_IDS = Object.keys(MUSCLE_GROUPS) as MuscleGroupId[]
