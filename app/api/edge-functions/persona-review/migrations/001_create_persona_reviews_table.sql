-- Migration for persona_reviews table
-- Run this in your Supabase SQL editor

-- Create persona_reviews table
CREATE TABLE IF NOT EXISTS persona_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  review_type TEXT NOT NULL CHECK (review_type IN ('week_4', 'week_8', 'week_24', 'periodic', 'manual')),
  review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Current persona at time of review
  current_persona TEXT NOT NULL CHECK (current_persona IN ('Coach', 'Strategist', 'Motivator')),
  
  -- Engagement metrics
  engagement_metrics JSONB NOT NULL DEFAULT '{}',
  
  -- Progress metrics
  progress_metrics JSONB NOT NULL DEFAULT '{}',
  
  -- Behavioral alignment analysis
  behavioral_alignment JSONB NOT NULL DEFAULT '{}',
  
  -- Insights and analysis
  key_insights TEXT[] NOT NULL DEFAULT '{}',
  risk_factors TEXT[] NOT NULL DEFAULT '{}',
  opportunities TEXT[] NOT NULL DEFAULT '{}',
  
  -- Persona decision
  persona_decision JSONB NOT NULL DEFAULT '{}',
  
  -- Recommendations
  recommendations JSONB NOT NULL DEFAULT '{}',
  
  -- Notifications sent
  notifications_sent JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_persona_reviews_client_id ON persona_reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_persona_reviews_review_date ON persona_reviews(review_date DESC);
CREATE INDEX IF NOT EXISTS idx_persona_reviews_review_type ON persona_reviews(review_type);
CREATE INDEX IF NOT EXISTS idx_persona_reviews_current_persona ON persona_reviews(current_persona);

-- Create view for review statistics
CREATE OR REPLACE VIEW persona_review_statistics AS
SELECT 
  review_type,
  COUNT(*) as total_reviews,
  COUNT(DISTINCT client_id) as unique_clients,
  ROUND(AVG((persona_decision->>'confidence')::numeric), 2) as avg_decision_confidence,
  MIN(review_date) as first_review,
  MAX(review_date) as last_review,
  COUNT(CASE WHEN persona_decision->>'action' = 'maintain' THEN 1 END) as personas_maintained,
  COUNT(CASE WHEN persona_decision->>'action' = 'adjust' THEN 1 END) as personas_adjusted,
  COUNT(CASE WHEN persona_decision->>'action' = 'change' THEN 1 END) as personas_changed
FROM persona_reviews
GROUP BY review_type;

-- Create view for client review history
CREATE OR REPLACE VIEW client_persona_review_history AS
SELECT 
  c.id as client_id,
  c.email,
  c.full_name,
  c.assigned_persona as current_persona,
  pr.review_type,
  pr.review_date,
  pr.persona_decision->>'action' as review_action,
  pr.persona_decision->>'newPersona' as suggested_persona,
  ROUND((pr.engagement_metrics->>'responseRate')::numeric, 1) as response_rate,
  ROUND((pr.progress_metrics->>'goalProgress')::numeric, 1) as goal_progress,
  ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY pr.review_date DESC) as review_rank
FROM clients c
LEFT JOIN persona_reviews pr ON c.id = pr.client_id
WHERE pr.id IS NOT NULL;

-- Create function to get latest review for a client
CREATE OR REPLACE FUNCTION get_latest_persona_review(client_uuid UUID)
RETURNS TABLE (
  review_type TEXT,
  review_date TIMESTAMPTZ,
  current_persona TEXT,
  persona_decision JSONB,
  engagement_metrics JSONB,
  progress_metrics JSONB,
  behavioral_alignment JSONB,
  key_insights TEXT[],
  recommendations JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.review_type,
    pr.review_date,
    pr.current_persona,
    pr.persona_decision,
    pr.engagement_metrics,
    pr.progress_metrics,
    pr.behavioral_alignment,
    pr.key_insights,
    pr.recommendations
  FROM persona_reviews pr
  WHERE pr.client_id = client_uuid
  ORDER BY pr.review_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if client needs review
CREATE OR REPLACE FUNCTION needs_persona_review(
  p_client_id UUID,
  p_review_type TEXT DEFAULT 'periodic'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_last_review_date TIMESTAMPTZ;
  v_last_persona_date TIMESTAMPTZ;
  v_review_period_days INTEGER;
  v_days_since_review NUMERIC;
BEGIN
  -- Get review period based on type
  CASE p_review_type
    WHEN 'week_4' THEN v_review_period_days := 28;
    WHEN 'week_8' THEN v_review_period_days := 56;
    WHEN 'week_24' THEN v_review_period_days := 168;
    ELSE v_review_period_days := 28; -- Default periodic
  END CASE;
  
  -- Get last review date for this client
  SELECT MAX(review_date) INTO v_last_review_date
  FROM persona_reviews
  WHERE client_id = p_client_id;
  
  -- Get last persona assignment date
  SELECT persona_assigned_at INTO v_last_persona_date
  FROM clients
  WHERE id = p_client_id;
  
  -- Calculate days since last review or persona assignment
  IF v_last_review_date IS NOT NULL THEN
    v_days_since_review := EXTRACT(DAY FROM (NOW() - v_last_review_date));
  ELSIF v_last_persona_date IS NOT NULL THEN
    v_days_since_review := EXTRACT(DAY FROM (NOW() - v_last_persona_date));
  ELSE
    -- No review or persona assignment yet
    RETURN TRUE;
  END IF;
  
  -- Return TRUE if days since review exceeds review period
  RETURN v_days_since_review >= v_review_period_days;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
ALTER TABLE persona_reviews ENABLE ROW LEVEL SECURITY;

-- Policy for trainers to view reviews for their clients
CREATE POLICY "Trainers can view persona reviews for their clients" 
ON persona_reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM client_trainer_assignments cta
    WHERE cta.client_id = persona_reviews.client_id
    AND cta.trainer_id = auth.uid()
  )
);

-- Policy for system to insert reviews (using service role)
CREATE POLICY "Service role can insert persona reviews" 
ON persona_reviews
FOR INSERT
WITH CHECK (true);

-- Policy for system to update reviews
CREATE POLICY "Service role can update persona reviews" 
ON persona_reviews
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE persona_reviews IS 'Stores periodic persona review results for clients';
COMMENT ON COLUMN persona_reviews.engagement_metrics IS 'Engagement metrics at time of review (response rate, completion rate, etc.)';
COMMENT ON COLUMN persona_reviews.progress_metrics IS 'Progress metrics at time of review (goal progress, biometric progress, etc.)';
COMMENT ON COLUMN persona_reviews.behavioral_alignment IS 'Behavioral alignment analysis with current persona';
COMMENT ON COLUMN persona_reviews.persona_decision IS 'Decision made during review (maintain/adjust/change) with reasoning';
COMMENT ON COLUMN persona_reviews.recommendations IS 'Recommendations for trainer, client, and system';

COMMENT ON VIEW persona_review_statistics IS 'Aggregate statistics for persona reviews';
COMMENT ON VIEW client_persona_review_history IS 'Historical persona reviews for clients';
COMMENT ON FUNCTION get_latest_persona_review IS 'Returns the latest persona review for a client';
COMMENT ON FUNCTION needs_persona_review IS 'Checks if a client needs a persona review based on review type and timing';