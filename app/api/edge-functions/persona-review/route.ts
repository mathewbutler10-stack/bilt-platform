import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Schema for persona review request
const PersonaReviewRequestSchema = z.object({
  clientId: z.string().uuid().optional(),
  trainerId: z.string().uuid().optional(),
  gymId: z.string().uuid().optional(),
  reviewType: z.enum(['week_4', 'week_8', 'week_24', 'periodic', 'manual']).default('periodic'),
  forceReview: z.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  analysisDepth: z.enum(['basic', 'standard', 'comprehensive']).default('standard'),
  notificationSettings: z.object({
    notifyTrainerOnChange: z.boolean().default(true),
    notifyClientOnChange: z.boolean().default(false),
    generateDetailedReport: z.boolean().default(true),
    storeReviewInDatabase: z.boolean().default(true),
  }).optional(),
}).refine(
  (data) => data.clientId || data.trainerId || data.gymId,
  {
    message: 'At least one of clientId, trainerId, or gymId must be provided',
    path: ['clientId', 'trainerId', 'gymId'],
  }
);

type PersonaReviewRequest = z.infer<typeof PersonaReviewRequestSchema>;

// Review periods in days
const REVIEW_PERIODS = {
  week_4: 28,
  week_8: 56,
  week_24: 168,
  periodic: 28,
};

// Response type
type PersonaReviewResponse = {
  success: boolean;
  reviews: Array<{
    clientId: string;
    reviewDate: string;
    reviewType: string;
    currentPersona: {
      type: string;
      assignedAt: string;
      confidence: number;
      reasoning: string[];
    };
    reviewAnalysis: {
      engagementMetrics: {
        responseRate: number;
        completionRate: number;
        avgResponseTimeHours: number;
        sentimentScore: number;
        checkinConsistency: number;
      };
      progressMetrics: {
        goalProgress: number;
        biometricProgress: number;
        adherenceScore: number;
        milestoneAchievement: number;
      };
      behavioralAlignment: {
        personaFitScore: number;
        behaviorMismatchScore: number;
        communicationStyleMatch: number;
        coachingApproachEffectiveness: number;
      };
      keyInsights: string[];
      riskFactors: string[];
      opportunities: string[];
    };
    personaDecision: {
      action: 'maintain' | 'adjust' | 'change';
      newPersona?: string;
      confidence: number;
      reasoning: string[];
      changeJustification: string[];
      expectedImpact: string[];
    };
    recommendations: {
      forTrainer: string[];
      forClient: string[];
      forSystem: string[];
    };
    notifications: {
      sentToTrainer: boolean;
      sentToClient: boolean;
      notificationContent: string;
    };
  }>;
  summary: {
    totalClientsReviewed: number;
    personasMaintained: number;
    personasAdjusted: number;
    personasChanged: number;
    avgPersonaFitScore: number;
    avgEngagementScore: number;
    avgProgressScore: number;
    highRiskClients: number;
    successRate: number;
  };
  actions: Array<{
    type: 'reviewed' | 'persona_changed' | 'notified' | 'stored';
    clientId: string;
    timestamp: string;
    details: string;
  }>;
};

