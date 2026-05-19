import { useNavigate } from 'react-router-dom'
import { useUsers } from '../../store/UserContext'

/**
 * Small floating avatar pill showing the active profile.  Tap to open the
 * Profiles management page.
 */
export const UserPill = ({ className = '' }: { className?: string }) => {
  const navigate = useNavigate()
  const { activeUser, users } = useUsers()
  const inits = activeUser?.name?.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?'

  return (
    <button
      onClick={() => navigate('/users')}
      aria-label={`Profile: ${activeUser?.name ?? 'unknown'}`}
      className={`app-btn h-9 rounded-full flex items-center gap-2 pl-1 pr-3 bg-elevated/90 backdrop-blur border border-border text-text transition-colors shadow-button ${className}`}
    >
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
        style={{
          background: 'linear-gradient(135deg, var(--brand), var(--accent))',
          color: 'var(--accent-ink)',
        }}
      >
        {inits}
      </span>
      <span className="text-[12px] font-medium leading-none max-w-[100px] truncate">
        {activeUser?.name ?? 'Profile'}
      </span>
      {users.length > 1 && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 opacity-60">
          <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}
