# assign-disc-persona Edge Function

This edge function analyzes DISC-lite assessment results from client onboarding and assigns one of three PT personas: "Coach", "Strategist", or "Motivator".

## Overview

The function:
1. Analyzes DISC assessment scores (Dominance, Influence, Steadiness, Conscientiousness)
2. Assigns a persona based on scoring algorithms and threshold checks
3. Stores the persona assignment in the database
4. Returns the persona with confidence score and detailed reasoning

## Persona Definitions

### Coach
- **Focus**: Structure, accountability, gradual progress
- **Ideal DISC Profile**: Conscientiousness > Steadiness > Dominance > Influence
- **Best for**: Clients who need consistency and clear guidance
- **Thresholds**: Conscientiousness ≥ 60, Steadiness ≥ 50

### Strategist
- **Focus**: Data, planning, optimization
- **Ideal DISC Profile**: Dominance > Conscientiousness > Steadiness > Influence
- **Best for**: Analytical clients who want evidence-based approaches
- **Thresholds**: Dominance ≥ 60, Conscientiousness ≥ 50

### Motivator
- **Focus**: Energy, enthusiasm, social support
- **Ideal DISC Profile**: Influence > Dominance > Steadiness > Conscientiousness
- **Best for**: Clients who thrive on encouragement and community
- **Thresholds**: Influence ≥ 60, Dominance ≥ 40

## API Endpoints

### POST `/api/edge-functions/assign-disc-persona`

Assigns a persona based on DISC assessment results.

**Request Body:**
```json
{
  "clientId": "uuid",
  "assessmentId": "uuid",
  "discScores": {
    "dominance": 75,
    "influence": 45,
    "steadiness": 60,
    "conscientiousness": 80
  },
  "assessmentContext": {
    "source": "onboarding",
    "completedAt": "2024-01-01T10:00:00Z",
    "version": "1.0"
  },
  "metadata": {
    "responseTimeSeconds": 300,
    "questionCount": 24,
    "completionRate": 100
  }
}
```

**Response:**
```json
{
  "success": true,
  "persona": {
    "type": "Coach",
    "confidence": 0.85,
    "reasoning": [
      "High conscientiousness indicates preference for structure and detail-oriented approach.",
      "Strong steadiness suggests value in consistency and gradual progress.",
      "Primary DISC trait is Conscientiousness, which aligns with Coach persona."
    ],
    "discProfile": {
      "primary": "Conscientiousness",
      "secondary": "Dominance",
      "tertiary": "Steadiness",
      "quaternary": "Influence"
    },
    "strengths": [
      "Detail-oriented and analytical",
      "Assertive when needed",
      "Reliable and steady"
    ],
    "coachingApproach": [
      "Provide structured workout plans with clear progression",
      "Establish regular check-ins for accountability",
      "Focus on gradual, sustainable progress over quick results",
      "Use data tracking to show incremental improvements",
      "Adapt communication to Conscientiousness-dominant style"
    ]
  },
  "clientId": "uuid",
  "assessmentId": "uuid",
  "assignedAt": "2024-01-01T10:00:00Z"
}
```

### GET `/api/edge-functions/assign-disc-persona`

Retrieves persona assignments.

**Query Parameters:**
- `clientId` (optional): Filter by client ID
- `assessmentId` (optional): Filter by assessment ID
- `limit` (optional, default: 10): Number of results to return

**Response:**
```json
{
  "success": true,
  "assignments": [
    {
      "id": "uuid",
      "client_id": "uuid",
      "assessment_id": "uuid",
      "persona_type": "Coach",
      "confidence_score": 0.85,
      "disc_scores": {
        "dominance": 75,
        "influence": 45,
        "steadiness": 60,
        "conscientiousness": 80
      },
      "disc_profile": {
        "primary": "Conscientiousness",
        "secondary": "Dominance",
        "tertiary": "Steadiness",
        "quaternary": "Influence"
      },
      "reasoning": ["..."],
      "strengths": ["..."],
      "coaching_approach": ["..."],
      "assigned_at": "2024-01-01T10:00:00Z"
    }
  ],
  "statistics": {
    "totalAssignments": 1,
    "personaDistribution": {
      "Coach": 1
    },
    "averageConfidence": 0.85,
    "mostRecentAssignment": "2024-01-01T10:00:00Z"
  },
  "total": 1
}
```

## Database Schema

The function expects the following tables:

### `persona_assignments`
```sql
CREATE TABLE persona_assignments (
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

CREATE INDEX idx_persona_assignments_client_id ON persona_assignments(client_id);
CREATE INDEX idx_persona_assignments_assessment_id ON persona_assignments(assessment_id);
CREATE INDEX idx_persona_assignments_assigned_at ON persona_assignments(assigned_at DESC);
```

### `clients` (update)
```sql
ALTER TABLE clients ADD COLUMN IF NOT EXISTS assigned_persona TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS persona_assigned_at TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS persona_confidence DECIMAL(3,2);
```

## Scoring Algorithm

1. **Calculate Persona Scores**: Weighted sum of DISC scores based on persona-specific weights
2. **Check Thresholds**: Verify minimum requirements for each persona
3. **Assign Persona**: 
   - If thresholds met: Assign persona with highest score among viable options
   - If no thresholds met: Assign persona with highest overall score (lower confidence)
4. **Generate Insights**: Create reasoning, strengths, and coaching approach based on DISC profile

## Error Handling

- **400 Bad Request**: Invalid input data (validated with Zod)
- **404 Not Found**: No persona assignments found for query
- **500 Internal Server Error**: Database or processing error

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

## Testing

Example test case:
```bash
curl -X POST http://localhost:3000/api/edge-functions/assign-disc-persona \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "123e4567-e89b-12d3-a456-426614174000",
    "assessmentId": "123e4567-e89b-12d3-a456-426614174001",
    "discScores": {
      "dominance": 75,
      "influence": 45,
      "steadiness": 60,
      "conscientiousness": 80
    }
  }'
```