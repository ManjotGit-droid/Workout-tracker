import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './pages/Dashboard'
import { WorkoutActive } from './pages/WorkoutActive'
import { WorkoutComplete } from './pages/WorkoutComplete'
import { MuscleDetail } from './pages/MuscleDetail'
import { ExerciseLibrary } from './pages/ExerciseLibrary'
import { Progress } from './pages/Progress'
import { WorkoutPlans } from './pages/WorkoutPlans'
import { Users } from './pages/Users'
import { ThemeProvider } from './store/ThemeContext'
import { UserProvider } from './store/UserContext'
import { ToastProvider } from './components/ui/Toast'

export const App = () => (
    <ThemeProvider>
      {/* UserProvider sits above AppProvider so changing the active user
          reloads the page, which causes AppProvider to remount and rehydrate
          from the new user's IndexedDB. */}
      <UserProvider>
        <AppProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<AppShell />}>
                  <Route index element={<Dashboard />} />
                  <Route path="workout" element={<WorkoutActive />} />
                  <Route path="workout/complete" element={<WorkoutComplete />} />
                  <Route path="muscles/:id" element={<MuscleDetail />} />
                  <Route path="exercises" element={<ExerciseLibrary />} />
                  <Route path="plans" element={<WorkoutPlans />} />
                  <Route path="progress" element={<Progress />} />
                  <Route path="users" element={<Users />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </AppProvider>
      </UserProvider>
    </ThemeProvider>
  )
