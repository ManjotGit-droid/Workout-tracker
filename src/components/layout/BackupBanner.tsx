import { useState, useEffect } from 'react'
import { isBackupDue, runBackupNow } from '../../utils/autoBackup'
import { useToast } from '../ui/Toast'

/**
 * Renders a slim banner at the very top of the app when an auto-backup is
 * due.  Tapping "Save now" runs the export — the tap counts as a user gesture
 * so the download reliably goes through on mobile too.
 */
export const BackupBanner = () => {
  const [due, setDue] = useState<boolean>(false)
  const [running, setRunning] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setDue(isBackupDue())
    // Re-check when the tab regains focus, in case the month rolled over
    // while the PWA stayed open.
    const onFocus = () => setDue(isBackupDue())
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  if (!due || dismissed) return null

  const handleSave = async () => {
    if (running) return
    setRunning(true)
    try {
      await runBackupNow()
      setDue(false)
      toast({ message: 'Backup saved', variant: 'success' })
    } catch {
      // Leave the banner visible so the user can try again
      toast({ message: 'Backup failed — try again', variant: 'error' })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="sticky top-0 z-40 bg-brand-soft border-b border-brand/30 px-4 py-2 flex items-center gap-3 text-[12px]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-brand flex-shrink-0">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="flex-1 text-text font-medium leading-tight">
        Monthly backup ready — save it to keep your workouts safe.
      </span>
      <button
        onClick={handleSave}
        disabled={running}
        className="app-btn px-3 py-1 rounded-md bg-accent text-accent-ink text-[11px] font-semibold disabled:opacity-60"
      >
        {running ? 'Saving…' : 'Save now'}
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="text-text-muted hover:text-text px-1"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
