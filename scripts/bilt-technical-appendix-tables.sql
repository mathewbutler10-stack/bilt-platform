-- BILT Technical Appendix - Complete Table Schema
-- Creates all 25+ new tables as per technical specification
-- Run this in Supabase SQL Editor for bilt-prod project

-- ============================================
-- 1. ENUM CREATIONS (25+ enums as per appendix)
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM ('client', 'trainer', 'gym_manager', 'owner', 'admin');
CREATE TYPE biological_sex AS ENUM ('male', 'female', 'other');
CREATE TYPE persona_type AS ENUM ('challenger', 'supporter', 'analyst_coach');
CREATE TYPE disc_primary AS ENUM ('dominant', 'influential', 'steady', 'compliant');

-- Goals and timelines
CREATE TYPE goal_type AS ENUM ('fat_loss', 'muscle_gain', 'maintenance', 'performance', 'recomposition');
CREATE TYPE goal_timeline AS ENUM ('1_month', '3_months', '6_months', '12_months', 'custom');

-- Training profiles
CREATE TYPE experience_level AS ENUM ('beginner', 'intermediate', 'advanced', 'elite');
CREATE TYPE activity_level AS ENUM ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active');
CREATE TYPE training_location AS ENUM ('home', 'gym', 'outdoor', 'studio', 'mixed');

-- Nutrition and dietary
CREATE TYPE dietary_lifestyle AS ENUM ('omnivore', 'vegetarian', 'vegan', 'pescatarian', 'halal', 'kosher', 'other');
CREATE TYPE food_tracking_preference AS ENUM ('macro_tracking', 'portion_based', 'intuitive', 'not_tracking');
CREATE TYPE meal_plan_style AS ENUM ('balanced', 'high_protein', 'low_carb', 'keto', 'mediterranean', 'flexible');
CREATE TYPE cooking_time_tier AS ENUM ('quick_under_30', 'medium_30_60', 'extended_60_plus', 'meal_prep');
CREATE TYPE food_budget_tier AS ENUM ('budget', 'moderate', 'premium', 'unlimited');
CREATE TYPE food_relationship AS ENUM ('positive', 'neutral', 'complicated', 'restrictive', 'disordered');

-- Health and safety
CREATE TYPE parq_response AS ENUM ('yes', 'no', 'unsure');
CREATE TYPE flag_type AS ENUM ('medical', 'injury', 'nutrition_risk', 'engagement', 'safety', 'technical');
CREATE TYPE flag_status AS ENUM ('open', 'reviewed', 'resolved', 'escalated');

-- Check-ins and messaging
CREATE TYPE checkin_status AS ENUM ('pending', 'completed', 'partial', 'missed');
CREATE TYPE message_sender AS ENUM ('client', 'agent', 'trainer', 'system');
CREATE TYPE message_type AS ENUM ('onboarding', 'program_delivery', 'checkin', 'checkin_followup', 'milestone', 'intervention', 'escalation', 'general');

-- Persona and triggers
CREATE TYPE persona_trigger AS ENUM ('initial_assessment', 'week_4_review', 'week_8_review', 'month_6_review', 'pt_override', 'behavior_change');

-- Wearables and devices
CREATE TYPE wearable_device AS ENUM ('apple_watch', 'fitbit', 'garmin', 'whoop', 'oura', 'none', 'other');

-- Onboarding phases
CREATE TYPE onboarding_phase AS ENUM ('welcome', 'biometrics', 'health_screening', 'training_preferences', 'motivation_mindset', 'lifestyle_barriers', 'nutrition', 'wrap_up', 'complete');

-- Supplement types
CREATE TYPE supplement_type AS ENUM ('protein', 'creatine', 'bcaa', 'pre_workout', 'multivitamin', 'vitamin_d', 'omega_3', 'other');

-- ============================================
-- 2. CORE TABLES (25+ new tables)
-- ============================================

-- 1. profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Australia/Sydney',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. trainers
CREATE TABLE IF NOT EXISTS trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  brand_voice_directness INTEGER CHECK (brand_voice_directness >= 1 AND brand_voice_directness <= 10) DEFAULT 5,
  brand_voice_formality INTEGER CHECK (brand_voice_formality >= 1 AND brand_voice_formality <= 10) DEFAULT 5,
  agent_persona_name TEXT DEFAULT 'BILT Assistant',
  includes_meal_planning BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. gyms
