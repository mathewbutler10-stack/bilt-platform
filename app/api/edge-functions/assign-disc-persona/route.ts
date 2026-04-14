import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Schema for DISC-lite assessment results
const DISCAssessmentRequestSchema = z.object({
  clientId: z.string().uuid(),
  assessmentId: z.string().uuid(),
  discScores: z.object({
    dominance: z.number().min(0).max(100),
    influence: z.number().min(0).max(100),
    steadiness: z.number().min(0).max(100),
    conscientiousness: z.number().min(0).max(100),
  }),
  assessmentContext: z.object({
    source: z.enum(['onboarding', 'periodic', 'manual']).default('onboarding'),
    completedAt: z.string().datetime(),
    version: z.string().default('1.0'),
  }).optional(),
  metadata: z.object({
    responseTimeSeconds: z.number().positive().optional(),
    questionCount: z.number().positive().optional(),
    completionRate: z.number().min(0).max(100).optional(),
  }).optional(),
});

type DISCAssessmentRequest = z.infer<typeof DISCAssessmentRequestSchema>;

// Persona types
type PersonaType = 'Coach' | 'Strategist' | 'Motivator';

// Response type
type PersonaAssignmentResponse = {
  success: boolean;
  persona: {
    type: PersonaType;
    confidence: number;
    reasoning: string[];
    discProfile: {
      primary: string;
      secondary: string;
      tertiary: string;
      quaternary: string;
    };
    strengths: string[];
    coachingApproach: string[];
  };
  clientId: string;
  assessmentId: string;
  assignedAt: string;
};

// Persona definitions and scoring rules
const PERSONA_DEFINITIONS = {
  Coach: {
    description: 'Focuses on structure, accountability, and gradual progress. Best for clients who need consistency and clear guidance.',
    idealDiscProfile: {
      primary: 'Conscientiousness',
      secondary: 'Steadiness',
      tertiary: 'Dominance',
      quaternary: 'Influence',
    },
    scoringWeights: {
      conscientiousness: 0.4,
      steadiness: 0.3,
      dominance: 0.2,
      influence: 0.1,
    },
    thresholds: {
      minConscientiousness: 60,
      minSteadiness: 50,
    },
  },
  Strategist: {
    description: 'Focuses on data, planning, and optimization. Best for analytical clients who want evidence-based approaches.',
    idealDiscProfile: {
      primary: 'Dominance',
      secondary: 'Conscientiousness',
      tertiary: 'Steadiness',
      quaternary: 'Influence',
    },
    scoringWeights: {
      dominance: 0.4,
      conscientiousness: 0.3,
      steadiness: 0.2,
      influence: 0.1,
    },
    thresholds: {
      minDominance: 60,
      minConscientiousness: 50,
    },
  },
  Motivator: {
    description: 'Focuses on energy, enthusiasm, and social support. Best for clients who thrive on encouragement and community.',
    idealDiscProfile: {
      primary: 'Influence',
      secondary: 'Dominance',
      tertiary: 'Steadiness',
      quaternary: 'Conscientiousness',
    },
    scoringWeights: {
      influence: 0.4,
      dominance: 0.3,
      steadiness: 0.2,
      conscientiousness: 0.1,
    },
    thresholds: {
      minInfluence: 60,
      minDominance: 40,
    },
  },
};

// Calculate persona score based on DISC scores and persona weights
function calculatePersonaScore(discScores: DISCAssessmentRequest['discScores'], weights: Record<string, number>): number {
  const weightedSum = 
    (discScores.dominance * weights.dominance || 0) +
    (discScores.influence * weights.influence || 0) +
    (discScores.steadiness * weights.steadiness || 0) +
    (discScores.conscientiousness * weights.conscientiousness || 0);
  
  return weightedSum / 100; // Normalize to 0-1 range
}

// Check if persona thresholds are met
function checkPersonaThresholds(discScores: DISCAssessmentRequest['discScores'], thresholds: Record<string, number>): boolean {
  return Object.entries(thresholds).every(([trait, minScore]) => {
    const score = discScores[trait as keyof typeof discScores];
    return score >= minScore;
  });
}

// Determine primary, secondary, tertiary, quaternary traits
function determineDiscProfile(discScores: DISCAssessmentRequest['discScores']) {
  const traits = [
    { name: 'Dominance', score: discScores.dominance },
    { name: 'Influence', score: discScores.influence },
    { name: 'Steadiness', score: discScores.steadiness },
    { name: 'Conscientiousness', score: discScores.conscientiousness },
  ];
  
  // Sort by score descending
  traits.sort((a, b) => b.score - a.score);
  
  return {
    primary: traits[0].name,
    secondary: traits[1].name,
    tertiary: traits[2].name,
    quaternary: traits[3].name,
  };
}

