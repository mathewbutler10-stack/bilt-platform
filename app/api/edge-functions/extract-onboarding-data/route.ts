import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Schema for onboarding data extraction
const ExtractOnboardingDataRequestSchema = z.object({
  conversationId: z.string().uuid(),
  messages: z.array(z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    timestamp: z.string().datetime(),
  })),
  clientId: z.string().uuid().optional(),
  extractAll: z.boolean().default(true),
  specificFields: z.array(z.enum([
    'goals',
    'challenges',
    'preferences',
    'biometrics',
    'lifestyle',
    'medical',
    'training_history',
    'nutrition_habits',
    'motivation_factors',
    'expectations',
  ])).optional(),
  language: z.enum(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']).default('en'),
  confidenceThreshold: z.number().min(0).max(1).default(0.7),
});

type ExtractOnboardingDataRequest = z.infer<typeof ExtractOnboardingDataRequestSchema>;
type OnboardingDataResponse = {
  success: boolean;
  extractionId: string;
  clientId: string;
  extractedData: {
    goals: Array<{
      type: 'weight_loss' | 'muscle_gain' | 'performance' | 'health' | 'recomposition' | 'other';
      description: string;
      target: string;
      timeline: string;
      priority: number;
      confidence: number;
      sourceMessages: string[];
    }>;
    challenges: Array<{
      category: 'time' | 'motivation' | 'knowledge' | 'resources' | 'health' | 'environment' | 'other';
      description: string;
      impact: 'low' | 'medium' | 'high';
      solutionsMentioned: string[];
      confidence: number;
      sourceMessages: string[];
    }>;
    preferences: {
      dietary: Array<{
        type: 'allergy' | 'intolerance' | 'preference' | 'lifestyle' | 'religious';
        item: string;
        severity: 'mild' | 'moderate' | 'severe';
        description: string;
        confidence: number;
      }>;
      training: Array<{
        type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'classes' | 'home' | 'gym';
        preference: 'enjoys' | 'dislikes' | 'neutral' | 'avoids';
        description: string;
        confidence: number;
      }>;
      schedule: {
        preferredDays: string[];
        preferredTimes: string[];
        availability: string;
        constraints: string[];
        confidence: number;
      };
    };
    biometrics: {
      age: number | null;
      biologicalSex: 'male' | 'female' | 'other' | null;
      weightKg: number | null;
      heightCm: number | null;
      bodyFatPercentage: number | null;
      fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | 'elite' | null;
      confidence: number;
    };
    lifestyle: {
      occupation: string | null;
      activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active' | null;
      sleepHours: number | null;
      stressLevel: 'low' | 'medium' | 'high' | null;
      alcoholConsumption: 'none' | 'light' | 'moderate' | 'heavy' | null;
      smoking: 'never' | 'former' | 'current' | null;
      confidence: number;
    };
    medical: {
      conditions: Array<{
        condition: string;
        status: 'active' | 'managed' | 'resolved' | 'history';
        impact: 'none' | 'mild' | 'moderate' | 'severe';
        medications: string[];
        confidence: number;
      }>;
      injuries: Array<{
        injury: string;
        status: 'acute' | 'chronic' | 'recovered' | 'managing';
        location: string;
        limitations: string[];
        confidence: number;
      }>;
      parqFlags: Array<{
        question: string;
        answer: 'yes' | 'no' | 'unsure';
        details: string;
        requiresClearence: boolean;
        confidence: number;
      }>;
      confidence: number;
    };
    trainingHistory: {
      experienceYears: number | null;
      previousPrograms: Array<{
        type: string;
        duration: string;
        success: 'yes' | 'partial' | 'no';
        takeaways: string;
        confidence: number;
      }>;
      currentActivity: string | null;
      injuriesHistory: string[];
      confidence: number;
    };
    nutritionHabits: {
      typicalDay: Array<{
        meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
        description: string;
        timing: string;
        confidence: number;
      }>;
      cookingAbility: 'none' | 'basic' | 'intermediate' | 'advanced' | null;
      mealPreparation: 'never' | 'rarely' | 'sometimes' | 'often' | 'always' | null;
      eatingOutFrequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily' | null;
      hydration: 'poor' | 'adequate' | 'good' | 'excellent' | null;
      supplements: Array<{
        supplement: string;
        dosage: string;
        frequency: string;
        confidence: number;
      }>;
      confidence: number;
    };
    motivationFactors: {
      intrinsic: Array<{
        factor: 'health' | 'appearance' | 'performance' | 'confidence' | 'energy' | 'longevity' | 'other';
        importance: number;
        description: string;
        confidence: number;
      }>;
      extrinsic: Array<{
        factor: 'social' | 'professional' | 'family' | 'event' | 'competition' | 'other';
        importance: number;
        description: string;
        confidence: number;
      }>;
      barriers: Array<{
        barrier: string;
        severity: 'low' | 'medium' | 'high';
        solutions: string[];
        confidence: number;
      }>;
      confidence: number;
    };
    expectations: {
      coachRole: Array<{
        expectation: 'educator' | 'motivator' | 'accountability' | 'planner' | 'supporter' | 'expert';
        importance: number;
        description: string;
        confidence: number;
      }>;
      programExpectations: Array<{
        aspect: 'flexibility' | 'structure' | 'communication' | 'results' | 'support' | 'education';
        expectation: string;
        importance: number;
        confidence: number;
      }>;
      successDefinition: string | null;
      concerns: string[];
      confidence: number;
    };
  };
  confidenceScores: {
    overall: number;
    byCategory: {
      goals: number;
      challenges: number;
      preferences: number;
      biometrics: number;
      lifestyle: number;
      medical: number;
      trainingHistory: number;
      nutritionHabits: number;
      motivationFactors: number;
      expectations: number;
    };
  };
  completeness: {
    percentage: number;
    missingFields: string[];
    recommendedFollowUps: Array<{
      field: string;
      question: string;
      priority: 'low' | 'medium' | 'high';
      rationale: string;
    }>;
  };
  metadata: {
    messagesAnalyzed: number;
    extractionTimeMs: number;
    modelVersion: string;
    extractedAt: string;
  };
};