CREATE TABLE IF NOT EXISTS gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  address TEXT,
  city TEXT,
  state TEXT,
  postcode TEXT,
  country TEXT DEFAULT 'Australia',
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
  gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('onboarding', 'active', 'paused', 'at_risk', 'churned')) DEFAULT 'onboarding',
  onboarding_complete BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,
  at_risk_since TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. onboarding_conversations
CREATE TABLE IF NOT EXISTS onboarding_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  phase onboarding_phase DEFAULT 'welcome',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  estimated_completion_minutes INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. onboarding_messages
CREATE TABLE IF NOT EXISTS onboarding_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES onboarding_conversations(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  sender message_sender NOT NULL,
  message_type message_type NOT NULL,
  quick_replies TEXT[], -- Array of quick reply options
  extracted_data JSONB, -- Structured data extracted from message
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. client_goals
CREATE TABLE IF NOT EXISTS client_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  goal_primary TEXT NOT NULL,
  goal_why TEXT,
  goal_type goal_type NOT NULL,
  goal_timeline goal_timeline NOT NULL,
  goal_target_date DATE,
  goal_weight_kg DECIMAL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. client_biometrics
CREATE TABLE IF NOT EXISTS client_biometrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date_of_birth DATE NOT NULL,
  biological_sex biological_sex NOT NULL,
  height_cm DECIMAL NOT NULL CHECK (height_cm > 0),
  weight_kg DECIMAL NOT NULL CHECK (weight_kg > 0),
  bmr_kcal DECIMAL GENERATED ALWAYS AS (
    CASE biological_sex
      WHEN 'male' THEN (10 * weight_kg) + (6.25 * height_cm) - (5 * EXTRACT(YEAR FROM AGE(date_of_birth))) + 5
      WHEN 'female' THEN (10 * weight_kg) + (6.25 * height_cm) - (5 * EXTRACT(YEAR FROM AGE(date_of_birth))) - 161
      ELSE (10 * weight_kg) + (6.25 * height_cm) - (5 * EXTRACT(YEAR FROM AGE(date_of_birth))) - 78
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. biometric_history
CREATE TABLE IF NOT EXISTS biometric_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  weight_kg DECIMAL NOT NULL CHECK (weight_kg > 0),
  body_fat_percentage DECIMAL CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
  measurements JSONB, -- JSON object with various measurements
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. parq_responses
CREATE TABLE IF NOT EXISTS parq_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  q1_heart_condition parq_response,
  q2_chest_pain parq_response,
  q3_faint_dizzy parq_response,
  q4_bone_joint parq_response,
  q5_blood_pressure_meds parq_response,
  q6_pregnant_postpartum parq_response,
  q7_other_reason parq_response,
  any_positive BOOLEAN GENERATED ALWAYS AS (
    q1_heart_condition = 'yes' OR
    q2_chest_pain = 'yes' OR
    q3_faint_dizzy = 'yes' OR
    q4_bone_joint = 'yes' OR
    q5_blood_pressure_meds = 'yes' OR
    q6_pregnant_postpartum = 'yes' OR
    q7_other_reason = 'yes'
  ) STORED,
  pt_cleared BOOLEAN DEFAULT false,
  pt_cleared_at TIMESTAMPTZ,
  pt_cleared_by UUID REFERENCES trainers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. client_health_flags
CREATE TABLE IF NOT EXISTS client_health_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL, -- 'injury', 'condition', 'medication', 'surgery'
  flag_description TEXT NOT NULL,
  flag_details TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. pt_flags
CREATE TABLE IF NOT EXISTS pt_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  flag_type flag_type NOT NULL,
  flag_status flag_status DEFAULT 'open',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  description TEXT NOT NULL,
  source_table TEXT, -- Table that triggered the flag
  source_id UUID, -- ID in source table
  agent_paused BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES trainers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. client_training_profiles
CREATE TABLE IF NOT EXISTS client_training_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  experience_level experience_level NOT NULL DEFAULT 'beginner',
  activity_level activity_level NOT NULL DEFAULT 'sedentary',
  training_days_per_week INTEGER CHECK (training_days_per_week >= 0 AND training_days_per_week <= 7) DEFAULT 3,
  training_location training_location NOT NULL DEFAULT 'gym',
  preferred_training_types TEXT[], -- Array of training types
  wearable_device wearable_device DEFAULT 'none',
  works_shifts BOOLEAN DEFAULT false,
  typical_sleep_hours DECIMAL CHECK (typical_sleep_hours >= 0 AND typical_sleep_hours <= 24) DEFAULT 7,
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10) DEFAULT 5,
  barriers TEXT[], -- Array of common barriers
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. training_programs
CREATE TABLE IF NOT EXISTS training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  program_name TEXT NOT NULL,
  program_description TEXT,
  duration_weeks INTEGER CHECK (duration_weeks > 0) DEFAULT 12,
  pt_approved BOOLEAN DEFAULT false,
  pt_approved_at TIMESTAMPTZ,
  pt_approved_by UUID REFERENCES trainers(id),
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. planned_sessions
CREATE TABLE IF NOT EXISTS planned_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number > 0),
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
  session_name TEXT NOT NULL,
  session_description TEXT,
  workout_template_id UUID REFERENCES workout_templates(id),
  duration_minutes INTEGER CHECK (duration_minutes > 0) DEFAULT 60,
  target_rpe DECIMAL CHECK (target_rpe >= 1 AND target_rpe <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(program_id, week_number, day_number)
);

