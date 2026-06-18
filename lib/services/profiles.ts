import { supabase } from '@/lib/supabase'

export interface Profile {
  id?:                     string
  user_id?:                string
  first_name:              string
  last_name:               string
  middle_name:             string
  age:                     number | ''
  sex:                     string
  height_cm:               number | ''
  weight_kg:               number | ''
  medical_conditions:      string[]
  medications:             string[]
  allergies:               string[]
  dietary_restrictions:    string[]
  family_health_history:   string[]
  occupation:              string
  physical_activity_level: string
  sleep_pattern:           string
}

export const EMPTY_PROFILE: Profile = {
  first_name:              '',
  last_name:               '',
  middle_name:             '',
  age:                     '',
  sex:                     '',
  height_cm:               '',
  weight_kg:               '',
  medical_conditions:      [],
  medications:             [],
  allergies:               [],
  dietary_restrictions:    [],
  family_health_history:   [],
  occupation:              '',
  physical_activity_level: '',
  sleep_pattern:           '',
}

export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error
  return data as Profile | null
}

export async function upsertProfile(profile: Profile): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const payload = {
    ...profile,
    user_id:                 user.id,
    age:                     profile.age       === '' ? null : Number(profile.age),
    height_cm:               profile.height_cm === '' ? null : Number(profile.height_cm),
    weight_kg:               profile.weight_kg === '' ? null : Number(profile.weight_kg),
    sex:                     profile.sex                     || null,
    physical_activity_level: profile.physical_activity_level || null,
    sleep_pattern:           profile.sleep_pattern           || null,
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' })

  if (error) throw error
}

export async function deleteFoodLog(id: string): Promise<void> {
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  if (error) throw error
}