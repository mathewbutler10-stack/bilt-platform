import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Schema for nutrition target calculation
const NutritionTargetRequestSchema = z.object({
  clientId: z.string().uuid(),
  goalType: z.enum(['fat_loss', 'muscle_gain', 'maintenance', 'performance', 'recomposition']),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']),
  biometrics: z.object({
    age: z.number().min(18).max(100),
    biologicalSex: z.enum(['male', 'female', 'other']),
    weightKg: z.number().positive(),
    heightCm: z.number().positive(),
    bodyFatPercentage: z.number().min(5).max(60).optional(),
  }),
  preferences: z.object({
    proteinPreference: z.enum(['moderate', 'high', 'very_high']).default('moderate'),
    carbPreference: z.enum(['moderate', 'low', 'very_low']).default('moderate'),
    dietaryLifestyle: z.enum(['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'halal', 'kosher', 'other']).default('omnivore'),
  }).optional(),
});

type NutritionTargetRequest = z.infer<typeof NutritionTargetRequestSchema>;
type NutritionTargetResponse = {
  success: boolean;
  targets: {
    bmr: number;
    tdee: number;
    dailyCalories: number;
    proteinGrams: number;
    carbGrams: number;
    fatGrams: number;
    proteinPercentage: number;
    carbPercentage: number;
    fatPercentage: number;
    mealPlan: Array<{
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      calories: number;
      proteinGrams: number;
      carbGrams: number;
      fatGrams: number;
    }>;
  };
  recommendations: string[];
};

// Activity level multipliers
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

// Goal adjustments
const GOAL_ADJUSTMENTS = {
  fat_loss: -500, // 500 calorie deficit
  muscle_gain: 300, // 300 calorie surplus
  maintenance: 0,
  performance: 200, // slight surplus for performance
  recomposition: -250, // slight deficit for recomposition
};

// Macro ratios by goal and preference
const MACRO_RATIOS = {
  fat_loss: {
    moderate: { protein: 0.30, carbs: 0.40, fat: 0.30 },
    high: { protein: 0.35, carbs: 0.35, fat: 0.30 },
    very_high: { protein: 0.40, carbs: 0.30, fat: 0.30 },
  },
  muscle_gain: {
    moderate: { protein: 0.30, carbs: 0.50, fat: 0.20 },
    high: { protein: 0.35, carbs: 0.45, fat: 0.20 },
    very_high: { protein: 0.40, carbs: 0.40, fat: 0.20 },
  },
  maintenance: {
    moderate: { protein: 0.25, carbs: 0.50, fat: 0.25 },
    high: { protein: 0.30, carbs: 0.45, fat: 0.25 },
    very_high: { protein: 0.35, carbs: 0.40, fat: 0.25 },
  },
  performance: {
    moderate: { protein: 0.25, carbs: 0.55, fat: 0.20 },
    high: { protein: 0.30, carbs: 0.50, fat: 0.20 },
    very_high: { protein: 0.35, carbs: 0.45, fat: 0.20 },
  },
  recomposition: {
    moderate: { protein: 0.35, carbs: 0.40, fat: 0.25 },
    high: { protein: 0.40, carbs: 0.35, fat: 0.25 },
    very_high: { protein: 0.45, carbs: 0.30, fat: 0.25 },
  },
};

// Calculate BMR using Mifflin-St Jeor equation
function calculateBMR(age: number, biologicalSex: string, weightKg: number, heightCm: number): number {
  if (biologicalSex === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
}

// Calculate TDEE from BMR and activity level
function calculateTDEE(bmr: number, activityLevel: string): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel as keyof typeof ACTIVITY_MULTIPLIERS] || 1.2;
  return bmr * multiplier;
}

// Calculate daily calories based on goal
function calculateDailyCalories(tdee: number, goalType: string): number {
  const adjustment = GOAL_ADJUSTMENTS[goalType as keyof typeof GOAL_ADJUSTMENTS] || 0;
  return Math.max(1200, tdee + adjustment); // Minimum 1200 calories for safety
}

// Calculate macro grams from calories and ratios
function calculateMacros(calories: number, proteinRatio: number, carbRatio: number, fatRatio: number) {
  const proteinGrams = Math.round((calories * proteinRatio) / 4);
  const carbGrams = Math.round((calories * carbRatio) / 4);
  const fatGrams = Math.round((calories * fatRatio) / 9);
  
  return { proteinGrams, carbGrams, fatGrams };
}

// Generate meal plan distribution
function generateMealPlan(dailyCalories: number, proteinGrams: number, carbGrams: number, fatGrams: number) {
  // Standard meal distribution (can be customized per client)
  const mealDistribution = [
    { mealType: 'breakfast' as const, percentage: 0.25 },
    { mealType: 'lunch' as const, percentage: 0.35 },
    { mealType: 'dinner' as const, percentage: 0.30 },
    { mealType: 'snack' as const, percentage: 0.10 },
  ];

  return mealDistribution.map(meal => ({
    mealType: meal.mealType,
    calories: Math.round(dailyCalories * meal.percentage),
    proteinGrams: Math.round(proteinGrams * meal.percentage),
    carbGrams: Math.round(carbGrams * meal.percentage),
    fatGrams: Math.round(fatGrams * meal.percentage),
  }));
}

// Generate recommendations based on goals and biometrics
function generateRecommendations(
  goalType: string,
  tdee: number,
  dailyCalories: number,
  biometrics: NutritionTargetRequest['biometrics']
): string[] {
  const recommendations: string[] = [];
  
  if (goalType === 'fat_loss') {
    const deficit = tdee - dailyCalories;
    recommendations.push(`Aim for a ${deficit} calorie deficit daily for sustainable weight loss.`);
    recommendations.push('Focus on protein intake to preserve muscle mass during weight loss.');
    recommendations.push('Consider incorporating resistance training 2-3 times per week.');
  } else if (goalType === 'muscle_gain') {
    recommendations.push('Ensure adequate protein intake (1.6-2.2g per kg of body weight).');
    recommendations.push('Progressive overload in strength training is key for muscle growth.');
    recommendations.push('Consider timing protein intake around workouts for optimal recovery.');
  } else if (goalType === 'recomposition') {
    recommendations.push('This approach requires patience - changes will be gradual.');
    recommendations.push('Focus on strength training and adequate protein.');
    recommendations.push('Monitor measurements more than scale weight.');
  }
  
  // Age-based recommendations
  if (biometrics.age > 40) {
    recommendations.push('Consider slightly higher protein intake to combat age-related muscle loss.');
  }
  
  // Body fat based recommendations
  if (biometrics.bodyFatPercentage && biometrics.bodyFatPercentage > 30) {
    recommendations.push('Focus on establishing consistent eating patterns before aggressive deficits.');
  }
  
  return recommendations;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const validationResult = NutritionTargetRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // Calculate BMR
    const bmr = calculateBMR(
      data.biometrics.age,
      data.biometrics.biologicalSex,
      data.biometrics.weightKg,
      data.biometrics.heightCm
    );
    
    // Calculate TDEE
    const tdee = calculateTDEE(bmr, data.activityLevel);
    
    // Calculate daily calories
    const dailyCalories = calculateDailyCalories(tdee, data.goalType);
    
    // Get macro ratios
    const proteinPreference = data.preferences?.proteinPreference || 'moderate';
    const ratios = MACRO_RATIOS[data.goalType as keyof typeof MACRO_RATIOS][proteinPreference];
    
    // Calculate macros
    const { proteinGrams, carbGrams, fatGrams } = calculateMacros(
      dailyCalories,
      ratios.protein,
      ratios.carbs,
      ratios.fat
    );
    
    // Generate meal plan
    const mealPlan = generateMealPlan(dailyCalories, proteinGrams, carbGrams, fatGrams);
    
    // Generate recommendations
    const recommendations = generateRecommendations(data.goalType, tdee, dailyCalories, data.biometrics);
    
    // Save to database (if Supabase is configured)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      try {
        await supabase.from('nutrition_targets').insert({
          client_id: data.clientId,
          bmr,
          tdee,
          daily_calories: dailyCalories,
          protein_grams: proteinGrams,
          carb_grams: carbGrams,
          fat_grams: fatGrams,
          protein_percentage: ratios.protein * 100,
          carb_percentage: ratios.carbs * 100,
          fat_percentage: ratios.fat * 100,
          goal_type: data.goalType,
          activity_level: data.activityLevel,
          calculated_at: new Date().toISOString(),
        });
      } catch (dbError) {
        console.error('Failed to save nutrition targets to database:', dbError);
        // Continue even if database save fails
      }
    }
    
    // Prepare response
    const response: NutritionTargetResponse = {
      success: true,
      targets: {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        dailyCalories: Math.round(dailyCalories),
        proteinGrams,
        carbGrams,
        fatGrams,
        proteinPercentage: Math.round(ratios.protein * 100),
        carbPercentage: Math.round(ratios.carbs * 100),
        fatPercentage: Math.round(ratios.fat * 100),
        mealPlan,
      },
      recommendations,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error calculating nutrition targets:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // GET endpoint for retrieving existing nutrition targets
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  
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
    const { data, error } = await supabase
      .from('nutrition_targets')
      .select('*')
      .eq('client_id', clientId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return NextResponse.json(
          { success: false, error: 'No nutrition targets found for this client' },
          { status: 404 }
        );
      }
      throw error;
    }
    
    return NextResponse.json({ success: true, targets: data });
    
  } catch (error) {
    console.error('Error retrieving nutrition targets:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
