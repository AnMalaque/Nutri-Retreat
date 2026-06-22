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
  goal:                    string  // NEW: For onboarding (Lose Weight, Maintain Weight, Gain Weight)
  medical_conditions:      string[]
  medications:             string[]
  allergies:               string[]
  dietary_restrictions:    string[]
  family_health_history:   string[]
  occupation:              string
  physical_activity_level: string
  sleep_pattern:           string
  updated_at?:             string
}

export const EMPTY_PROFILE: Profile = {
  first_name:              '',
  last_name:               '',
  middle_name:             '',
  age:                     '',
  sex:                     '',
  height_cm:               '',
  weight_kg:               '',
  goal:                    '',
  medical_conditions:      [],
  medications:             [],
  allergies:               [],
  dietary_restrictions:    [],
  family_health_history:   [],
  occupation:              '',
  physical_activity_level: '',
  sleep_pattern:           '',
}

/**
 * Get current user's profile
 */
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

/**
 * Check if user has completed onboarding (has required fields filled)
 * Onboarding requires: first_name, last_name, age, sex, height_cm, weight_kg, physical_activity_level, goal
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const profile = await getProfile()
    
    if (!profile) return false
    
    // Check if all required onboarding fields are filled
    const hasAllFields = !!(
      profile.first_name &&
      profile.last_name &&
      profile.age &&
      profile.sex &&
      profile.height_cm &&
      profile.weight_kg &&
      profile.physical_activity_level &&
      profile.goal
    )
    
    return hasAllFields
  } catch (err) {
    console.error('Error checking onboarding status:', err)
    return false
  }
}

/**
 * Upsert profile (create or update)
 * Handles empty string conversion to null for numeric/optional fields
 */
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
    goal:                    profile.goal                    || null,
    physical_activity_level: profile.physical_activity_level || null,
    sleep_pattern:           profile.sleep_pattern           || null,
    updated_at:              new Date().toISOString(),
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' })

  if (error) throw error
}

/**
 * Delete profile (not a food log - seems like a copy-paste error in original)
 */
export async function deleteProfile(id: string): Promise<void> {
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  if (error) throw error
}