import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import {
  listUsers, getActiveUserId, setActiveUserId,
  createUser as createUserStore, deleteUser as deleteUserStore, renameUser as renameUserStore,
  type UserProfile,
} from './users'
import { resetDBHandle } from '../db'
import { seedIfNeeded } from '../db/seed'

interface UserContextValue {
  users: UserProfile[]
  activeUserId: string
  activeUser: UserProfile
  /** Switch the active user.  The page will reload so the AppContext picks up the new DB. */
  switchUser: (id: string) => Promise<void>
  createUser: (name: string) => Promise<UserProfile>
  deleteUser: (id: string) => Promise<void>
  renameUser: (id: string, name: string) => void
}

const UserContext = createContext<UserContextValue | null>(null)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => listUsers())
  const [activeUserId, setActiveUserIdState] = useState<string>(() => getActiveUserId())

  const refresh = useCallback(() => {
    setUsers(listUsers())
    setActiveUserIdState(getActiveUserId())
  }, [])

  const switchUser = useCallback(async (id: string) => {
    if (id === activeUserId) return
    setActiveUserId(id)
    resetDBHandle()
    // Seed the new user's DB so the exercise library is populated
    await seedIfNeeded().catch(console.warn)
    // Hard reload — simplest way to get every part of the app to re-fetch
    // from the now-current IndexedDB for the new user.
    window.location.reload()
  }, [activeUserId])

  const createUser = useCallback(async (name: string) => {
    const u = createUserStore(name)
    refresh()
    return u
  }, [refresh])

  const deleteUser = useCallback(async (id: string) => {
    await deleteUserStore(id)
    refresh()
    // If we deleted the active user, switchUser already redirected
    if (id === activeUserId) window.location.reload()
  }, [activeUserId, refresh])

  const renameUser = useCallback((id: string, name: string) => {
    renameUserStore(id, name)
    refresh()
  }, [refresh])

  useEffect(() => {
    // Keep state in sync if another tab updates the registry
    const onStorage = () => refresh()
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [refresh])

  const activeUser = users.find((u) => u.id === activeUserId) ?? users[0]

  return (
    <UserContext.Provider
      value={{ users, activeUserId, activeUser, switchUser, createUser, deleteUser, renameUser }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUsers = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUsers must be used inside UserProvider')
  return ctx
}