// Goal extraction patterns
const GOAL_PATTERNS = {
  weight_loss: [
    'lose weight', 'weight loss', 'slim down', 'burn fat', 'reduce body fat', 'get lean',
    'drop pounds', 'shed weight', 'tone up', 'get in shape', 'fit into clothes'
  ],
  muscle_gain: [
    'build muscle', 'gain muscle', 'get bigger', 'add mass', 'bulk up', 'strength',
    'get stronger', 'muscle growth', 'hypertrophy', 'size'
  ],
  performance: [
    'improve performance', 'get faster', 'increase endurance', 'better at sports',
    'athletic performance', 'compete', 'race', 'game ready', 'peak performance'
  ],
  health: [
    'improve health', 'better health', 'healthier', 'reduce risk', 'prevent disease',
    'manage condition', 'blood pressure', 'cholesterol', 'blood sugar', 'longevity'
  ],
  recomposition: [
    'recomposition', 'body recomposition', 'change body composition', 'lose fat gain muscle',
    'toned', 'defined', 'sculpt', 'transform body'
  ],
};

// Challenge extraction patterns
const CHALLENGE_PATTERNS = {
  time: ['no time', 'busy', 'schedule', 'work hours', 'family time', 'travel', 'commute'],
  motivation: ['lack motivation', 'unmotivated', 'hard to stay consistent', 'discipline', 'willpower'],
  knowledge: ["don't know how", 'confused', 'unsure', 'need guidance', 'information', 'education'],
  resources: ['no equipment', 'no gym', 'budget', 'cost', 'space', 'facilities'],
  health: ['injuries', 'pain', 'health issues', 'conditions', 'limitations', 'recovery'],
  environment: ['unsupportive family', 'work environment', 'social pressure', 'travel', 'climate'],
};

