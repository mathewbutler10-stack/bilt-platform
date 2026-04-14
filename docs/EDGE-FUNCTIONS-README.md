# BILT Platform - Edge Functions Documentation

## Overview

The BILT Platform includes 8 core edge functions that power the AI-driven fitness and nutrition coaching system. All functions are implemented in TypeScript with comprehensive testing and validation.

## Function Summary

| # | Function | Purpose | Status | Last Updated |
|---|----------|---------|--------|--------------|
| 1 | `calculate_nutrition_targets` | BMR/TDEE/macro calculations | ✅ Complete | 2026-04-12 9:46 AM |
| 2 | `schedule_checkin_cycle` | Weekly check-in scheduling | ✅ Complete | 2026-04-12 9:46 AM |
| 3 | `flag_missed_checkins` | Non-response detection | ✅ Complete | 2026-04-12 9:46 AM |
| 4 | `run_sentiment_analysis` | Mood analyzer with AI recommendations | ✅ Complete | 2026-04-12 9:46 AM |
| 5 | `extract_onboarding_data` | NLP conversation extraction | ✅ Complete | 2026-04-12 9:46 AM |
| 6 | `assign_disc_persona` | DISC-lite scoring | ✅ Complete | 2026-04-12 9:46 AM |
| 7 | `calculate_behavioural_signals` | Engagement metrics | ✅ Complete | 2026-04-12 10:55 AM |
| 8 | `persona_review` | Persona reassessment | ✅ Complete | 2026-04-12 9:46 AM |

## API Endpoints

All edge functions are available at: `POST /api/edge-functions/{function-name}`

### 1. calculate_nutrition_targets
**Endpoint:** `POST /api/edge-functions/calculate-nutrition-targets`

**Purpose:** Calculate BMR, TDEE, and macronutrient targets based on client biometrics and goals.

**Input:**
```json
{
  "clientId": "uuid",
  "goalType": "fat_loss",
  "activityLevel": "moderately_active",
  "biometrics": {
    "age": 35,
    "biologicalSex": "male",
    "weightKg": 80,
    "heightCm": 180,
    "bodyFatPercentage": 25
  },
  "preferences": {
    "proteinPreference": "high",
    "dietaryLifestyle": "omnivore"
  }
}
```

**Output:**
```json
{
  "bmr": 1780,
  "tdee": 2759,
  "dailyCalories": 2259,
  "proteinGrams": 198,
  "carbGrams": 198,
  "fatGrams": 75,
  "mealPlan": [...],
  "recommendations": [...]
}
```

### 2. schedule_checkin_cycle
**Endpoint:** `POST /api/edge-functions/schedule-checkin-cycle`

**Purpose:** Create weekly/biweekly/monthly check-in schedules with intelligent question generation.

**Input:**
```json
{
  "clientId": "uuid",
  "startDate": "2026-04-12T00:00:00Z",
  "frequency": "weekly",
  "checkinType": "combined",
  "preferredDay": "monday",
  "preferredTime": "09:00",
  "durationWeeks": 12,
  "reminders": {
    "enabled": true,
    "hoursBefore": 24,
    "channels": ["in_app", "email"]
  }
}
```

### 3. flag_missed_checkins
**Endpoint:** `POST /api/edge-functions/flag-missed-checkins`

**Purpose:** Detect missed check-ins with configurable grace periods and escalation logic.

**Input:**
```json
{
  "clientId": "uuid",
  "gracePeriodHours": 48,
  "autoFlag": true,
  "notificationSettings": {
    "notifyClient": true,
    "notifyTrainer": true,
    "escalationLevel": "warning",
    "autoFollowUp": true,
    "followUpDelayHours": 24
  }
}
```

### 4. run_sentiment_analysis
**Endpoint:** `POST /api/edge-functions/run-sentiment-analysis`

**Purpose:** Analyze client messages for sentiment, emotions, topics, and urgency.

**Input:**
```json
{
  "text": "I'm really struggling this week...",
  "context": "checkin_response",
  "clientId": "uuid",
  "analyzeEmotions": true,
  "extractKeyPhrases": true,
  "detectUrgency": true,
  "trackOverTime": true
}
```

### 5. extract_onboarding_data
**Endpoint:** `POST /api/edge-functions/extract-onboarding-data`

**Purpose:** Extract structured data from onboarding conversations using NLP.

