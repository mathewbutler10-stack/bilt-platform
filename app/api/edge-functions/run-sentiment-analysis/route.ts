import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Schema for sentiment analysis
const SentimentAnalysisRequestSchema = z.object({
  text: z.string().min(1).max(10000),
  context: z.enum(['checkin_response', 'onboarding_conversation', 'general_feedback', 'coaching_note']).default('checkin_response'),
  clientId: z.string().uuid().optional(),
  checkinId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
  language: z.enum(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']).default('en'),
  analyzeEmotions: z.boolean().default(true),
  extractKeyPhrases: z.boolean().default(true),
  detectUrgency: z.boolean().default(true),
  trackOverTime: z.boolean().default(true),
});

type SentimentAnalysisRequest = z.infer<typeof SentimentAnalysisRequestSchema>;
type SentimentAnalysisResponse = {
  success: boolean;
  analysisId: string;
  sentiment: {
    overall: {
      score: number; // -1 to 1
      label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
      confidence: number; // 0 to 1
    };
    byAspect: Array<{
      aspect: string;
      score: number;
      label: string;
      mentions: number;
      examples: string[];
    }>;
    emotions: {
      primary: string;
      secondary: string[];
      intensity: number; // 0 to 1
      detected: Array<{
        emotion: string;
        score: number;
        triggers: string[];
      }>;
    };
  };
  insights: {
    keyPhrases: Array<{
      phrase: string;
      relevance: number;
      category: string;
      sentiment: number;
    }>;
    topics: Array<{
      topic: string;
      weight: number;
      subtopics: string[];
    }>;
    urgency: {
      level: 'none' | 'low' | 'medium' | 'high' | 'critical';
      score: number;
      indicators: string[];
      recommendedAction: string;
    };
    recommendations: Array<{
      type: 'coaching' | 'support' | 'celebration' | 'adjustment';
      priority: 'low' | 'medium' | 'high';
      action: string;
      rationale: string;
    }>;
  };
  metadata: {
    textLength: number;
    wordCount: number;
    readingLevel: string;
    processingTimeMs: number;
    modelVersion: string;
    analyzedAt: string;
  };
  trends: {
    previousScore: number | null;
    trend: 'improving' | 'declining' | 'stable' | 'volatile' | 'first_analysis';
    changeMagnitude: number;
    consistencyScore: number;
  } | null;
};

// Sentiment scoring thresholds
const SENTIMENT_THRESHOLDS = {
  very_negative: { min: -1.0, max: -0.6 },
  negative: { min: -0.6, max: -0.2 },
  neutral: { min: -0.2, max: 0.2 },
  positive: { min: 0.2, max: 0.6 },
  very_positive: { min: 0.6, max: 1.0 },
};

// Common aspects for analysis
const COMMON_ASPECTS = {
  checkin_response: ['nutrition', 'training', 'recovery', 'motivation', 'stress', 'sleep', 'consistency', 'progress'],
  onboarding_conversation: ['goals', 'challenges', 'expectations', 'lifestyle', 'preferences', 'concerns', 'motivation'],
  general_feedback: ['service', 'platform', 'coaching', 'results', 'communication', 'value', 'recommendation'],
  coaching_note: ['compliance', 'effort', 'understanding', 'engagement', 'challenges', 'breakthroughs', 'next_steps'],
};

// Emotion detection patterns
const EMOTION_PATTERNS = {
  positive: {
    joy: ['happy', 'excited', 'proud', 'grateful', 'optimistic', 'confident', 'energized'],
    satisfaction: ['satisfied', 'content', 'pleased', 'fulfilled', 'accomplished'],
    hope: ['hopeful', 'encouraged', 'motivated', 'inspired', 'determined'],
  },
  negative: {
    frustration: ['frustrated', 'annoyed', 'irritated', 'disappointed', 'discouraged'],
    anxiety: ['anxious', 'worried', 'stressed', 'overwhelmed', 'nervous'],
    sadness: ['sad', 'down', 'disheartened', 'demotivated', 'exhausted'],
    confusion: ['confused', 'uncertain', 'unsure', 'lost', 'overwhelmed'],
  },
  neutral: {
    reflection: ['thinking', 'considering', 'evaluating', 'assessing', 'planning'],
    inquiry: ['questioning', 'wondering', 'curious', 'interested', 'exploring'],
  },
};

// Urgency indicators
const URGENCY_INDICATORS = {
  critical: ['emergency', 'urgent', 'immediately', 'asap', 'now', 'critical', 'serious', 'danger', 'help needed'],
  high: ['important', 'priority', 'soon', 'quickly', 'concerned', 'worried', 'stress', 'pressure'],
  medium: ['should', 'need to', 'would like', 'prefer', 'better', 'improve', 'adjust'],
  low: ['maybe', 'possibly', 'consider', 'think about', 'explore', 'option', 'alternative'],
};

// Coaching recommendations based on sentiment
const COACHING_RECOMMENDATIONS = {
  very_negative: [
    {
      type: 'support' as const,
      priority: 'high' as const,
      action: 'Schedule immediate check-in call',
      rationale: 'Client is expressing strong negative emotions that require personal attention',
    },
    {
      type: 'adjustment' as const,
      priority: 'high' as const,
      action: 'Review and adjust current plan',
      rationale: 'Current approach may not be working for the client',
    },
  ],
  negative: [
    {
      type: 'support' as const,
      priority: 'medium' as const,
      action: 'Send supportive message acknowledging challenges',
      rationale: 'Client needs validation and encouragement',
    },
    {
      type: 'adjustment' as const,
      priority: 'medium' as const,
      action: 'Consider small plan modifications',
      rationale: 'Minor adjustments can improve adherence and motivation',
    },
  ],
  neutral: [
    {
      type: 'coaching' as const,
      priority: 'low' as const,
      action: 'Ask probing questions to understand deeper',
      rationale: 'Neutral responses may indicate lack of engagement or uncertainty',
    },
    {
      type: 'support' as const,
      priority: 'low' as const,
      action: 'Provide additional guidance or resources',
      rationale: 'Client may benefit from more structured support',
    },
  ],
  positive: [
    {
      type: 'celebration' as const,
      priority: 'medium' as const,
      action: 'Acknowledge and celebrate progress',
      rationale: 'Positive reinforcement strengthens motivation',
    },
    {
      type: 'coaching' as const,
      priority: 'low' as const,
      action: 'Build on current success with next challenges',
      rationale: 'Leverage positive momentum for continued progress',
    },
  ],
  very_positive: [
    {
      type: 'celebration' as const,
      priority: 'high' as const,
      action: 'Share success story (with permission)',
      rationale: 'Celebrating major wins boosts client confidence and motivation',
    },
    {
      type: 'coaching' as const,
      priority: 'medium' as const,
      action: 'Set new ambitious goals',
      rationale: 'Client is in optimal state for taking on new challenges',
    },
  ],
};

// Simple sentiment analysis (in production, this would use an AI service)
function analyzeSentiment(text: string, context: string): {
  score: number;
  label: string;
  confidence: number;
  aspects: Array<{ aspect: string; score: number; label: string; mentions: number; examples: string[] }>;
} {
  const words = text.toLowerCase().split(/\s+/);
  
  // Simple keyword-based sentiment (production would use ML)
  const positiveWords = ['good', 'great', 'excellent', 'happy', 'progress', 'better', 'improved', 'proud', 'excited', 'motivated', 'confident', 'energized', 'satisfied', 'pleased', 'grateful', 'hopeful', 'encouraged', 'inspired', 'determined', 'success', 'win', 'achievement'];
  const negativeWords = ['bad', 'poor', 'terrible', 'sad', 'frustrated', 'stuck', 'worse', 'difficult', 'hard', 'challenging', 'struggling', 'overwhelmed', 'stressed', 'anxious', 'worried', 'tired', 'exhausted', 'discouraged', 'disappointed', 'confused', 'unsure', 'lost'];
  const neutralWords = ['ok', 'fine', 'alright', 'average', 'normal', 'usual', 'typical', 'regular', 'standard', 'moderate', 'medium'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;
  let totalScored = 0;
  
  const positiveExamples: string[] = [];
  const negativeExamples: string[] = [];
  const neutralExamples: string[] = [];
  
  words.forEach(word => {
    if (positiveWords.includes(word)) {
      positiveCount++;
      positiveExamples.push(word);
      totalScored++;
    } else if (negativeWords.includes(word)) {
      negativeCount++;
      negativeExamples.push(word);
      totalScored++;
    } else if (neutralWords.includes(word)) {
      neutralCount++;
      neutralExamples.push(word);
      totalScored++;
    }
  });
  
  // Calculate sentiment score (-1 to 1)
  const score = totalScored > 0 
    ? (positiveCount - negativeCount) / totalScored 
    : 0;
  
  // Determine label
  let label = 'neutral';
  if (score <= SENTIMENT_THRESHOLDS.very_negative.max && score >= SENTIMENT_THRESHOLDS.very_negative.min) label = 'very_negative';
  else if (score <= SENTIMENT_THRESHOLDS.negative.max && score > SENTIMENT_THRESHOLDS.negative.min) label = 'negative';
  else if (score <= SENTIMENT_THRESHOLDS.neutral.max && score > SENTIMENT_THRESHOLDS.neutral.min) label = 'neutral';
  else if (score <= SENTIMENT_THRESHOLDS.positive.max && score > SENTIMENT_THRESHOLDS.positive.min) label = 'positive';
  else if (score <= SENTIMENT_THRESHOLDS.very_positive.max && score > SENTIMENT_THRESHOLDS.very_positive.min) label = 'very_positive';
  
  // Calculate confidence based on word count and clarity
  const confidence = Math.min(0.95, 0.3 + (totalScored / words.length) * 0.7);
  
  // Analyze aspects
  const aspects = COMMON_ASPECTS[context as keyof typeof COMMON_ASPECTS].map(aspect => {
    const aspectWords = text.toLowerCase().match(new RegExp(`\\b${aspect}\\w*\\b`, 'gi')) || [];
    const aspectScore = aspectWords.length > 0 ? score : 0;
    
    return {
      aspect,
      score: aspectScore,
      label: aspectScore <= -0.2 ? 'negative' : aspectScore >= 0.2 ? 'positive' : 'neutral',
      mentions: aspectWords.length,
      examples: aspectWords.slice(0, 3),
    };
  }).filter(aspect => aspect.mentions > 0);
  
  return { score, label, confidence, aspects };
}

// Detect emotions in text
function detectEmotions(text: string, analyzeEmotions: boolean): {
  primary: string;
  secondary: string[];
  intensity: number;
  detected: Array<{ emotion: string; score: number; triggers: string[] }>;
} {
  if (!analyzeEmotions) {
    return {
      primary: 'neutral',
      secondary: [],
      intensity: 0,
      detected: [],
    };
  }
  
  const textLower = text.toLowerCase();
  const detectedEmotions: Array<{ emotion: string; score: number; triggers: string[] }> = [];
  
  // Check for each emotion pattern
  for (const [category, emotions] of Object.entries(EMOTION_PATTERNS)) {
    for (const [emotion, triggers] of Object.entries(emotions)) {
      const foundTriggers = triggers.filter(trigger => 
        textLower.includes(trigger.toLowerCase())
      );
      
      if (foundTriggers.length > 0) {
        detectedEmotions.push({
          emotion,
          score: foundTriggers.length / triggers.length,
          triggers: foundTriggers,
        });
      }
    }
  }
  
  // Determine primary and secondary emotions
  if (detectedEmotions.length === 0) {
    return {
      primary: 'neutral',
      secondary: [],
      intensity: 0,
      detected: [],
    };
  }
  
  // Sort by score
  detectedEmotions.sort((a, b) => b.score - a.score);
  
  const primary = detectedEmotions[0].emotion;
  const secondary = detectedEmotions.slice(1, 3).map(e => e.emotion);
  const intensity = detectedEmotions[0].score;
  
  return {
    primary,
    secondary,
    intensity,
    detected: detectedEmotions,
  };
}

// Extract key phrases
function extractKeyPhrases(text: string, extractKeyPhrases: boolean): Array<{
  phrase: string;
  relevance: number;
  category: string;
  sentiment: number;
}> {
  if (!extractKeyPhrases) return [];
  
  // Simple phrase extraction (production would use NLP)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const phrases: Array<{
    phrase: string;
    relevance: number;
    category: string;
    sentiment: number;
  }> = [];
  
  sentences.forEach(sentence => {
    const words = sentence.trim().split(/\s+/);
    if (words.length >= 3 && words.length <= 8) {
      // Simple relevance scoring based on position and length
      const relevance = 0.5 + (words.length / 15); // 0.5 to ~1.0
      
      // Simple category detection
      let category = 'general';
      const lowerSentence = sentence.toLowerCase();
      if (lowerSentence.includes('nutrition') || lowerSentence.includes('food') || lowerSentence.includes('meal')) category = 'nutrition';
      else if (lowerSentence.includes('train') || lowerSentence.includes('workout') || lowerSentence.includes('exercise')) category = 'training';
      else if (lowerSentence.includes('recover') || lowerSentence.includes('sleep') || lowerSentence.includes('rest')) category = 'recovery';
      else if (lowerSentence.includes('stress') || lowerSentence.includes('anxious') || lowerSentence.includes('overwhelmed')) category = 'wellness';
      else if (lowerSentence.includes('goal') || lowerSentence.includes('progress') || lowerSentence.includes('achieve')) category = 'progress';
      
      // Simple sentiment for phrase
      const { score } = analyzeSentiment(sentence, 'general_feedback');
      
      phrases.push({
        phrase: sentence.trim(),
        relevance,
        category,
        sentiment: score,
      });
    }
  });
  
  // Return top 5 phrases by relevance
  return phrases.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
}

// Detect urgency level
function detectUrgency(text: string, detectUrgency: boolean): {
  level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  score: number;
  indicators: string[];
  recommendedAction: string;
} {
  if (!detectUrgency) {
    return {
      level: 'none',
      score: 0,
      indicators: [],
      recommendedAction: 'No urgent action required',
    };
  }
  
  const textLower = text.toLowerCase();
  const indicators: string[] = [];
  let maxLevel: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';
  let totalScore = 0;
  
  // Check each urgency level
  for (const [level, levelIndicators] of Object.entries(URGENCY_INDICATORS)) {
    const foundIndicators = levelIndicators.filter(indicator => 
      textLower.includes(indicator.toLowerCase())
    );
    
    if (foundIndicators.length > 0) {
      indicators.push(...foundIndicators);
      
      // Update max level
      const levelOrder = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };
      if (levelOrder[level as keyof typeof levelOrder] > levelOrder[maxLevel]) {
        maxLevel = level as typeof maxLevel;
      }
      
      totalScore += foundIndicators.length;
    }
  }
  
  // Calculate urgency score (0 to 1)
  const score = Math.min(1, totalScore / 10);
  
  // Determine recommended action based on urgency level
  let recommendedAction = 'No urgent action required';
  switch (maxLevel) {
    case 'critical':
      recommendedAction = 'Immediate intervention required - contact client directly';
      break;
    case 'high':
      recommendedAction = 'Schedule urgent check-in within 24 hours';
      break;
    case 'medium':
      recommendedAction = 'Address in next scheduled communication';
      break;
    case 'low':
      recommendedAction = 'Note for follow-up in regular check-in';
      break;
  }
  
  return {
    level: maxLevel,
    score,
    indicators: [...new Set(indicators)], // Remove duplicates
    recommendedAction,
  };
}

