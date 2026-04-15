// Workout service for client-side API calls

const API_BASE = '/api/workouts'

export interface Workout {
  id: string
  name: string
  description?: string
  category: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'recovery' | 'circuit'
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite'
  estimated_duration_minutes: number
  exercises: any[]
  is_public: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface WorkoutFilters {
  category?: string
  difficulty?: string
  limit?: number
  offset?: number
}

export interface WorkoutResponse {
  workouts: Workout[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface CreateWorkoutData {
  name: string
  description?: string
  category: Workout['category']
  difficulty: Workout['difficulty']
  estimated_duration_minutes?: number
  exercises?: any[]
  is_public?: boolean
}

export interface UpdateWorkoutData extends Partial<CreateWorkoutData> {}

// Fetch workouts with optional filters
export async function fetchWorkouts(filters: WorkoutFilters = {}): Promise<WorkoutResponse> {
  const params = new URLSearchParams()
  
  if (filters.category && filters.category !== 'all') {
    params.append('category', filters.category)
  }
  
  if (filters.difficulty && filters.difficulty !== 'all') {
    params.append('difficulty', filters.difficulty)
  }
  
  if (filters.limit) {
    params.append('limit', filters.limit.toString())
  }
  
  if (filters.offset) {
    params.append('offset', filters.offset.toString())
  }
  
  const queryString = params.toString()
  const url = queryString ? `${API_BASE}?${queryString}` : API_BASE
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch workouts: ${response.statusText}`)
  }
  
  return response.json()
}

// Fetch single workout by ID
export async function fetchWorkout(id: string): Promise<{ workout: Workout }> {
  const response = await fetch(`${API_BASE}/${id}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch workout: ${response.statusText}`)
  }
  
  return response.json()
}

// Create new workout
export async function createWorkout(data: CreateWorkoutData): Promise<{ success: boolean; workout: Workout; message: string }> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to create workout: ${response.statusText}`)
  }
  
  return response.json()
}

// Update existing workout
export async function updateWorkout(id: string, data: UpdateWorkoutData): Promise<{ success: boolean; workout: Workout; message: string }> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to update workout: ${response.statusText}`)
  }
  
  return response.json()
}

// Delete workout
export async function deleteWorkout(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error(`Failed to delete workout: ${response.statusText}`)
  }
  
  return response.json()
}

// Get workout statistics
export async function getWorkoutStats(): Promise<{
  total: number
  byCategory: Record<string, number>
  byDifficulty: Record<string, number>
  recent: Workout[]
}> {
  const response = await fetch(`${API_BASE}/stats`)
  
  if (!response.ok) {
    // If stats endpoint doesn't exist yet, return mock data
    return {
      total: 0,
      byCategory: {},
      byDifficulty: {},
      recent: []
    }
  }
  
  return response.json()
}