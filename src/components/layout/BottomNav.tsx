import { NavLink, useLocation } from 'react-router-dom'
import { useAppStore } from '../../store/AppContext'

interface Tab {
  to: string
  label: string
  icon: React.ReactNode
}

const tabs: Tab[] = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px]">
        <path d="M3 12l9-9 9 9M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/workout',
    label: 'Train',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px]">
        <path d="M4 9v6M7 6v12M17 6v12M20 9v6M7 12h10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/plans',
    label: 'Plans',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px]">
        <rect x="4" y="3" width="16" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 8h6M9 12h6M9 16h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/exercises',
    label: 'Library',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px]">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v-13H6.5A2.5 2.5 0 0 0 4 6.5v13z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 22H20" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Progress',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px]">
        <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 7h7v7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

/**
 * Forge bottom nav — floating glass capsule pinned to the bottom safe area.
 * Active item gets a radial-gradient halo behind the icon and the accent
 * stroke colour; inactive items are muted. No raised circle, no spring.
 */
export const BottomNav = () => {
  const location = useLocation()
  const { state } = useAppStore()
  const hasActiveWorkout = !!state.activeWorkout

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-3 left-3 right-3 z-40 safe-bottom pointer-events-none"
    >
      <div className="relative mx-auto max-w-md pointer-events-auto">
        <div className="relative bg-elevated/80 backdrop-blur-xl border border-border rounded-full shadow-card flex items-center justify-around px-3 py-2 glass-inner-highlight">
          {tabs.map((tab) => {
            const isActive =
              tab.to === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.to)
            const isWorkout = tab.to === '/workout'
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-colors ${
                  isActive ? 'text-accent' : 'text-text-muted hover:text-text'
                }`}
                style={
                  isActive
                    ? {
                        background:
                          'radial-gradient(circle at center, var(--accent-soft) 0%, transparent 70%)',
                        filter: 'drop-shadow(0 0 6px rgba(202, 255, 58, 0.45))',
                      }
                    : undefined
                }
              >
                {tab.icon}
                {isWorkout && hasActiveWorkout && !isActive && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full pulse-glow" />
                )}
              </NavLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
