import { useState, useRef } from 'react'
import {
  isAutoBackupEnabled,
  setAutoBackupEnabled,
  getLastBackupAt,
  daysUntilNextBackup,
  runBackupNow,
} from '../utils/autoBackup'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/AppContext'
import { exportData, importData, resetData } from '../api/data'
import { PageHeader } from '../components/layout/PageHeader'
import { NeonCard } from '../components/ui/NeonCard'
import { GlowButton } from '../components/ui/GlowButton'
import { LevelBadge } from '../components/progression/LevelBadge'
import { XPBar } from '../components/progression/XPBar'
import { MUSCLE_GROUPS, MUSCLE_GROUP_IDS } from '../data/muscleGroups'

import { getLevelColor } from '../data/levelConfig'
import { fromKg, formatDate } from '../utils/formatters'
import { RankBadge } from '../components/progression/RankBadge'
import { BodyTab } from '../components/body/BodyTab'

type Tab = 'muscles' | 'records' | 'body' | 'data'

export const Progress = () => {
  const { state } = useAppStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('muscles')
  const [dataMsg, setDataMsg] = useState('')
  const [resetting, setResetting] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)
  const [autoBackup, setAutoBackup] = useState<boolean>(() => isAutoBackupEnabled())
  const [lastBackupAt, setLastBackupAt] = useState<number | null>(() => getLastBackupAt())
  const [backupRunning, setBackupRunning] = useState(false)

  const handleToggleAutoBackup = () => {
    const next = !autoBackup
    setAutoBackupEnabled(next)
    setAutoBackup(next)
  }

  const handleBackupNow = async () => {
    if (backupRunning) return
    setBackupRunning(true)
    try {
      await runBackupNow()
      setLastBackupAt(getLastBackupAt())
      setDataMsg('Backup saved')
    } catch {
      setDataMsg('Backup failed')
    } finally {
      setBackupRunning(false)
    }
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

  const allExercises = state.customExercises

  // Sort muscles by level desc
  const sortedMuscles = MUSCLE_GROUP_IDS
    .map((id) => state.profile.muscleGroups[id])
    .sort((a, b) => b.level - a.level)

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Progress"
        subtitle={`${state.profile.totalWorkouts} total workouts`}
        right={<RankBadge rank={state.profile.rank} size="sm" />}
      />

      {/* Tabs */}
      <div className="flex border-b border-sl-border">
        {(['muscles', 'records', 'body', 'data'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-widest transition-colors border-b-2 ${
              tab === t
                ? 'text-sl-purple border-sl-purple'
                : 'text-sl-muted border-transparent hover:text-sl-text'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 py-3">
        {/* ── MUSCLES TAB ── */}
        {tab === 'muscles' && (
          <div>
            {/* Overall stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <NeonCard className="p-3 text-center" glow="purple">
                <div className="text-2xl font-mono font-bold text-sl-purple">{state.profile.totalWorkouts}</div>
                <div className="text-xs font-mono text-sl-muted uppercase tracking-wider mt-0.5">Total Workouts</div>
              </NeonCard>
              <NeonCard className="p-3 text-center" glow="blue">
                <div className="text-2xl font-mono font-bold text-sl-blue">{state.profile.totalSets}</div>
                <div className="text-xs font-mono text-sl-muted uppercase tracking-wider mt-0.5">Total Sets</div>
              </NeonCard>
            </div>

            {/* All muscles with XP bars */}
            <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-2">All Muscle Groups</div>
            <div className="flex flex-col gap-2">
              {sortedMuscles.map(({ id, level, xp, xpToNextLevel }, idx) => {
                const meta = MUSCLE_GROUPS[id]
                const { glow } = getLevelColor(level)
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <NeonCard
                      className="px-3 py-2.5 flex items-center gap-3"
                      onClick={() => navigate(`/muscles/${id}`)}
                    >
                      <LevelBadge level={level} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-display font-semibold">{meta.shortName}</div>
                        <div className="mt-1">
                          <XPBar
                            xp={xp}
                            xpToNext={xpToNextLevel}
                            level={level}
                            color={glow || '#9333ea'}
                            showLabel={false}
                          />
                        </div>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-sl-muted flex-shrink-0">
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </NeonCard>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── RECORDS TAB ── */}
        {tab === 'records' && (
          <div>
            {Object.keys(state.personalRecords).length === 0 ? (
              <div className="text-center text-sl-muted font-mono text-sm py-12">
                <div className="text-4xl mb-3">🏋️</div>
                Complete workouts to unlock personal records
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-1">Best Lifts</div>
                {Object.values(state.personalRecords)
                  .sort((a, b) => b.weightKg - a.weightKg)
                  .map((pr) => {
                    const ex = allExercises.find((e) => e.id === pr.exerciseId)
                    if (!ex) return null
                    return (
                      <NeonCard key={pr.exerciseId} className="p-3" glow="gold">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-display font-semibold">{ex.name}</div>
                            <div className="text-xs font-mono text-sl-muted capitalize mt-0.5">
                              {ex.equipment} · {formatDate(pr.date)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-mono font-bold text-sl-gold">
                              {fromKg(pr.weightKg, state.weightUnit).toFixed(1)}
                              <span className="text-xs text-sl-muted ml-1">{state.weightUnit}</span>
                            </div>
                            <div className="text-xs font-mono text-sl-muted">{pr.reps} reps</div>
                          </div>
                        </div>
                      </NeonCard>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {/* ── BODY TAB ── */}
        {tab === 'body' && <BodyTab />}
        {/* Data Management Tab */}
        {tab === 'data' && (
          <div className="flex flex-col gap-4">
            <NeonCard className="p-4">
              <h3 className="text-sm font-display font-bold mb-1">Export Data</h3>
              <p className="text-xs font-mono text-sl-muted mb-3">Download all your workouts and exercises as a JSON backup.</p>
              <GlowButton size="sm" variant="secondary" onClick={() => exportData().catch(() => setDataMsg('Export failed'))}>
                Download Backup
              </GlowButton>
            </NeonCard>

            <NeonCard className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <h3 className="text-sm font-display font-bold mb-1">Monthly Auto-Backup</h3>
                  <p className="text-xs font-mono text-sl-muted leading-relaxed">
                    A banner appears every 30 days asking you to save a fresh backup. One tap and it downloads — keeps your data safe across phone wipes or app reinstalls.
                  </p>
                </div>
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
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      autoBackup ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-sl-muted mt-3 mb-3">
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

            <NeonCard className="p-4">
              <h3 className="text-sm font-display font-bold mb-1">Import Data</h3>
              <p className="text-xs font-mono text-sl-muted mb-3">Restore from a previously exported JSON backup. This replaces all current data.</p>
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
                    setDataMsg(`Imported ${result.imported.workouts} workouts, ${result.imported.exercises} exercises`)
                    window.location.reload()
                  } catch {
                    setDataMsg('Import failed — invalid backup file')
                  }
                }}
              />
              <GlowButton size="sm" variant="secondary" onClick={() => importRef.current?.click()}>
                Choose Backup File
              </GlowButton>
            </NeonCard>

            <NeonCard className="p-4">
              <h3 className="text-sm font-display font-bold mb-1 text-sl-red">Reset All Data</h3>
              <p className="text-xs font-mono text-sl-muted mb-3">Delete all workouts and muscle XP. Exercise library is kept.</p>
              {!resetting ? (
                <GlowButton size="sm" variant="danger" onClick={() => setResetting(true)}>
                  Reset Data
                </GlowButton>
              ) : (
                <div className="flex gap-2">
                  <GlowButton
                    size="sm"
                    variant="danger"
                    onClick={async () => {
                      await resetData()
                      setResetting(false)
                      setDataMsg('Data reset complete')
                      window.location.reload()
                    }}
                  >
                    Confirm Reset
                  </GlowButton>
                  <GlowButton size="sm" variant="secondary" onClick={() => setResetting(false)}>
                    Cancel
                  </GlowButton>
                </div>
              )}
            </NeonCard>

            {dataMsg && (
              <div className="text-xs font-mono text-sl-muted text-center py-2">{dataMsg}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
