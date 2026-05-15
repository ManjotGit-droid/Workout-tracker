import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore, useDispatch } from '../store/AppContext'
import { exportData, importData, resetData } from '../api/data'
import { PageHeader } from '../components/layout/PageHeader'
import { NeonCard } from '../components/ui/NeonCard'
import { GlowButton } from '../components/ui/GlowButton'
import { LevelBadge } from '../components/progression/LevelBadge'
import { XPBar } from '../components/progression/XPBar'
import { MUSCLE_GROUPS, MUSCLE_GROUP_IDS } from '../data/muscleGroups'

import { getLevelColor } from '../data/levelConfig'
import { fromKg, formatDate, todayISO } from '../utils/formatters'
import { RankBadge } from '../components/progression/RankBadge'

type Tab = 'muscles' | 'records' | 'body' | 'data'

export function Progress() {
  const { state } = useAppStore()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('muscles')
  const [bodyWeight, setBodyWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [bodyDate, setBodyDate] = useState(todayISO())
  const [dataMsg, setDataMsg] = useState('')
  const [resetting, setResetting] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  const allExercises = state.customExercises

  // Sort muscles by level desc
  const sortedMuscles = MUSCLE_GROUP_IDS
    .map((id) => state.profile.muscleGroups[id])
    .sort((a, b) => b.level - a.level)

  function addBodyEntry() {
    const wKg = parseFloat(bodyWeight)
    const fat = parseFloat(bodyFat)
    if (!isNaN(wKg) || !isNaN(fat)) {
      dispatch({
        type: 'ADD_BODY_ENTRY',
        entry: {
          date: bodyDate,
          weightKg: isNaN(wKg) ? undefined : wKg,
          bodyFatPct: isNaN(fat) ? undefined : fat,
        },
      })
      setBodyWeight('')
      setBodyFat('')
    }
  }

  const latestBody = state.bodyLog[0]

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
        {tab === 'body' && (
          <div>
            {/* Latest snapshot */}
            {latestBody && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {latestBody.weightKg !== undefined && (
                  <NeonCard className="p-3 text-center">
                    <div className="text-2xl font-mono font-bold text-sl-blue">
                      {fromKg(latestBody.weightKg, state.weightUnit).toFixed(1)}
                      <span className="text-sm text-sl-muted ml-1">{state.weightUnit}</span>
                    </div>
                    <div className="text-xs font-mono text-sl-muted uppercase mt-0.5">Body Weight</div>
                    <div className="text-xs font-mono text-sl-muted mt-0.5">{formatDate(latestBody.date)}</div>
                  </NeonCard>
                )}
                {latestBody.bodyFatPct !== undefined && (
                  <NeonCard className="p-3 text-center">
                    <div className="text-2xl font-mono font-bold text-sl-purple">
                      {latestBody.bodyFatPct.toFixed(1)}%
                    </div>
                    <div className="text-xs font-mono text-sl-muted uppercase mt-0.5">Body Fat</div>
                    <div className="text-xs font-mono text-sl-muted mt-0.5">{formatDate(latestBody.date)}</div>
                  </NeonCard>
                )}
              </div>
            )}

            {/* Log new entry */}
            <NeonCard className="p-3 mb-4" glow="purple">
              <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-3">Log Body Stats</div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-mono text-sl-muted block mb-1">
                    Weight ({state.weightUnit})
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={bodyWeight}
                    onChange={(e) => setBodyWeight(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-sl-bg border border-sl-border rounded-lg px-3 py-2 text-sm font-mono text-sl-text outline-none focus:border-sl-purple"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-sl-muted block mb-1">Body Fat %</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-sl-bg border border-sl-border rounded-lg px-3 py-2 text-sm font-mono text-sl-text outline-none focus:border-sl-purple"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="text-xs font-mono text-sl-muted block mb-1">Date</label>
                <input
                  type="date"
                  value={bodyDate}
                  onChange={(e) => setBodyDate(e.target.value)}
                  className="w-full bg-sl-bg border border-sl-border rounded-lg px-3 py-2 text-sm font-mono text-sl-text outline-none focus:border-sl-purple"
                />
              </div>
              <GlowButton className="w-full" onClick={addBodyEntry}>
                Log Entry
              </GlowButton>
            </NeonCard>

            {/* History */}
            {state.bodyLog.length > 0 && (
              <div>
                <div className="text-xs font-mono text-sl-muted uppercase tracking-widest mb-2">History</div>
                <div className="flex flex-col gap-1.5">
                  {state.bodyLog.slice(0, 20).map((entry) => (
                    <NeonCard key={entry.id} className="px-3 py-2 flex items-center justify-between">
                      <span className="text-xs font-mono text-sl-muted">{formatDate(entry.date)}</span>
                      <div className="flex gap-4">
                        {entry.weightKg !== undefined && (
                          <span className="text-sm font-mono text-sl-blue">
                            {fromKg(entry.weightKg, state.weightUnit).toFixed(1)} {state.weightUnit}
                          </span>
                        )}
                        {entry.bodyFatPct !== undefined && (
                          <span className="text-sm font-mono text-sl-purple">
                            {entry.bodyFatPct.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </NeonCard>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
