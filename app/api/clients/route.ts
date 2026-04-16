import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    
    // Build query
    let query = supabase
      .from('clients')
      .select(`
        *,
        profiles:user_id (
          email,
          full_name,
          avatar_url
        ),
        client_goals (*),
        client_biometrics (*)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json(
        { error: 'Failed to fetch clients', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      clients: data || [],
      total: count || 0,
      limit,
      offset,
      hasMore: (offset + limit) < (count || 0)
    })
    
  } catch (error: any) {
    console.error('Unexpected error in GET /api/clients:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Validate required fields
    const { user_id, full_name, email, phone, date_of_birth, gender } = body
    
    if (!user_id || !full_name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, full_name, email' },
        { status: 400 }
      )
    }
    
    // Create client record
    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id,
        full_name,
        email,
        phone: phone || null,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        status: 'active',
        membership_type: 'standard',
        join_date: new Date().toISOString().split('T')[0]
      })
      .select(`
        *,
        profiles:user_id (
          email,
          full_name,
          avatar_url
        )
      `)
      .single()
    
    if (error) {
      console.error('Error creating client:', error)
      return NextResponse.json(
        { error: 'Failed to create client', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data, { status: 201 })
    
  } catch (error: any) {
    console.error('Unexpected error in POST /api/clients:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'