-- BILT Technical Appendix - Complete Table Schema (Part 2)
-- Continuation of table creation

-- 17. disc_assessments (continued)
  c_count INTEGER GENERATED ALWAYS AS (
    (CASE WHEN answer1 = 'C' THEN 1 ELSE 0 END) +
    (CASE WHEN answer2 = 'C' THEN 1 ELSE 0 END) +
    (CASE WHEN answer3 = 'C' THEN 1 ELSE 0 END) +
    (CASE WHEN answer4 = 'C' THEN 1 ELSE 0 END) +
    (CASE WHEN answer5 = 'C' THEN 1 ELSE 0 END) +
    (CASE WHEN answer6 = 'C' THEN 1 ELSE 0 END) +
    (CASE WHEN answer7 = 'C' THEN 1 ELSE 0 END)
  ) STORED,
  d_count INTEGER GENERATED ALWAYS AS (
    (CASE WHEN answer1 = 'D' THEN 1 ELSE 0 END) +
    (CASE WHEN answer2 = 'D' THEN 1 ELSE 0 END) +
    (CASE WHEN answer3 = 'D' THEN 1 ELSE 0 END) +
    (CASE WHEN answer4 = 'D' THEN 1 ELSE 0 END) +
    (CASE WHEN answer5 = 'D' THEN 1 ELSE 0 END) +
    (CASE WHEN answer6 = 'D' THEN 1 ELSE 0 END) +
    (CASE WHEN answer7 = 'D' THEN 1 ELSE 0 END)
  ) STORED,
  disc_primary disc_primary GENERATED ALWAYS AS (
    CASE
      WHEN a_count >= 4 THEN 'dominant'
      WHEN b_count >= 4 OR c_count >= 4 THEN 'influential'
      WHEN d_count >= 4 THEN 'compliant'
      ELSE 'steady'
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. persona_assignments
CREATE TABLE IF NOT EXISTS persona_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  persona_type persona_type NOT NULL,
  challenge_weight DECIMAL CHECK (challenge_weight >= 0 AND challenge_weight <= 1) DEFAULT 0.3,
  support_weight DECIMAL CHECK (support_weight >= 0 AND support_weight <= 1) DEFAULT 0.6,
  data_weight DECIMAL CHECK (data_weight >= 0 AND data_weight <= 1) DEFAULT 0.1,
  trigger persona_trigger NOT NULL,
  is_active BOOLEAN DEFAULT true,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  superseded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id) WHERE (is_active = true)
);

-- 19. persona_reviews
CREATE TABLE IF NOT EXISTS persona_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  review_trigger persona_trigger NOT NULL,
  old_persona_type persona_type,
  new_persona_type persona_type,
  change_reason TEXT,
  behavioural_insights JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. dietary_restrictions
CREATE TABLE IF NOT EXISTS dietary_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  has_nut_allergy BOOLEAN DEFAULT false,
  has_shellfish_allergy BOOLEAN DEFAULT false,
  has_dairy_intolerance BOOLEAN DEFAULT false,
  has_gluten_intolerance BOOLEAN DEFAULT false,
  dietary_lifestyle dietary_lifestyle DEFAULT 'omnivore',
  eating_disorder_flag BOOLEAN DEFAULT false,
  eating_disorder_details TEXT,
  pt_nutrition_cleared BOOLEAN DEFAULT false,
  pt_nutrition_cleared_at TIMESTAMPTZ,
  pt_nutrition_cleared_by UUID REFERENCES trainers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. food_preferences
CREATE TABLE IF NOT EXISTS food_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  food_tracking_preference food_tracking_preference DEFAULT 'portion_based',
  meal_plan_style meal_plan_style DEFAULT 'balanced',
  cooking_time_tier cooking_time_tier DEFAULT 'medium_30_60',
  food_budget_tier food_budget_tier DEFAULT 'moderate',
  food_relationship food_relationship DEFAULT 'neutral',
  current_eating_habits TEXT,
  meals_per_day INTEGER CHECK (meals_per_day >= 1 AND meals_per_day <= 10) DEFAULT 3,
  disliked_foods TEXT[],
  liked_foods TEXT[],
  preferred_cuisines TEXT[],
  supplement_use BOOLEAN DEFAULT false,
  hydration_goal_ml INTEGER DEFAULT 2000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. client_supplements
CREATE TABLE IF NOT EXISTS client_supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  supplement_type supplement_type NOT NULL,
  supplement_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. nutrition_targets
