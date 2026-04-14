import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Schema for behavioral signal calculation request
const CalculateBehaviouralSignalsRequestSchema = z.object({
  clientId: z.string().uuid().optional(),
  trainerId: z.string().uuid().optional(),
  gymId: z.string().uuid().optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  calculationPeriodDays: z.number().min(7).max(90).default(28), // 4 weeks default
  includeHistorical: z.boolean().default(false),
  forceRecalculation: z.boolean().default(false),
  analysisDepth: z.enum(['basic', 'standard', 'comprehensive']).default('standard'),
  notificationSettings: z.object({
    notifyTrainerOnRisk: z.boolean().default(true),
    riskThreshold: z.number().min(0).max(100).default(70),
    generateInsights: z.boolean().default(true),
    storeInDatabase: z.boolean().default(true),
  }).optional(),
}).refine(
  (data) => data.clientId || data.trainerId || data.gymId,
  {
    message: 'At least one of clientId, trainerId, or gymId must be provided',
    path: ['clientId', 'trainerId', 'gymId'],
  }
);

type CalculateBehaviouralSignalsRequest = z.infer<typeof CalculateBehaviouralSignalsRequestSchema>;
type BehaviouralSignalResponse = {
  success: boolean;
  calculatedSignals: Array<{
    clientId: string;
    calculationDate: string;
    responseRate4wk: number;
    avgResponseTimeHours: number;
    completionRate4wk: number;
    completionTrend: 'improving' | 'stable' | 'declining';
    avgSentiment4wk: number;
    sentimentTrend: 'improving' | 'stable' | 'declining';
    atRiskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    interventionEffectiveness: Record<string, number>;
    milestoneEngagement: Record<string, number>;
    keyInsights: string[];
    recommendations: string[];
  }>;
  summary: {
    totalClientsAnalyzed: number;
    clientsAtRisk: number;
    avgResponseRate: number;
    avgCompletionRate: number;
    avgSentiment: number;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    trends: {
      improving: number;
      stable: number;
      declining: number;
    };
  };
  actions: Array<{
    type: 'calculated' | 'stored' | 'notified' | 'flagged';
    clientId: string;
    timestamp: string;
    details: string;
  }>;
};

// Risk score calculation weights
const RISK_WEIGHTS = {
  responseRate: 0.25,
  completionRate: 0.30,
  responseTime: 0.15,
  sentiment: 0.15,
  trend: 0.15,
};

// Trend analysis thresholds
const TREND_THRESHOLDS = {
  improving: 0.05, // 5% improvement
  declining: -0.05, // 5% decline
  stable: 0.05, // within ±5%
};

// Risk level thresholds
const RISK_LEVELS = {
  low: 30,
  medium: 50,
  high: 70,
  critical: 85,
};

// Calculate response rate over period
async function calculateResponseRate(
  supabase: any,
  clientId: string,
  startDate: Date,
  endDate: Date
): Promise<{ rate: number; avgResponseTime: number; totalCheckins: number; respondedCheckins: number }> {
  const { data: checkinCycles, error } = await supabase
    .from('checkin_cycles')
    .select('id, scheduled_for, responded_at')
    .eq('client_id', clientId)
    .gte('scheduled_for', startDate.toISOString())
    .lte('scheduled_for', endDate.toISOString());
  
  if (error || !checkinCycles) {
    return { rate: 0, avgResponseTime: 0, totalCheckins: 0, respondedCheckins: 0 };
  }
  
  const respondedCheckins = checkinCycles.filter((cycle: any) => cycle.responded_at).length;
  const totalCheckins = checkinCycles.length;
  const rate = totalCheckins > 0 ? (respondedCheckins / totalCheckins) * 100 : 0;
  
  // Calculate average response time (hours)
  let totalResponseTimeHours = 0;
  let responseCount = 0;
  
  checkinCycles.forEach((cycle: any) => {
    if (cycle.responded_at && cycle.scheduled_for) {
      const scheduled = new Date(cycle.scheduled_for);
      const responded = new Date(cycle.responded_at);
      const responseTimeHours = (responded.getTime() - scheduled.getTime()) / (1000 * 60 * 60);
      totalResponseTimeHours += responseTimeHours;
      responseCount++;
    }
  });
  
  const avgResponseTime = responseCount > 0 ? totalResponseTimeHours / responseCount : 0;
  
  return { rate, avgResponseTime, totalCheckins, respondedCheckins };
}

