import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Schema for check-in cycle scheduling
const ScheduleCheckinCycleRequestSchema = z.object({
  clientId: z.string().uuid(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  frequency: z.enum(['weekly', 'biweekly', 'monthly']).default('weekly'),
  checkinType: z.enum(['nutrition', 'training', 'combined', 'wellness']).default('combined'),
  preferredDay: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).default('monday'),
  preferredTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:MM format',
  }).default('09:00'),
  durationWeeks: z.number().min(1).max(52).default(12),
  reminders: z.object({
    enabled: z.boolean().default(true),
    hoursBefore: z.number().min(1).max(48).default(24),
    channels: z.array(z.enum(['in_app', 'email', 'sms', 'push'])).default(['in_app', 'email']),
  }).optional(),
});

type ScheduleCheckinCycleRequest = z.infer<typeof ScheduleCheckinCycleRequestSchema>;
type CheckinCycleResponse = {
  success: boolean;
  cycleId: string;
  schedule: Array<{
    checkinId: string;
    scheduledFor: string;
    checkinType: string;
    status: 'scheduled' | 'sent' | 'completed' | 'missed';
    reminderSent: boolean;
  }>;
  summary: {
    totalCheckins: number;
    frequency: string;
    durationWeeks: number;
    nextCheckin: string;
    lastCheckin: string | null;
  };
};

// Day of week mapping
const DAY_MAP = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

// Frequency intervals in days
const FREQUENCY_INTERVALS = {
  weekly: 7,
  biweekly: 14,
  monthly: 30, // Approximate
};

// Check-in type configurations
const CHECKIN_CONFIGS = {
  nutrition: {
    questions: [
      'How consistent were you with your meal plan this week?',
      'Did you experience any cravings or hunger issues?',
      'How was your energy levels throughout the day?',
      'Any digestive issues or food intolerances noticed?',
      'Rate your adherence to hydration goals (1-10)',
    ],
    metrics: ['calorie_intake', 'protein_intake', 'hydration', 'meal_timing'],
  },
  training: {
    questions: [
      'How many training sessions did you complete this week?',
      'Rate your workout intensity (1-10)',
      'Any muscle soreness or recovery issues?',
      'Did you hit your progressive overload targets?',
      'How was your sleep quality for recovery?',
    ],
    metrics: ['session_count', 'rpe_average', 'recovery_score', 'sleep_hours'],
  },
  combined: {
    questions: [
      'Overall, how did your week go with nutrition and training?',
      'What was your biggest win this week?',
      'What was your biggest challenge this week?',
      'How motivated do you feel for the coming week?',
      'Any adjustments needed for your plan?',
    ],
    metrics: ['adherence_score', 'motivation_level', 'challenge_rating', 'adjustment_needed'],
  },
  wellness: {
    questions: [
      'How would you rate your stress levels this week?',
      'How was your sleep quality and duration?',
      'Did you practice any mindfulness or recovery techniques?',
      'How balanced did you feel between work, training, and life?',
      'Any non-scale victories to celebrate?',
    ],
    metrics: ['stress_level', 'sleep_score', 'recovery_quality', 'life_balance'],
  },
};

// Generate check-in schedule
function generateCheckinSchedule(
  startDate: Date,
  frequency: string,
  preferredDay: string,
  durationWeeks: number
): Date[] {
  const schedule: Date[] = [];
  const intervalDays = FREQUENCY_INTERVALS[frequency as keyof typeof FREQUENCY_INTERVALS];
  const targetDay = DAY_MAP[preferredDay as keyof typeof DAY_MAP];
  
  // Find first occurrence of preferred day on or after start date
  let currentDate = new Date(startDate);
  while (currentDate.getDay() !== targetDay) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Generate schedule for duration
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (durationWeeks * 7));
  
  while (currentDate <= endDate) {
    schedule.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + intervalDays);
  }
  
  return schedule;
}