// Extract topics from text
function extractTopics(text: string): Array<{
  topic: string;
  weight: number;
  subtopics: string[];
}> {
  // Simple topic extraction (production would use NLP/topic modeling)
  const commonTopics = [
    { topic: 'Nutrition', keywords: ['food', 'meal', 'diet', 'eat', 'hungry', 'craving', 'protein', 'carb', 'calorie'] },
    { topic: 'Training', keywords: ['workout', 'exercise', 'train', 'gym', 'lift', 'cardio', 'strength', 'session'] },
    { topic: 'Recovery', keywords: ['sleep', 'rest', 'recover', 'sore', 'tired', 'fatigue', 'energy', 'rest day'] },
    { topic: 'Motivation', keywords: ['motivate', 'motivation', 'drive', 'focus', 'determined', 'committed', 'consistency'] },
    { topic: 'Stress', keywords: ['stress', 'anxious', 'worried', 'overwhelmed', 'pressure', 'busy', 'hectic'] },
    { topic: 'Progress', keywords: ['progress', 'improve', 'better', 'results', 'achieve', 'goal', 'success', 'win'] },
    { topic: 'Challenges', keywords: ['challenge', 'difficult', 'hard', 'struggle', 'stuck', 'plateau', 'obstacle'] },
    { topic: 'Support', keywords: ['help', 'support', 'guidance', 'advice', 'question', 'unsure', 'confused'] },
  ];
  
  const textLower = text.toLowerCase();
  const topics: Array<{ topic: string; weight: number; subtopics: string[] }> = [];
  
  commonTopics.forEach(({ topic, keywords }) => {
    const matches = keywords.filter(keyword => textLower.includes(keyword));
    if (matches.length > 0) {
      topics.push({
        topic,
        weight: matches.length / keywords.length,
        subtopics: matches,
      });
    }
  });
  
  return topics.sort((a, b) => b.weight - a.weight).slice(0, 5);
}

