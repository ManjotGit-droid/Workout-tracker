import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type ToastVariant = 'default' | 'success' | 'error' | 'info'

interface ToastInput {
  message: string
  variant?: ToastVariant
  /** Milliseconds before auto-dismiss. Default 2400. Pass 0 to stay until tapped. */
  duration?: number
}

interface ToastRecord extends Required<Omit<ToastInput, 'duration'>> {
  id: string
  duration: number
}

interface ToastContextValue {
  toast: (input: ToastInput | string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantStyles: Record<ToastVariant, string> = {
  default: 'border-border bg-elevated text-text',
  success: 'border-success/40 bg-success/10 text-success',
  error:   'border-danger/40 bg-danger/10 text-danger',
  info:    'border-brand/40 bg-brand/10 text-brand',
}

const variantIcons: Record<ToastVariant, ReactNode> = {
  default: null,
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-4 h-4">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-4 h-4">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16v.5" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-4 h-4">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.5" strokeLinecap="round" />
    </svg>
  ),
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const timers = useRef<Record<string, number>>({})

  const dismiss = useCallback((id: string) => {
    setToasts((cur) => cur.filter((t) => t.id !== id))
    const tid = timers.current[id]
    if (tid) {
      window.clearTimeout(tid)
      delete timers.current[id]
    }
  }, [])

  const toast = useCallback((input: ToastInput | string) => {
    const normalised: ToastInput = typeof input === 'string' ? { message: input } : input
    const record: ToastRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      message: normalised.message,
      variant: normalised.variant ?? 'default',
      duration: normalised.duration ?? 2400,
    }
    setToasts((cur) => [...cur, record])
    if (record.duration > 0) {
      timers.current[record.id] = window.setTimeout(() => dismiss(record.id), record.duration)
    }
  }, [dismiss])

  useEffect(() => () => {
    for (const id of Object.keys(timers.current)) window.clearTimeout(timers.current[id])
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

interface ViewportProps {
  toasts: ToastRecord[]
  onDismiss: (id: string) => void
}

const ToastViewport = ({ toasts, onDismiss }: ViewportProps) => (
  <div className="fixed left-0 right-0 top-0 z-[100] flex flex-col items-center pointer-events-none safe-top pt-3 gap-2">
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.button
          key={t.id}
          type="button"
          onClick={() => onDismiss(t.id)}
          initial={{ y: -12, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -8, opacity: 0, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className={`pointer-events-auto max-w-[92vw] flex items-center gap-2 border rounded-full px-4 py-2 text-[13px] font-mono shadow-card backdrop-blur-xl ${variantStyles[t.variant]}`}
          aria-live="polite"
        >
          {variantIcons[t.variant]}
          <span className="truncate">{t.message}</span>
        </motion.button>
      ))}
    </AnimatePresence>
  </div>
)

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
