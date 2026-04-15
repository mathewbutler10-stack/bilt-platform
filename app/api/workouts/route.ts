import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Build query
    let query = supabase
      .from('workout_templates')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty)
    }
    
    const { data: workouts, error } = await query
    
    if (error) {
      console.error('Error fetching workouts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch workouts' },
        { status: 500 }
      )
    }
    
    // Get total count for pagination
    let countQuery = supabase
      .from('workout_templates')
      .select('*', { count: 'exact', head: true })
    
    if (category && category !== 'all') {
      countQuery = countQuery.eq('category', category)
    }
    
    if (difficulty && difficulty !== 'all') {
      countQuery = countQuery.eq('difficulty', difficulty)
    }
    
    const { count } = await countQuery
    
    return NextResponse.json({
      workouts: workouts || [],
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit
    })
    
  } catch (error: any) {
    console.error('Unexpected error in workouts API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.category || !body.difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, difficulty' },
        { status: 400 }
      )
    }
    
    // Create workout template
    const { data: workout, error } = await supabase
      .from('workout_templates')
      .insert({
        name: body.name,
        description: body.description || '',
        category: body.category,
        difficulty: body.difficulty,
        estimated_duration_minutes: body.estimated_duration_minutes || 60,
        exercises: body.exercises || [],
        is_public: body.is_public || false
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating workout:', error)
      return NextResponse.json(
        { error: 'Failed to create workout' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      workout,
      message: 'Workout created successfully'
    })
    
  } catch (error: any) {
    console.error('Unexpected error creating workout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}