// Get trend analysis if tracking over time
async function getTrendAnalysis(
  clientId: string | undefined,
  context: string,
  currentScore: number,
  supabase: any
): Promise<{
  previousScore: number | null;
  trend: 'improving' | 'declining' | 'stable' | 'volatile' | 'first_analysis';
  changeMagnitude: number;
  consistencyScore: number;
} | null> {
  if (!clientId) return null;
  
  try {
    // Get previous sentiment analyses for this client
    const { data: previousAnalyses, error } = await supabase
      .from('sentiment_analyses')
      .select('sentiment_score, analyzed_at')
      .eq('client_id', clientId)
      .eq('context', context)
      .order('analyzed_at', { ascending: false })
      .limit(5);
    
    if (error || !previousAnalyses || previousAnalyses.length === 0) {
      return {
        previousScore: null,
        trend: 'first_analysis',
        changeMagnitude: 0,
        consistencyScore: 0,
      };
    }
    
    const previousScore = previousAnalyses[0].sentiment_score;
    const change = currentScore - previousScore;
    
    // Determine trend
    let trend: 'improving' | 'declining' | 'stable' | 'volatile' = 'stable';
    if (change > 0.3) trend = 'improving';
    else if (change < -0.3) trend = 'declining';
    else if (Math.abs(change) < 0.1) trend = 'stable';
    else trend = 'volatile';
    
    // Calculate consistency (variance of previous scores)
    const scores = previousAnalyses.map(a => a.sentiment_score);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const consistencyScore = Math.max(0, 1 - variance); // 1 = perfectly consistent
    
    return {
      previousScore,
      trend,
      changeMagnitude: Math.abs(change),
      consistencyScore,
    };
    
  } catch (error) {
    console.error('Error getting trend analysis:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse and validate request
    const body = await request.json();
    const validationResult = SentimentAnalysisRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // Perform sentiment analysis
    const sentiment = analyzeSentiment(data.text, data.context);
    
    // Detect emotions
    const emotions = detectEmotions(data.text, data.analyzeEmotions);
    
    // Extract key phrases
    const keyPhrases = extractKeyPhrases(data.text, data.extractKeyPhrases);
    
    // Extract topics
    const topics = extractTopics(data.text);
    
    // Detect urgency
    const urgency = detectUrgency(data.text, data.detectUrgency);
    
    // Get recommendations based on sentiment
    const recommendations = COACHING_RECOMMENDMENTS[sentiment.label as keyof typeof COACHING_RECOMMENDATIONS] || [];
    
    // Get trend analysis if tracking over time
    let trends = null;
    if (data.trackOverTime && data.clientId) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        trends = await getTrendAnalysis(data.clientId, data.context, sentiment.score, supabase);
      }
    }
    
    // Save analysis to database if clientId provided
    const analysisId = `sentiment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (data.clientId) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        try {
          await supabase.from('sentiment_analyses').insert({
            id: analysisId,
            client_id: data.clientId,
            checkin_id: data.checkinId,
            conversation_id: data.conversationId,
            context: data.context,
            text: data.text,
            sentiment_score: sentiment.score,
            sentiment_label: sentiment.label,
            confidence: sentiment.confidence,
            primary_emotion: emotions.primary,
            secondary_emotions: emotions.secondary,
            emotion_intensity: emotions.intensity,
            urgency_level: urgency.level,
            urgency_score: urgency.score,
            key_phrases: keyPhrases,
            topics: topics,
            recommendations: recommendations,
            analyzed_at: new Date().toISOString(),
          });
        } catch (dbError) {
          console.error('Failed to save sentiment analysis to database:', dbError);
          // Continue even if database save fails
        }
      }
    }
    
    // Prepare response
    const processingTimeMs = Date.now() - startTime;
    const response: SentimentAnalysisResponse = {
      success: true,
      analysisId,
      sentiment: {
        overall: {
          score: sentiment.score,
          label: sentiment.label as any,
          confidence: sentiment.confidence,
        },
        byAspect: sentiment.aspects,
        emotions,
      },
      insights: {
        keyPhrases,
        topics,
        urgency,
        recommendations,
      },
      metadata: {
        textLength: data.text.length,
        wordCount: data.text.split(/\s+/).length,
        readingLevel: 'intermediate', // Simplified - would use actual readability formula
        processingTimeMs,
        modelVersion: '1.0.0',
        analyzedAt: new Date().toISOString(),
      },
      trends,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error performing sentiment analysis:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // GET endpoint for retrieving sentiment analysis history
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const limit = parseInt(searchParams.get('limit') || '20');
  
  if (!clientId) {
    return NextResponse.json(
      { success: false, error: 'clientId query parameter is required' },
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
      .from('sentiment_analyses')
      .select('*')
      .eq('client_id', clientId)
      .order('analyzed_at', { ascending: false })
      .limit(limit);
    
    if (startDate) {
      query = query.gte('analyzed_at', startDate);
    }
    if (endDate) {
      query = query.lte('analyzed_at', endDate);
    }
    
    const { data: analyses, error } = await query;
    
    if (error) throw error;
    
    // Calculate trends and statistics
    const scores = analyses.map(a => a.sentiment_score);
    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    const recentTrend = scores.length >= 2 ? scores[0] - scores[1] : 0;
    
    const statistics = {
      totalAnalyses: analyses.length,
      averageScore,
      recentTrend,
      sentimentDistribution: {
        very_negative: analyses.filter(a => a.sentiment_label === 'very_negative').length,
        negative: analyses.filter(a => a.sentiment_label === 'negative').length,
        neutral: analyses.filter(a => a.sentiment_label === 'neutral').length,
        positive: analyses.filter(a => a.sentiment_label === 'positive').length,
        very_positive: analyses.filter(a => a.sentiment_label === 'very_positive').length,
      },
      commonEmotions: Array.from(
        analyses.reduce((acc, analysis) => {
          const emotion = analysis.primary_emotion;
          acc.set(emotion, (acc.get(emotion) || 0) + 1);
          return acc;
        }, new Map<string, number>())
      )
        .map(([emotion, count]) => ({ emotion, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      urgencyLevels: {
        none: analyses.filter(a => a.urgency_level === 'none').length,
        low: analyses.filter(a => a.urgency_level === 'low').length,
        medium: analyses.filter(a => a.urgency_level === 'medium').length,
        high: analyses.filter(a => a.urgency_level === 'high').length,
        critical: analyses.filter(a => a.urgency_level === 'critical').length,
      },
    };
    
    return NextResponse.json({
      success: true,
      analyses,
      statistics,
      total: analyses.length,
    });
    
  } catch (error) {
    console.error('Error retrieving sentiment analyses:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