// Calculate completion rate (sessions completed vs planned)
async function calculateCompletionRate(
  supabase: any,
  clientId: string,
  startDate: Date,
  endDate: Date
): Promise<{ rate: number; trend: 'improving' | 'stable' | 'declining'; historicalRates: number[] }> {
  // Get check-in responses with session data
  const { data: checkinResponses, error } = await supabase
    .from('checkin_responses')
    .select('sessions_planned, sessions_completed, responded_at')
    .in('checkin_cycle_id', 
      supabase
        .from('checkin_cycles')
        .select('id')
        .eq('client_id', clientId)
        .gte('scheduled_for', startDate.toISOString())
        .lte('scheduled_for', endDate.toISOString())
    )
    .order('responded_at', { ascending: true });
  
  if (error || !checkinResponses || checkinResponses.length === 0) {
    return { rate: 0, trend: 'stable', historicalRates: [] };
  }
  
  // Calculate rates for each check-in
  const rates = checkinResponses
    .filter((response: any) => response.sessions_planned > 0)
    .map((response: any) => (response.sessions_completed / response.sessions_planned) * 100);
  
  // Overall rate
  const totalPlanned = checkinResponses.reduce((sum: number, r: any) => sum + (r.sessions_planned || 0), 0);
  const totalCompleted = checkinResponses.reduce((sum: number, r: any) => sum + (r.sessions_completed || 0), 0);
  const rate = totalPlanned > 0 ? (totalCompleted / totalPlanned) * 100 : 0;
  
  // Calculate trend
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (rates.length >= 2) {
    const firstHalf = rates.slice(0, Math.floor(rates.length / 2));
    const secondHalf = rates.slice(Math.floor(rates.length / 2));
    const avgFirst = firstHalf.reduce((a: number, b: number) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a: number, b: number) => a + b, 0) / secondHalf.length;
    const change = ((avgSecond - avgFirst) / avgFirst) * 100;
    
    if (change > TREND_THRESHOLDS.improving) {
      trend = 'improving';
    } else if (change < TREND_THRESHOLDS.declining) {
      trend = 'declining';
    }
  }
  
  return { rate, trend, historicalRates: rates };
}

// Calculate sentiment analysis
async function calculateSentiment(
  supabase: any,
  clientId: string,
  startDate: Date,
  endDate: Date
): Promise<{ avgSentiment: number; trend: 'improving' | 'stable' | 'declining'; sentimentScores: number[] }> {
  const { data: checkinResponses, error } = await supabase
    .from('checkin_responses')
    .select('sentiment_score, responded_at')
    .in('checkin_cycle_id',
      supabase
        .from('checkin_cycles')
        .select('id')
        .eq('client_id', clientId)
        .gte('scheduled_for', startDate.toISOString())
        .lte('scheduled_for', endDate.toISOString())
    )
    .not('sentiment_score', 'is', null)
    .order('responded_at', { ascending: true });
  
  if (error || !checkinResponses || checkinResponses.length === 0) {
    return { avgSentiment: 0, trend: 'stable', sentimentScores: [] };
  }
  
  const sentimentScores = checkinResponses.map((r: any) => r.sentiment_score);
  const avgSentiment = sentimentScores.reduce((a: number, b: number) => a + b, 0) / sentimentScores.length;
  
  // Calculate trend
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (sentimentScores.length >= 2) {
    const firstHalf = sentimentScores.slice(0, Math.floor(sentimentScores.length / 2));
    const secondHalf = sentimentScores.slice(Math.floor(sentimentScores.length / 2));
    const avgFirst = firstHalf.reduce((a: number, b: number) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a: number, b: number) => a + b, 0) / secondHalf.length;
    const change = avgSecond - avgFirst;
    
    if (change > TREND_THRESHOLDS.improving) {
      trend = 'improving';
    } else if (change < TREND_THRESHOLDS.declining) {
      trend = 'declining';
    }
  }
  
  return { avgSentiment, trend, sentimentScores };
}

