# Persona Review Edge Function

## Overview
The Persona Review edge function is the 8th and final edge function for the BILT Platform. It periodically reassesses client personas at key milestones (Week 4, 8, 24) to detect persona drift, compare current behavior vs original persona assignment, and generate review reports with change recommendations for Personal Trainers.

## Features

### 1. Periodic Reassessment
- **Milestone Reviews**: Automatic reviews at Week 4, 8, and 24
- **Manual Reviews**: On-demand reviews triggered by trainers
- **Periodic Reviews**: Regular reviews (default every 28 days)

### 2. Persona Drift Detection
- **Drift Scoring**: Calculates persona drift score (0-100)
- **Drift Levels**: Classifies drift as none, minor, moderate, significant, or major
- **Primary Drivers**: Identifies what's causing the drift (behavioral changes, DISC profile shifts, etc.)

### 3. Behavioral Comparison
- **Response Rates**: Compares current vs historical response patterns
- **Completion Rates**: Tracks workout/task completion consistency
- **Sentiment Analysis**: Monitors client sentiment trends
- **Engagement Metrics**: Measures overall engagement and consistency

### 4. DISC Profile Analysis
- **Score Changes**: Tracks changes in DISC trait scores
- **Profile Stability**: Measures how stable the DISC profile remains
- **Alignment Check**: Verifies if current behavior aligns with assigned persona

### 5. Recommendation Engine
- **Actionable Insights**: Provides specific recommendations for trainers
- **Priority Levels**: Low, medium, high, critical priority recommendations
- **Action Types**: Maintain, update, monitor, or intervene actions

### 6. Report Generation
- **Executive Summaries**: High-level overview of findings
- **Key Findings**: Bulleted list of important observations
- **Suggested Actions**: Concrete next steps for trainers
- **Next Review Date**: Automatically schedules follow-up reviews

## API Endpoints

### POST `/api/edge-functions/persona-review`
Performs persona reviews for one or more clients.

**Request Body:**
```json
{
  "clientId": "uuid-optional",
  "trainerId": "uuid-optional",
  "gymId": "uuid-optional",
  "reviewType": "week_4|week_8|week_24|periodic|manual",
  "forceReview": false,
  "startDate": "ISO-date-optional",
  "endDate": "ISO-date-optional",
  "analysisDepth": "basic|standard|comprehensive",
  "notificationSettings": {
    "notifyTrainerOnChange": true,
    "notifyClientOnChange": false,
    "generateDetailedReport": true,
    "storeReviewInDatabase": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "clientId": "uuid",
      "reviewDate": "ISO-date",
      "reviewType": "string",
      "currentPersona": { /* persona details */ },
      "originalPersona": { /* persona details */ },
      "driftAnalysis": { /* drift analysis */ },
      "behavioralComparison": { /* behavioral data */ },
      "discComparison": { /* DISC comparison */ },
      "recommendations": [ /* recommendations */ ],
      "report": { /* generated report */ }
    }
  ],
  "summary": { /* review summary */ },
  "actions": [ /* actions taken */ ]
}
```

### GET `/api/edge-functions/persona-review`
Retrieves persona review history.

**Query Parameters:**
- `clientId`: Filter by client ID
- `trainerId`: Filter by trainer ID
- `limit`: Number of results (default: 10)
- `offset`: Pagination offset (default: 0)

## Database Integration

### Tables Used:
1. **clients**: Client information and current persona assignment
2. **persona_assignments**: Original persona assignment records
3. **checkins**: Behavioral data for response/completion rates
4. **sentiment_analysis**: Client sentiment data
5. **disc_assessments**: DISC assessment results
6. **persona_reviews**: Review history storage

### New Table Created:
```sql
CREATE TABLE persona_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  review_type VARCHAR(20),
  milestone_week INTEGER,
  original_persona VARCHAR(50),
  current_persona VARCHAR(50),
  persona_drift_score INTEGER,
  drift_level VARCHAR(20),
  confidence_change INTEGER,
  behavioral_data JSONB,
  disc_comparison JSONB,
  drift_analysis JSONB,
  recommendations JSONB,
  report_summary JSONB,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Configuration

### Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

### Review Periods:
- Week 4: 28 days
- Week 8: 56 days  
- Week 24: 168 days
- Periodic: 28 days (default)

### Drift Thresholds:
- None: 0-10
- Minor: 11-25
- Moderate: 26-40
- Significant: 41-60
- Major: 61-100

## Usage Examples

### 1. Milestone Review (Week 8)
```javascript
fetch('/api/edge-functions/persona-review', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reviewType: 'week_8',
    trainerId: 'trainer-uuid',
    notificationSettings: {
      notifyTrainerOnChange: true,
      generateDetailedReport: true
    }
  })
})
```

### 2. Manual Review for Specific Client
```javascript
fetch('/api/edge-functions/persona-review', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: 'client-uuid',
    reviewType: 'manual',
    analysisDepth: 'comprehensive'
  })
})
```

### 3. Retrieve Review History
```javascript
fetch('/api/edge-functions/persona-review?clientId=client-uuid&limit=5')
```

## Integration Points

### 1. Scheduled Reviews
- Integrate with cron jobs for automatic milestone reviews
- Trigger reviews when clients reach milestone dates
- Schedule follow-up reviews based on drift severity

### 2. Trainer Notifications
- Send notifications when significant drift detected
- Provide actionable recommendations in notifications
- Include report links for detailed analysis

### 3. Client Portal
- Show persona stability metrics in client dashboard
- Display review history and recommendations
- Allow clients to provide feedback on persona assignments

### 4. Analytics Dashboard
- Aggregate drift statistics across clients/trainers/gyms
- Track persona change trends over time
- Measure impact of persona updates on client outcomes

## Error Handling

The function includes comprehensive error handling:
- Input validation using Zod schemas
- Database connection error handling
- Graceful degradation when data is missing
- Detailed error responses with troubleshooting information

## Performance Considerations

1. **Batch Processing**: Limits to 50 clients per review when no specific client ID provided
2. **Caching**: Consider caching frequent queries for better performance
3. **Indexing**: Ensure proper database indexes on frequently queried columns
4. **Async Processing**: For large-scale reviews, consider moving to background jobs

## Testing

Test scenarios should include:
- Normal milestone reviews
- Edge cases (missing data, first-time reviews)
- Error conditions (invalid IDs, database errors)
- Performance testing with multiple clients
- Integration testing with other edge functions