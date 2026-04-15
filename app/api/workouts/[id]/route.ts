import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    
    const { data: workout, error } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching workout:', error)
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ workout })
    
  } catch (error: any) {
    console.error('Unexpected error fetching workout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()
    
    // Check if workout exists
    const { data: existingWorkout, error: fetchError } = await supabase
      .from('workout_templates')
      .select('id')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      )
    }
    
    // Update workout
    const { data: workout, error } = await supabase
      .from('workout_templates')
      .update({
        name: body.name,
        description: body.description,
        category: body.category,
        difficulty: body.difficulty,
        estimated_duration_minutes: body.estimated_duration_minutes,
        exercises: body.exercises,
        is_public: body.is_public,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating workout:', error)
      return NextResponse.json(
        { error: 'Failed to update workout' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      workout,
      message: 'Workout updated successfully'
    })
    
  } catch (error: any) {
    console.error('Unexpected error updating workout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    
    // Check if workout exists
    const { data: existingWorkout, error: fetchError } = await supabase
      .from('workout_templates')
      .select('id')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      )
    }
    
    // Delete workout
    const { error } = await supabase
      .from('workout_templates')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting workout:', error)
      return NextResponse.json(
        { error: 'Failed to delete workout' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Workout deleted successfully'
    })
    
  } catch (error: any) {
    console.error('Unexpected error deleting workout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}