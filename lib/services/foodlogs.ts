import { supabase } from '@/lib/supabase'
import type { LogEntry } from '@/components/FoodLog'

export type FoodLogRow = Omit<LogEntry, 'id'> & {
  id: string
  user_id: string
  created_at: string
}

export async function saveFoodLog(entries: LogEntry[]): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const rows = entries.map(({ id: _id, ...entry }) => ({
    ...entry,
    user_id: user.id,
  }))

  const { error } = await supabase.from('food_logs').insert(rows)
  if (error) throw error
}

export async function getFoodLogs(): Promise<FoodLogRow[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as FoodLogRow[]
}

export async function deleteFoodLog(id: string): Promise<void> {
  const { error } = await supabase.from('food_logs').delete().eq('id', id)
  if (error) throw error
}

export async function deleteFoodLogsBySession(date: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Deletes all rows whose created_at falls within the given calendar day (local time)
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  const { error } = await supabase
    .from('food_logs')
    .delete()
    .eq('user_id', user.id)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())

  if (error) throw error
}