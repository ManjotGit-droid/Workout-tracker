import { getActiveUserId } from '../store/users'

/* ─────────────────────────────────────────────────────────────────────────────
   Mobility log
   ─────────────────────────────────────────────────────────────────────────────
   Records which days the user marked their mobility session complete.
   Stored in localStorage (per active user) because the data is tiny and we
   don't want to bump the IndexedDB schema for it.
   ───────────────────────────────────────────────────────────────────────── */

interface MobilityLog {
  dates: string[]   // ISO 'YYYY-MM-DD', no duplicates
  bestStreak: number
}

const keyFor = (userId: string): string => `wt-mobility-log--${userId}`

const todayISO = (): string => {
  const d = new Date()
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 10)
}

const loadLog = (): MobilityLog => {
  try {
    const raw = localStorage.getItem(keyFor(getActiveUserId()))
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<MobilityLog>
      if (Array.isArray(parsed.dates)) {
        return {
          dates: parsed.dates.filter((d): d is string => typeof d === 'string'),
          bestStreak: typeof parsed.bestStreak === 'number' ? parsed.bestStreak : 0,
        }
      }
    }
  } catch {
    /* ignore — return empty log */
  }
  return { dates: [], bestStreak: 0 }
}

const saveLog = (log: MobilityLog): void => {
  localStorage.setItem(keyFor(getActiveUserId()), JSON.stringify(log))
}

// ── Day arithmetic ──────────────────────────────────────────────────────────

const dayBefore = (iso: string): string => {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

const computeCurrentStreak = (sortedDates: string[]): number => {
  if (sortedDates.length === 0) return 0
  const today = todayISO()
  const set = new Set(sortedDates)
  // A streak counts as "current" if it ends today OR yesterday — gives the
  // user until end of next day to do today's session without breaking the run.
  let cursor = today
  if (!set.has(cursor)) {
    const yesterday = dayBefore(today)
    if (!set.has(yesterday)) return 0
    cursor = yesterday
  }
  let streak = 0
  while (set.has(cursor)) {
    streak++
    cursor = dayBefore(cursor)
  }
  return streak
}

// ── Public API ──────────────────────────────────────────────────────────────

export const isMobilityDone = (date: string): boolean => loadLog().dates.includes(date)

export const setMobilityDone = (date: string, done: boolean): void => {
  const log = loadLog()
  const has = log.dates.includes(date)
  if (done && !has) {
    log.dates = [...log.dates, date].sort()
  } else if (!done && has) {
    log.dates = log.dates.filter((d) => d !== date)
  } else {
    return
  }
  const streak = computeCurrentStreak(log.dates)
  if (streak > log.bestStreak) log.bestStreak = streak
  saveLog(log)
}

export const getCompletedDates = (): string[] => loadLog().dates

export const getCurrentStreak = (): number => computeCurrentStreak(loadLog().dates)

export const getBestStreak = (): number => {
  const log = loadLog()
  // Recompute on read so a freshly-broken current streak is still reflected if
  // it surpassed the stored best — defensive, almost always a no-op.
  const cur = computeCurrentStreak(log.dates)
  return Math.max(log.bestStreak, cur)
}