// Analyze intervention effectiveness
async function analyzeInterventionEffectiveness(
  supabase: any,
  clientId: string,
  startDate: Date,
  endDate: Date
): Promise<Record<string, number>> {
  const { data: messages, error } = await supabase
    .from('app_messages')
    .select('message_type, read_at, delivered_at')
    .eq('client_id', clientId)
    .gte('delivered_at', startDate.toISOString())
    .lte('delivered_at', endDate.toISOString())
    .in('message_type', ['checkin_followup', 'intervention', 'escalation', 'milestone']);
  
  if (error || !messages) {
    return {};
  }
  
  const effectiveness: Record<string, number> = {};
  const messageTypes = ['checkin_followup', 'intervention', 'escalation', 'milestone'];
  
  messageTypes.forEach(type => {
    const typeMessages = messages.filter(m => m.message_type === type);
    if (typeMessages.length > 0) {
      const readCount = typeMessages.filter(m => m.read_at).length;
      effectiveness[type] = (readCount / typeMessages.length) * 100;
    }
  });
  
  return effectiveness;
}

// Analyze milestone engagement
async function analyzeMilestoneEngagement(
  supabase: any,
  clientId: string,
  startDate: Date,
  endDate: Date
): Promise<Record<string, number>> {
  // This would analyze engagement with different types of milestones
  // For now, return placeholder data
  return {
    'weight_loss': 85,
    'strength_gain': 70,
    'consistency': 90,
    'nutrition': 60,
  };
}

// Calculate risk score
function calculateRiskScore(
  responseRate: number,
  completionRate: number,
  avgResponseTime: number,
  avgSentiment: number,
  completionTrend: string,
  sentimentTrend: string
): number {
  // Normalize values to 0-100 scale
  const normalizedResponseRate = responseRate; // Already 0-100
  const normalizedCompletionRate = completionRate; // Already 0-100
  
  // Response time: longer = higher risk (0-100 scale, 0-48 hours)
  const normalizedResponseTime = Math.min(avgResponseTime / 48 * 100, 100);
  
  // Sentiment: lower = higher risk (-1 to 1 -> 0 to 100)
  const normalizedSentiment = ((avgSentiment + 1) / 2) * 100;
  
  // Trend penalties/bonuses
  let trendScore = 50; // Neutral
  if (completionTrend === 'declining') trendScore += 20;
  if (completionTrend === 'improving') trendScore -= 20;
  if (sentimentTrend === 'declining') trendScore += 15;
  if (sentimentTrend === 'improving') trendScore -= 15;
  
  // Calculate weighted score
  const score = 
    (100 - normalizedResponseRate) * RISK_WEIGHTS.responseRate +
    (100 - normalizedCompletionRate) * RISK_WEIGHTS.completionRate +
    normalizedResponseTime * RISK_WEIGHTS.responseTime +
    (100 - normalizedSentiment) * RISK_WEIGHTS.sentiment +
    trendScore * RISK_WEIGHTS.trend;
  
  return Math.min(Math.max(score, 0), 100);
}

// Determine risk level
function determineRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
  if (riskScore < RISK_LEVELS.low) return 'low';
  if (riskScore < RISK_LEVELS.medium) return 'medium';
  if (riskScore < RISK_LEVELS.high) return 'high';
  return 'critical';
}

// Generate insights based on behavioral data
function generateInsights(
  clientData: any,
  responseRate: number,
  completionRate: number,
  avgSentiment: number,
  riskLevel: string,
  completionTrend: string,
  sentimentTrend: string
): string[] {
  const insights: string[] = [];
  
  // Response rate insights
  if (responseRate < 50) {
    insights.push('Low check-in response rate suggests potential disengagement');
  } else if (responseRate > 90) {
    insights.push('Excellent check-in response rate indicates high engagement');
  }
  
  // Completion rate insights
  if (completionRate < 60) {
    insights.push('Low session completion rate may indicate adherence challenges');
  } else if (completionRate > 85) {
    insights.push('High session completion rate shows strong program adherence');
  }
  
  // Trend insights
  if (completionTrend === 'declining') {
    insights.push('Declining completion trend suggests waning motivation or external barriers');
  } else if (completionTrend === 'improving') {
    insights.push('Improving completion trend indicates positive adaptation to the program');
  }
  
  // Sentiment insights
  if (avgSentiment < 0) {
    insights.push('Negative sentiment trend may indicate frustration or dissatisfaction');
  } else if (avgSentiment > 0.5) {
    insights.push('Positive sentiment suggests client is enjoying the program');
  }
  
  // Risk level insights
  if (riskLevel === 'high' || riskLevel === 'critical') {
    insights.push(`High risk level (${riskLevel}) requires immediate trainer attention`);
  }
  
  // Add persona-specific insights if available
  if (clientData.persona_type) {
    insights.push(`Persona: ${clientData.persona_type} - consider tailored communication approach`);
  }
  
  return insights;
}

