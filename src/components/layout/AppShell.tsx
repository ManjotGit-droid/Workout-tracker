import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { LevelUpModal } from '../progression/LevelUpModal'

export function AppShell() {
  return (
    <div className="min-h-screen bg-sl-bg text-sl-text font-display">
      <main className="pb-20 min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
      <LevelUpModal />
    </div>
  )
}
