import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { BackupBanner } from './BackupBanner'
import { LevelUpModal } from '../progression/LevelUpModal'
import { ThemeToggle } from '../ui/ThemeToggle'
import { UserPill } from '../ui/UserPill'

export const AppShell = () => (
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

    <BottomNav />
    <LevelUpModal />
  </div>
)