CREATE TABLE IF NOT EXISTS nutrition_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  bmr_kcal DECIMAL NOT NULL CHECK (bmr_kcal > 0),
  tdee_kcal DECIMAL NOT NULL CHECK (tdee_kcal > 0),
  tdee_multiplier DECIMAL NOT NULL CHECK (tdee_multiplier > 0),
  calorie_target_kcal DECIMAL NOT NULL CHECK (calorie_target_kcal > 0),
  calorie_adjustment_kcal DECIMAL NOT NULL,
  protein_g DECIMAL NOT NULL CHECK (protein_g > 0),
  fat_g DECIMAL NOT NULL CHECK (fat_g > 0),
  carbs_g DECIMAL NOT NULL CHECK (carbs_g > 0),
  protein_percentage DECIMAL GENERATED ALWAYS AS (
    ROUND((protein_g * 4) / calorie_target_kcal * 100, 1)
  ) STORED,
  fat_percentage DECIMAL GENERATED ALWAYS AS (
    ROUND((fat_g * 9) / calorie_target_kcal * 100, 1)
  ) STORED,
  carbs_percentage DECIMAL GENERATED ALWAYS AS (
    ROUND((carbs_g * 4) / calorie_target_kcal * 100, 1)
  ) STORED,
  protein_floor_g DECIMAL DEFAULT 100,
  below_calorie_floor BOOLEAN GENERATED ALWAYS AS (
    calorie_target_kcal < 1200
  ) STORED,
  is_active BOOLEAN DEFAULT true,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  superseded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id) WHERE (is_active = true)
);

-- 24. meal_plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_description TEXT,
  duration_days INTEGER CHECK (duration_days > 0) DEFAULT 7,
  pt_approved BOOLEAN DEFAULT false,
  pt_approved_at TIMESTAMPTZ,
  pt_approved_by UUID REFERENCES trainers(id),
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. meal_plan_days
CREATE TABLE IF NOT EXISTS meal_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1),
  total_calories DECIMAL,
  total_protein_g DECIMAL,
  total_carbs_g DECIMAL,
  total_fat_g DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meal_plan_id, day_number)
);

-- 26. meal_plan_meals
CREATE TABLE IF NOT EXISTS meal_plan_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_day_id UUID NOT NULL REFERENCES meal_plan_days(id) ON DELETE CASCADE,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout')) NOT NULL,
  meal_id UUID REFERENCES meals(id),
  custom_meal_name TEXT,
  custom_meal_description TEXT,
  calories DECIMAL,
  protein_g DECIMAL,
  carbs_g DECIMAL,
  fat_g DECIMAL,
  ingredients JSONB,
  instructions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. nutrition_checkin_responses
CREATE TABLE IF NOT EXISTS nutrition_checkin_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_response_id UUID NOT NULL REFERENCES checkin_responses(id) ON DELETE CASCADE,
  meal_plan_adherence INTEGER CHECK (meal_plan_adherence >= 0 AND meal_plan_adherence <= 100),
  hunger_level INTEGER CHECK (hunger_level >= 1 AND hunger_level <= 10),
  energy_from_food INTEGER CHECK (energy_from_food >= 1 AND energy_from_food <= 10),
  protein_target_status TEXT CHECK (protein_target_status IN ('under', 'met', 'over')),
  water_intake_ml INTEGER,
  nutrition_challenge TEXT,
  off_plan_meal_detail TEXT,
  food_feelings_note TEXT,
  meal_log_id UUID REFERENCES client_meal_logs(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. checkin_cycles
CREATE TABLE IF NOT EXISTS checkin_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  checkin_status checkin_status DEFAULT 'pending',
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  follow_up_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, week_start_date)
);

