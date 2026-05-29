'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/Modal'
import { useToast } from '@/components/Toast'
import Card3D from '@/components/Card3D'
import { supabase } from '@/lib/supabase/client'

export default function DashboardPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const toast = useToast()

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to load projects.')
    } else {
      setProjects(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('projects')
      .insert({ title: newTitle.trim(), description: newDesc.trim(), status: 'Draft', user_id: user.id })
      .select()
      .single()

    setSaving(false)
    if (error) {
      toast.error('Failed to create project.')
    } else {
      setProjects((prev) => [data, ...prev])
      setNewTitle('')
      setNewDesc('')
      setShowModal(false)
      toast.success(`"${data.title}" created!`)
    }
  }

  const handleDelete = async (id, title) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete project.')
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== id))
      toast.error(`"${title}" deleted.`)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Projects</h1>
          <p className="text-[var(--muted)] mt-1">Manage and track all your projects</p>
        </div>
        <button onClick={() => setShowModal(true)} className="nav-cta">
          + New Project
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="spinner" />
        </div>
      ) : projects.length === 0 ? (
        <Card3D className="text-center py-16" style={{ background: 'var(--surface)' }}>
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium text-[var(--foreground)]">No projects yet</p>
          <p className="text-sm text-[var(--muted)] mt-1 mb-6">Create your first project to get started.</p>
          <button onClick={() => setShowModal(true)} className="nav-cta">
            + New Project
          </button>
        </Card3D>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card3D
              key={project.id}
              className="group transition-all duration-200 cursor-pointer flex flex-col"
              onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-[var(--foreground)] text-lg">
                  {project.title}
                </h3>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{
                    background: project.status === 'Active' ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'transparent',
                    color: project.status === 'Active' ? 'var(--primary)' : 'var(--muted)',
                    border: '1px solid',
                    borderColor: project.status === 'Active' ? 'color-mix(in srgb, var(--primary) 30%, transparent)' : 'var(--border)',
                  }}
                >
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-[var(--muted)] mb-4 flex-1">
                {project.description || 'No description'}
              </p>
              <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-xs text-[var(--muted)]">
                  {project.created_at ? new Date(project.created_at).toLocaleDateString() : ''}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(project.id, project.title) }}
                  className="text-xs text-[var(--muted)] hover:text-red-500 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </Card3D>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="project-title" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Project Name
            </label>
            <input
              id="project-title"
              type="text"
              placeholder="e.g. Parkinson's Research Study"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="input"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="project-desc" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Description
            </label>
            <textarea
              id="project-desc"
              placeholder="Brief description..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
              className="input resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="nav-cta-secondary px-6">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="nav-cta px-6">
              {saving ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