// Medical condition patterns
const MEDICAL_PATTERNS = {
  conditions: [
    'diabetes', 'hypertension', 'high blood pressure', 'heart condition', 'asthma',
    'arthritis', 'back pain', 'knee pain', 'shoulder pain', 'migraine', 'anxiety',
    'depression', 'thyroid', 'autoimmune', 'allergies', 'digestive issues'
  ],
  injuries: [
    'torn', 'sprain', 'strain', 'fracture', 'break', 'dislocation', 'surgery',
    'ACL', 'meniscus', 'rotator cuff', 'herniated disc', 'sciatica', 'tendonitis'
  ],
};

// Extract goals from conversation
function extractGoals(messages: any[], language: string, confidenceThreshold: number) {
  const goals: Array<{
    type: 'weight_loss' | 'muscle_gain' | 'performance' | 'health' | 'recomposition' | 'other';
    description: string;
    target: string;
    timeline: string;
    priority: number;
    confidence: number;
    sourceMessages: string[];
  }> = [];
  
  const userMessages = messages.filter(m => m.role === 'user');
  const goalMessages: string[] = [];
  
  userMessages.forEach(message => {
    const text = message.content.toLowerCase();
    
    // Check for each goal type
    for (const [goalType, patterns] of Object.entries(GOAL_PATTERNS)) {
      const matchingPatterns = patterns.filter(pattern => text.includes(pattern));
      
      if (matchingPatterns.length > 0) {
        // Extract target (e.g., "lose 10kg", "gain 5kg muscle")
        let target = '';
        const weightMatch = text.match(/(lose|gain|drop|shed)\s+(\d+)\s*(kg|kilos|kilograms|pounds|lbs)/i);
        if (weightMatch) {
          target = `${weightMatch[1]} ${weightMatch[2]} ${weightMatch[3]}`;
        }
        
        // Extract timeline
        let timeline = '';
        const timelineMatch = text.match(/(in|within|by)\s+(\d+)\s*(weeks|months|days|years)/i);
        if (timelineMatch) {
          timeline = `${timelineMatch[2]} ${timelineMatch[3]}`;
        }
        
        // Calculate confidence based on pattern matches and context
        const confidence = Math.min(0.95, 0.5 + (matchingPatterns.length * 0.1));
        
        if (confidence >= confidenceThreshold) {
          goals.push({
            type: goalType as any,
            description: matchingPatterns.join(', '),
            target,
            timeline,
            priority: matchingPatterns.length, // More mentions = higher priority
            confidence,
            sourceMessages: [message.content.substring(0, 100) + '...'],
          });
          
          goalMessages.push(message.id);
        }
      }
    }
    
    // Check for "other" goals not covered by patterns
    const goalKeywords = ['goal', 'want to', 'would like to', 'aim to', 'hope to', 'objective'];
    const hasGoalKeyword = goalKeywords.some(keyword => text.includes(keyword));
    const hasGoalContent = text.length > 20 && (text.includes('improve') || text.includes('better') || text.includes('achieve'));
    
    if (hasGoalKeyword && hasGoalContent && !goalMessages.includes(message.id)) {
      // Extract the goal sentence
      const sentences = message.content.split(/[.!?]+/);
      const goalSentence = sentences.find(s => 
        goalKeywords.some(keyword => s.toLowerCase().includes(keyword))
      );
      
      if (goalSentence) {
        goals.push({
          type: 'other',
          description: goalSentence.trim(),
          target: '',
          timeline: '',
          priority: 1,
          confidence: 0.6,
          sourceMessages: [message.content.substring(0, 100) + '...'],
        });
      }
    }
  });
  
  // Remove duplicates and sort by priority
  const uniqueGoals = Array.from(
    new Map(goals.map(goal => [goal.description, goal])).values()
  ).sort((a, b) => b.priority - a.priority);
  
  return uniqueGoals;
}

