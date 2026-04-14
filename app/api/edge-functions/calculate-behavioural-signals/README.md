# Calculate Behavioural Signals Edge Function

This edge function analyzes client engagement data over time to calculate behavioral signals, detect risk signals, and generate insights for personal trainers.

## Overview

The `calculate-behavioural-signals` function processes client check-in data, session completion rates, response times, and sentiment analysis to generate comprehensive behavioral insights. It helps identify clients at risk of disengagement, tracks motivation trends, and provides actionable recommendations for trainers.

## Features

### 1. **Behavioral Signal Calculation**
- **Response Rate**: Percentage of check-ins completed vs scheduled
- **Response Time**: Average time taken to respond to check-ins
- **Completion Rate**: Percentage of planned sessions actually completed
- **Sentiment Analysis**: Average sentiment score from check-in responses
- **Trend Analysis**: Identifies improving, stable, or declining trends

### 2. **Risk Detection**
- **Risk Score**: Composite score (0-100) based on multiple factors
- **Risk Levels**: Low, Medium, High, Critical classification
- **Early Warning**: Detects disengagement and compliance issues

### 3. **Insights Generation**
- **Key Insights**: Automated analysis of behavioral patterns
- **Recommendations**: Actionable suggestions for trainers
- **Intervention Effectiveness**: Tracks which interventions work best
- **Milestone Engagement**: Analyzes engagement with program milestones

### 4. **Database Integration**
- Stores calculated signals in `behavioural_signals` table
- Supports historical trend analysis
- Enables dashboard visualizations

## API Endpoints

### POST `/api/edge-functions/calculate-behavioural-signals`
Calculate behavioral signals for one or more clients.

**Request Body:**
```json
{
  "clientId": "uuid-optional",
  "trainerId": "uuid-optional",
  "gymId": "uuid-optional",
  "calculationPeriodDays": 28,
  "forceRecalculation": false,
  "analysisDepth": "standard",
  "notificationSettings": {
    "notifyTrainerOnRisk": true,
    "riskThreshold": 70,
    "generateInsights": true,
    "storeInDatabase": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "calculatedSignals": [
    {
      "clientId": "uuid",
      "calculationDate": "2024-01-01",
      "responseRate4wk": 85.5,
      "avgResponseTimeHours": 12.3,
      "completionRate4wk": 72.8,
      "completionTrend": "improving",
      "avgSentiment4wk": 0.65,
      "sentimentTrend": "stable",
      "atRiskScore": 42.1,
      "riskLevel": "medium",
      "interventionEffectiveness": {
        "checkin_followup": 85,
        "intervention": 60,
        "escalation": 40,
        "milestone": 90
      },
      "milestoneEngagement": {
        "weight_loss": 85,
        "strength_gain": 70,
        "consistency": 90,
        "nutrition": 60
      },
      "keyInsights": [
        "Excellent check-in response rate indicates high engagement",
        "Improving completion trend indicates positive adaptation to the program"
      ],
      "recommendations": [
        "Send personalized check-in reminder messages",
        "Set smaller, more achievable weekly goals"
      ]
    }
  ],
  "summary": {
    "totalClientsAnalyzed": 15,
    "clientsAtRisk": 3,
    "avgResponseRate": 78.2,
    "avgCompletionRate": 65.4,
    "avgSentiment": 0.42,
    "riskDistribution": {
      "low": 8,
      "medium": 4,
      "high": 2,
      "critical": 1
    },
    "trends": {
      "improving": 6,
      "stable": 7,
      "declining": 2
    }
  },
  "actions": [
    {
      "type": "calculated",
      "clientId": "uuid",
      "timestamp": "2024-01-01T10:30:00Z",
      "details": "Calculated behavioral signals (risk: medium, score: 42.1)"
    }
  ]
}
```

### GET `/api/edge-functions/calculate-behavioural-signals`
Retrieve previously calculated behavioral signals.