-- 29. checkin_responses
CREATE TABLE IF NOT EXISTS checkin_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_cycle_id UUID NOT NULL REFERENCES checkin_cycles(id) ON DELETE CASCADE,
  sessions_planned INTEGER CHECK (sessions_planned >= 0) DEFAULT 0,
  sessions_completed INTEGER CHECK (sessions_completed >= 0) DEFAULT 0,
  adherence_pct DECIMAL GENERATED ALWAYS AS (
    CASE 
      WHEN sessions_planned > 0 THEN ROUND((sessions_completed::DECIMAL / sessions_planned) * 100, 1)
      ELSE 0
    END
  ) STORED,
  average_effort_rpe DECIMAL CHECK (average_effort_rpe >= 1 AND average_effort_rpe <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  sleep_hours DECIMAL CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  soreness_level INTEGER CHECK (soreness_level >= 1 AND soreness_level <= 10),
  mood_level INTEGER CHECK (mood_level >= 1 AND mood_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  current_weight_kg DECIMAL CHECK (current_weight_kg > 0),
  notes TEXT,
  sentiment_score DECIMAL CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  sentiment_label TEXT CHECK (sentiment_label IN ('very_negative', 'negative', 'neutral', 'positive', 'very_positive')),
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 30. app_messages
CREATE TABLE IF NOT EXISTS app_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sender message_sender NOT NULL,
  message_type message_type NOT NULL,
  message_text TEXT NOT NULL,
  quick_replies TEXT[],
  read_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  linked_checkin_id UUID REFERENCES checkin_cycles(id),
  linked_flag_id UUID REFERENCES pt_flags(id),
  linked_plan_id UUID, -- Could be training_programs or meal_plans
  linked_plan_type TEXT, -- 'training' or 'nutrition'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 31. behavioural_signals
CREATE TABLE IF NOT EXISTS behavioural_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  calculation_date DATE NOT NULL,
  response_rate_4wk DECIMAL CHECK (response_rate_4wk >= 0 AND response_rate_4wk <= 100),
  avg_response_time_hours DECIMAL CHECK (avg_response_time_hours >= 0),
  completion_rate_4wk DECIMAL CHECK (completion_rate_4wk >= 0 AND completion_rate_4wk <= 100),
  completion_trend TEXT CHECK (completion_trend IN ('improving', 'stable', 'declining')),
  avg_sentiment_4wk DECIMAL CHECK (avg_sentiment_4wk >= -1 AND avg_sentiment_4wk <= 1),
  sentiment_trend TEXT CHECK (sentiment_trend IN ('improving', 'stable', 'declining')),
  at_risk_score DECIMAL CHECK (at_risk_score >= 0 AND at_risk_score <= 100),
  intervention_effectiveness JSONB, -- Which interventions work best
  milestone_engagement JSONB, -- Which milestones client engages with
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, calculation_date)
);

-- ============================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_clients_trainer_id ON clients(trainer_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_gym_id ON clients(gym_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_conversations_client_id ON onboarding_conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_messages_conversation_id ON onboarding_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_client_goals_client_id ON client_goals(client_id);
CREATE INDEX IF NOT EXISTS idx_client_goals_is_active ON client_goals(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pt_flags_trainer_id ON pt_flags(trainer_id);
CREATE INDEX IF NOT EXISTS idx_pt_flags_flag_status ON pt_flags(flag_status);
CREATE INDEX IF NOT EXISTS idx_pt_flags_client_id ON pt_flags(client_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_client_id ON training_programs(client_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_is_active ON training_programs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_planned_sessions_program_id ON planned_sessions(program_id);
CREATE INDEX IF NOT EXISTS idx_session_completions_planned_session_id ON session_completions(planned_session_id);
CREATE INDEX IF NOT EXISTS idx_persona_assignments_client_id ON persona_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_persona_assignments_is_active ON persona_assignments(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_nutrition_targets_client_id ON nutrition_targets(client_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_targets_is_active ON nutrition_targets(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_meal_plans_client_id ON meal_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_checkin_cycles_client_id ON checkin_cycles(client_id);
CREATE INDEX IF NOT EXISTS idx_checkin_cycles_week_start_date ON checkin_cycles(week_start_date);
CREATE INDEX IF NOT EXISTS idx_checkin_responses_checkin_cycle_id ON checkin_responses(checkin_cycle_id);
CREATE INDEX IF NOT EXISTS idx_app_messages_client_id ON app_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_app_messages_sent_at ON app_messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_behavioural_signals_client_id ON behavioural_signals(client_id);
CREATE INDEX IF NOT EXISTS idx_behavioural_signals_calculation_date ON behavioural_signals(calculation_date);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_dashboard_active_clients ON clients(trainer_id, status) WHERE status IN ('active', 'at_risk');
CREATE INDEX IF NOT EXISTS idx_dashboard_open_flags ON pt_flags(trainer_id, flag_status, created_at) WHERE flag_status = 'open';
CREATE INDEX IF NOT EXISTS idx_recent_checkins ON checkin_responses(client_id, responded_at DESC);
CREATE INDEX IF NOT EXISTS idx_recent_messages ON app_messages(client_id, sent_at DESC);

-- ============================================
-- 4. RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================

-- Enable