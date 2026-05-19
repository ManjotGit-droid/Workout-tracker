/* ─────────────────────────────────────────────────────────────────────────────
   Multi-user profile registry
   ─────────────────────────────────────────────────────────────────────────────
   We store each user's workout data in its own IndexedDB database whose name
   is suffixed with the user id.  The list of users (and which one is active)
   lives in localStorage so it survives page reloads without touching IDB.
   ───────────────────────────────────────────────────────────────────────── */

const REGISTRY_KEY = 'wt-users-v1'
const ACTIVE_KEY = 'wt-active-user-v1'

export interface UserProfile {
  id: string
  name: string
  createdAt: string
}

interface Registry {
  users: UserProfile[]
}

const uid = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

const loadRegistry = (): Registry => {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Registry
      if (Array.isArray(parsed?.users) && parsed.users.length > 0) return parsed
    }
  } catch {
    /* ignore */
  }
  // First-time setup: seed a default user so existing data isn't orphaned
  const defaultUser: UserProfile = {
    id: 'default',
    name: 'Default',
    createdAt: new Date().toISOString(),
  }
  return { users: [defaultUser] }
}

const saveRegistry = (r: Registry): void => {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(r))
}

export const listUsers = (): UserProfile[] => loadRegistry().users

export const getActiveUserId = (): string => {
  const id = localStorage.getItem(ACTIVE_KEY)
  const users = listUsers()
  if (id && users.some((u) => u.id === id)) return id
  const fallback = users[0]?.id ?? 'default'
  localStorage.setItem(ACTIVE_KEY, fallback)
  return fallback
}

export const getActiveUser = (): UserProfile => {
  const id = getActiveUserId()
  return listUsers().find((u) => u.id === id) ?? listUsers()[0]
}

export const setActiveUserId = (id: string): void => {
  localStorage.setItem(ACTIVE_KEY, id)
}

export const createUser = (name: string): UserProfile => {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Name required')
  const reg = loadRegistry()
  if (reg.users.some((u) => u.name.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error('A user with that name already exists')
  }
  const user: UserProfile = { id: uid(), name: trimmed, createdAt: new Date().toISOString() }
  reg.users.push(user)
  saveRegistry(reg)
  return user
}

export const renameUser = (id: string, name: string): void => {
  const trimmed = name.trim()
  if (!trimmed) return
  const reg = loadRegistry()
  const user = reg.users.find((u) => u.id === id)
  if (!user) return
  user.name = trimmed
  saveRegistry(reg)
}

export const deleteUser = async (id: string): Promise<void> => {
  const reg = loadRegistry()
  if (reg.users.length <= 1) throw new Error('Cannot delete the last user')
  reg.users = reg.users.filter((u) => u.id !== id)
  saveRegistry(reg)
  if (getActiveUserId() === id) setActiveUserId(reg.users[0].id)
  try {
    indexedDB.deleteDatabase(dbNameForUser(id))
  } catch {
    /* ignore */
  }
}

export const dbNameForUser = (userId: string): string =>
  // Keep the legacy database name for the default user so existing data is preserved.
  userId === 'default' ? 'workout-tracker' : `workout-tracker--${userId}`
