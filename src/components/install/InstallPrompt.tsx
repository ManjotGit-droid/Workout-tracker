import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../ui/Toast'

const DISMISS_LS_KEY = 'installPromptDismissedAt'
const RESHOW_AFTER_MS = 30 * 86400000 // 30 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true
  // iOS uses navigator.standalone
  if ((navigator as unknown as { standalone?: boolean }).standalone) return true
  return false
}

const isIos = (): boolean => {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
}

/**
 * Friendly install banner. Captures the browser's `beforeinstallprompt` event
 * (Chrome/Edge/Android) into local state so we can fire it from a styled CTA.
 * On iOS Safari there's no API for this, so we show a one-page "how to add to
 * home screen" guide instead.
 *
 * Dismissed once → stays hidden for 30 days.
 */
export const InstallPrompt = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const [hidden, setHidden] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (isStandalone()) return
    const dismissedAt = parseInt(localStorage.getItem(DISMISS_LS_KEY) ?? '', 10)
    if (Number.isFinite(dismissedAt) && Date.now() - dismissedAt < RESHOW_AFTER_MS) {
      return
    }

    // Defer initial appearance so the banner doesn't compete with the page's
    // first paint or the onboarding overlay.
    const settleTimer = window.setTimeout(() => setHidden(false), 4000)

    const onBefore = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBefore)

    const onInstalled = () => {
      setDeferred(null)
      setHidden(true)
      toast({ message: 'Installed to your home screen', variant: 'success' })
    }
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.clearTimeout(settleTimer)
      window.removeEventListener('beforeinstallprompt', onBefore)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [toast])

  const dismiss = () => {
    localStorage.setItem(DISMISS_LS_KEY, String(Date.now()))
    setHidden(true)
  }

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt()
      const choice = await deferred.userChoice
      setDeferred(null)
      if (choice.outcome === 'accepted') {
        setHidden(true)
      } else {
        dismiss()
      }
    } else if (isIos()) {
      setShowIosGuide(true)
    }
  }

  // No banner if we have no native prompt available *and* it's not iOS.
  const canShow = (deferred !== null || isIos()) && !hidden && !isStandalone()

  return (
    <>
      <AnimatePresence>
        {canShow && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 480, damping: 32 }}
            className="fixed left-3 right-3 bottom-[78px] z-40 safe-bottom"
          >
            <div className="rounded-2xl border border-brand/40 bg-elevated/95 backdrop-blur-xl shadow-card px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/15 text-brand flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-display font-semibold text-text">Install Solo Gym</div>
                <div className="text-[11px] font-mono text-text-muted truncate">
                  Add to your home screen for full-screen, offline use.
                </div>
              </div>
              <button
                onClick={handleInstall}
                className="app-btn bg-brand text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
              >
                Install
              </button>
              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="text-text-muted hover:text-text w-7 h-7 flex items-center justify-center -mr-1"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIosGuide && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowIosGuide(false)} />
            <motion.div
              className="relative z-10 w-full max-w-lg bg-surface border-t border-border rounded-t-2xl p-5 safe-bottom"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 480, damping: 32 }}
            >
              <h3 className="text-lg font-display font-bold mb-1">Install on iPhone</h3>
              <p className="text-xs font-mono text-text-muted mb-4">
                iOS Safari doesn't auto-install web apps. Three quick taps to add it to your home screen:
              </p>
              <ol className="flex flex-col gap-2 mb-4">
                <li className="flex items-center gap-3 text-sm font-mono">
                  <span className="w-6 h-6 rounded-full bg-brand/15 text-brand flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  Tap the <span className="font-semibold">Share</span> icon at the bottom of Safari
                </li>
                <li className="flex items-center gap-3 text-sm font-mono">
                  <span className="w-6 h-6 rounded-full bg-brand/15 text-brand flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  Choose <span className="font-semibold">Add to Home Screen</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-mono">
                  <span className="w-6 h-6 rounded-full bg-brand/15 text-brand flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  Tap <span className="font-semibold">Add</span> in the top-right
                </li>
              </ol>
              <button
                onClick={() => { setShowIosGuide(false); dismiss() }}
                className="app-btn w-full bg-brand text-white text-sm font-semibold py-3 rounded-lg"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