// Format time with date
function setTimeOnDate(date: Date, timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

// Generate check-in questions based on type
function generateCheckinQuestions(checkinType: string, weekNumber: number) {
  const config = CHECKIN_CONFIGS[checkinType as keyof typeof CHECKIN_CONFIGS];
  const baseQuestions = [...config.questions];
  
  // Add week-specific questions
  if (weekNumber === 1) {
    baseQuestions.push('How was the initial adjustment to your new plan?');
    baseQuestions.push('Any initial questions or concerns about the program?');
  } else if (weekNumber % 4 === 0) {
    // Monthly review
    baseQuestions.push('Looking back over the past month, what progress have you noticed?');
    baseQuestions.push('What habits have become easier or more challenging?');
  } else if (weekNumber === durationWeeks) {
    // Final check-in
    baseQuestions.push('Reflecting on the entire program, what are your key takeaways?');
    baseQuestions.push('How will you maintain your progress moving forward?');
  }
  
  return baseQuestions;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const validationResult = ScheduleCheckinCycleRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    const startDate = new Date(data.startDate);
    
    // Generate check-in schedule
    const scheduleDates = generateCheckinSchedule(
      startDate,
      data.frequency,
      data.preferredDay,
      data.durationWeeks
    );
    
    // Apply preferred time to all dates
    const scheduledCheckins = scheduleDates.map((date, index) => {
      const scheduledFor = setTimeOnDate(date, data.preferredTime);
      const weekNumber = Math.floor(index * (FREQUENCY_INTERVALS[data.frequency as keyof typeof FREQUENCY_INTERVALS] / 7)) + 1;
      
      return {
        scheduledFor: scheduledFor.toISOString(),
        checkinType: data.checkinType,
        weekNumber,
        questions: generateCheckinQuestions(data.checkinType, weekNumber),
        status: 'scheduled' as const,
        reminderSent: false,
        reminders: data.reminders || { enabled: true, hoursBefore: 24, channels: ['in_app', 'email'] },
      };
    });
    
    // Save to database (if Supabase is configured)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let cycleId = `cycle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      try {
        // Create check-in cycle
        const { data: cycleData, error: cycleError } = await supabase
          .from('checkin_cycles')
          .insert({
            client_id: data.clientId,
            start_date: startDate.toISOString(),
            frequency: data.frequency,
            checkin_type: data.checkinType,
            preferred_day: data.preferredDay,
            preferred_time: data.preferredTime,
            duration_weeks: data.durationWeeks,
            reminders_enabled: data.reminders?.enabled ?? true,
            reminder_hours_before: data.reminders?.hoursBefore ?? 24,
            reminder_channels: data.reminders?.channels ?? ['in_app', 'email'],
            status: 'active',
          })
          .select('id')
          .single();
        
        if (cycleError) throw cycleError;
        cycleId = cycleData.id;
        
        // Create individual check-ins
        const checkinsToInsert = scheduledCheckins.map((checkin, index) => ({
          cycle_id: cycleId,
          client_id: data.clientId,
          scheduled_for: checkin.scheduledFor,
          checkin_type: checkin.checkinType,
          week_number: checkin.weekNumber,
          questions: checkin.questions,
          status: checkin.status,
          reminder_sent: checkin.reminderSent,
          sort_order: index,
        }));
        
        const { error: checkinsError } = await supabase
          .from('checkin_responses')
          .insert(checkinsToInsert);
        
        if (checkinsError) throw checkinsError;
        
      } catch (dbError) {
        console.error('Failed to save check-in schedule to database:', dbError);
        // Continue even if database save fails
      }
    }
    
    // Prepare response
    const response: CheckinCycleResponse = {
      success: true,
      cycleId,
      schedule: scheduledCheckins.map((checkin, index) => ({
        checkinId: `checkin_${cycleId}_${index}`,
        scheduledFor: checkin.scheduledFor,
        checkinType: checkin.checkinType,
        status: checkin.status,
        reminderSent: checkin.reminderSent,
        weekNumber: checkin.weekNumber,
      })),
      summary: {
        totalCheckins: scheduledCheckins.length,
        frequency: data.frequency,
        durationWeeks: data.durationWeeks,
        nextCheckin: scheduledCheckins[0]?.scheduledFor || null,
        lastCheckin: null,
      },
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error scheduling check-in cycle:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // GET endpoint for retrieving check-in cycles
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  const cycleId = searchParams.get('cycleId');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  if (!clientId && !cycleId) {
    return NextResponse.json(
      { success: false, error: 'Either clientId or cycleId query parameter is required' },
      { status: 400 }
    );
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { success: false, error: 'Supabase not configured' },
      { status: 500 }
    );
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    if (cycleId) {
      // Get specific cycle with its check-ins
      const { data: cycleData, error: cycleError } = await supabase
        .from('checkin_cycles')
        .select(`
          *,
          checkin_responses (*)
        `)
        .eq('id', cycleId)
        .single();
      
      if (cycleError) throw cycleError;
      
      // Get check-in responses for this cycle
      const { data: checkinsData, error: checkinsError } = await supabase
        .from('checkin_responses')
        .select('*')
        .eq('cycle_id', cycleId)
        .order('scheduled_for', { ascending: true });
      
      if (checkinsError) throw checkinsError;
      
      return NextResponse.json({
        success: true,
        cycle: cycleData,
        checkins: checkinsData,
      });
      
    } else {
      // Get cycles for client
      let query = supabase
        .from('checkin_cycles')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data: cyclesData, error: cyclesError } = await query;
      
      if (cyclesError) throw cyclesError;
      
      // Get upcoming check-ins for each cycle
      const cyclesWithCheckins = await Promise.all(
        cyclesData.map(async (cycle) => {
          const { data: upcomingCheckins } = await supabase
            .from('checkin_responses')
            .select('*')
            .eq('cycle_id', cycle.id)
            .eq('status', 'scheduled')
            .gte('scheduled_for', new Date().toISOString())
            .order('scheduled_for', { ascending: true })
            .limit(3);
          
          return {
            ...cycle,
            upcomingCheckins: upcomingCheckins || [],
          };
        })
      );
      
      return NextResponse.json({
        success: true,
        cycles: cyclesWithCheckins,
        total: cyclesData.length,
      });
    }
    
  } catch (error) {
    console.error('Error retrieving check-in cycles:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Update check-in cycle status
  try {
    const body = await request.json();
    const { cycleId, status, action } = body;
    
    if (!cycleId) {
      return NextResponse.json(
        { success: false, error: 'cycleId is required' },
        { status: 400 }
      );
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase not configured' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    if (action === 'pause') {
      const { error } = await supabase
        .from('checkin_cycles')
        .update({ status: 'paused', paused_at: new Date().toISOString() })
        .eq('id', cycleId);
      
      if (error) throw error;
      
      return NextResponse.json({
        success: true,
        message: 'Check-in cycle paused successfully',
      });
      
    } else if (action === 'resume') {
      const { error } = await supabase
        .from('checkin_cycles')
        .update({ status: 'active', resumed_at: new Date().toISOString() })
        .eq('id', cycleId);
      
      if (error) throw error;
      
      return NextResponse.json({
        success: true,
        message: 'Check-in cycle resumed successfully',
      });
      
    } else if (action === 'complete') {
      const { error } = await supabase
        .from('checkin_cycles')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', cycleId);
      
      if (error) throw error;
      
      return NextResponse.json({
        success: true,
        message: 'Check-in cycle marked as completed',
      });
      
    } else if (status) {
      const { error } = await supabase
        .from('checkin_cycles')
        .update({ status })
        .eq('id', cycleId);
      
      if (error) throw error;
      
      return NextResponse.json({
        success: true,
        message: `Check-in cycle status updated to ${status}`,
      });
      
    } else {
      return NextResponse.json(
        { success: false, error: 'Either status or action is required' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error updating check-in cycle:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