// Generate reasoning based on DISC profile and persona
function generateReasoning(discScores: DISCAssessmentRequest['discScores'], persona: PersonaType, discProfile: any): string[] {
  const reasoning: string[] = [];
  
  // Add persona-specific reasoning
  if (persona === 'Coach') {
    if (discScores.conscientiousness > 70) {
      reasoning.push('High conscientiousness indicates preference for structure and detail-oriented approach.');
    }
    if (discScores.steadiness > 60) {
      reasoning.push('Strong steadiness suggests value in consistency and gradual progress.');
    }
  } else if (persona === 'Strategist') {
    if (discScores.dominance > 70) {
      reasoning.push('High dominance shows preference for control and results-driven mindset.');
    }
    if (discScores.conscientiousness > 60) {
      reasoning.push('Strong conscientiousness indicates analytical and systematic thinking.');
    }
  } else if (persona === 'Motivator') {
    if (discScores.influence > 70) {
      reasoning.push('High influence suggests outgoing personality and value in social interaction.');
    }
    if (discScores.dominance > 50) {
      reasoning.push('Moderate to high dominance indicates drive and ambition.');
    }
  }
  
  // Add profile-based reasoning
  reasoning.push(`Primary DISC trait is ${discProfile.primary}, which aligns with ${persona} persona.`);
  
  // Add any notable trait combinations
  if (discScores.dominance > 70 && discScores.influence > 60) {
    reasoning.push('High dominance and influence combination suggests strong leadership potential.');
  }
  if (discScores.conscientiousness > 70 && discScores.steadiness > 60) {
    reasoning.push('High conscientiousness and steadiness combination indicates reliability and attention to detail.');
  }
  
  return reasoning;
}

// Generate strengths based on DISC profile
function generateStrengths(discScores: DISCAssessmentRequest['discScores']): string[] {
  const strengths: string[] = [];
  
  if (discScores.dominance > 70) {
    strengths.push('Decisive and results-oriented');
  } else if (discScores.dominance > 50) {
    strengths.push('Assertive when needed');
  }
  
  if (discScores.influence > 70) {
    strengths.push('Excellent communicator and motivator');
  } else if (discScores.influence > 50) {
    strengths.push('Good at building relationships');
  }
  
  if (discScores.steadiness > 70) {
    strengths.push('Patient and consistent');
  } else if (discScores.steadiness > 50) {
    strengths.push('Reliable and steady');
  }
  
  if (discScores.conscientiousness > 70) {
    strengths.push('Detail-oriented and analytical');
  } else if (discScores.conscientiousness > 50) {
    strengths.push('Organized and systematic');
  }
  
  return strengths;
}

// Generate coaching approach recommendations
function generateCoachingApproach(persona: PersonaType, discProfile: any): string[] {
  const approaches: string[] = [];
  
  if (persona === 'Coach') {
    approaches.push('Provide structured workout plans with clear progression');
    approaches.push('Establish regular check-ins for accountability');
    approaches.push('Focus on gradual, sustainable progress over quick results');
    approaches.push('Use data tracking to show incremental improvements');
  } else if (persona === 'Strategist') {
    approaches.push('Present evidence-based rationale for all recommendations');
    approaches.push('Use data analytics to optimize training and nutrition');
    approaches.push('Create detailed plans with measurable outcomes');
    approaches.push('Encourage self-monitoring and analysis');
  } else if (persona === 'Motivator') {
    approaches.push('Use positive reinforcement and celebration of milestones');
    approaches.push('Incorporate social elements and community support');
    approaches.push('Focus on energy and enthusiasm in communication');
    approaches.push('Create engaging and varied workout routines');
  }
  
  // Add persona-appropriate communication style
  approaches.push(`Adapt communication to ${discProfile.primary}-dominant style`);
  
  return approaches;
}

