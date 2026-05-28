import { useMemo, useState } from 'react'
import { useAppStore } from '../../store/AppContext'
import { NeonCard } from '../ui/NeonCard'
import { GlowButton } from '../ui/GlowButton'
import { MUSCLE_GROUPS } from '../../data/muscleGroups'
import { generateWeeklyMobilityPlan, formatSessionDuration } from '../../utils/mobilityPlan'
import {
  setMobilityDone,
  getCurrentStreak,
  getBestStreak,
  getCompletedDates,
} from '../../utils/mobilityLog'
import type { DayOfWeek } from '../../data/animePlans'

/**
 * Returns the ISO date string (yyyy-mm-dd) for each day of the current
 * Monday→Sunday week, indexed by DayOfWeek.
 */
const useThisWeekDates = (): Record<DayOfWeek, string> => {
  return useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // Monday = 0 ... Sunday = 6 (override JS's Sunday=0)
    const dayIdx = (today.getDay() + 6) % 7
    const monday = new Date(today)
    monday.setDate(monday.getDate() - dayIdx)
    const labels: DayOfWeek[] = [
      'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    ]
    const out = {} as Record<DayOfWeek, string>
    labels.forEach((label, i) => {
      const d = new Date(monday)
      d.setDate(d.getDate() + i)
      const offset = d.getTimezoneOffset() * 60000
      out[label] = new Date(d.getTime() - offset).toISOString().slice(0, 10)
    })
    return out
  }, [])
}

const DAY_INITIAL: Record<DayOfWeek, string> = {
  monday: 'M', tuesday: 'T', wednesday: 'W', thursday: 'T',
  friday: 'F', saturday: 'S', sunday: 'S',
}

