import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, useDispatch } from '../../store/AppContext'
import { MUSCLE_GROUPS } from '../../data/muscleGroups'
import { RANK_COLORS } from '../../data/levelConfig'

export const LevelUpModal = () => {
  const { state } = useAppStore()
  const dispatch = useDispatch()
  const event = state.pendingLevelUps[0]

  const dismiss = () => {
    if (event) dispatch({ type: 'DISMISS_LEVEL_UP', muscleId: event.muscleId })
  }

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key={event.muscleId + event.newLevel}
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Content */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-6 p-8 text-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Glow ring */}
            <motion.div
              className="absolute rounded-full"
              style={{ width: 240, height: 240, border: '2px solid #9333ea' }}
              animate={{ scale: [0.8, 1.4], opacity: [1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            />

            {/* Level number */}
            <motion.div
              className="text-8xl font-display font-bold"
              style={{ color: '#9333ea', textShadow: '0 0 40px #9333ea, 0 0 80px #9333ea80' }}
              initial={{ scale: 3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {event.newLevel}
            </motion.div>

            <motion.div
              className="flex flex-col items-center gap-1"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-3xl font-display font-bold text-white tracking-widest uppercase">
                Level Up!
              </div>
              <div className="text-sl-muted font-mono text-sm">
                {MUSCLE_GROUPS[event.muscleId]?.displayName ?? event.muscleId}
              </div>
            </motion.div>

            {event.newRank && (
              <motion.div
                className="mt-2 px-6 py-3 rounded-lg border-2 font-display text-2xl font-bold"
                style={{
                  color: RANK_COLORS[event.newRank].text,
                  borderColor: RANK_COLORS[event.newRank].border,
                  backgroundColor: RANK_COLORS[event.newRank].bg,
                  boxShadow: `0 0 20px ${RANK_COLORS[event.newRank].glow}`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
              >
                RANK {event.newRank} ACHIEVED
              </motion.div>
            )}

            <motion.div
              className="text-sl-muted text-xs font-mono mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Tap anywhere to continue
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