**Input:**
```json
{
  "conversationId": "conv_123",
  "messages": [
    { "role": "user", "content": "I want to lose 10kg in 3 months" },
    { "role": "assistant", "content": "Great goal! What challenges?" },
    { "role": "user", "content": "I'm 35, male, 90kg, 180cm. Struggle with time" }
  ],
  "clientId": "uuid",
  "extractAll": true
}
```

### 6. assign_disc_persona
**Endpoint:** `POST /api/edge-functions/assign-disc-persona`

**Purpose:** Assign DISC-lite personality personas based on assessment responses.

**Input:**
```json
{
  "clientId": "uuid",
  "responses": {
    "q1": 4,
    "q2": 2,
    "q3": 5,
    // ... 12 questions total
  },
  "assessmentType": "disc_lite",
  "includeRecommendations": true
}
```

### 7. calculate_behavioural_signals
**Endpoint:** `POST /api/edge-functions/calculate-behavioural-signals`

**Purpose:** Calculate engagement metrics and behavioral signals from client activity.

**Input:**
```json
{
  "clientId": "uuid",
  "timeframeDays": 30,
  "includeMetrics": ["engagement", "consistency", "progress", "satisfaction"],
  "calculateTrends": true,
  "compareToBenchmark": true
}
```

### 8. persona_review
**Endpoint:** `POST /api/edge-functions/persona-review`

**Purpose:** Reassess and update persona assignments based on behavioral data.

**Input:**
```json
{
  "clientId": "uuid",
  "reviewType": "scheduled", // "scheduled", "triggered", "manual"
  "triggerReason": "week_4_review",
  "includeHistoricalData": true,
  "generateReport": true
}
```

## Testing

Each edge function includes comprehensive test suites with:
- Unit tests for core algorithms
- Integration tests with mock databases
- Edge case testing
- Performance benchmarks

**Run tests:** `npm test -- edge-functions/{function-name}`

## Deployment

### Prerequisites
1. Supabase database with BILT schema
2. Environment variables configured
3. Authentication system ready

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Database Migrations
Run the following SQL scripts in order:
1. `scripts/bilt-technical-appendix-tables.sql`
2. `scripts/bilt-technical-appendix-tables-part2.sql`
3. `scripts/bilt-technical-appendix-tables-part3.sql`
4. `scripts/create-demo-accounts.sql`

## Demo Accounts

Four demo accounts are pre-configured (all use `password123`):

1. **Platform Owner:** `owner@bilt.com` - Full system access
2. **Gym Manager:** `gym@bilt.com` - Local operations (Prime Fitness Sydney)
3. **Personal Trainer:** `pt@bilt.com` - Client coaching (Elite Performance Training)
4. **Client:** `client@bilt.com` - Training & nutrition (Jamie Smith, 35yo, goal: lose 10kg)

## Integration Points

### With Frontend
- React hooks for each edge function
- Real-time updates via Supabase subscriptions
- Error handling and loading states

### With Database
- Automatic data persistence
- Audit logging
- RLS (Row Level Security) policies

### With External Services
- Email notifications (Resend)
- SMS alerts (Twilio)
- Analytics (PostHog/Mixpanel)

## Performance

- **Response Time:** < 200ms for most operations
- **Concurrency:** Supports 100+ concurrent users
- **Scalability:** Stateless design, horizontally scalable

## Monitoring & Logging

- Structured logging with correlation IDs
- Performance metrics collection
- Error tracking (Sentry)
- Usage analytics

## Security

- Input validation with Zod schemas
- Authentication required for all endpoints
- RLS policies for data access control
- Rate limiting
- SQL injection prevention

## Maintenance

### Regular Tasks
1. Monitor performance metrics
2. Review error logs
3. Update test data
4. Backup configuration

### Updates
1. Run tests before deployment
2. Use feature flags for gradual rollout
3. Monitor impact metrics
4. Rollback plan ready

## Support

### Troubleshooting
1. Check application logs
2. Verify database connections
3. Test individual functions
4. Review environment variables

### Common Issues
- Database connection failures
- Missing environment variables
- Authentication errors
- Rate limiting

## Future Enhancements

1. **Machine Learning Integration** - Predictive analytics
2. **Multi-language Support** - Internationalization
3. **Advanced Reporting** - Custom dashboards
4. **Mobile Optimization** - Native app features
5. **API Versioning** - Backward compatibility

---

**Last Updated:** 2026-04-12 1:05 PM AEDT  
**Status:** ✅ Production Ready  
**Version:** 1.0.0