// Extract challenges from conversation
function extractChallenges(messages: any[], confidenceThreshold: number) {
  const challenges: Array<{
    category: 'time' | 'motivation' | 'knowledge' | 'resources' | 'health' | 'environment' | 'other';
    description: string;
    impact: 'low' | 'medium' | 'high';
    solutionsMentioned: string[];
    confidence: number;
    sourceMessages: string[];
  }> = [];
  
  const userMessages = messages.filter(m => m.role === 'user');
  
  userMessages.forEach(message => {
    const text = message.content.toLowerCase();
    
    // Check for each challenge category
    for (const [category, patterns] of Object.entries(CHALLENGE_PATTERNS)) {
      const matchingPatterns = patterns.filter(pattern => text.includes(pattern));
      
      if (matchingPatterns.length > 0) {
        // Determine impact based on language intensity
        let impact: 'low' | 'medium' | 'high' = 'medium';
        if (text.includes('really') || text.includes('very') || text.includes('extremely')) {
          impact = 'high';
        } else if (text.includes('sometimes') || text.includes('occasionally')) {
          impact = 'low';
        }
        
        // Look for solutions mentioned
        const solutions: string[] = [];
        const solutionIndicators = ['try', 'attempt', 'plan to', 'will', 'going to', 'hope to'];
        solutionIndicators.forEach(indicator => {
          if (text.includes(indicator)) {
            const sentences = message.content.split(/[.!?]+/);
            const solutionSentence = sentences.find(s => s.toLowerCase().includes(indicator));
            if (solutionSentence) {
              solutions.push(solutionSentence.trim());
            }
          }
        });
        
        const confidence = Math.min(0.95, 0.4 + (matchingPatterns.length * 0.15));
        
        if (confidence >= confidenceThreshold) {
          challenges.push({
            category: category as any,
            description: matchingPatterns.join(', '),
            impact,
            solutionsMentioned: solutions,
            confidence,
            sourceMessages: [message.content.substring(0, 100) + '...'],
          });
        }
      }
    }
    
    // Check for "other" challenges
    const challengeKeywords = ['struggle', 'difficult', 'hard', 'challenge', 'problem', 'issue', 'barrier'];
    const hasChallengeKeyword = challengeKeywords.some(keyword => text.includes(keyword));
    const hasChallengeContent = text.length > 30;
    
    if (hasChallengeKeyword && hasChallengeContent) {
      // Extract the challenge description
      const sentences = message.content.split(/[.!?]+/);
      const challengeSentence = sentences.find(s => 
        challengeKeywords.some(keyword => s.toLowerCase().includes(keyword))
      );
      
      if (challengeSentence) {
        challenges.push({
          category: 'other',
          description: challengeSentence.trim(),
          impact: 'medium',
          solutionsMentioned: [],
          confidence: 0.5,
          sourceMessages: [message.content.substring(0, 100) + '...'],
        });
      }
    }
  });
  
  return Array.from(new Map(challenges.map(c => [c.description, c])).values());
}

