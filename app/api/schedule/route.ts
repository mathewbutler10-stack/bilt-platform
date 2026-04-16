import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start') || new Date().toISOString().split('T')[0]
    const endDate = searchParams.get('end') || ''
    const type = searchParams.get('type') || ''
    
    // Build query for classes/sessions
    let query = supabase
      .from('gym_classes')
      .select(`
        *,
        trainer:trainer_id (
          id,
          full_name,
          avatar_url
        ),
        workout_template:workout_template_id (
          id,
          name,
          category,
          difficulty,
          estimated_duration_minutes
        )
      `)
      .gte('start_time', `${startDate}T00:00:00`)
      .order('start_time', { ascending: true })
    
    if (endDate) {
      query = query.lte('start_time', `${endDate}T23:59:59`)
    }
    
    if (type) {
      query = query.eq('type', type)
    }
    
    const { data: classes, error: classesError } = await query
    
    if (classesError) {
      console.error('Error fetching classes:', classesError)
      // Return empty array instead of error for demo purposes
      return NextResponse.json({ classes: [], appointments: [] })
    }
    
    // Also fetch personal training appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('training_appointments')
      .select(`
        *,
        client:client_id (
          id,
          full_name,
          email
        ),
        trainer:trainer_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .gte('start_time', `${startDate}T00:00:00`)
      .order('start_time', { ascending: true })
    
    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
      // Return classes only
      return NextResponse.json({ classes: classes || [], appointments: [] })
    }
    
    return NextResponse.json({
      classes: classes || [],
      appointments: appointments || []
    })
    
  } catch (error: any) {
    console.error('Unexpected error in GET /api/schedule:', error)
    // Return empty data for demo purposes
    return NextResponse.json({ classes: [], appointments: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Determine if it's a class or appointment
    const { type, ...data } = body
    
    if (type === 'class') {
      // Create gym class
      const { data: newClass, error } = await supabase
        .from('gym_classes')
        .insert({
          ...data,
          status: 'scheduled',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating class:', error)
        return NextResponse.json(
          { error: 'Failed to create class', details: error.message },
          { status: 500 }
        )
      }
      
      return NextResponse.json(newClass, { status: 201 })
      
    } else if (type === 'appointment') {
      // Create training appointment
      const { data: newAppointment, error } = await supabase
        .from('training_appointments')
        .insert({
          ...data,
          status: 'scheduled',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating appointment:', error)
        return NextResponse.json(
          { error: 'Failed to create appointment', details: error.message },
          { status: 500 }
        )
      }
      
      return NextResponse.json(newAppointment, { status: 201 })
      
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "class" or "appointment"' },
        { status: 400 }
      )
    }
    
  } catch (error: any) {
    console.error('Unexpected error in POST /api/schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'