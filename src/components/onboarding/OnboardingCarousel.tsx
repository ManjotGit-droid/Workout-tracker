import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { RankBadge } from '../progression/RankBadge'
import { BodyDiagram } from '../svg/BodyDiagram'
import { GlowButton } from '../ui/GlowButton'

interface Props {
  onDone: () => void
}

const slides = [
  {
    title: 'Welcome, Hunter',
    body: 'Solo Gym is a fully-offline workout tracker themed after the rank system. Lift more, level up your muscles, climb from E → SS.',
    chrome: (
      <div className="flex items-center justify-center gap-4 my-4">
        <RankBadge rank="E" size="lg" />
        <span className="text-2xl text-text-muted">→</span>
        <RankBadge rank="SS" size="lg" />
      </div>
    ),
  },
  {
    title: 'Earn XP per muscle',
    body: 'Every completed set awards XP to the targeted muscles. Each muscle has its own level, tier, and history. Tap the diagram on the dashboard any time to drill in.',
    chrome: (
      <div className="flex justify-center my-2">
        <div className="w-44">
          <BodyDiagram activatedMuscleIds={['chest', 'biceps', 'quads']} />
        </div>
      </div>
    ),
  },
  {
    title: 'Start your first hunt',
    body: 'Tap Start to begin a session. Log sets — weight, reps, optional RPE & notes — and the rest timer auto-runs after each one. Stay consistent: streaks and PRs do the rest.',
    chrome: (
      <div className="flex justify-center my-4">
        <div className="w-14 h-14 rounded-full bg-accent text-accent-ink flex items-center justify-center shadow-card glow-ring-brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-7 h-7">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    ),
  },
] as const

export const OnboardingCarousel = ({ onDone }: Props) => {
  const [idx, setIdx] = useState(0)
  const navigate = useNavigate()
  const slide = slides[idx]
  const isLast = idx === slides.length - 1

  const close = () => {
    localStorage.setItem('onboarded', '1')
    onDone()
  }

  const next = () => {
    if (isLast) {
      close()
      navigate('/workout')
    } else {
      setIdx((i) => i + 1)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] bg-bg flex flex-col safe-top safe-bottom">
      <div className="flex justify-end px-4 pt-3">
        <button
          onClick={close}
          className="text-xs font-mono text-text-muted hover:text-text px-3 py-1.5 rounded"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 px-6 flex flex-col items-center justify-center text-center overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="max-w-sm w-full"
          >
            <div className="text-[11px] font-mono text-text-muted uppercase tracking-widest mb-2">
              Step {idx + 1} of {slides.length}
            </div>
            <h1 className="text-2xl font-display font-bold text-text mb-2">{slide.title}</h1>
            <p className="text-sm text-text-muted font-mono leading-relaxed mb-4">
              {slide.body}
            </p>
            {slide.chrome}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pb-6">
        <div className="flex justify-center gap-1.5 mb-4">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? 'bg-brand' : 'bg-border'}`}
            />
          ))}
        </div>
        <GlowButton className="w-full py-3" onClick={next}>
          {isLast ? 'Start my first workout' : 'Next'}
        </GlowButton>
        {!isLast && (
          <button
            onClick={close}
            className="block mx-auto mt-3 text-[11px] font-mono text-text-muted hover:text-text"
          >
            Take me to the dashboard
          </button>
        )}
      </div>
    </div>
  )
}
