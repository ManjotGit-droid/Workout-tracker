import { exportData } from '../api/data'

/* ─────────────────────────────────────────────────────────────────────────────
   Monthly auto-backup
   ─────────────────────────────────────────────────────────────────────────────
   Browsers require a user gesture (a tap/click) to trigger a file download
   reliably, so a fully-silent monthly export isn't possible — especially on
   mobile.  Instead we expose:

     • a per-device toggle (enabled / disabled)
     • a last-backup timestamp
     • an "is the backup due?" helper

   The UI shows a banner when a backup is due; the user taps the banner button
   which counts as a gesture and runs the export.
   ───────────────────────────────────────────────────────────────────────── */

const ENABLED_KEY = 'wt-autobackup-enabled'
const LAST_AT_KEY = 'wt-autobackup-last-at'

const MONTH_MS = 30 * 24 * 60 * 60 * 1000

export const isAutoBackupEnabled = (): boolean => localStorage.getItem(ENABLED_KEY) === '1'

export const setAutoBackupEnabled = (enabled: boolean): void => {
  if (enabled) localStorage.setItem(ENABLED_KEY, '1')
  else localStorage.removeItem(ENABLED_KEY)
}

export const getLastBackupAt = (): number | null => {
  const raw = localStorage.getItem(LAST_AT_KEY)
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

const markBackupDoneNow = (): void => {
  localStorage.setItem(LAST_AT_KEY, String(Date.now()))
}

/** Auto-backup is due when it's enabled and ≥ 30 days since the last run. */
export const isBackupDue = (): boolean => {
  if (!isAutoBackupEnabled()) return false
  const last = getLastBackupAt()
  if (last === null) return true
  return Date.now() - last >= MONTH_MS
}

/**
 * Run the export immediately and record the timestamp.  Throws if the export
 * itself fails (caller decides whether to surface the error).
 */
export const runBackupNow = async (): Promise<void> => {
  await exportData()
  markBackupDoneNow()
}

/** Days remaining until the next auto-backup is due (negative if already due). */
export const daysUntilNextBackup = (): number => {
  const last = getLastBackupAt()
  if (last === null) return 0
  const remaining = MONTH_MS - (Date.now() - last)
  return Math.ceil(remaining / (24 * 60 * 60 * 1000))
}