-- 16. session_completions
CREATE TABLE IF NOT EXISTS session_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planned_session_id UUID NOT NULL REFERENCES planned_sessions(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  actual_duration_minutes INTEGER,
  actual_rpe DECIMAL CHECK (actual_rpe >= 1 AND actual_rpe <= 10),
  notes TEXT,
  workout_log_id UUID REFERENCES client_workout_logs(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. disc_assessments
CREATE TABLE IF NOT EXISTS disc_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  answer1 CHAR(1) CHECK (answer1 IN ('A', 'B', 'C', 'D')),
  answer2 CHAR(1) CHECK (answer2 IN ('A', 'B', 'C', 'D')),
  answer3 CHAR(1) CHECK (answer3 IN ('A', 'B', 'C', 'D')),
  answer4 CHAR(1) CHECK (answer4 IN ('A', 'B', 'C', 'D')),
  answer5 CHAR(1) CHECK (answer5 IN ('A', 'B', 'C', 'D')),
  answer6 CHAR(1) CHECK (answer6 IN ('A', 'B', 'C', 'D')),
  answer7 CHAR(1) CHECK (answer7 IN ('A', 'B', 'C', 'D')),
  a_count INTEGER GENERATED ALWAYS AS (
    (CASE WHEN answer1 = 'A' THEN 1 ELSE 0 END) +
    (CASE WHEN answer2 = 'A' THEN 1 ELSE 0 END) +
    (CASE WHEN answer3 = 'A' THEN 1 ELSE 0 END) +
    (CASE WHEN answer4 = 'A' THEN 1 ELSE 0 END) +
    (CASE WHEN answer5 = 'A' THEN 1 ELSE 0 END) +
    (CASE WHEN answer6 = 'A' THEN 1 ELSE 0 END) +
    (CASE WHEN answer7 = 'A' THEN 1 ELSE 0 END)
  ) STORED,
  b_count INTEGER GENERATED ALWAYS AS (
    (CASE WHEN answer1 = 'B' THEN 1 ELSE 0 END) +
    (CASE WHEN answer2 = 'B' THEN 1 ELSE 0 END) +
    (CASE WHEN answer3 = 'B' THEN 1 ELSE 0 END) +
    (CASE WHEN answer4 = 'B' THEN 1 ELSE 0 END) +
    (CASE WHEN answer5 = 'B' THEN 1 ELSE 0 END) +
    (CASE WHEN answer6 = 'B' THEN 1 ELSE 0 END) +
    (CASE WHEN answer7 = 'B' THEN 1 ELSE 0 END)
  ) STORED,
  c_count INTEGER GENERATED ALWAYS AS (
    (CASE WHEN answer1 = 'C' THEN 1 ELSE 0 END) +
    (CASE WHEN