import { useRef, useState } from 'react'
import {
  isAutoBackupEnabled,
  setAutoBackupEnabled,
  getLastBackupAt,
  daysUntilNextBackup,
  runBackupNow,
} from '../utils/autoBackup'
import { useAppStore } from '../store/AppContext'
import { useTheme } from '../store/ThemeContext'
import { useToast } from '../components/ui/Toast'
import { exportData, importData, resetData } from '../api/data'
import { PageHeader } from '../components/layout/PageHeader'
import { NeonCard } from '../components/ui/NeonCard'
import { GlowButton } from '../components/ui/GlowButton'

const APP_VERSION = '1.0.0'
const REPO_URL = 'https://github.com/ManjotGit-droid/Workout-tracker'

export const Settings = () => {
  const { state, dispatch } = useAppStore()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [autoBackup, setAutoBackup] = useState<boolean>(() => isAutoBackupEnabled())
  const [lastBackupAt, setLastBackupAt] = useState<number | null>(() => getLastBackupAt())
  const [backupRunning, setBackupRunning] = useState(false)
  const [resetting, setResetting] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  const handleToggleAutoBackup = () => {
    const next = !autoBackup
    setAutoBackupEnabled(next)
    setAutoBackup(next)
    toast({ message: next ? 'Auto-backup on' : 'Auto-backup off', variant: 'info' })
  }

  const handleBackupNow = async () => {
    if (backupRunning) return
    setBackupRunning(true)
    try {
      await runBackupNow()
      setLastBackupAt(getLastBackupAt())
      toast({ message: 'Backup saved', variant: 'success' })
    } catch {
      toast({ message: 'Backup failed', variant: 'error' })
    } finally {
      setBackupRunning(false)
    }
  }

  const handleExport = async () => {
    try {
      await exportData()
      toast({ message: 'Backup downloaded', variant: 'success' })
    } catch {
      toast({ message: 'Export failed', variant: 'error' })
    }
  }

  const handleResetOnboarding = () => {
    localStorage.removeItem('onboarded')
    toast({ message: 'Onboarding will show on next launch', variant: 'info' })
  }

  const lastBackupLabel = lastBackupAt
    ? new Date(lastBackupAt).toLocaleDateString()
    : 'Never'
  const nextBackupLabel = autoBackup
    ? lastBackupAt === null
      ? 'Due now'
      : (() => {
          const d = daysUntilNextBackup()
          if (d <= 0) return 'Due now'
          if (d === 1) return 'In 1 day'
          return `In ${d} days`
        })()
    : 'Off'

  return (
    <div className="min-h-screen pb-8">
      <PageHeader title="Settings" back />

      <div className="px-4 py-3 flex flex-col gap-4">
        {/* Appearance */}
        <NeonCard className="p-4">
          <h3 className="text-sm font-display font-bold mb-1">Appearance</h3>
          <p className="text-xs font-mono text-text-muted mb-3">
            Theme follows the chosen mode immediately. Reduce-motion is honoured automatically from your OS settings.
          </p>
          <div className="flex gap-2">
            {(['light', 'dark'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 py-2 rounded-lg border text-sm font-mono uppercase tracking-widest transition-colors ${
                  theme === t ? 'bg-brand border-brand text-white' : 'border-border text-text-muted hover:border-brand/40'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </NeonCard>

        {/* Units */}
        <NeonCard className="p-4">
          <h3 className="text-sm font-display font-bold mb-1">Weight unit</h3>
          <p className="text-xs font-mono text-text-muted mb-3">
            Display unit for weights everywhere. Saved values stay in kilograms internally, so switching never changes your numbers.
          </p>
          <div className="flex gap-2">
            {(['kg', 'lbs'] as const).map((u) => (
              <button
                key={u}
                onClick={() => dispatch({ type: 'SET_WEIGHT_UNIT', unit: u })}
                className={`flex-1 py-2 rounded-lg border text-sm font-mono uppercase tracking-widest transition-colors ${
                  state.weightUnit === u ? 'bg-brand border-brand text-white' : 'border-border text-text-muted hover:border-brand/40'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </NeonCard>

        {/* Backup */}
        <NeonCard className="p-4">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <h3 className="text-sm font-display font-bold">Monthly auto-backup</h3>
            <button
              role="switch"
              aria-checked={autoBackup}
              aria-label="Toggle monthly auto-backup"
              onClick={handleToggleAutoBackup}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                autoBackup ? 'bg-brand' : 'bg-sunken border border-border'
              }`}
            >
              <span
                className="absolute top-1/2 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                style={{ transform: `translateY(-50%) translateX(${autoBackup ? '22px' : '2px'})` }}
              />
            </button>
          </div>
          <p className="text-xs font-mono text-text-muted leading-relaxed">
            A banner appears every 30 days asking you to save a fresh backup. One tap and it downloads.
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-text-muted mt-3 mb-3">
            <div>
              <div className="text-text-muted/70 uppercase tracking-wider text-[9px]">Last backup</div>
              <div className="text-text">{lastBackupLabel}</div>
            </div>
            <div>
              <div className="text-text-muted/70 uppercase tracking-wider text-[9px]">Next due</div>
              <div className="text-text">{nextBackupLabel}</div>
            </div>
          </div>
          <GlowButton size="sm" variant="secondary" disabled={backupRunning} onClick={handleBackupNow}>
            {backupRunning ? 'Saving…' : 'Backup now'}
          </GlowButton>
        </NeonCard>

        {/* Data — export / import / reset */}
        <NeonCard className="p-4">
          <h3 className="text-sm font-display font-bold mb-1">Export / import</h3>
          <p className="text-xs font-mono text-text-muted mb-3">
            Download all your workouts, body entries, and muscle XP as a JSON file. Importing replaces every record.
          </p>
          <div className="flex gap-2">
            <GlowButton size="sm" variant="secondary" onClick={handleExport}>
              Download backup
            </GlowButton>
            <input
              ref={importRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                try {
                  const result = await importData(file)
                  toast({ message: `Imported ${result.imported.workouts} workouts`, variant: 'success', duration: 3500 })
                  setTimeout(() => window.location.reload(), 600)
                } catch {
                  toast({ message: 'Import failed — invalid file', variant: 'error' })
                }
              }}
            />
            <GlowButton size="sm" variant="secondary" onClick={() => importRef.current?.click()}>
              Restore from file
            </GlowButton>
          </div>
        </NeonCard>

        {/* Danger zone */}
        <NeonCard className="p-4">
          <h3 className="text-sm font-display font-bold mb-1 text-danger">Danger zone</h3>
          <p className="text-xs font-mono text-text-muted mb-3">
            Reset deletes all workouts and muscle XP. Custom exercises stay.
          </p>
          {!resetting ? (
            <GlowButton size="sm" variant="danger" onClick={() => setResetting(true)}>
              Reset all data
            </GlowButton>
          ) : (
            <div className="flex gap-2">
              <GlowButton
                size="sm"
                variant="danger"
                onClick={async () => {
                  await resetData()
                  toast({ message: 'Data reset', variant: 'info' })
                  setTimeout(() => window.location.reload(), 500)
                }}
              >
                Confirm reset
              </GlowButton>
              <GlowButton size="sm" variant="secondary" onClick={() => setResetting(false)}>
                Cancel
              </GlowButton>
            </div>
          )}
        </NeonCard>

        {/* Debug / onboarding */}
        <NeonCard className="p-4">
          <h3 className="text-sm font-display font-bold mb-1">Show onboarding again</h3>
          <p className="text-xs font-mono text-text-muted mb-3">
            Replays the first-launch intro on next page load.
          </p>
          <GlowButton size="sm" variant="secondary" onClick={handleResetOnboarding}>
            Reset onboarding
          </GlowButton>
        </NeonCard>

        {/* About */}
        <NeonCard className="p-4">
          <h3 className="text-sm font-display font-bold mb-1">About</h3>
          <p className="text-xs font-mono text-text-muted mb-2">
            Solo Gym Tracker — fully offline PWA. Version {APP_VERSION}.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-brand hover:underline"
          >
            Source on GitHub →
          </a>
        </NeonCard>
      </div>
    </div>
  )
}
