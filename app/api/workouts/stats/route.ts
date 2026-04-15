import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get total count
    const { count: total, error: countError } = await supabase
      .from('workout_templates')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('Error counting workouts:', countError)
      // Continue with zero count
    }
    
    // Get count by category
    const { data: byCategory, error: categoryError } = await supabase
      .from('workout_templates')
      .select('category')
    
    const categoryStats: Record<string, number> = {}
    if (!categoryError && byCategory) {
      byCategory.forEach(workout => {
        const category = workout.category || 'uncategorized'
        categoryStats[category] = (categoryStats[category] || 0) + 1
      })
    }
    
    // Get count by difficulty
    const { data: byDifficulty, error: difficultyError } = await supabase
      .from('workout_templates')
      .select('difficulty')
    
    const difficultyStats: Record<string, number> = {}
    if (!difficultyError && byDifficulty) {
      byDifficulty.forEach(workout => {
        const difficulty = workout.difficulty || 'unknown'
        difficultyStats[difficulty] = (difficultyStats[difficulty] || 0) + 1
      })
    }
    
    // Get recent workouts
    const { data: recent, error: recentError } = await supabase
      .from('workout_templates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    return NextResponse.json({
      total: total || 0,
      byCategory: categoryStats,
      byDifficulty: difficultyStats,
      recent: recent || []
    })
    
  } catch (error: any) {
    console.error('Unexpected error in workout stats:', error)
    return NextResponse.json({
      total: 0,
      byCategory: {},
      byDifficulty: {},
      recent: []
    })
  }
}