import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/AppContext'

/**
 * Floating action button anchored above the BottomNav. Always taps through to
 * `/workout` — the Start screen or in-progress session, whichever the app is
 * in. Hidden on the workout flow itself to avoid being redundant.
 */
export const QuickAddFab = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = useAppStore()

  const hideOn = ['/workout', '/workout/complete', '/users']
  if (hideOn.some((p) => location.pathname.startsWith(p))) return null

  const activeWorkout = !!state.activeWorkout
  const label = activeWorkout ? 'Resume workout' : 'Start workout'

  return (
    <motion.button
      type="button"
      onClick={() => navigate('/workout')}
      whileTap={{ scale: 0.92 }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 480, damping: 26 }}
      aria-label={label}
      className="fixed right-4 bottom-[78px] z-40 safe-bottom w-14 h-14 rounded-full bg-brand text-white flex items-center justify-center shadow-card glow-ring-brand"
    >
      {activeWorkout ? (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M8 5v14l11-7z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-6 h-6">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      )}
      {activeWorkout && (
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-brand-bright pulse-glow" />
      )}
    </motion.button>
  )
}
