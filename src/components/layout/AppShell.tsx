import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { BackupBanner } from './BackupBanner'
import { QuickAddFab } from './QuickAddFab'
import { LevelUpModal } from '../progression/LevelUpModal'
import { ThemeToggle } from '../ui/ThemeToggle'
import { UserPill } from '../ui/UserPill'
import { OnboardingCarousel } from '../onboarding/OnboardingCarousel'
import { InstallPrompt } from '../install/InstallPrompt'
import { useAppStore } from '../../store/AppContext'

export const AppShell = () => {
  const { state, ready } = useAppStore()
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Show onboarding only after IDB hydration and only if the user is new.
  useEffect(() => {
    if (!ready) return
    const onboarded = localStorage.getItem('onboarded') === '1'
    if (!onboarded && state.profile.totalWorkouts === 0 && state.profile.workoutHistory.length === 0) {
      setShowOnboarding(true)
    }
  }, [ready, state.profile.totalWorkouts, state.profile.workoutHistory.length])

  return (
    <div className="min-h-screen bg-bg text-text font-sans theme-fade">
      <BackupBanner />

      <main className="pb-24 min-h-screen">
        <Outlet />
      </main>

      {/* Bottom-left floating controls — never block page content */}
      <div className="fixed left-3 bottom-[78px] z-40 safe-bottom flex items-center gap-2">
        <ThemeToggle />
        <UserPill />
      </div>

      <QuickAddFab />
      <BottomNav />
      <LevelUpModal />
      <InstallPrompt />
      {showOnboarding && <OnboardingCarousel onDone={() => setShowOnboarding(false)} />}
    </div>
  )
}
