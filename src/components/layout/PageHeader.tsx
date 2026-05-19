import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
  subtitle?: string
  back?: boolean
  right?: ReactNode
}

export const PageHeader = ({ title, subtitle, back, right }: Props) => {
  const navigate = useNavigate()

  return (
    <div className="sticky top-0 z-30 bg-bg/85 backdrop-blur-xl border-b border-border safe-top px-4 py-3 flex items-center gap-3 theme-fade">
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="app-btn -ml-1 w-9 h-9 rounded-full flex items-center justify-center text-text hover:bg-sunken"
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-[20px] font-semibold tracking-tight truncate text-text">{title}</h1>
        {subtitle && <p className="text-[12px] text-text-muted -mt-0.5">{subtitle}</p>}
      </div>
      {right && <div className="flex items-center gap-2 flex-shrink-0">{right}</div>}
    </div>
  )
}