export const MobilityView = () => {
  const { state } = useAppStore()
  const weekDates = useThisWeekDates()
  const todayISO = useMemo(() => {
    const d = new Date()
    const offset = d.getTimezoneOffset() * 60000
    return new Date(d.getTime() - offset).toISOString().slice(0, 10)
  }, [])

  // Find which DayOfWeek today is — used to default-select today's session.
  const todayDow: DayOfWeek = useMemo(() => {
    const entries = Object.entries(weekDates) as [DayOfWeek, string][]
    return entries.find(([, iso]) => iso === todayISO)?.[0] ?? 'monday'
  }, [weekDates, todayISO])

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDow)
  // Bump on every log-toggle so streak / completed-dates re-read from storage.
  const [logTick, setLogTick] = useState(0)

  const plan = useMemo(
    () => generateWeeklyMobilityPlan(state.profile.workoutHistory, state.customExercises),
    [state.profile.workoutHistory, state.customExercises],
  )

  const completedSet = useMemo(() => {
    void logTick // re-evaluate when log changes
    return new Set(getCompletedDates())
  }, [logTick])

  const currentStreak = useMemo(() => {
    void logTick
    return getCurrentStreak()
  }, [logTick])

  const bestStreak = useMemo(() => {
    void logTick
    return getBestStreak()
  }, [logTick])

  const selectedSession = plan.weeklySchedule.find((s) => s.day === selectedDay)!
  const selectedDate = weekDates[selectedDay]
  const selectedDone = completedSet.has(selectedDate)
  const isToday = selectedDate === todayISO
  const isFuture = selectedDate > todayISO

  const toggleSelectedDone = () => {
    setMobilityDone(selectedDate, !selectedDone)
    setLogTick((n) => n + 1)
  }

  const [showWhy, setShowWhy] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      {/* Hero / streak card */}
      <NeonCard className="p-4" glow="purple" tint="cyan">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-display font-bold tracking-tight text-text">Weekly Mobility</h2>
            <p className="text-[12px] font-mono text-text-muted mt-0.5 leading-relaxed">
              Daily stretching to keep joints, tendons and connective tissue happy. Adapts to which muscles you've trained this week.
            </p>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <div className="px-2.5 py-1 rounded-full bg-accent text-[12px] font-mono font-bold text-accent-ink">
              {currentStreak}🔥
            </div>
            <div className="text-[10px] font-mono text-text-muted mt-1 uppercase tracking-wider">
              Best {bestStreak}
            </div>
          </div>
        </div>
      </NeonCard>

      {/* Week strip */}
      <div className="grid grid-cols-7 gap-1.5">
        {plan.weeklySchedule.map((session) => {
          const iso = weekDates[session.day]
          const done = completedSet.has(iso)
          const dayIsToday = iso === todayISO
          const dayIsFuture = iso > todayISO
          const isSelected = session.day === selectedDay
          return (
            <button
              key={session.day}
              onClick={() => setSelectedDay(session.day)}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl border transition-all ${
                isSelected
                  ? 'border-brand bg-brand-soft text-text'
                  : 'border-border bg-elevated/40 text-text-muted hover:border-text-muted'
              } ${dayIsFuture ? 'opacity-50' : ''}`}
            >
              <span className="text-[10px] font-mono uppercase tracking-widest">
                {DAY_INITIAL[session.day]}
              </span>
              <span className={`text-[13px] font-display font-bold tabular-nums ${dayIsToday && !isSelected ? 'text-brand' : ''}`}>
                {Number(iso.slice(8, 10))}
              </span>
              <span className="text-[10px] leading-none mt-0.5">
                {done ? '✓' : dayIsToday ? '•' : ' '}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected-day session */}
      <NeonCard className="p-4" tint="violet">
        <div className="flex items-baseline justify-between mb-1 gap-2">
          <h3 className="text-base font-display font-bold text-text">{selectedSession.theme}</h3>
          <span className="text-[11px] font-mono text-text-muted whitespace-nowrap">
            {formatSessionDuration(selectedSession.totalDurationSec)} · {selectedSession.stretches.length} stretches
          </span>
        </div>
        <div className="text-[11px] font-mono text-text-muted mb-3 capitalize">
          {selectedDay} · {new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          {isToday && <span className="ml-1 text-brand">· today</span>}
          {isFuture && <span className="ml-1">· upcoming</span>}
        </div>

        <div className="flex flex-col gap-2.5 mb-3">
          {selectedSession.stretches.map((s) => (
            <div key={s.id} className="border-l-2 border-brand/30 pl-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[14px] font-display font-semibold text-text">{s.name}</span>
                <span className="text-[11px] font-mono text-text-muted whitespace-nowrap">
                  {s.durationSec}s{s.perSide ? ' × 2' : ''}
                </span>
              </div>
              <p className="text-[12px] text-text-muted leading-relaxed mt-0.5">{s.description}</p>
            </div>
          ))}
        </div>

        {selectedDone ? (
          <div className="flex gap-2 items-center">
            <div className="flex-1 px-3 py-2 rounded-xl bg-brand-soft border border-brand/30 text-center text-[13px] font-mono text-brand font-semibold">
              ✓ Completed
            </div>
            <GlowButton size="sm" variant="secondary" onClick={toggleSelectedDone}>Undo</GlowButton>
          </div>
        ) : (
          <GlowButton className="w-full" onClick={toggleSelectedDone} disabled={isFuture}>
            {isFuture ? 'Comes later this week' : 'Mark complete'}
          </GlowButton>
        )}
      </NeonCard>

      {/* Why these? explainer */}
      <NeonCard className="p-3" tint="emerald">
        <button
          onClick={() => setShowWhy((v) => !v)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-[13px] font-display font-semibold text-text">Why these stretches?</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 text-text-muted transition-transform ${showWhy ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {showWhy && (
          <div className="mt-2.5 text-[12px] font-mono text-text-muted leading-relaxed">
            {plan.topTrainedMuscles.length === 0 ? (
              <span>
                No training data yet for the last 7 days. Sessions follow the standard daily themes (hips, shoulders, spine, etc.).
                Log a few workouts and the plan will start emphasising stretches for the muscles you load most.
              </span>
            ) : (
              <>
                <span>Over the last 7 days you've trained most:</span>
                <ul className="mt-1.5 ml-3 list-disc text-text">
                  {plan.topTrainedMuscles.map((m) => (
                    <li key={m}>{MUSCLE_GROUPS[m]?.displayName ?? m}</li>
                  ))}
                </ul>
                <span className="block mt-2">
                  Each day pulls 1–2 stretches that target those areas on top of its baseline theme — so heavy squat weeks naturally surface more hip and hamstring work.
                </span>
              </>
            )}
          </div>
        )}
      </NeonCard>
    </div>
  )
}
