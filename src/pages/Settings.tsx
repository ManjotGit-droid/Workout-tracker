import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  isAutoBackupEnabled,
  setAutoBackupEnabled,
  getLastBackupAt,
  daysUntilNextBackup,
  runBackupNow,
} from '../utils/autoBackup'
import { useAppStore } from '../store/AppContext'
import { useTheme, ACCENTS } from '../store/ThemeContext'
import { useUsers } from '../store/UserContext'
import { useToast } from '../components/ui/Toast'
import { exportData, importData, resetData } from '../api/data'
import { PageHeader } from '../components/layout/PageHeader'
import { NeonCard } from '../components/ui/NeonCard'
import { GlowButton } from '../components/ui/GlowButton'

const APP_VERSION = '1.0.0'
const REPO_URL = 'https://github.com/ManjotGit-droid/Workout-tracker'
const REST_DURATION_KEY = 'restDurationSec'
const DEFAULT_REST_SEC = 90
const REST_PRESETS_SEC = [30, 60, 90, 120, 180, 240]

export const Settings = () => {
  const { state, dispatch } = useAppStore()
  const { theme, setTheme, accent, setAccent } = useTheme()
  const { users, activeUser } = useUsers()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [autoBackup, setAutoBackup] = useState<boolean>(() => isAutoBackupEnabled())
  const [lastBackupAt, setLastBackupAt] = useState<number | null>(() => getLastBackupAt())
  const [backupRunning, setBackupRunning] = useState(false)
  const [resetting, setResetting] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  // Default rest-timer duration: persisted in localStorage; WorkoutActive
  // reads the same key when it boots, so changes here apply to the next
  // workout (or right now if no rest is currently running).
  const [restDuration, setRestDurationState] = useState<number>(() => {
    const stored = parseInt(localStorage.getItem(REST_DURATION_KEY) ?? '', 10)
    return Number.isFinite(stored) && stored > 0 ? stored : DEFAULT_REST_SEC
  })

  const setRestDuration = (sec: number) => {
    setRestDurationState(sec)
    localStorage.setItem(REST_DURATION_KEY, String(sec))
  }

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

  const initials = activeUser?.name?.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?'
  const fmtRest = (s: number) => s < 60 ? `${s}s` : `${(s / 60).toFixed(s % 60 === 0 ? 0 : 1)}m`

  return (
    <div className="min-h-screen pb-8">
      <PageHeader title="Settings" back />

      <div className="px-4 py-3 flex flex-col gap-4">
        {/* ── Profile ───────────────────────────────────────── */}
        <SectionLabel>Profile</SectionLabel>
        <NeonCard className="p-4" tint="cyan">
          <button
            onClick={() => navigate('/users')}
            className="w-full flex items-center gap-3 text-left"
            aria-label="Manage profiles"
          >
            <span
              className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--brand), var(--accent))',
                color: 'var(--accent-ink)',
              }}
            >
              {initials}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-display font-semibold truncate">
                {activeUser?.name ?? 'Profile'}
              </div>
              <div className="text-[11px] font-mono text-text-muted">
                {users.length === 1 ? 'Active profile' : `${users.length} profiles · tap to manage`}
              </div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-text-muted flex-shrink-0">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </NeonCard>

        {/* ── Appearance ────────────────────────────────────── */}
        <SectionLabel>Appearance</SectionLabel>
        <NeonCard className="p-4">
          <h3 className="text-sm font-display font-bold mb-1">Theme</h3>
          <p className="text-xs font-mono text-text-muted mb-3">
            Reduce-motion is honoured automatically from your OS settings.
          </p>
          <div className="flex gap-2">
            {(['light', 'dark'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 py-2 rounded-lg border text-sm font-mono uppercase tracking-widest transition-colors ${
                  theme === t
                    ? 'border-accent text-accent-ink'
                    : 'border-border text-text-muted hover:border-border-soft'
                }`}
                style={theme === t ? { background: 'var(--accent)' } : undefined}
              >
                {t}
              </button>
            ))}
          </div>
        </NeonCard>

        <NeonCard className="p-4">
          <h3 className="text-sm font-display font-bold mb-1">Accent</h3>
          <p className="text-xs font-mono text-text-muted mb-3">
            Recolours buttons, progress fills, halos, and stat highlights across the app.
          </p>
          <div className="grid grid-cols-4 gap-2">
            {ACCENTS.map((opt) => {
              const isActive = accent === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => setAccent(opt.id)}
                  aria-pressed={isActive}
                  aria-label={opt.label}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border transition-colors ${
                    isActive
                      ? 'border-text-muted bg-sunken'
                      : 'border-border hover:border-border-soft'
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-full"
                    style={{
                      background: opt.swatch,
                      boxShadow: isActive
                        ? `0 0 0 2px var(--bg-elevated), 0 0 0 4px ${opt.swatch}`
                        : 'inset 0 0 0 1px rgba(0,0,0,0.15)',
                    }}
                  />
                  <span className={`text-[10px] font-mono uppercase tracking-widest ${
                    isActive ? 'text-text' : 'text-text-muted'
                  }`}>
                    {opt.label}
                  </span>
                </button>
              )
            })}
          </div>
        </NeonCard>

        {/* ── Workout ───────────────────────────────────────── */}
        <SectionLabel>Workout</SectionLabel>
        <NeonCard className="p-4" tint="violet">
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
                  state.weightUnit === u ? 'bg-accent border-accent text-accent-ink' : 'border-border text-text-muted hover:border-border-soft'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </NeonCard>

        <NeonCard className="p-4" tint="indigo">
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="text-sm font-display font-bold">Default rest timer</h3>
            <span className="text-xs font-mono text-brand tabular-nums">{fmtRest(restDuration)}</span>
          </div>
          <p className="text-xs font-mono text-text-muted mb-3">
            How long the timer counts down by default after you mark a set complete. You can still ±15&nbsp;s during a rest.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {REST_PRESETS_SEC.map((s) => (
              <button
                key={s}
                onClick={() => setRestDuration(s)}
                className={`py-2 rounded-lg border text-sm font-mono tabular-nums transition-colors ${
                  restDuration === s ? 'bg-accent border-accent text-accent-ink' : 'border-border text-text-muted hover:border-border-soft'
                }`}
              >
                {fmtRest(s)}
              </button>
            ))}
          </div>
        </NeonCard>

        {/* ── Backup ────────────────────────────────────────── */}
        <SectionLabel>Backup</SectionLabel>
        <NeonCard className="p-4" tint="emerald">
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

        {/* ── Data ──────────────────────────────────────────── */}
        <SectionLabel>Data</SectionLabel>
        <NeonCard className="p-4" tint="teal">
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

        {/* ── Danger zone ───────────────────────────────────── */}
        <SectionLabel>Danger zone</SectionLabel>
        <NeonCard className="p-4" tint="rose">
          <h3 className="text-sm font-display font-bold mb-1 text-danger">Reset all data</h3>
          <p className="text-xs font-mono text-text-muted mb-3">
            Deletes all workouts and muscle XP. Custom exercises stay. This cannot be undone.
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

        {/* ── About ─────────────────────────────────────────── */}
        <SectionLabel>About</SectionLabel>
        <NeonCard className="p-4" tint="pink">
          <h3 className="text-sm font-display font-bold mb-1">Solo Gym Tracker</h3>
          <p className="text-xs font-mono text-text-muted mb-2">
            Fully offline PWA. Version {APP_VERSION}.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-brand hover:underline block mb-3"
          >
            Source on GitHub →
          </a>
          <GlowButton size="sm" variant="secondary" onClick={handleResetOnboarding}>
            Replay onboarding
          </GlowButton>
        </NeonCard>
      </div>
    </div>
  )
}

// Tiny section divider so the page reads like a real settings menu rather
// than a stack of cards.
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest mt-2 -mb-2 px-1">
    {children}
  </div>
)