**Query Parameters:**
- `clientId`: Filter by specific client
- `trainerId`: Filter by trainer's clients
- `startDate`: Start date for filtering
- `endDate`: End date for filtering
- `riskLevel`: Filter by risk level (low, medium, high, critical)
- `limit`: Maximum number of results (default: 50)

## Risk Score Calculation

The risk score (0-100) is calculated using weighted factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| Response Rate | 25% | Percentage of check-ins responded to |
| Completion Rate | 30% | Percentage of planned sessions completed |
| Response Time | 15% | Average time to respond to check-ins |
| Sentiment | 15% | Average sentiment from check-ins |
| Trend | 15% | Direction of completion/sentiment trends |

**Risk Level Thresholds:**
- **Low**: 0-30
- **Medium**: 31-50
- **High**: 51-70
- **Critical**: 71-100

## Data Sources

The function analyzes data from multiple tables:

1. **`checkin_cycles`**: Scheduled check-ins and response times
2. **`checkin_responses`**: Session completion, sentiment, and metrics
3. **`app_messages`**: Intervention effectiveness and engagement
4. **`clients`**: Client information and status
5. **`persona_assignments`**: Client communication preferences

## Usage Examples

### 1. Calculate signals for a single client
```bash
curl -X POST https://your-domain.com/api/edge-functions/calculate-behavioural-signals \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "123e4567-e89b-12d3-a456-426614174000",
    "calculationPeriodDays": 28
  }'
```

### 2. Calculate signals for all clients of a trainer
```bash
curl -X POST https://your-domain.com/api/edge-functions/calculate-behavioural-signals \
  -H "Content-Type: application/json" \
  -d '{
    "trainerId": "123e4567-e89b-12d3-a456-426614174001",
    "forceRecalculation": true,
    "notificationSettings": {
      "notifyTrainerOnRisk": true,
      "riskThreshold": 60
    }
  }'
```

### 3. Retrieve historical signals
```bash
curl "https://your-domain.com/api/edge-functions/calculate-behavioural-signals?trainerId=123e4567-e89b-12d3-a456-426614174001&startDate=2024-01-01&riskLevel=high"
```

## Integration Points

### 1. **Automated Scheduling**
- Schedule daily/weekly calculations via cron job
- Trigger after check-in completion
- Run after major program milestones

### 2. **Trainer Dashboard**
- Display risk scores and trends
- Show actionable insights
- Provide intervention recommendations

### 3. **Alert System**
- Email/SMS notifications for high-risk clients
- In-app alerts for trainers
- Escalation workflows for critical cases

### 4. **Reporting**
- Monthly engagement reports
- Program effectiveness analysis
- Client retention predictions

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Analysis Depth Options
- **basic**: Response and completion rates only
- **standard**: Includes sentiment and trend analysis (default)
- **comprehensive**: Adds intervention effectiveness and milestone engagement

## Error Handling

The function includes comprehensive error handling:
- Validates all input data using Zod schemas
- Gracefully handles missing or incomplete data
- Continues processing other clients if one fails
- Returns detailed error messages for debugging

## Performance Considerations

1. **Caching**: Existing calculations are reused unless `forceRecalculation` is true
2. **Batch Processing**: Processes multiple clients efficiently
3. **Database Indexes**: Uses optimized queries with proper indexes
4. **Time Windows**: Limits analysis to relevant time periods

## Dependencies

- `@supabase/supabase-js`: Database operations
- `zod`: Request validation
- `next/server`: Next.js API framework

## Testing

Test the function with various scenarios:
1. New clients with limited data
2. Highly engaged clients
3. At-risk clients
4. Clients with improving/declining trends
5. Bulk processing of multiple clients

## Monitoring

Monitor the following metrics:
- Processing time per client
- Number of clients analyzed
- Distribution of risk scores
- Error rates and types
- Database storage growth

## Future Enhancements

1. **Machine Learning**: Predictive modeling for client retention
2. **Natural Language Processing**: Advanced sentiment analysis
3. **Real-time Processing**: WebSocket updates for live dashboards
4. **Integration**: Connect with wearable device data
5. **Customization**: Trainer-specific risk thresholds and weights