import { NavLink, useLocation } from 'react-router-dom'
import { useAppStore } from '../../store/AppContext'

const tabs = [
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
      // Dumbbell: two weight stacks bracketing a central bar
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

export const BottomNav = () => {
  const location = useLocation()
  const { state } = useAppStore()
  const hasActiveWorkout = !!state.activeWorkout

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-elevated/85 backdrop-blur-xl border-t border-border safe-bottom theme-fade glass-inner-highlight">
      <div className="flex max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.to === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.to)
          const isWorkout = tab.to === '/workout'

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`flex-1 flex flex-col items-center gap-0.5 pt-2.5 pb-2 transition-colors relative ${
                isActive ? 'text-brand glow-text-soft' : 'text-text-muted hover:text-text-soft'
              }`}
            >
              <div className="relative">
                <div style={{ filter: isActive ? 'drop-shadow(0 0 6px var(--brand))' : 'none' }}>
                  {tab.icon}
                </div>
                {isWorkout && hasActiveWorkout && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-brand rounded-full pulse-glow" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand rounded-full" style={{ boxShadow: '0 0 8px var(--brand)' }} />
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
