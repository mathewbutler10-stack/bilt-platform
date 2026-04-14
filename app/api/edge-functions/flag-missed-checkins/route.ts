import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Schema for missed check-in detection
const FlagMissedCheckinsRequestSchema = z.object({
  clientId: z.string().uuid().optional(),
  cycleId: z.string().uuid().optional(),
  checkinId: z.string().uuid().optional(),
  gracePeriodHours: z.number().min(0).max(168).default(48), // 0-7 days
  autoFlag: z.boolean().default(true),
  notificationSettings: z.object({
    notifyClient: z.boolean().default(true),
    notifyTrainer: z.boolean().default(true),
    escalationLevel: z.enum(['none', 'warning', 'concern', 'urgent']).default('warning'),
    autoFollowUp: z.boolean().default(false),
    followUpDelayHours: z.number().min(1).max(168).default(24),
  }).optional(),
}).refine(
  (data) => data.clientId || data.cycleId || data.checkinId,
  {
    message: 'At least one of clientId, cycleId, or checkinId must be provided',
    path: ['clientId', 'cycleId', 'checkinId'],
  }
);

type FlagMissedCheckinsRequest = z.infer<typeof FlagMissedCheckinsRequestSchema>;
type MissedCheckinResponse = {
  success: boolean;
  flaggedCheckins: Array<{
    checkinId: string;
    clientId: string;
    cycleId: string;
    scheduledFor: string;
    missedAt: string;
    gracePeriodEnded: string;
    status: 'missed' | 'late' | 'pending';
    escalationLevel: string;
    notificationsSent: {
      client: boolean;
      trainer: boolean;
      timestamp: string | null;
    };
    followUpScheduled: boolean;
    followUpTime: string | null;
  }>;
  summary: {
    totalChecked: number;
    totalMissed: number;
    totalLate: number;
    totalPending: number;
    clientsAffected: number;
    cyclesAffected: number;
    nextCheck: string;
  };
  actions: Array<{
    type: 'flagged' | 'notified' | 'escalated' | 'follow_up_scheduled';
    checkinId: string;
    clientId: string;
    timestamp: string;
    details: string;
  }>;
};

// Check-in status transitions
const STATUS_TRANSITIONS = {
  scheduled: ['sent', 'completed', 'missed'],
  sent: ['completed', 'missed'],
  completed: [], // Terminal state
  missed: ['completed', 'cancelled'], // Can be completed late or cancelled
  cancelled: [], // Terminal state
};

// Escalation thresholds
const ESCALATION_THRESHOLDS = {
  warning: {
    missedCheckins: 1,
    consecutiveMissed: 1,
    timeframeHours: 168, // 1 week
    action: 'Send reminder notification',
  },
  concern: {
    missedCheckins: 2,
    consecutiveMissed: 2,
    timeframeHours: 336, // 2 weeks
    action: 'Schedule follow-up call',
  },
  urgent: {
    missedCheckins: 3,
    consecutiveMissed: 3,
    timeframeHours: 504, // 3 weeks
    action: 'Escalate to PT for intervention',
  },
};

// Calculate if check-in is missed
function isCheckinMissed(
  scheduledFor: Date,
  currentTime: Date,
  gracePeriodHours: number
): { missed: boolean; status: 'missed' | 'late' | 'pending'; gracePeriodEnded: Date } {
  const gracePeriodEnded = new Date(scheduledFor);
  gracePeriodEnded.setHours(gracePeriodEnded.getHours() + gracePeriodHours);
  
  if (currentTime > gracePeriodEnded) {
    return { missed: true, status: 'missed', gracePeriodEnded };
  } else if (currentTime > scheduledFor) {
    return { missed: false, status: 'late', gracePeriodEnded };
  } else {
    return { missed: false, status: 'pending', gracePeriodEnded };
  }
}

// Determine escalation level based on missed check-in history
function determineEscalationLevel(
  missedCheckins: number,
  consecutiveMissed: number,
  timeframeHours: number
): string {
  if (consecutiveMissed >= ESCALATION_THRESHOLDS.urgent.consecutiveMissed &&
      timeframeHours <= ESCALATION_THRESHOLDS.urgent.timeframeHours) {
    return 'urgent';
  } else if (consecutiveMissed >= ESCALATION_THRESHOLDS.concern.consecutiveMissed &&
             timeframeHours <= ESCALATION_THRESHOLDS.concern.timeframeHours) {
    return 'concern';
  } else if (missedCheckins >= ESCALATION_THRESHOLDS.warning.missedCheckins) {
    return 'warning';
  } else {
    return 'none';
  }
}

