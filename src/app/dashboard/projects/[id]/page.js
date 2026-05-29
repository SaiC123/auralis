'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'
import { supabase } from '@/lib/supabase/client'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const toast = useToast()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          toast.error('Project not found.')
          router.push('/dashboard')
        } else {
          setProject(data)
          setEditTitle(data.title)
          setEditDesc(data.description ?? '')
        }
        setLoading(false)
      })
  }, [id])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { data, error } = await supabase
      .from('projects')
      .update({ title: editTitle.trim(), description: editDesc.trim() })
      .eq('id', id)
      .select()
      .single()
    setSaving(false)
    if (error) {
      toast.error('Failed to save changes.')
    } else {
      setProject(data)
      setEditing(false)
      toast.success('Project updated.')
    }
  }

  const handleToggleStatus = async () => {
    const nextStatus = project.status === 'Active' ? 'Draft' : 'Active'
    const { data, error } = await supabase
      .from('projects')
      .update({ status: nextStatus })
      .eq('id', id)
      .select()
      .single()
    if (!error) setProject(data)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <button
        onClick={() => router.push('/dashboard')}
        className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors mb-6 cursor-pointer"
      >
        ← Back to Projects
      </button>

      <div className="card mb-6">
        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
              className="input text-xl font-bold"
              autoFocus
            />
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder="Description"
            />
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="nav-cta px-5 py-2 text-sm">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="nav-cta-secondary px-5 py-2 text-sm">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">{project.title}</h1>
              <p className="text-[var(--muted)] mt-1">{project.description || 'No description.'}</p>
              <p className="text-xs text-[var(--muted)] mt-3">
                Created {project.created_at ? new Date(project.created_at).toLocaleDateString() : ''}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <button
                onClick={handleToggleStatus}
                className="text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors"
                style={{
                  background: project.status === 'Active' ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'var(--surface)',
                  color: project.status === 'Active' ? 'var(--primary)' : 'var(--muted)',
                  border: '1px solid',
                  borderColor: project.status === 'Active' ? 'color-mix(in srgb, var(--primary) 30%, transparent)' : 'var(--border)',
                }}
              >
                {project.status}
              </button>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-[var(--muted)] hover:text-[var(--primary)] transition-colors cursor-pointer"
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">Run Detection</h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          Use the detection tool to capture voice and motor data for this project.
        </p>
        <button
          onClick={() => router.push('/detect')}
          className="nav-cta"
        >
          Open Detection Tool
        </button>
      </div>
    </div>
  )
}
