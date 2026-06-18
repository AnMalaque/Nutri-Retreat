import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const search = searchParams.get('search') || ''

  try {
    let data = null
    let error = null

    switch (type) {
      case 'meat': {
        const fatLevel = searchParams.get('fat_level')
        let query = supabase
          .from('meat_foods')
          .select('*')
          .order('english_name')
        if (fatLevel) query = query.eq('fat_level', fatLevel)
        if (search) query = query.or(`filipino_name.ilike.%${search}%,english_name.ilike.%${search}%`)
        ;({ data, error } = await query)
        break
      }
      case 'rice': {
        const proteinLevel = searchParams.get('protein_level')
        let query = supabase
          .from('rice_foods')
          .select('*')
          .order('english_name')
        if (proteinLevel) query = query.eq('protein_level', proteinLevel)
        if (search) query = query.or(`filipino_name.ilike.%${search}%,english_name.ilike.%${search}%`)
        ;({ data, error } = await query)
        break
      }
      case 'vegetable': {
        const category = searchParams.get('category')
        const preparation = searchParams.get('preparation')

        let query = supabase
          .from('vegetable_foods')
          .select('*')
          .order('english_name')
        if (category) {
          query = query.eq('category', category)
        }
        if (preparation) {
          query = query.eq('preparation', preparation)
        }

        if (search) {
          query = query.or(
            `filipino_name.ilike.%${search}%,english_name.ilike.%${search}%`
          )
        }
        ;({ data, error } = await query)
        break
      }
      case 'milk': {
        const category = searchParams.get('category')
        let query = supabase
          .from('milk_foods')
          .select('*')
          .order('english_name')
        if (category) query = query.eq('category', category)
        if (search) query = query.or(`filipino_name.ilike.%${search}%,english_name.ilike.%${search}%`)
        ;({ data, error } = await query)
        break
      }
      case 'fruit': {
        let query = supabase
          .from('fruit_foods')
          .select('*')
          .order('english_name')
        if (search) query = query.or(`filipino_name.ilike.%${search}%,english_name.ilike.%${search}%`)
        ;({ data, error } = await query)
        break
      }
      default:
        return NextResponse.json({ error: 'Invalid food type' }, { status: 400 })
    }

    if (error) throw error

    return NextResponse.json({ data })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Failed to fetch foods' }, { status: 500 })
  }
}