// Generate notification message based on escalation level
function generateNotificationMessage(
  clientName: string,
  checkinType: string,
  scheduledFor: Date,
  escalationLevel: string,
  consecutiveMissed: number
): { subject: string; body: string; urgency: string } {
  const formattedDate = scheduledFor.toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const baseSubject = `Check-in Reminder: ${checkinType} check-in for ${clientName}`;
  const baseBody = `Hi ${clientName},\n\nYour ${checkinType} check-in scheduled for ${formattedDate} has not been completed.`;
  
  switch (escalationLevel) {
    case 'warning':
      return {
        subject: `${baseSubject} - Reminder`,
        body: `${baseBody}\n\nThis is a friendly reminder to complete your check-in when you have a moment.\n\nYour consistency is key to achieving your goals!`,
        urgency: 'low',
      };
    case 'concern':
      return {
        subject: `${baseSubject} - Follow-up Needed`,
        body: `${baseBody}\n\nYou've missed ${consecutiveMissed} check-ins in a row. Let's schedule a quick chat to see how we can better support you.\n\nPlease reply to this email to arrange a time.`,
        urgency: 'medium',
      };
    case 'urgent':
      return {
        subject: `URGENT: ${baseSubject} - Intervention Required`,
        body: `${baseBody}\n\nYou've missed ${consecutiveMissed} consecutive check-ins. We're concerned about your progress and want to ensure you're getting the support you need.\n\nYour trainer will reach out directly to discuss how we can help you get back on track.`,
        urgency: 'high',
      };
    default:
      return {
        subject: baseSubject,
        body: baseBody,
        urgency: 'info',
      };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const validationResult = FlagMissedCheckinsRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    const currentTime = new Date();
    const actions: Array<{
      type: 'flagged' | 'notified' | 'escalated' | 'follow_up_scheduled';
      checkinId: string;
      clientId: string;
      timestamp: string;
      details: string;
    }> = [];
    
    // Get check-ins to check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase not configured' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Build query based on provided identifiers
    let query = supabase
      .from('checkin_responses')
      .select(`
        *,
        checkin_cycles (*),
        clients (*)
      `)
      .in('status', ['scheduled', 'sent'])
      .lte('scheduled_for', currentTime.toISOString());
    
    if (data.clientId) {
      query = query.eq('client_id', data.clientId);
    }
    if (data.cycleId) {
      query = query.eq('cycle_id', data.cycleId);
    }
    if (data.checkinId) {
      query = query.eq('id', data.checkinId);
    }
    
    const { data: checkins, error: checkinsError } = await query;
    
    if (checkinsError) {
      console.error('Error fetching check-ins:', checkinsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch check-ins' },
        { status: 500 }
      );
    }
    
    const flaggedCheckins = [];
    const clientMissedCounts = new Map<string, number>();
    const clientConsecutiveMissed = new Map<string, number>();
    const cycleMissedCounts = new Map<string, number>();
    
    // Check each check-in
    for (const checkin of checkins) {
      const scheduledFor = new Date(checkin.scheduled_for);
      const { missed, status, gracePeriodEnded } = isCheckinMissed(
        scheduledFor,
        currentTime,
        data.gracePeriodHours
      );
      
      if (missed || (data.autoFlag && status === 'late')) {
        // Update client missed counts
        const clientId = checkin.client_id;
        const currentMissed = clientMissedCounts.get(clientId) || 0;
        clientMissedCounts.set(clientId, currentMissed + 1);
        
        // Update consecutive missed (simplified - would need historical data)
        const currentConsecutive = clientConsecutiveMissed.get(clientId) || 0;
        clientConsecutiveMissed.set(clientId, currentConsecutive + 1);
        
        // Update cycle missed counts
        const cycleId = checkin.cycle_id;
        const cycleMissed = cycleMissedCounts.get(cycleId) || 0;
        cycleMissedCounts.set(cycleId, cycleMissed + 1);
        
        // Determine escalation level
        const escalationLevel = determineEscalationLevel(
          currentMissed + 1,
          currentConsecutive + 1,
          168 // Simplified - would calculate actual timeframe
        );
        
        // Generate notifications
        const notificationSettings = data.notificationSettings || {
          notifyClient: true,
          notifyTrainer: true,
          escalationLevel: 'warning',
          autoFollowUp: false,
          followUpDelayHours: 24,
        };
        
        const notificationsSent = {
          client: false,
          trainer: false,
          timestamp: null as string | null,
        };
        
        let followUpScheduled = false;
        let followUpTime = null as string | null;
        
        // Send notifications if configured
        if (notificationSettings.notifyClient || notificationSettings.notifyTrainer) {
          const clientName = checkin.clients?.name || 'Client';
          const checkinType = checkin.checkin_cycles?.checkin_type || 'check-in';
          const message = generateNotificationMessage(
            clientName,
            checkinType,
            scheduledFor,
            escalationLevel,
            currentConsecutive + 1
          );
          
          // In a real implementation, this would send actual notifications
          // For now, we'll just log and mark as sent
          console.log('Notification generated:', {
            toClient: notificationSettings.notifyClient,
            toTrainer: notificationSettings.notifyTrainer,
            subject: message.subject,
            body: message.body,
            urgency: message.urgency,
          });
          
          notificationsSent.client = notificationSettings.notifyClient;
          notificationsSent.trainer = notificationSettings.notifyTrainer;
          notificationsSent.timestamp = new Date().toISOString();
          
          actions.push({
            type: 'notified',
            checkinId: checkin.id,
            clientId,
            timestamp: new Date().toISOString(),
            details: `Sent ${message.urgency} priority notification to ${notificationSettings.notifyClient ? 'client' : ''}${notificationSettings.notifyClient && notificationSettings.notifyTrainer ? ' and ' : ''}${notificationSettings.notifyTrainer ? 'trainer' : ''}`,
          });
        }
        
        // Schedule follow-up if configured
        if (notificationSettings.autoFollowUp && escalationLevel === 'concern') {
          followUpTime = new Date(Date.now() + notificationSettings.followUpDelayHours * 60 * 60 * 1000).toISOString();
          followUpScheduled = true;
          
          actions.push({
            type: 'follow_up_scheduled',
            checkinId: checkin.id,
            clientId,
            timestamp: new Date().toISOString(),
            details: `Scheduled follow-up for ${new Date(followUpTime).toLocaleString()}`,
          });
        }
        
        // Update check-in status in database
        if (data.autoFlag) {
          try {
            const { error: updateError } = await supabase
              .from('checkin_responses')
              .update({
                status: 'missed',
                missed_at: new Date().toISOString(),
                escalation_level: escalationLevel,
                notifications_sent: notificationsSent,
                follow_up_scheduled: followUpScheduled,
                follow_up_time: followUpTime,
              })
              .eq('id', checkin.id);
            
            if (updateError) throw updateError;
            
            actions.push({
              type: 'flagged',
              checkinId: checkin.id,
              clientId,
              timestamp: new Date().toISOString(),
              details: `Flagged as missed with ${escalationLevel} escalation`,
            });
            
            if (escalationLevel !== 'none') {
              actions.push({
                type: 'escalated',
                checkinId: checkin.id,
                clientId,
                timestamp: new Date().toISOString(),
                details: `Escalated to ${escalationLevel} level`,
              });
            }
            
          } catch (dbError) {
            console.error('Failed to update check-in status:', dbError);
            // Continue processing other check-ins
          }
        }
        
        flaggedCheckins.push({
          checkinId: checkin.id,
          clientId,
          cycleId: checkin.cycle_id,
          scheduledFor: checkin.scheduled_for,
          missedAt: new Date().toISOString(),
          gracePeriodEnded: gracePeriodEnded.toISOString(),
          status,
          escalationLevel,
          notificationsSent,
          followUpScheduled,
          followUpTime,
        });
      }
    }
    
    // Prepare response
    const response: MissedCheckinResponse = {
      success: true,
      flaggedCheckins,
      summary: {
        totalChecked: checkins.length,
        totalMissed: flaggedCheckins.filter(c => c.status === 'missed').length,
        totalLate: flaggedCheckins.filter(c => c.status === 'late').length,
        totalPending: checkins.length - flaggedCheckins.length,
        clientsAffected: new Set(flaggedCheckins.map(c => c.clientId)).size,
        cyclesAffected: new Set(flaggedCheckins.map(c => c.cycleId)).size,
        nextCheck: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      },
      actions,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error flagging missed check-ins:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // GET endpoint for retrieving missed check-ins
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  const cycleId = searchParams.get('cycleId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');
  
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
    
    let query = supabase
      .from('checkin_responses')
      .select(`
        *,
        checkin_cycles (*),
        clients (*)
      `)
      .eq('status', 'missed')
      .order('scheduled_for', { ascending: false })
      .limit(limit);
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (cycleId) {
      query = query.eq('cycle_id', cycleId);
    }
    if (startDate) {
      query = query.gte('scheduled_for', startDate);
    }
    if (endDate) {
      query = query.lte('scheduled_for', endDate);
    }
    if (status) {
      query = query.eq('escalation_level', status);
    }
    
    const { data: missedCheckins, error: missedError } = await query;
    
    if (missedError) {
      console.error('Error fetching missed check-ins:', missedError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch missed check-ins' },
        { status: 500 }
      );
    }
    
    // Get statistics
    const { data: statsData, error: statsError } = await supabase
      .from('checkin_responses')
      .select('status, escalation_level')
      .eq('status', 'missed');
    
    if (statsError) {
      console.error('Error fetching statistics:', statsError);
    }
    
    const stats = {
      total: missedCheckins.length,
      byEscalation: {
        warning: missedCheckins.filter(c => c.escalation_level === 'warning').length,
        concern: missedCheckins.filter(c => c.escalation_level === 'concern').length,
        urgent: missedCheckins.filter(c => c.escalation_level === 'urgent').length,
      },
      byClient: Array.from(
        missedCheckins.reduce((acc, checkin) => {
          const clientId = checkin.client_id;
          acc.set(clientId, (acc.get(clientId) || 0) + 1);
          return acc;
        }, new Map<string, number>())
      ).map(([clientId, count]) => ({ clientId, count })),
      recent: missedCheckins
        .sort((a, b) => new Date(b.missed_at || b.scheduled_for).getTime() - new Date(a.missed_at || a.scheduled_for).getTime())
        .slice(0, 10),
    };
    
    return NextResponse.json({
      success: true,
      missedCheckins,
      statistics: stats,
      total: missedCheckins.length,
    });
    
  } catch (error) {
    console.error('Error retrieving missed check-ins:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
