import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { BackupBanner } from './BackupBanner'
import { QuickAddFab } from './QuickAddFab'
import { LevelUpModal } from '../progression/LevelUpModal'
import { OnboardingCarousel } from '../onboarding/OnboardingCarousel'
import { InstallPrompt } from '../install/InstallPrompt'
import { useAppStore } from '../../store/AppContext'

export const AppShell = () => {
  const { state, ready } = useAppStore()
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Show onboarding only after IDB hydration and only if the user is new.
  // `totalWorkouts` is derived from `workoutHistory.length` in the reducer,
  // so a single check is sufficient.
  useEffect(() => {
    if (!ready) return
    const onboarded = localStorage.getItem('onboarded') === '1'
    if (!onboarded && state.profile.workoutHistory.length === 0) {
      setShowOnboarding(true)
    }
  }, [ready, state.profile.workoutHistory.length])

  return (
    <div className="min-h-screen bg-bg text-text font-sans theme-fade">
      <BackupBanner />

      <main className="pb-24 min-h-screen">
        <Outlet />
      </main>

      {/* Theme and Profile have moved into the Settings page (gear icon on
          the Dashboard). Floating controls were removed so the bottom area
          stays clean for the FAB and BottomNav. */}

      <QuickAddFab />
      <BottomNav />
      <LevelUpModal />
      <InstallPrompt />
      {showOnboarding && <OnboardingCarousel onDone={() => setShowOnboarding(false)} />}
    </div>
  )
}