// Extract biometrics from conversation
function extractBiometrics(messages: any[]) {
  const userMessages = messages.filter(m => m.role === 'user');
  let age: number | null = null;
  let biologicalSex: 'male' | 'female' | 'other' | null = null;
  let weightKg: number | null = null;
  let heightCm: number | null = null;
  let bodyFatPercentage: number | null = null;
  let fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | 'elite' | null = null;
  let confidence = 0;
  
  userMessages.forEach(message => {
    const text = message.content.toLowerCase();
    
    // Extract age
    const ageMatch = text.match(/(\d+)\s*(years old|yo|y\.o\.|year old|years)/i);
    if (ageMatch && !age) {
      age = parseInt(ageMatch[1]);
      confidence += 0.1;
    }
    
    // Extract biological sex
    if (text.includes('male') || text.includes('man') || text.includes('guy')) {
      biologicalSex = 'male';
      confidence += 0.1;
    } else if (text.includes('female') || text.includes('woman') || text.includes('lady')) {
      biologicalSex = 'female';
      confidence += 0.1;
    }
    
    // Extract weight
    const weightMatch = text.match(/(\d+)\s*(kg|kilos|kilograms)/i) || 
                       text.match(/(\d+)\s*(pounds|lbs)/i);
    if (weightMatch && !weightKg) {
      weightKg = parseInt(weightMatch[1]);
      if (weightMatch[2].toLowerCase().includes('pound') || weightMatch[2].toLowerCase().includes('lbs')) {
        weightKg = Math.round(weightKg * 0.453592); // Convert pounds to kg
      }
      confidence += 0.1;
    }
    
    // Extract height
    const heightMatch = text.match(/(\d+)\s*(cm|centimeters)/i) ||
                       text.match(/(\d)'\s*(\d*)"/i) ||
                       text.match(/(\d+)\s*(feet|ft)/i);
    if (heightMatch && !heightCm) {
      if (heightMatch[2].toLowerCase().includes('cm')) {
        heightCm = parseInt(heightMatch[1]);
      } else if (heightMatch[0].includes("'")) {
        // Feet and inches format: 5'10"
        const feet = parseInt(heightMatch[1]);
        const inches = heightMatch[2] ? parseInt(heightMatch[2]) : 0;
        heightCm = Math.round((feet * 12 + inches) * 2.54);
      } else if (heightMatch[2].toLowerCase().includes('feet') || heightMatch[2].toLowerCase().includes('ft')) {
        const feet = parseInt(heightMatch[1]);
        heightCm = Math.round(feet * 30.48);
      }
      confidence += 0.1;
    }
    
    // Extract body fat percentage
    const bfMatch = text.match(/(\d+)\s*(%|percent)\s*body fat/i) ||
                    text.match(/body fat\s*(\d+)\s*(%|percent)/i);
    if (bfMatch && !bodyFatPercentage) {
      bodyFatPercentage = parseInt(bfMatch[1]);
      confidence += 0.1;
    }
    
    // Determine fitness level
    if (text.includes('beginner') || text.includes('new') || text.includes('starting')) {
      fitnessLevel = 'beginner';
      confidence += 0.1;
    } else if (text.includes('intermediate') || text.includes('some experience')) {
      fitnessLevel = 'intermediate';
      confidence += 0.1;
    } else if (text.includes('advanced') || text.includes('experienced')) {
      fitnessLevel = 'advanced';
      confidence += 0.1;
    } else if (text.includes('elite') || text.includes('athlete') || text.includes('competitor')) {
      fitnessLevel = 'elite';
      confidence += 0.1;
    }
  });
  
  return {
    age,
    biologicalSex,
    weightKg,
    heightCm,
    bodyFatPercentage,
    fitnessLevel,
    confidence: Math.min(1, confidence),
  };
}

// Extract lifestyle information
function extractLifestyle(messages: any[]) {
  const userMessages = messages.filter(m => m.role === 'user');
  let occupation: string | null = null;
  let activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active' | null = null;
  let sleepHours: number | null = null;
  let stressLevel: 'low' | 'medium' | 'high' | null = null;
  let alcoholConsumption: 'none' | 'light' | 'moderate' | 'heavy' | null = null;
  let smoking: 'never' | 'former' | 'current' | null = null;
  let confidence = 0;
  
  const occupationKeywords = ['work', 'job', 'occupation', 'profession', 'career'];
  const activityKeywords = {
    sedentary: ['sedentary', 'desk job', 'office work', 'sit all day', 'not active'],
    lightly_active: ['lightly active', 'walk sometimes', 'occasional exercise', 'moderate activity'],
    moderately_active: ['moderately active', 'exercise regularly', 'work out', 'active lifestyle'],
    very_active: ['very active', 'exercise daily', 'train regularly', 'athletic'],
    extra_active: ['extra active', 'professional athlete', 'train multiple times', 'endurance athlete'],
  };
  
  userMessages.forEach(message => {
    const text = message.content.toLowerCase();
    
    // Extract occupation
    if (!occupation) {
      for (const keyword of occupationKeywords) {
        if (text.includes(keyword)) {
          // Try to extract occupation from context
          const sentences = message.content.split(/[.!?]+/);
          const occupationSentence = sentences.find(s => s.toLowerCase().includes(keyword));
          if (occupationSentence) {
            // Simple extraction - in production would use NLP
            occupation = occupationSentence.trim().substring(0, 50);
            confidence += 0.1;
            break;
          }
        }
      }
    }
    
    // Determine activity level
    if (!activityLevel) {
      for (const [level, keywords] of Object.entries(activityKeywords)) {
        if (keywords.some(keyword => text.includes(keyword))) {
          activityLevel = level as any;
          confidence += 0.1;
          break;
        }
      }
    }
    
    // Extract sleep hours
    const sleepMatch = text.match(/(\d+)\s*(hours|hrs)\s*sleep/i) ||
                      text.match(/sleep\s*(\d+)\s*(hours|hrs)/i);
    if (sleepMatch && !sleepHours) {
      sleepHours = parseInt(sleepMatch[1]);
      confidence += 0.1;
    }
    
    // Determine stress level
    if (!stressLevel) {
      if (text.includes('high stress') || text.includes('very stressed') || text.includes('overwhelmed')) {
        stressLevel = 'high';
        confidence += 0.1;
      } else if (text.includes('moderate stress') || text.includes('some stress')) {
        stressLevel = 'medium';
        confidence += 0.1;
      } else if (text.includes('low stress') || text.includes('not stressed')) {
        stressLevel = 'low';
        confidence += 0.1;
      }
    }
    
    // Determine alcohol consumption
    if (!alcoholConsumption) {
      if (text.includes('no alcohol') || text.includes("don't drink") || text.includes('never drink')) {
        alcoholConsumption = 'none';
        confidence += 0.1;
      } else if (text.includes('light drinking') || text.includes('occasional drink')) {
        alcoholConsumption = 'light';
        confidence += 0.1;
      } else if (text.includes('moderate drinking') || text.includes('social drinker')) {
        alcoholConsumption = 'moderate';
        confidence += 0.1;
      } else if (text.includes('heavy drinking') || text.includes('drink a lot')) {
        alcoholConsumption = 'heavy';
        confidence += 0.1;
      }
    }
    
    // Determine smoking status
    if (!smoking) {
      if (text.includes('never smoked') || text.includes('non-smoker')) {
        smoking = 'never';
        confidence += 0.1;
      } else if (text.includes('former smoker') || text.includes('quit smoking')) {
        smoking = 'former';
        confidence += 0.1;
      } else if (text.includes('current smoker') || text.includes('smoke')) {
        smoking = 'current';
        confidence += 0.1;
      }
    }
  });
  
  return {
    occupation,
    activityLevel,
    sleepHours,
    stressLevel,
    alcoholConsumption,
    smoking,
    confidence: Math.min(1, confidence),
  };
}

// Calculate completeness percentage
function calculateCompleteness(extractedData: any) {
  const fields = [
    { category: 'goals', weight: 0.15, value: extractedData.goals.length > 0 ? 1 : 0 },
    { category: 'challenges', weight: 0.10, value: extractedData.challenges.length > 0 ? 1 : 0 },
    { category: 'preferences', weight: 0.10, value: Object.keys(extractedData.preferences).length > 0 ? 1 : 0 },
    { category: 'biometrics', weight: 0.15, value: extractedData.biometrics.confidence > 0.3 ? 1 : 0 },
    { category: 'lifestyle', weight: 0.10, value: extractedData.lifestyle.confidence > 0.3 ? 1 : 0 },
    { category: 'medical', weight: 0.10, value: extractedData.medical.confidence > 0.3 ? 1 : 0 },
    { category: 'trainingHistory', weight: 0.10, value: extractedData.trainingHistory.confidence > 0.3 ? 1 : 0 },
    { category: 'nutritionHabits', weight: 0.10, value: extractedData.nutritionHabits.confidence > 0.3 ? 1 : 0 },
    { category: 'motivationFactors', weight: 0.05, value: extractedData.motivationFactors.confidence > 0.3 ? 1 : 0 },
    { category: 'expectations', weight: 0.05, value: extractedData.expectations.confidence > 0.3 ? 1 : 0 },
  ];
  
  const percentage = fields.reduce((sum, field) => sum + (field.value * field.weight), 0) * 100;
  const missingFields = fields.filter(f => f.value === 0).map(f => f.category);
  
  // Generate recommended follow-up questions
  const recommendedFollowUps = missingFields.map(field => {
    const questions = {
      goals: "What are your primary fitness and health goals?",
      challenges: "What challenges have you faced with fitness/nutrition in the past?",
      preferences: "Do you have any dietary preferences or restrictions?",
      biometrics: "Can you share your age, weight, and height?",
      lifestyle: "What does your typical daily schedule look like?",
      medical: "Do you have any medical conditions or injuries I should know about?",
      trainingHistory: "What's your experience with exercise and training?",
      nutritionHabits: "How would you describe your current eating habits?",
      motivationFactors: "What motivates you to make health and fitness changes?",
      expectations: "What do you expect from a coaching program?",
    };
    
    return {
      field,
      question: questions[field as keyof typeof questions],
      priority: field === 'medical' || field === 'biometrics' ? 'high' : 
                field === 'goals' || field === 'challenges' ? 'medium' : 'low',
      rationale: field === 'medical' ? 'Safety-critical information' :
                 field === 'biometrics' ? 'Required for personalized planning' :
                 field === 'goals' ? 'Foundation for program design' :
                 'Important for personalized approach',
    };
  });
  
  return {
    percentage: Math.round(percentage),
    missingFields,
    recommendedFollowUps,
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse and validate request
    const body = await request.json();
    const validationResult = ExtractOnboardingDataRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // Extract data from conversation
    const goals = extractGoals(data.messages, data.language, data.confidenceThreshold);
    const challenges = extractChallenges(data.messages, data.confidenceThreshold);
    const biometrics = extractBiometrics(data.messages);
    const lifestyle = extractLifestyle(data.messages);
    
    // For now, return simplified structure - in production would extract all fields
    const extractedData = {
      goals,
      challenges,
      preferences: {
        dietary: [],
        training: [],
        schedule: {
          preferredDays: [],
          preferredTimes: [],
          availability: '',
          constraints: [],
          confidence: 0,
        },
      },
      biometrics,
      lifestyle,
      medical: {
        conditions: [],
        injuries: [],
        parqFlags: [],
        confidence: 0,
      },
      trainingHistory: {
        experienceYears: null,
        previousPrograms: [],
        currentActivity: null,
        injuriesHistory: [],
        confidence: 0,
      },
      nutritionHabits: {
        typicalDay: [],
        cookingAbility: null,
        mealPreparation: null,
        eatingOutFrequency: null,
        hydration: null,
        supplements: [],
        confidence: 0,
      },
      motivationFactors: {
        intrinsic: [],
        extrinsic: [],
        barriers: [],
        confidence: 0,
      },
      expectations: {
        coachRole: [],
        programExpectations: [],
        successDefinition: null,
        concerns: [],
        confidence: 0,
      },
    };
    
    // Calculate completeness
    const completeness = calculateCompleteness(extractedData);
    
    // Calculate confidence scores
    const confidenceScores = {
      overall: Math.min(1, 
        (goals.reduce((sum, g) => sum + g.confidence, 0) / Math.max(1, goals.length)) * 0.3 +
        (challenges.reduce((sum, c) => sum + c.confidence, 0) / Math.max(1, challenges.length)) * 0.2 +
        biometrics.confidence * 0.3 +
        lifestyle.confidence * 0.2
      ),
      byCategory: {
        goals: goals.length > 0 ? goals.reduce((sum, g) => sum + g.confidence, 0) / goals.length : 0,
        challenges: challenges.length > 0 ? challenges.reduce((sum, c) => sum + c.confidence, 0) / challenges.length : 0,
        preferences: 0,
        biometrics: biometrics.confidence,
        lifestyle: lifestyle.confidence,
        medical: 0,
        trainingHistory: 0,
        nutritionHabits: 0,
        motivationFactors: 0,
        expectations: 0,
      },
    };
    
    // Save to database if clientId provided
    const extractionId = `extraction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (data.clientId) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        try {
          await supabase.from('onboarding_extractions').insert({
            id: extractionId,
            conversation_id: data.conversationId,
            client_id: data.clientId,
            extracted_data: extractedData,
            confidence_scores: confidenceScores,
            completeness: completeness.percentage,
            missing_fields: completeness.missingFields,
            extraction_time_ms: Date.now() - startTime,
            extracted_at: new Date().toISOString(),
          });
        } catch (dbError) {
          console.error('Failed to save onboarding extraction to database:', dbError);
          // Continue even if database save fails
        }
      }
    }
    
    // Prepare response
    const response: OnboardingDataResponse = {
      success: true,
      extractionId,
      clientId: data.clientId || 'unknown',
      extractedData,
      confidenceScores,
      completeness,
      metadata: {
        messagesAnalyzed: data.messages.length,
        extractionTimeMs: Date.now() - startTime,
        modelVersion: '1.0.0',
        extractedAt: new Date().toISOString(),
      },
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error extracting onboarding data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // GET endpoint for retrieving onboarding extractions
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  const conversationId = searchParams.get('conversationId');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  if (!clientId && !conversationId) {
    return NextResponse.json(
      { success: false, error: 'Either clientId or conversationId query parameter is required' },
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
      .from('onboarding_extractions')
      .select('*')
      .order('extracted_at', { ascending: false })
      .limit(limit);
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (conversationId) {
      query = query.eq('conversation_id', conversationId);
    }
    
    const { data: extractions, error } = await query;
    
    if (error) throw error;
    
    // Calculate statistics
    const statistics = {
      totalExtractions: extractions.length,
      averageCompleteness: extractions.length > 0 
        ? extractions.reduce((sum, e) => sum + e.completeness, 0) / extractions.length 
        : 0,
      averageConfidence: extractions.length > 0
        ? extractions.reduce((sum, e) => sum + e.confidence_scores.overall, 0) / extractions.length
        : 0,
      commonMissingFields: Array.from(
        extractions.reduce((acc, extraction) => {
          extraction.missing_fields?.forEach((field: string) => {
            acc.set(field, (acc.get(field) || 0) + 1);
          });
          return acc;
        }, new Map<string, number>())
      )
        .map(([field, count]) => ({ field, count }))
        .sort((a, b) => b.count - a.count),
      extractionTimes: {
        fastest: extractions.length > 0 ? Math.min(...extractions.map(e => e.extraction_time_ms)) : 0,
        slowest: extractions.length > 0 ? Math.max(...extractions.map(e => e.extraction_time_ms)) : 0,
        average: extractions.length > 0 ? extractions.reduce((sum, e) => sum + e.extraction_time_ms, 0) / extractions.length : 0,
      },
    };
    
    return NextResponse.json({
      success: true,
      extractions,
      statistics,
      total: extractions.length,
    });
    
  } catch (error) {
    console.error('Error retrieving onboarding extractions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