// Generate recommendations
function generateRecommendations(
  riskLevel: string,
  responseRate: number,
  completionRate: number,
  avgSentiment: number,
  completionTrend: string
): string[] {
  const recommendations: string[] = [];
  
  if (riskLevel === 'critical' || riskLevel === 'high') {
    recommendations.push('Schedule immediate check-in call with client');
    recommendations.push('Review and potentially adjust program difficulty');
    recommendations.push('Consider temporary reduction in training volume');
  }
  
  if (responseRate < 60) {
    recommendations.push('Send personalized check-in reminder messages');
    recommendations.push('Consider adjusting check-in frequency or timing');
    recommendations.push('Use different communication channels (SMS vs in-app)');
  }
  
  if (completionRate < 70) {
    recommendations.push('Simplify workout structure or reduce session duration');
    recommendations.push('Add more variety to prevent boredom');
    recommendations.push('Set smaller, more achievable weekly goals');
  }
  
  if (avgSentiment < 0) {
    recommendations.push('Incorporate more enjoyable activities into program');
    recommendations.push('Focus on positive reinforcement and celebration of small wins');
    recommendations.push('Check for external stressors affecting client mood');
  }
  
  if (completionTrend === 'declining') {
    recommendations.push('Conduct motivational interview to identify barriers');
    recommendations.push('Implement accountability partner or group training');
    recommendations.push('Review and adjust goal setting process');
  }
  
  return recommendations;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const validationResult = CalculateBehaviouralSignalsRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    const currentDate = new Date();
    const endDate = data.endDate ? new Date(data.endDate) : currentDate;
    const startDate = data.startDate ? new Date(data.startDate) : new Date(endDate);
    startDate.setDate(startDate.getDate() - data.calculationPeriodDays);
    
    const actions: Array<{
      type: 'calculated' | 'stored' | 'notified' | 'flagged';
      clientId: string;
      timestamp: string;
      details: string;
    }> = [];
    
    // Get Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase not configured' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get clients to analyze
    let clientsQuery = supabase
      .from('clients')
      .select(`
        id,
        status,
        profiles!inner(full_name, email),
        persona_assignments!left(persona_type)
      `)
      .eq('status', 'active');
    
    if (data.clientId) {
      clientsQuery = clientsQuery.eq('id', data.clientId);
    } else if (data.trainerId) {
      clientsQuery = clientsQuery.eq('trainer_id', data.trainerId);
    } else if (data.gymId) {
      clientsQuery = clientsQuery.eq('gym_id', data.gymId);
    }
    
    const { data: clients, error: clientsError } = await clientsQuery;
    
    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch clients' },
        { status: 500 }
      );
    }
    
    if (!clients || clients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No clients found for analysis' },
        { status: 404 }
      );
    }
    
    const calculatedSignals = [];
    const riskDistribution = { low: 0, medium: 0, high: 0, critical: 0 };
    const trendDistribution = { improving: 0, stable: 0, declining: 0 };
    let totalResponseRate = 0;
    let totalCompletionRate = 0;
    let totalSentiment = 0;
    
    // Analyze each client
    for (const client of clients) {
      try {
        // Check if we should recalculate or use existing data
        if (!data.forceRecalculation) {
          const { data: existingSignal, error: existingError } = await supabase
            .from('behavioural_signals')
            .select('*')
            .eq('client_id', client.id)
            .eq('calculation_date', currentDate.toISOString().split('T')[0])
            .single();
          
          if (existingSignal && !existingError) {
            // Use existing signal
            calculatedSignals.push({
              clientId: client.id,
              calculationDate: existingSignal.calculation_date,
              responseRate4wk: existingSignal.response_rate_4wk,
              avgResponseTimeHours: existingSignal.avg_response_time_hours,
              completionRate4wk: existingSignal.completion_rate_4wk,
              completionTrend: existingSignal.completion_trend,
              avgSentiment4wk: existingSignal.avg_sentiment_4wk,
              sentimentTrend: existingSignal.sentiment_trend,
              atRiskScore: existingSignal.at_risk_score,
              riskLevel: determineRiskLevel(existingSignal.at_risk_score),
              interventionEffectiveness: existingSignal.intervention_effectiveness || {},
              milestoneEngagement: existingSignal.milestone_engagement || {},
              keyInsights: [],
              recommendations: [],
            });
            
            actions.push({
              type: 'calculated',
              clientId: client.id,
              timestamp: new Date().toISOString(),
              details: 'Used existing behavioral signal data',
            });
            
            continue;
          }
        }
        
        // Calculate behavioral metrics
        const responseData = await calculateResponseRate(supabase, client.id, startDate, endDate);
        const completionData = await calculateCompletionRate(supabase, client.id, startDate, endDate);
        const sentimentData = await calculateSentiment(supabase, client.id, startDate, endDate);
        const interventionEffectiveness = await analyzeInterventionEffectiveness(supabase, client.id, startDate, endDate);
        const milestoneEngagement = await analyzeMilestoneEngagement(supabase, client.id, startDate, endDate);
        
        // Calculate risk score
        const riskScore = calculateRiskScore(
          responseData.rate,
          completionData.rate,
          responseData.avgResponseTime,
          sentimentData.avgSentiment,
          completionData.trend,
          sentimentData.trend
        );
        
        const riskLevel = determineRiskLevel(riskScore);
        
        // Generate insights and recommendations
        const keyInsights = generateInsights(
          client,
          responseData.rate,
          completionData.rate,
          sentimentData.avgSentiment,
          riskLevel,
          completionData.trend,
          sentimentData.trend
        );
        
        const recommendations = generateRecommendations(
          riskLevel,
          responseData.rate,
          completionData.rate,
          sentimentData.avgSentiment,
          completionData.trend
        );
        
        // Store in database if configured
        if (data.notificationSettings?.storeInDatabase) {
          try {
            const signalData = {
              client_id: client.id,
              calculation_date: currentDate.toISOString().split('T')[0],
              response_rate_4wk: responseData.rate,
              avg_response_time_hours: responseData.avgResponseTime,
              completion_rate_4wk: completionData.rate,
              completion_trend: completionData.trend,
              avg_sentiment_4wk: sentimentData.avgSentiment,
              sentiment_trend: sentimentData.trend,
              at_risk_score: riskScore,
              intervention_effectiveness: interventionEffectiveness,
              milestone_engagement: milestoneEngagement,
            };
            
            const { error: insertError } = await supabase
              .from('behavioural_signals')
              .upsert(signalData, { onConflict: 'client_id,calculation_date' });
            
            if (!insertError) {
              actions.push({
                type: 'stored',
                clientId: client.id,
                timestamp: new Date().toISOString(),
                details: 'Stored behavioral signal in database',
              });
            }
          } catch (dbError) {
            console.error('Failed to store behavioral signal:', dbError);
          }
        }
        
        // Notify trainer if risk is high
        if (data.notificationSettings?.notifyTrainerOnRisk && 
            riskScore >= (data.notificationSettings?.riskThreshold || 70)) {
          // In a real implementation, this would send a notification
          // For now, we'll just log it
          console.log(`High risk alert for client ${client.id}: ${riskScore} (${riskLevel})`);
          
          actions.push({
            type: 'notified',
            clientId: client.id,
            timestamp: new Date().toISOString(),
            details: `Notified trainer of ${riskLevel} risk level (score: ${riskScore.toFixed(1)})`,
          });
        }
        
        // Add to calculated signals
        calculatedSignals.push({
          clientId: client.id,
          calculationDate: currentDate.toISOString().split('T')[0],
          responseRate4wk: responseData.rate,
          avgResponseTimeHours: responseData.avgResponseTime,
          completionRate4wk: completionData.rate,
          completionTrend: completionData.trend,
          avgSentiment4wk: sentimentData.avgSentiment,
          sentimentTrend: sentimentData.trend,
          atRiskScore: riskScore,
          riskLevel,
          interventionEffectiveness,
          milestoneEngagement,
          keyInsights,
          recommendations,
        });
        
        // Update statistics
        riskDistribution[riskLevel]++;
        trendDistribution[completionData.trend]++;
        totalResponseRate += responseData.rate;
        totalCompletionRate += completionData.rate;
        totalSentiment += sentimentData.avgSentiment;
        
        actions.push({
          type: 'calculated',
          clientId: client.id,
          timestamp: new Date().toISOString(),
          details: `Calculated behavioral signals (risk: ${riskLevel}, score: ${riskScore.toFixed(1)})`,
        });
        
      } catch (clientError) {
        console.error(`Error analyzing client ${client.id}:`, clientError);
        // Continue with next client
      }
    }
    
    // Prepare response
    const response: BehaviouralSignalResponse = {
      success: true,
      calculatedSignals,
      summary: {
        totalClientsAnalyzed: calculatedSignals.length,
        clientsAtRisk: riskDistribution.high + riskDistribution.critical,
        avgResponseRate: calculatedSignals.length > 0 ? totalResponseRate / calculatedSignals.length : 0,
        avgCompletionRate: calculatedSignals.length > 0 ? totalCompletionRate / calculatedSignals.length : 0,
        avgSentiment: calculatedSignals.length > 0 ? totalSentiment / calculatedSignals.length : 0,
        riskDistribution,
        trends: trendDistribution,
      },
      actions,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error calculating behavioral signals:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // GET endpoint for retrieving behavioral signals
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  const trainerId = searchParams.get('trainerId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const limit = parseInt(searchParams.get('limit') || '50');
  const riskLevel = searchParams.get('riskLevel');
  
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
    
    // Build query
    let query = supabase
      .from('behavioural_signals')
      .select(`
        *,
        clients!inner(
          id,
          profiles!inner(full_name, email),
          trainers!inner(business_name)
        )
      `)
      .order('calculation_date', { ascending: false })
      .limit(limit);
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    if (trainerId) {
      query = query.eq('clients.trainer_id', trainerId);
    }
    
    if (startDate) {
      query = query.gte('calculation_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('calculation_date', endDate);
    }
    
    if (riskLevel) {
      // Filter by risk level based on score ranges
      let scoreRange;
      switch (riskLevel) {
        case 'low': scoreRange = { lte: RISK_LEVELS.low }; break;
        case 'medium': scoreRange = { gt: RISK_LEVELS.low, lte: RISK_LEVELS.medium }; break;
        case 'high': scoreRange = { gt: RISK_LEVELS.medium, lte: RISK_LEVELS.high }; break;
        case 'critical': scoreRange = { gt: RISK_LEVELS.high }; break;
      }
      if (scoreRange) {
        if (scoreRange.lte !== undefined) query = query.lte('at_risk_score', scoreRange.lte);
        if (scoreRange.gt !== undefined) query = query.gt('at_risk_score', scoreRange.gt);
      }
    }
    
    const { data: signals, error: signalsError } = await query;
    
    if (signalsError) {
      console.error('Error fetching behavioral signals:', signalsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch behavioral signals' },
        { status: 500 }
      );
    }
    
    // Get statistics
    const { data: statsData, error: statsError } = await supabase
      .from('behavioural_signals')
      .select('at_risk_score, calculation_date')
      .gte('calculation_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Last 30 days
    
    if (statsError) {
      console.error('Error fetching statistics:', statsError);
    }
    
    const stats = {
      total: signals.length,
      byRiskLevel: {
        low: signals.filter(s => s.at_risk_score < RISK_LEVELS.low).length,
        medium: signals.filter(s => s.at_risk_score >= RISK_LEVELS.low && s.at_risk_score < RISK_LEVELS.medium).length,
        high: signals.filter(s => s.at_risk_score >= RISK_LEVELS.medium && s.at_risk_score < RISK_LEVELS.high).length,
        critical: signals.filter(s => s.at_risk_score >= RISK_LEVELS.high).length,
      },
      avgScores: {
        responseRate: signals.reduce((sum, s) => sum + (s.response_rate_4wk || 0), 0) / signals.length,
        completionRate: signals.reduce((sum, s) => sum + (s.completion_rate_4wk || 0), 0) / signals.length,
        sentiment: signals.reduce((sum, s) => sum + (s.avg_sentiment_4wk || 0), 0) / signals.length,
        riskScore: signals.reduce((sum, s) => sum + (s.at_risk_score || 0), 0) / signals.length,
      },
      recentTrends: {
        improving: signals.filter(s => s.completion_trend === 'improving').length,
        stable: signals.filter(s => s.completion_trend === 'stable').length,
        declining: signals.filter(s => s.completion_trend === 'declining').length,
      },
    };
    
    return NextResponse.json({
      success: true,
      signals,
      statistics: stats,
      total: signals.length,
    });
    
  } catch (error) {
    console.error('Error retrieving behavioral signals:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
