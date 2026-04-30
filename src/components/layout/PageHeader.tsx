import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
  subtitle?: string
  back?: boolean
  right?: ReactNode
}

export function PageHeader({ title, subtitle, back, right }: Props) {
  const navigate = useNavigate()

  return (
    <div className="sticky top-0 z-30 bg-sl-bg/95 backdrop-blur border-b border-sl-border px-4 py-3 flex items-center gap-3">
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="text-sl-muted hover:text-sl-text transition-colors p-1"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold font-display tracking-wide truncate">{title}</h1>
        {subtitle && <p className="text-xs text-sl-muted font-mono">{subtitle}</p>}
      </div>
      {right && <div className="flex items-center gap-2 flex-shrink-0">{right}</div>}
    </div>
  )
}
