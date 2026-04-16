// Schedule service for client-side API calls

const API_BASE = '/api/schedule'

export interface GymClass {
  id: string
  name: string
  description?: string
  type: 'group' | 'personal' | 'special'
  start_time: string
  end_time: string
  duration_minutes: number
  trainer_id: string
  workout_template_id?: string
  max_capacity: number
  current_enrollment: number
  status: 'scheduled' | 'cancelled' | 'completed' | 'full'
  location?: string
  notes?: string
  created_at: string
  updated_at: string
  
  // Joined data
  trainer?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  workout_template?: {
    id: string
    name: string
    category: string
    difficulty: string
    estimated_duration_minutes: number
  }
}

export interface TrainingAppointment {
  id: string
  client_id: string
  trainer_id: string
  start_time: string
  end_time: string
  duration_minutes: number
  type: 'initial_assessment' | 'training_session' | 'progress_check' | 'nutrition_consultation'
  status: 'scheduled' | 'cancelled' | 'completed' | 'no_show'
  notes?: string
  goals_discussed?: string[]
  exercises_completed?: string[]
  client_feedback?: string
  trainer_notes?: string
  created_at: string
  updated_at: string
  
  // Joined data
  client?: {
    id: string
    full_name: string
    email: string
  }
  trainer?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

export interface ScheduleResponse {
  classes: GymClass[]
  appointments: TrainingAppointment[]
}

export interface ScheduleFilters {
  start?: string  // ISO date string
  end?: string    // ISO date string
  type?: string
}

// Fetch schedule with optional date range
export async function fetchSchedule(filters: ScheduleFilters = {}): Promise<ScheduleResponse> {
  const params = new URLSearchParams()
  
  if (filters.start) params.append('start', filters.start)
  if (filters.end) params.append('end', filters.end)
  if (filters.type) params.append('type', filters.type)
  
  const queryString = params.toString()
  const url = `${API_BASE}${queryString ? `?${queryString}` : ''}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching schedule:', error)
    // Return empty schedule for demo purposes
    return { classes: [], appointments: [] }
  }
}

// Create new class or appointment
export async function createScheduleItem(
  type: 'class' | 'appointment',
  data: any
): Promise<GymClass | TrainingAppointment> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, ...data }),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating schedule item:', error)
    throw error
  }
}

// Get today's schedule
export async function getTodaysSchedule(): Promise<ScheduleResponse> {
  const today = new Date().toISOString().split('T')[0]
  return fetchSchedule({ start: today })
}

// Get this week's schedule
export async function getWeeklySchedule(): Promise<ScheduleResponse> {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday
  
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (6 - today.getDay())) // Saturday
  
  return fetchSchedule({
    start: startOfWeek.toISOString().split('T')[0],
    end: endOfWeek.toISOString().split('T')[0]
  })
}

// Get schedule statistics
export async function getScheduleStats(): Promise<{
  totalClasses: number
  totalAppointments: number
  upcomingClasses: number
  upcomingAppointments: number
  classEnrollmentRate: number
  appointmentCompletionRate: number
}> {
  try {
    const schedule = await fetchSchedule()
    
    const now = new Date()
    const upcomingClasses = schedule.classes.filter(c => new Date(c.start_time) > now)
    const upcomingAppointments = schedule.appointments.filter(a => new Date(a.start_time) > now)
    
    const completedAppointments = schedule.appointments.filter(a => a.status === 'completed')
    const totalEnrollment = schedule.classes.reduce((sum, c) => sum + c.current_enrollment, 0)
    const totalCapacity = schedule.classes.reduce((sum, c) => sum + c.max_capacity, 0)
    
    return {
      totalClasses: schedule.classes.length,
      totalAppointments: schedule.appointments.length,
      upcomingClasses: upcomingClasses.length,
      upcomingAppointments: upcomingAppointments.length,
      classEnrollmentRate: totalCapacity > 0 ? Math.round((totalEnrollment / totalCapacity) * 100) : 0,
      appointmentCompletionRate: schedule.appointments.length > 0 
        ? Math.round((completedAppointments.length / schedule.appointments.length) * 100) 
        : 0
    }
  } catch (error) {
    console.error('Error fetching schedule stats:', error)
    // Return default stats for demo purposes
    return {
      totalClasses: 0,
      totalAppointments: 0,
      upcomingClasses: 0,
      upcomingAppointments: 0,
      classEnrollmentRate: 0,
      appointmentCompletionRate: 0
    }
  }
}