// Assign persona based on DISC scores
function assignPersona(discScores: DISCAssessmentRequest['discScores']): {
  type: PersonaType;
  confidence: number;
  reasoning: string[];
  discProfile: any;
  strengths: string[];
  coachingApproach: string[];
} {
  // Calculate scores for each persona
  const personaScores: Record<PersonaType, number> = {
    Coach: calculatePersonaScore(discScores, PERSONA_DEFINITIONS.Coach.scoringWeights),
    Strategist: calculatePersonaScore(discScores, PERSONA_DEFINITIONS.Strategist.scoringWeights),
    Motivator: calculatePersonaScore(discScores, PERSONA_DEFINITIONS.Motivator.scoringWeights),
  };
  
  // Check threshold requirements
  const viablePersonas = Object.entries(personaScores)
    .filter(([personaType]) => {
      const thresholds = PERSONA_DEFINITIONS[personaType as PersonaType].thresholds;
      return checkPersonaThresholds(discScores, thresholds);
    })
    .map(([personaType, score]) => ({ type: personaType as PersonaType, score }));
  
  // Determine disc profile
  const discProfile = determineDiscProfile(discScores);
  
  let assignedPersona: PersonaType;
  let confidence: number;
  
  if (viablePersonas.length === 0) {
    // No persona meets thresholds, assign based on highest score
    const highestScore = Object.entries(personaScores).reduce((max, [type, score]) => 
      score > max.score ? { type: type as PersonaType, score } : max
    , { type: 'Coach' as PersonaType, score: 0 });
    
    assignedPersona = highestScore.type;
    confidence = Math.min(0.7, highestScore.score); // Lower confidence when thresholds not met
  } else {
    // Assign persona with highest score among viable options
    const bestPersona = viablePersonas.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    assignedPersona = bestPersona.type;
    confidence = Math.min(0.95, bestPersona.score);
  }
  
  // Generate reasoning, strengths, and coaching approach
  const reasoning = generateReasoning(discScores, assignedPersona, discProfile);
  const strengths = generateStrengths(discScores);
  const coachingApproach = generateCoachingApproach(assignedPersona, discProfile);
  
  return {
    type: assignedPersona,
    confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
    reasoning,
    discProfile,
    strengths,
    coachingApproach,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const validationResult = DISCAssessmentRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // Assign persona based on DISC scores
    const personaAssignment = assignPersona(data.discScores);
    
    // Save to database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      try {
        // Save persona assignment
        const { error: assignmentError } = await supabase
          .from('persona_assignments')
          .insert({
            client_id: data.clientId,
            assessment_id: data.assessmentId,
            persona_type: personaAssignment.type,
            confidence_score: personaAssignment.confidence,
            disc_scores: data.discScores,
            disc_profile: personaAssignment.discProfile,
            reasoning: personaAssignment.reasoning,
            strengths: personaAssignment.strengths,
            coaching_approach: personaAssignment.coachingApproach,
            assigned_at: new Date().toISOString(),
            assessment_context: data.assessmentContext,
            metadata: data.metadata,
          });
        
        if (assignmentError) {
          console.error('Failed to save persona assignment:', assignmentError);
          // Continue even if database save fails
        }
        
        // Update client record with persona
        const { error: clientError } = await supabase
          .from('clients')
          .update({
            assigned_persona: personaAssignment.type,
            persona_assigned_at: new Date().toISOString(),
            persona_confidence: personaAssignment.confidence,
            last_updated: new Date().toISOString(),
          })
          .eq('id', data.clientId);
        
        if (clientError) {
          console.error('Failed to update client record:', clientError);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if database operations fail
      }
    }
    
    // Prepare response
    const response: PersonaAssignmentResponse = {
      success: true,
      persona: personaAssignment,
      clientId: data.clientId,
      assessmentId: data.assessmentId,
      assignedAt: new Date().toISOString(),
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error assigning DISC persona:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // GET endpoint for retrieving persona assignments
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  const assessmentId = searchParams.get('assessmentId');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  if (!clientId && !assessmentId) {
    return NextResponse.json(
      { success: false, error: 'Either clientId or assessmentId query parameter is required' },
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
    
    let query = supabase
      .from('persona_assignments')
      .select('*')
      .order('assigned_at', { ascending: false })
      .limit(limit);
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (assessmentId) {
      query = query.eq('assessment_id', assessmentId);
    }
    
    const { data: assignments, error } = await query;
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return NextResponse.json(
          { success: false, error: 'No persona assignments found' },
          { status: 404 }
        );
      }
      throw error;
    }
    
    // Calculate statistics if we have multiple assignments
    const statistics = assignments.length > 0 ? {
      totalAssignments: assignments.length,
      personaDistribution: assignments.reduce((acc, assignment) => {
        acc[assignment.persona_type] = (acc[assignment.persona_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageConfidence: assignments.reduce((sum, assignment) => sum + assignment.confidence_score, 0) / assignments.length,
      mostRecentAssignment: assignments[0].assigned_at,
    } : null;
    
    return NextResponse.json({
      success: true,
      assignments,
      statistics,
      total: assignments.length,
    });
    
  } catch (error) {
    console.error('Error retrieving persona assignments:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
