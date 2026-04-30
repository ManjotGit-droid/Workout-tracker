import { NavLink, useLocation } from 'react-router-dom'
import { useAppStore } from '../../store/AppContext'

const tabs = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    to: '/workout',
    label: 'Train',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M6 6h2M16 6h2M8 6v3a4 4 0 0 0 8 0V6M4 9h2M18 9h2M4 9v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/exercises',
    label: 'Library',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12h6M9 16h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Progress',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export function BottomNav() {
  const location = useLocation()
  const { state } = useAppStore()
  const hasActiveWorkout = !!state.activeWorkout

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-sl-bg border-t border-sl-border safe-bottom">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = tab.to === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.to)
          const isWorkout = tab.to === '/workout'

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-mono transition-colors relative ${
                isActive ? 'text-sl-purple' : 'text-sl-muted hover:text-sl-text'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {isWorkout && hasActiveWorkout && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-sl-purple rounded-full animate-pulse" />
                )}
              </div>
              <span className="text-[10px] uppercase tracking-wider">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-sl-purple rounded-full" />
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
