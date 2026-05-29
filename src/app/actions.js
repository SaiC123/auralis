'use server'

import { createServerClient } from '@/lib/supabase/server'

/**
 * ──────────────────────────────────────────────────────────────
 *  Example Server Actions for Supabase CRUD
 *
 *  Duplicate and modify these for your hackathon features.
 *  Replace 'items' with your actual table name.
 * ──────────────────────────────────────────────────────────────
 */

/**
 * Fetch all items for the current user.
 * Usage:  const { data, error } = await getItems()
 */
export async function getItems() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('items')            // <-- replace with your table
    .select('*')
    .eq('user_id', user.id)   // <-- scope to current user
    .order('created_at', { ascending: false })

  return { data, error: error?.message ?? null }
}

/**
 * Add a new item using FormData (works with HTML forms + useActionState).
 * Usage:
 *   <form action={addItem}>
 *     <input name="title" />
 *     <button type="submit">Add</button>
 *   </form>
 */
export async function addItem(formData) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const title = formData.get('title')

  const { error } = await supabase
    .from('items')            // <-- replace with your table
    .insert({ title, user_id: user.id })

  return { error: error?.message ?? null }
}

/**
 * Delete an item by its ID.
 * Usage:  const { error } = await deleteItem(itemId)
 */
export async function deleteItem(id) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('items')            // <-- replace with your table
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)   // ensure user owns the item

  return { error: error?.message ?? null }
}
