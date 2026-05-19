import { useState } from 'react'
import { useUsers } from '../store/UserContext'
import { PageHeader } from '../components/layout/PageHeader'
import { NeonCard } from '../components/ui/NeonCard'
import { GlowButton } from '../components/ui/GlowButton'

export const Users = () => {
  const { users, activeUserId, switchUser, createUser, deleteUser, renameUser } = useUsers()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!newName.trim()) return
    setAdding(true)
    setError(null)
    try {
      await createUser(newName)
      setNewName('')
      setShowAdd(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create user')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    setError(null)
    try {
      await deleteUser(id)
      setConfirmDelete(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete user')
    }
  }

  const initials = (name: string) =>
    name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?'

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Profiles"
        subtitle={`${users.length} ${users.length === 1 ? 'user' : 'users'}`}
        back
        right={<GlowButton size="sm" variant="secondary" onClick={() => setShowAdd(true)}>+ Add</GlowButton>}
      />

      <div className="px-4 py-3 pb-24">
        <div className="text-[12px] text-text-muted leading-relaxed mb-4">
          Every profile has its own workouts, custom exercises, body entries, and muscle XP — completely separate from each other.
        </div>

        <div className="flex flex-col gap-2">
          {users.map((u) => {
            const isActive = u.id === activeUserId
            const isEditing = editingId === u.id
            return (
              <NeonCard key={u.id} className={`p-3 ${isActive ? 'ring-2 ring-brand' : ''}`}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0"
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, var(--brand), var(--accent))'
                        : 'var(--bg-sunken)',
                      color: isActive ? 'var(--accent-ink)' : 'var(--text-muted)',
                      boxShadow: isActive ? '0 0 14px var(--brand)' : 'none',
                    }}
                  >
                    {initials(u.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => {
                          if (editingName.trim()) renameUser(u.id, editingName)
                          setEditingId(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editingName.trim()) renameUser(u.id, editingName)
                            setEditingId(null)
                          }
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        className="w-full bg-sunken border border-border rounded-lg px-2 py-1 text-[14px] text-text outline-none focus:border-brand"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold text-text truncate">{u.name}</span>
                        {isActive && (
                          <span className="text-[9px] font-mono uppercase tracking-wider text-brand bg-brand-soft border border-brand/30 rounded-md px-1.5 py-0.5">
                            Active
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-[10px] text-text-muted font-mono">
                      Created {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {!isActive && (
                      <GlowButton size="sm" onClick={() => switchUser(u.id)}>Switch</GlowButton>
                    )}
                    <div className="flex gap-1">
                      <button
                        aria-label="Rename"
                        className="text-[11px] text-text-muted hover:text-brand border border-border hover:border-brand/40 rounded-md px-1.5 py-0.5 transition-colors"
                        onClick={() => { setEditingId(u.id); setEditingName(u.name) }}
                      >
                        Rename
                      </button>
                      {users.length > 1 && (
                        <button
                          aria-label="Delete"
                          className="text-[11px] text-text-muted hover:text-danger border border-border hover:border-danger/40 rounded-md px-1.5 py-0.5 transition-colors"
                          onClick={() => setConfirmDelete(u.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </NeonCard>
            )
          })}
        </div>

        {error && (
          <div className="mt-3 text-[12px] text-danger font-mono">{error}</div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="modal-backdrop absolute inset-0" onClick={() => !adding && setShowAdd(false)} />
          <div className="relative z-10 w-full max-w-lg bg-elevated border-t border-border rounded-t-2xl p-5">
            <h3 className="text-[18px] font-semibold tracking-tight mb-1 text-text">Add new profile</h3>
            <p className="text-[13px] text-text-muted mb-3">
              A fresh database is created for this user. Their data stays separate from everyone else.
            </p>
            <input
              type="text"
              placeholder="Profile name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              autoFocus
              className="w-full bg-sunken border border-border rounded-xl px-3 py-2.5 text-[14px] text-text outline-none focus:border-brand mb-4"
            />
            <div className="flex gap-3">
              <GlowButton className="flex-1" disabled={!newName.trim() || adding} onClick={handleAdd}>
                {adding ? 'Adding…' : 'Create profile'}
              </GlowButton>
              <GlowButton variant="secondary" className="flex-1" disabled={adding} onClick={() => setShowAdd(false)}>
                Cancel
              </GlowButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="modal-backdrop absolute inset-0" onClick={() => setConfirmDelete(null)} />
          <div className="relative z-10 w-full max-w-lg bg-elevated border-t border-border rounded-t-2xl p-5">
            <h3 className="text-[18px] font-semibold tracking-tight mb-1 text-text">
              Delete "{users.find((u) => u.id === confirmDelete)?.name}"?
            </h3>
            <p className="text-[13px] text-text-muted mb-4">
              All of their workouts, exercises, body entries and XP will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <GlowButton variant="danger" className="flex-1" onClick={() => handleDelete(confirmDelete)}>
                Delete profile
              </GlowButton>
              <GlowButton variant="secondary" className="flex-1" onClick={() => setConfirmDelete(null)}>
                Cancel
              </GlowButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
