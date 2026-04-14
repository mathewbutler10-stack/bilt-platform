-- BILT Platform Demo Accounts Creation Script
-- Run this in Supabase SQL Editor for the bilt-prod project

-- First, create auth users (if using Supabase Auth)
-- Note: In production, you would use the Supabase Auth API or Dashboard
-- This script assumes auth.users are created via the application

-- Create profiles for each user role
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at) VALUES
-- Platform Owner
(
  '11111111-1111-1111-1111-111111111111',
  'owner@bilt.com',
  'Alex Johnson',
  'owner',
  NOW(),
  NOW()
),
-- Gym Manager
(
  '22222222-2222-2222-2222-222222222222',
  'gym@bilt.com',
  'Sarah Wilson',
  'gym_manager',
  NOW(),
  NOW()
),
-- Personal Trainer
(
  '33333333-3333-3333-3333-333333333333',
  'pt@bilt.com',
  'Mike Chen',
  'trainer',
  NOW(),
  NOW()
),
-- Client
(
  '44444444-4444-4444-4444-444444444444',
  'client@bilt.com',
  'Jamie Smith',
  'client',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create trainer record for the PT
INSERT INTO trainers (id, profile_id, business_name, brand_voice_directness, brand_voice_formality, includes_meal_planning, created_at) VALUES
(
  '55555555-5555-5555-5555-555555555555',
  '33333333-3333-3333-3333-333333333333',
  'Elite Performance Training',
  7, -- Directness (1-10)
  6, -- Formality (1-10)
  true,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create gym record
INSERT INTO gyms (id, name, owner_profile_id, address, phone, email, created_at) VALUES
(
  '66666666-6666-6666-6666-666666666666',
  'Prime Fitness Sydney',
  '22222222-2222-2222-2222-222222222222',
  '123 Fitness St, Sydney NSW 2000',
  '+61 2 1234 5678',
  'info@primefitnesssydney.com.au',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create client record
INSERT INTO clients (id, profile_id, trainer_id, gym_id, status, onboarding_complete, created_at) VALUES
(
  '77777777-7777-7777-7777-777777777777',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  'active',
  true,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create sample client goals
INSERT INTO client_goals (client_id, goal_primary, goal_why, goal_type, goal_timeline, goal_target_date, is_active, created_at) VALUES
(
  '77777777-7777-7777-7777-777777777777',
  'Lose 10kg and improve cardiovascular fitness',
  'Want to feel more confident and have more energy for my kids',
  'fat_loss',
  '3_months',
  '2026-07-11',
  true,
  NOW()
);

-- Create sample client biometrics
INSERT INTO client_biometrics (client_id, date_of_birth, biological_sex, height_cm, weight_kg, created_at) VALUES
(
  '77777777-7777-7777-7777-777777777777',
  '1990-05-15',
  'female',
  165,
  75,
  NOW()
);

-- Create sample training profile
INSERT INTO client_training_profiles (client_id, experience_level, activity_level, training_days_per_week, training_location, preferred_training_types, created_at) VALUES
(
  '77777777-7777-7777-7777-777777777777',
  'intermediate',
  'moderately_active',
  3,
  'gym',
  ARRAY['strength', 'cardio', 'hiit'],
  NOW()
);

-- Create sample DISC assessment and persona assignment
INSERT INTO disc_assessments (client_id, answer1, answer2, answer3, answer4, answer5, answer6, answer7, disc_primary, created_at) VALUES
(
  '77777777-7777-7777-7777-777777777777',
  'B',
  'C',
  'A',
  'D',
  'B',
  'C',
  'B',
  'influential',
  NOW()
);

INSERT INTO persona_assignments (client_id, persona_type, challenge_weight, support_weight, data_weight, trigger, is_active, created_at) VALUES
(
  '77777777-7777-7777-7777-777777777777',
  'supporter',
  0.3,
  0.6,
  0.1,
  'initial_assessment',
  true,
  NOW()
);

-- Create sample nutrition targets
INSERT INTO nutrition_targets (client_id, bmr_kcal, tdee_kcal, tdee_multiplier, calorie_target_kcal, protein_g, fat_g, carbs_g, is_active, created_at) VALUES
(
  '77777777-7777-7777-7777-777777777777',
  1450,
  2100,
  1.55,
  1850,
  140,
  60,
  180,
  true,
  NOW()
);

-- Create sample dietary restrictions
INSERT INTO dietary_restrictions (client_id, has_nut_allergy, has_shellfish_allergy, is_vegetarian, eating_disorder_flag, pt_nutrition_cleared, created_at) VALUES
(
  '77777777-7777-7777-7777-777777777777',
  true,
  false,
  false,
  false,
  true,
  NOW()
);

-- Create sample food preferences
INSERT INTO food_preferences (client_id, food_tracking_preference, meal_plan_style, cooking_time_tier, food_budget_tier, food_relationship, created_at) VALUES
(
  '77777777-7777-7777-7777-777777777777',
  'portion_based',
  'balanced',
  'medium_30_60',
  'moderate',
  'neutral',
  NOW()
);

-- Output confirmation
SELECT 'Demo accounts created successfully!' as message;

-- Verify the accounts
SELECT 
  p.email,
  p.full_name,
  p.role,
  CASE p.role
    WHEN 'owner' THEN 'Platform Owner - Full system access'
    WHEN 'gym_manager' THEN 'Gym Manager - Local operations'
    WHEN 'trainer' THEN 'Personal Trainer - Client coaching'
    WHEN 'client' THEN 'Client - Training & nutrition'
  END as description
FROM profiles p
WHERE p.email IN ('owner@bilt.com', 'gym@bilt.com', 'pt@bilt.com', 'client@bilt.com')
ORDER BY 
  CASE p.role
    WHEN 'owner' THEN 1
    WHEN 'gym_manager' THEN 2
    WHEN 'trainer' THEN 3
    WHEN 'client' THEN 4
  END;