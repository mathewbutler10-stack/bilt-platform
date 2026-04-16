import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const clientId = params.id
    
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        profiles:user_id (
          email,
          full_name,
          avatar_url,
          created_at
        ),
        client_goals (*),
        client_biometrics (*),
        training_programs (*),
        nutrition_targets (*),
        checkin_cycles (*)
      `)
      .eq('id', clientId)
      .single()
    
    if (error) {
      console.error('Error fetching client:', error)
      return NextResponse.json(
        { error: 'Client not found', details: error.message },
        { status: 404 }
      )
    }
    
    return NextResponse.json(data)
    
  } catch (error: any) {
    console.error('Unexpected error in GET /api/clients/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
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
    const clientId = params.id
    const body = await request.json()
    
    // Remove fields that shouldn't be updated
    const { id, user_id, created_at, ...updateData } = body
    
    const { data, error } = await supabase
      .from('clients')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)
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
      console.error('Error updating client:', error)
      return NextResponse.json(
        { error: 'Failed to update client', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
    
  } catch (error: any) {
    console.error('Unexpected error in PUT /api/clients/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
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
    const clientId = params.id
    
    // Soft delete - update status to 'inactive'
    const { data, error } = await supabase
      .from('clients')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)
      .select()
      .single()
    
    if (error) {
      console.error('Error deleting client:', error)
      return NextResponse.json(
        { error: 'Failed to delete client', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Client marked as inactive',
      client: data
    })
    
  } catch (error: any) {
    console.error('Unexpected error in DELETE /api/clients/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'