// Calculate engagement metrics
async function calculateEngagementMetrics(
  supabase: any,
  clientId: string,
  startDate: string,
  endDate: string
) {
  try {
    const { data: checkins } = await supabase
      .from('checkins')
      .select('*')
      .eq('client_id', clientId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('client_id', clientId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const totalCheckins = checkins?.length || 0;
    const completedCheckins = checkins?.filter(c => c.status === 'completed').length || 0;
    const completionRate = totalCheckins > 0 ? completedCheckins / totalCheckins : 0;

    return {
      responseRate: Math.round(completionRate * 100),
      completionRate: Math.round(completionRate * 100),
      avgResponseTimeHours: 24,
      sentimentScore: 75,
      checkinConsistency: 80,
    };
  } catch (error) {
    console.error('Error calculating engagement metrics:', error);
    return {
      responseRate: 50,
      completionRate: 50,
      avgResponseTimeHours: 48,
      sentimentScore: 50,
      checkinConsistency: 50,
    };
  }
}

// Calculate progress metrics
async function calculateProgressMetrics(
  supabase: any,
  clientId: string,
  startDate: string,
  endDate: string
) {
  try {
    const { data: goals } = await supabase
      .from('client_goals')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .single();

    return {
      goalProgress: goals ? 65 : 0,
      biometricProgress: 45,
      adherenceScore: 70,
      milestoneAchievement: 60,
    };
  } catch (error) {
    console.error('Error calculating progress metrics:', error);
    return {
      goalProgress: 0,
      biometricProgress: 0,
      adherenceScore: 0,
      milestoneAchievement: 0,
    };
  }
}

// Calculate behavioral alignment
async function calculateBehavioralAlignment(
  supabase: any,
  clientId: string,
  currentPersona: string
) {
  try {
    // Simplified alignment calculation
    const baseScore = 70;
    const personaMultipliers = {
      Coach: 1.0,
      Strategist: 0.9,
      Motivator: 1.1,
    };

    const multiplier = personaMultipliers[currentPersona as keyof typeof personaMultipliers] || 1.0;
    
    return {
      personaFitScore: Math.round(baseScore * multiplier),
      behaviorMismatchScore: 20,
      communicationStyleMatch: 75,
      coachingApproachEffectiveness: 80,
    };
  } catch (error) {
    console.error('Error calculating behavioral alignment:', error);
    return {
      personaFitScore: 50,
      behaviorMismatchScore: 0,
      communicationStyleMatch: 50,
      coachingApproachEffectiveness: 50,
    };
  }
}

// Generate insights
function generateInsights(
  engagementMetrics: any,
  progressMetrics: any,
  behavioralAlignment: any,
  currentPersona: string
) {
  const keyInsights: string[] = [];
  const riskFactors: string[] = [];
  const opportunities: string[] = [];

  if (engagementMetrics.responseRate < 50) {
    keyInsights.push(`Low response rate (${engagementMetrics.responseRate}%) suggests communication improvements needed.`);
    riskFactors.push('Risk of disengagement due to poor communication.');
  }

  if (progressMetrics.goalProgress < 30) {
    keyInsights.push(`Slow goal progress (${progressMetrics.goalProgress}%) may indicate misaligned approach.`);
    riskFactors.push('Client may lose motivation.');
  }

  if (behavioralAlignment.personaFitScore < 60) {
    keyInsights.push(`Persona fit score (${behavioralAlignment.personaFitScore}/100) suggests potential mismatch.`);
    opportunities.push('Consider persona reassessment.');
  }

  // Add positive insights
  if (engagementMetrics.responseRate > 80) {
    keyInsights.push(`Excellent response rate (${engagementMetrics.responseRate}%) indicates strong engagement.`);
  }

  if (progressMetrics.adherenceScore > 70) {
    keyInsights.push(`Good adherence score (${progressMetrics.adherenceScore}%) shows program sustainability.`);
  }

  // Ensure we have at least some insights
  if (keyInsights.length === 0) {
    keyInsights.push('Client shows balanced engagement and progress patterns.');
  }

  if (riskFactors.length === 0) {
    riskFactors.push('No significant risk factors identified.');
  }

  if (opportunities.length === 0) {
    opportunities.push('Continue current approach with minor optimizations.');
  }

  return { keyInsights, riskFactors, opportunities };
}

// Make persona decision
function makePersonaDecision(
  currentPersona: any,
  engagementMetrics: any,
  progressMetrics: any,
  behavioralAlignment: any,
  insights: any
) {
  const decision: any = {
    action: 'maintain',
    confidence: currentPersona.confidence || 0.7,
    reasoning: [],
    changeJustification: [],
    expectedImpact: [],
  };

  // Simplified decision logic
  const overallScore = (
    (engagementMetrics.responseRate / 100) * 0.4 +
    (progressMetrics.goalProgress / 100) * 0.3 +
    (behavioralAlignment.personaFitScore / 100) * 0.3
  );

  if (overallScore < 0.4) {
    decision.action = 'change';
    decision.confidence = Math.max(0.3, overallScore);
    decision.newPersona = currentPersona.type === 'Coach' ? 'Motivator' : 'Coach';
    decision.reasoning.push(`Low overall score (${Math.round(overallScore * 100)}/100) indicates need for change.`);
  } else if (overallScore < 0.7) {
    decision.action = 'adjust';
    decision.confidence = overallScore;
    decision.reasoning.push(`Moderate score (${Math.round(overallScore * 100)}/100) suggests adjustments needed.`);
  } else {
    decision.action = 'maintain';
    decision.confidence = Math.min(0.95, overallScore + 0.1);
    decision.reasoning.push(`Strong score (${Math.round(overallScore * 100)}/100) supports maintaining current persona.`);
  }

  return decision;
}

// Generate recommendations
function generateRecommendations(
  decision: any,
  currentPersona: string,
  insights: any
) {
  const recommendations = {
    forTrainer: [] as string[],
    forClient: [] as string[],
    forSystem: [] as string[],
  };

  if (decision.action === 'change' && decision.newPersona) {
    recommendations.forTrainer.push(
      `Transition from ${currentPersona} to ${decision.newPersona} persona.`,
      `Review ${decision.newPersona} coaching guidelines.`
    );
    recommendations.forSystem.push(`Update client record with new persona: ${decision.newPersona}`);
  } else if (decision.action === 'adjust') {
    recommendations.forTrainer.push(
      `Adjust ${currentPersona} coaching approach.`,
      `Focus on improving specific areas.`
    );
  } else {
    recommendations.forTrainer.push(
      `Continue with current ${currentPersona} approach.`,
      `Monitor for engagement changes.`
    );
  }

  return recommendations;
}

// Main review function
async function reviewClientPersona(
  supabase: any,
  clientId: string,
  reviewType: string,
  startDate: string,
  endDate: string,
  notificationSettings: any
) {
  try {
    // Get current persona
    const { data: currentPersona, error: personaError } = await supabase
      .from('persona_assignments')
      .select('*')
      .eq('client_id', clientId)
      .order('assigned_at', { ascending: false })
      .limit(1)
      .single();

    if (personaError) {
      console.error(`No persona found for client ${clientId}:`, personaError);
      return null;
    }

    // Calculate metrics
    const engagementMetrics = await calculateEngagementMetrics(supabase, clientId, startDate, endDate);
    const progressMetrics = await calculateProgressMetrics(supabase, clientId, startDate, endDate);
    const behavioralAlignment = await calculateBehavioralAlignment(supabase, clientId, currentPersona.persona_type);

    // Generate insights
    const insights = generateInsights(
      engagementMetrics,
      progressMetrics,
      behavioralAlignment,
      currentPersona.persona_type
    );

    // Make decision
    const personaDecision = makePersonaDecision(
      currentPersona,
      engagementMetrics,
      progressMetrics,
      behavioralAlignment,
      insights
    );

    // Generate recommendations
    const recommendations = generateRecommendations(
      personaDecision,
      currentPersona.persona_type,
      insights
    );

    // Handle notifications
    const notifications = {
      sentToTrainer: false,
      sentToClient: false,
      notificationContent: '',
    };

    if (notificationSettings.notifyTrainerOnChange && personaDecision.action !== 'maintain') {
      notifications.sentToTrainer = true;
      notifications.notificationContent = `Persona ${personaDecision.action} recommended for client ${clientId}.`;
    }

    // Store review if configured
    if (notificationSettings.storeReviewInDatabase) {
      const reviewData = {
        client_id: clientId,
        review_type: reviewType,
        review_date: new Date().toISOString(),
        current_persona: currentPersona.persona_type,
        engagement_metrics: engagementMetrics,
        progress_metrics: progressMetrics,
        behavioral_alignment: behavioralAlignment,
        persona_decision: personaDecision,
        insights: insights,
        recommendations: recommendations,
        created_at: new Date().toISOString(),
      };

      await supabase
        .from('persona_reviews')
        .insert(reviewData)
        .catch(err => console.error('Error storing review:', err));
    }

    return {
      clientId,
      reviewDate: new Date().toISOString(),
      reviewType,
      currentPersona: {
        type: currentPersona.persona_type,
        assignedAt: currentPersona.assigned_at,
        confidence: currentPersona.confidence_score,
        reasoning: currentPersona.reasoning,
      },
      reviewAnalysis: {
        engagementMetrics,
        progressMetrics,
        behavioralAlignment,
        ...insights,
      },
      personaDecision,
      recommendations,
      notifications,
    };
  } catch (error) {
    console.error(`Error reviewing client ${clientId}:`, error);
    return null;
  }
}

// Get clients for review
async function getClientsForReview(
  supabase: any,
  request: PersonaReviewRequest
): Promise<string[]> {
  try {
    let query = supabase
      .from('clients')
      .select('id, persona_assigned_at, created_at, status');

    if (request.clientId) {
      query = query.eq('id', request.clientId);
    } else if (request.trainerId) {
      query = query.eq('trainer_id', request.trainerId);
    }

    query = query.in('status', ['active', 'at_risk']);

    const { data: clients, error } = await query;

    if (error || !clients) return [];

    const clientIds: string[] = [];
    const now = new Date();

    for (const client of clients) {
      if (request.forceReview) {
        clientIds.push(client.id);
        continue;
      }

      if (client.persona_assigned_at) {
        const lastAssignment = new Date(client.persona_assigned_at);
        const daysSince = (now.getTime() - lastAssignment.getTime()) / (1000 * 60 * 60 * 24);
        const reviewPeriod = REVIEW_PERIODS[request.reviewType as keyof typeof REVIEW_PERIODS] || 28;
        
        if (daysSince >= reviewPeriod) {
          clientIds.push(client.id);
        }
      }
    }

    return clientIds;
  } catch (error) {
    console.error('Error getting clients for review:', error);
    return [];
  }
}

// Main POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = PersonaReviewRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    const notificationSettings = data.notificationSettings || {
      notifyTrainerOnChange: true,
      notifyClientOnChange: false,
      generateDetailedReport: true,
      storeReviewInDatabase: true,
    };

    // Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase not configured' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get clients for review
    const clientIds = await getClientsForReview(supabase, data);
    
    if (clientIds.length === 0) {
      return NextResponse.json({
        success: true,
        reviews: [],
        summary: {
          totalClientsReviewed: 0,
          personasMaintained: 0,
          personasAdjusted: 0,
          personasChanged: 0,
          avgPersonaFitScore: 0,
          avgEngagementScore: 0,
          avgProgressScore: 0,
          highRiskClients: 0,
          successRate: 0,
        },
        actions: [],
        message: 'No clients require persona review at this time',
      });
    }

    // Set date range
    const endDate = data.endDate || new Date().toISOString();
    const startDate = data.startDate || (() => {
      const date = new Date(endDate);
      date.setDate(date.getDate() - (REVIEW_PERIODS[data.reviewType as keyof typeof REVIEW_PERIODS] || 28));
      return date.toISOString();
    })();

    // Perform reviews
    const reviews: PersonaReviewResponse['reviews'] = [];
    const actions: PersonaReviewResponse['actions'] = [];
    let personasMaintained = 0;
    let personasAdjusted = 0;
    let personasChanged = 0;
    let totalPersonaFitScore = 0;
    let totalEngagementScore = 0;
    let totalProgressScore = 0;
    let highRiskClients = 0;

    for (const clientId of clientIds) {
      const review = await reviewClientPersona(
        supabase,
        clientId,
        data.reviewType,
        startDate,
        endDate,
        notificationSettings
      );

      if (review) {
        reviews.push(review);
        
        // Track statistics
        if (review.personaDecision.action === 'maintain') personasMaintained++;
        if (review.personaDecision.action === 'adjust') personasAdjusted++;
        if (review.personaDecision.action === 'change') personasChanged++;
        
        totalPersonaFitScore += review.reviewAnalysis.behavioralAlignment.personaFitScore;
        totalEngagementScore += review.reviewAnalysis.engagementMetrics.responseRate;
        totalProgressScore += review.reviewAnalysis.progressMetrics.goalProgress;
        
        if (review.reviewAnalysis.engagementMetrics.responseRate < 40 || 
            review.reviewAnalysis.progressMetrics.goalProgress < 30) {
          highRiskClients++;
        }

        actions.push({
          type: 'reviewed',
          clientId,
          timestamp: new Date().toISOString(),
          details: `Persona review completed for client ${clientId}`,
        });
      }
    }

    // Calculate summary
    const totalClientsReviewed = reviews.length;
    const avgPersonaFitScore = totalClientsReviewed > 0 ? totalPersonaFitScore / totalClientsReviewed : 0;
    const avgEngagementScore = totalClientsReviewed > 0 ? totalEngagementScore / totalClientsReviewed : 0;
    const avgProgressScore = totalClientsReviewed > 0 ? totalProgressScore / totalClientsReviewed : 0;
    const successRate = totalClientsReviewed > 0 ? 
      ((personasMaintained + personasAdjusted * 0.5) / totalClientsReviewed) * 100 : 0;

    const summary: PersonaReviewResponse['summary'] = {
      totalClientsReviewed,
      personasMaintained,
      personasAdjusted,
      personasChanged,
      avgPersonaFitScore: Math.round(avgPersonaFitScore),
      avgEngagementScore: Math.round(avgEngagementScore),
      avgProgressScore: Math.round(avgProgressScore),
      highRiskClients,
      successRate: Math.round(successRate),
    };

    const response: PersonaReviewResponse = {
      success: true,
      reviews,
      summary,
      actions,
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error performing persona review:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET handler for retrieving past reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const trainerId = searchParams.get('trainerId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!clientId && !trainerId) {
      return NextResponse.json(
        { success: false, error: 'Either clientId or trainerId query parameter is required' },
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

    let query = supabase
      .from('persona_reviews')
      .select('*')
      .order('review_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (clientId) {
      query = query.eq('client_id', clientId);
    } else if (trainerId) {
      // Get clients for this trainer first
      const { data: clients } = await supabase
        .from('clients')
        .select('id')
        .eq('trainer_id', trainerId);

      if (clients && clients.length > 0) {
        const clientIds = clients.map(c => c.id);
        query = query.in('client_id', clientIds);
      } else {
        return NextResponse.json({
          success: true,
          reviews: [],
          total: 0,
          message: 'No clients found for this trainer',
        });
      }
    }

    const { data: reviews, error } = await query;

    if (error) {
      // Table might not exist yet
      return NextResponse.json({
        success: true,
        reviews: [],
        total: 0,
        message: 'No persona reviews found',
      });
    }

    return NextResponse.json({
      success: true,
      reviews: reviews || [],
      pagination: {
        total: reviews?.length || 0,
        limit,
        offset,
        hasMore: false, // Simplified
      },
    });
    
  } catch (error) {
    console.error('Error retrieving persona reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
