-- BILT Technical Appendix - Complete Table Schema (Part 3)
-- RLS Policies and Helper Functions

-- ============================================
-- 4. RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_biometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE parq_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_health_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_training_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disc_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE dietary_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_checkin_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioural_signals ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. HELPER FUNCTIONS FOR RLS
-- ============================================

-- Get current user's profile ID
CREATE OR REPLACE FUNCTION auth_profile_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user's trainer ID (if they are a trainer)
CREATE OR REPLACE FUNCTION auth_trainer_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM trainers WHERE profile_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if a client belongs to the current trainer
CREATE OR REPLACE FUNCTION is_my_client(p_client_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM clients c
    JOIN trainers t ON c.trainer_id = t.id
    WHERE c.id = p_client_id AND t.profile_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is a platform owner
CREATE OR REPLACE FUNCTION is_platform_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is a gym manager
CREATE OR REPLACE FUNCTION is_gym_manager()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'gym_manager'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. RLS POLICIES BY TABLE
-- ============================================

-- profiles: Users can read/update their own profile
CREATE POLICY profiles_select_policy ON profiles
  FOR SELECT USING (id = auth.uid() OR is_platform_owner());

CREATE POLICY profiles_update_policy ON profiles
  FOR UPDATE USING (id = auth.uid());

-- trainers: Trainers can read/update their own record
CREATE POLICY trainers_select_policy ON trainers
  FOR SELECT USING (profile_id = auth.uid() OR is_platform_owner());

CREATE POLICY trainers_update_policy ON trainers
  FOR UPDATE USING (profile_id = auth.uid());

-- gyms: Gym managers can read/update their gym, owners can read all
CREATE POLICY gyms_select_policy ON gyms
  FOR SELECT USING (
    owner_profile_id = auth.uid() OR 
    is_platform_owner() OR
    (is_gym_manager() AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.email LIKE '%@' || gyms.email
    ))
  );

CREATE POLICY gyms_update_policy ON gyms
  FOR UPDATE USING (owner_profile_id = auth.uid() OR is_platform_owner());

-- clients: Clients can read their own data, trainers can read their clients
CREATE POLICY clients_select_policy ON clients
  FOR SELECT USING (
    profile_id = auth.uid() OR 
    is_my_client(id) OR
    is_platform_owner() OR
    (is_gym_manager() AND gym_id IN (
      SELECT id FROM gyms WHERE owner_profile_id = auth.uid()
    ))
  );

CREATE POLICY clients_update_policy ON clients
  FOR UPDATE USING (is_my_client(id) OR is_platform_owner());

-- onboarding_conversations: Same as clients
CREATE POLICY onboarding_conversations_policy ON onboarding_conversations
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- onboarding_messages: Same as conversations
CREATE POLICY onboarding_messages_policy ON onboarding_messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM onboarding_conversations WHERE 
        client_id IN (
          SELECT id FROM clients WHERE 
            profile_id = auth.uid() OR 
            is_my_client(id) OR
            is_platform_owner()
        )
    )
  );

-- client_goals: Clients can read their goals, trainers can read/write
CREATE POLICY client_goals_select_policy ON client_goals
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

CREATE POLICY client_goals_modify_policy ON client_goals
  FOR ALL USING (is_my_client(client_id) OR is_platform_owner());

-- client_biometrics: Same as goals
CREATE POLICY client_biometrics_policy ON client_biometrics
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- biometric_history: Same as biometrics
CREATE POLICY biometric_history_policy ON biometric_history
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- parq_responses: Clients can read, trainers can read/write
CREATE POLICY parq_responses_policy ON parq_responses
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- client_health_flags: Same as parq
CREATE POLICY client_health_flags_policy ON client_health_flags
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- pt_flags: Trainers only (clients cannot see flags)
CREATE POLICY pt_flags_policy ON pt_flags
  FOR ALL USING (
    trainer_id = auth_trainer_id() OR 
    is_platform_owner() OR
    (client_id IN (
      SELECT id FROM clients WHERE profile_id = auth.uid()
    ) AND EXISTS (
      SELECT 1 FROM pt_flags pf2 
      WHERE pf2.id = pt_flags.id AND pf2.flag_type = 'medical'
    ))
  );

-- client_training_profiles: Same as other client data
CREATE POLICY client_training_profiles_policy ON client_training_profiles
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- training_programs: Clients can read, trainers can read/write
CREATE POLICY training_programs_policy ON training_programs
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- planned_sessions: Same as programs
CREATE POLICY planned_sessions_policy ON planned_sessions
  FOR ALL USING (
    program_id IN (
      SELECT id FROM training_programs WHERE 
        client_id IN (
          SELECT id FROM clients WHERE 
            profile_id = auth.uid() OR 
            is_my_client(id) OR
            is_platform_owner()
        )
    )
  );

