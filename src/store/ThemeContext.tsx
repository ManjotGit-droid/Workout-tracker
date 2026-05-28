import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type Theme = 'light' | 'dark'
export type Accent = 'lime' | 'cyan' | 'orange' | 'violet'

export const ACCENTS: { id: Accent; label: string; swatch: string }[] = [
  { id: 'lime',   label: 'Lime',   swatch: '#C8F751' },
  { id: 'cyan',   label: 'Cyan',   swatch: '#5DC8E8' },
  { id: 'orange', label: 'Orange', swatch: '#F09445' },
  { id: 'violet', label: 'Violet', swatch: '#9A6BE8' },
]

interface ThemeContextValue {
  theme: Theme
  accent: Accent
  toggleTheme: () => void
  setTheme: (t: Theme) => void
  setAccent: (a: Accent) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const THEME_KEY = 'wt-theme'
const ACCENT_KEY = 'wt-accent'

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem(THEME_KEY) as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

const getInitialAccent = (): Accent => {
  const stored = localStorage.getItem(ACCENT_KEY) as Accent | null
  if (stored && ACCENTS.some((a) => a.id === stored)) return stored
  return 'lime'
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [accent, setAccentState] = useState<Accent>(getInitialAccent)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.accent = accent
    localStorage.setItem(ACCENT_KEY, accent)
  }, [accent])

  const setTheme = (t: Theme) => setThemeState(t)
  const toggleTheme = () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))
  const setAccent = (a: Accent) => setAccentState(a)

  return (
    <ThemeContext.Provider value={{ theme, accent, toggleTheme, setTheme, setAccent }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
