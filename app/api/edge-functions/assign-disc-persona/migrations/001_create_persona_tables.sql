-- Migration for persona assignment tables
-- Run this in your Supabase SQL editor

-- Create persona_assignments table
CREATE TABLE IF NOT EXISTS persona_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  assessment_id UUID NOT NULL,
  persona_type TEXT NOT NULL CHECK (persona_type IN ('Coach', 'Strategist', 'Motivator')),
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  disc_scores JSONB NOT NULL,
  disc_profile JSONB NOT NULL,
  reasoning TEXT[] NOT NULL,
  strengths TEXT[] NOT NULL,
  coaching_approach TEXT[] NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assessment_context JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_persona_assignments_client_id ON persona_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_persona_assignments_assessment_id ON persona_assignments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_persona_assignments_assigned_at ON persona_assignments(assigned_at DESC);
CREATE INDEX IF NOT EXISTS idx_persona_assignments_persona_type ON persona_assignments(persona_type);

-- Add persona fields to clients table if they don't exist
DO $$ 
BEGIN
  -- Check if columns exist before adding them
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'clients' AND column_name = 'assigned_persona') THEN
    ALTER TABLE clients ADD COLUMN assigned_persona TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'clients' AND column_name = 'persona_assigned_at') THEN
    ALTER TABLE clients ADD COLUMN persona_assigned_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'clients' AND column_name = 'persona_confidence') THEN
    ALTER TABLE clients ADD COLUMN persona_confidence DECIMAL(3,2);
  END IF;
END $$;

-- Create view for persona statistics
CREATE OR REPLACE VIEW persona_statistics AS
SELECT 
  persona_type,
  COUNT(*) as total_assignments,
  ROUND(AVG(confidence_score)::numeric, 2) as avg_confidence,
  MIN(confidence_score) as min_confidence,
  MAX(confidence_score) as max_confidence,
  COUNT(DISTINCT client_id) as unique_clients,
  MIN(assigned_at) as first_assignment,
  MAX(assigned_at) as last_assignment
FROM persona_assignments
GROUP BY persona_type;

-- Create view for client persona history
CREATE OR REPLACE VIEW client_persona_history AS
SELECT 
  c.id as client_id,
  c.email,
  c.full_name,
  pa.persona_type,
  pa.confidence_score,
  pa.assigned_at,
  pa.disc_profile->>'primary' as primary_disc_trait,
  pa.disc_scores,
  ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY pa.assigned_at DESC) as persona_rank
FROM clients c
LEFT JOIN persona_assignments pa ON c.id = pa.client_id
WHERE pa.id IS NOT NULL;

-- Create function to get latest persona for a client
CREATE OR REPLACE FUNCTION get_latest_persona(client_uuid UUID)
RETURNS TABLE (
  persona_type TEXT,
  confidence_score DECIMAL(3,2),
  assigned_at TIMESTAMPTZ,
  disc_profile JSONB,
  reasoning TEXT[],
  strengths TEXT[],
  coaching_approach TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.persona_type,
    pa.confidence_score,
    pa.assigned_at,
    pa.disc_profile,
    pa.reasoning,
    pa.strengths,
    pa.coaching_approach
  FROM persona_assignments pa
  WHERE pa.client_id = client_uuid
  ORDER BY pa.assigned_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to update client persona
CREATE OR REPLACE FUNCTION update_client_persona(
  p_client_id UUID,
  p_persona_type TEXT,
  p_confidence_score DECIMAL(3,2)
)
RETURNS VOID AS $$
BEGIN
  UPDATE clients
  SET 
    assigned_persona = p_persona_type,
    persona_confidence = p_confidence_score,
    persona_assigned_at = NOW(),
    last_updated = NOW()
  WHERE id = p_client_id;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies if using Row Level Security
-- Note: Adjust these policies based on your security requirements

-- Enable RLS on persona_assignments
ALTER TABLE persona_assignments ENABLE ROW LEVEL SECURITY;

-- Policy for trainers to view assignments for their clients
CREATE POLICY "Trainers can view persona assignments for their clients" 
ON persona_assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM client_trainer_assignments cta
    WHERE cta.client_id = persona_assignments.client_id
    AND cta.trainer_id = auth.uid()
  )
);

-- Policy for system to insert assignments (using service role)
CREATE POLICY "Service role can insert persona assignments" 
ON persona_assignments
FOR INSERT
WITH CHECK (true); -- Service role bypasses RLS

-- Policy for system to update assignments
CREATE POLICY "Service role can update persona assignments" 
ON persona_assignments
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE persona_assignments IS 'Stores DISC-based persona assignments for clients';
COMMENT ON COLUMN persona_assignments.disc_scores IS 'Raw DISC scores (0-100 for each trait)';
COMMENT ON COLUMN persona_assignments.disc_profile IS 'Ordered DISC traits (primary, secondary, tertiary, quaternary)';
COMMENT ON COLUMN persona_assignments.reasoning IS 'AI-generated reasoning for persona assignment';
COMMENT ON COLUMN persona_assignments.strengths IS 'Client strengths based on DISC profile';
COMMENT ON COLUMN persona_assignments.coaching_approach IS 'Recommended coaching approaches for this persona';

COMMENT ON VIEW persona_statistics IS 'Aggregate statistics for persona assignments';
COMMENT ON VIEW client_persona_history IS 'Historical persona assignments for clients';
COMMENT ON FUNCTION get_latest_persona IS 'Returns the latest persona assignment for a client';
COMMENT ON FUNCTION update_client_persona IS 'Updates client record with persona information';