-- session_completions: Same as sessions
CREATE POLICY session_completions_policy ON session_completions
  FOR ALL USING (
    planned_session_id IN (
      SELECT id FROM planned_sessions WHERE 
        program_id IN (
          SELECT id FROM training_programs WHERE 
            client_id IN (
              SELECT id FROM clients WHERE 
                profile_id = auth.uid() OR 
                is_my_client(id) OR
                is_platform_owner()
            )
        )
    )
  );

-- disc_assessments: Clients can read, trainers can read/write
CREATE POLICY disc_assessments_policy ON disc_assessments
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- persona_assignments: Same as disc
CREATE POLICY persona_assignments_policy ON persona_assignments
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- persona_reviews: Same as assignments
CREATE POLICY persona_reviews_policy ON persona_reviews
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- dietary_restrictions: Same as other client data
CREATE POLICY dietary_restrictions_policy ON dietary_restrictions
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- food_preferences: Same as restrictions
CREATE POLICY food_preferences_policy ON food_preferences
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- client_supplements: Same as preferences
CREATE POLICY client_supplements_policy ON client_supplements
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- nutrition_targets: Same as other nutrition data
CREATE POLICY nutrition_targets_policy ON nutrition_targets
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- meal_plans: Same as targets
CREATE POLICY meal_plans_policy ON meal_plans
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- meal_plan_days: Same as plans
CREATE POLICY meal_plan_days_policy ON meal_plan_days
  FOR ALL USING (
    meal_plan_id IN (
      SELECT id FROM meal_plans WHERE 
        client_id IN (
          SELECT id FROM clients WHERE 
            profile_id = auth.uid() OR 
            is_my_client(id) OR
            is_platform_owner()
        )
    )
  );

-- meal_plan_meals: Same as days
CREATE POLICY meal_plan_meals_policy ON meal_plan_meals
  FOR ALL USING (
    meal_plan_day_id IN (
      SELECT id FROM meal_plan_days WHERE 
        meal_plan_id IN (
          SELECT id FROM meal_plans WHERE 
            client_id IN (
              SELECT id FROM clients WHERE 
                profile_id = auth.uid() OR 
                is_my_client(id) OR
                is_platform_owner()
            )
        )
    )
  );

-- nutrition_checkin_responses: Same as checkins
CREATE POLICY nutrition_checkin_responses_policy ON nutrition_checkin_responses
  FOR ALL USING (
    checkin_response_id IN (
      SELECT id FROM checkin_responses WHERE 
        checkin_cycle_id IN (
          SELECT id FROM checkin_cycles WHERE 
            client_id IN (
              SELECT id FROM clients WHERE 
                profile_id = auth.uid() OR 
                is_my_client(id) OR
                is_platform_owner()
            )
        )
    )
  );

-- checkin_cycles: Clients and trainers
CREATE POLICY checkin_cycles_policy ON checkin_cycles
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- checkin_responses: Same as cycles
CREATE POLICY checkin_responses_policy ON checkin_responses
  FOR ALL USING (
    checkin_cycle_id IN (
      SELECT id FROM checkin_cycles WHERE 
        client_id IN (
          SELECT id FROM clients WHERE 
            profile_id = auth.uid() OR 
            is_my_client(id) OR
            is_platform_owner()
        )
    )
  );

-- app_messages: Clients can read their messages, trainers can read/write
CREATE POLICY app_messages_policy ON app_messages
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        profile_id = auth.uid() OR 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- behavioural_signals: Trainers and platform owners only
CREATE POLICY behavioural_signals_policy ON behavioural_signals
  FOR ALL USING (
    client_id IN (
      SELECT id FROM clients WHERE 
        is_my_client(id) OR
        is_platform_owner()
    )
  );

-- ============================================
-- 7. TRIGGER FUNCTIONS
-- ============================================

-- Updated_at trigger for all tables
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_trainers
  BEFORE UPDATE ON trainers
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_gyms
  BEFORE UPDATE ON gyms
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_clients
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_onboarding_conversations
  BEFORE UPDATE ON onboarding_conversations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_client_goals
  BEFORE UPDATE ON client_goals
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_client_biometrics
  BEFORE UPDATE ON client_biometrics
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_parq_responses
  BEFORE UPDATE ON parq_responses
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_client_health_flags
  BEFORE UPDATE ON client_health_flags
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_pt_flags
  BEFORE UPDATE ON pt_flags
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_client_training_profiles
  BEFORE UPDATE ON client_training_profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_training_programs
  BEFORE UPDATE ON training_programs
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_planned_sessions