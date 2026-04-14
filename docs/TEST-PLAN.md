# BILT Platform - Edge Functions Test Plan

## Overview

This test plan covers the 8 edge functions implemented in the BILT Platform. Each function has unit tests, integration tests, and performance tests.

## Test Environment

### Requirements
- Node.js 18+
- Supabase database (local or test instance)
- Test data set
- API testing tool (Postman, curl, etc.)

### Setup
```bash
# Clone repository
git clone https://github.com/mathewbutler10-stack/bilt.git
cd bilt

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.test
# Edit .env.test with test credentials

# Start test server
npm run test:dev
```

## Test Cases

### 1. calculate_nutrition_targets

#### 1.1 Unit Tests
- [ ] **TC-001:** Calculate BMR for male/female
- [ ] **TC-002:** Calculate TDEE with different activity levels
- [ ] **TC-003:** Macronutrient distribution for different goals
- [ ] **TC-004:** Meal plan generation
- [ ] **TC-005:** Input validation (invalid biometrics)

#### 1.2 Integration Tests
- [ ] **TC-101:** End-to-end calculation with database save
- [ ] **TC-102:** Retrieve previous calculations
- [ ] **TC-103:** Update existing nutrition targets
- [ ] **TC-104:** Error handling (database unavailable)

#### 1.3 Performance Tests
- [ ] **TC-201:** Response time < 100ms (p95)
- [ ] **TC-202:** Concurrent users (10+ simultaneous)
- [ ] **TC-203:** Memory usage under load

### 2. schedule_checkin_cycle

#### 2.1 Unit Tests
- [ ] **TC-301:** Weekly schedule generation
- [ ] **TC-302:** Biweekly schedule generation
- [ ] **TC-303:** Monthly schedule generation
- [ ] **TC-304:** Question generation by week/type
- [ ] **TC-305:** Reminder configuration

#### 2.2 Integration Tests
- [ ] **TC-401:** Create complete 12-week cycle
- [ ] **TC-402:** Pause/resume cycle
- [ ] **TC-403:** Update schedule preferences
- [ ] **TC-404:** Notification system integration

#### 2.3 Performance Tests
- [ ] **TC-501:** Schedule 100 clients simultaneously
- [ ] **TC-502:** Bulk schedule operations
- [ ] **TC-503:** Query performance for large datasets

### 3. flag_missed_checkins

#### 3.1 Unit Tests
- [ ] **TC-601:** Detect missed check-ins
- [ ] **TC-602:** Grace period calculation
- [ ] **TC-603:** Escalation logic (warning → concern → urgent)
- [ ] **TC-604:** Notification templates
- [ ] **TC-605:** Follow-up scheduling

#### 3.2 Integration Tests
- [ ] **TC-701:** End-to-end missed check-in workflow
- [ ] **TC-702:** Multiple missed check-ins pattern
- [ ] **TC-703:** Integration with notification services
- [ ] **TC-704:** Database state after flagging

#### 3.3 Performance Tests
- [ ] **TC-801:** Process 1000 check-ins in batch
- [ ] **TC-802:** Real-time detection performance
- [ ] **TC-803:** Memory usage for large datasets

### 4. run_sentiment_analysis

#### 4.1 Unit Tests
- [ ] **TC-901:** Sentiment scoring (-1 to +1)
- [ ] **TC-902:** Emotion detection
- [ ] **TC-903:** Topic extraction
- [ ] **TC-904:** Urgency detection
- [ ] **TC-905:** Coaching recommendations

#### 4.2 Integration Tests
- [ ] **TC-1001:** Analyze check-in responses
- [ ] **TC-1002:** Analyze onboarding conversations
- [ ] **TC-1003:** Trend analysis over time
- [ ] **TC-1004:** Database persistence

#### 4.3 Performance Tests
- [ ] **TC-1101:** Analyze 100 messages concurrently
- [ ] **TC-1102:** Long text analysis performance
- [ ] **TC-1103:** Memory usage for NLP processing

### 5. extract_onboarding_data

#### 5.1 Unit Tests
- [ ] **TC-1201:** Goal extraction (weight loss, muscle gain, etc.)
- [ ] **TC-1202:** Challenge detection
- [ ] **TC-1203:** Biometric extraction
- [ ] **TC-1204:** Lifestyle analysis
- [ ] **TC-1205:** Completeness scoring

#### 5.2 Integration Tests
- [ ] **TC-1301:** End-to-end conversation processing
- [ ] **TC-1302:** Multi-language support (if implemented)
- [ ] **TC-1303:** Integration with persona assignment
- [ ] **TC-1304:** Database storage and retrieval

#### 5.3 Performance Tests
- [ ] **TC-1401:** Process long conversations
- [ ] **TC-1402:** Batch processing of multiple conversations
- [ ] **TC-1403:** Real-time extraction performance

### 6. assign_disc_persona

#### 6.1 Unit Tests
- [ ] **TC-1501:** DISC scoring algorithm
- [ ] **TC-1502:** Persona assignment logic
- [ ] **TC-1503:** Confidence scoring
- [ ] **TC-1504:** Recommendation generation
- [ ] **TC-1505:** Input validation

#### 6.2 Integration Tests
- [ ] **TC-1601:** End-to-end assessment workflow
- [ ] **TC-1602:** Integration with onboarding data
- [ ] **TC-1603:** Database persistence
- [ ] **TC-1604:** Update existing persona assignments

#### 6.3 Performance Tests
- [ ] **TC-1701:** Process 100 assessments concurrently
- [ ] **TC-1702:** Scoring algorithm performance
- [ ] **TC-1703:** Memory usage for large datasets

### 7. calculate_behavioural_signals

#### 7.1 Unit Tests
- [ ] **TC-1801:** Engagement score calculation
- [ ] **TC-1802:** Consistency metrics
- [ ] **TC-1803:** Progress tracking
- [ ] **TC-1804:** Satisfaction scoring
- [ ] **TC-1805:** Trend analysis

#### 7.2 Integration Tests
- [ ] **TC-1901:** End-to-end behavioral analysis
- [ ] **TC-1902:** Integration with check-in data
- [ ] **TC-1903:** Real-time signal calculation
- [ ] **TC-1904:** Alert generation for concerning signals

#### 7.3 Performance Tests
- [ ] **TC-2001:** Calculate signals for 1000 clients
- [ ] **TC-2002:** Real-time calculation performance
- [ ] **TC-2003:** Database query optimization

### 8. persona_review

#### 8.1 Unit Tests
- [ ] **TC-2101:** Scheduled review logic
- [ ] **TC-2102:** Triggered review conditions
- [ ] **TC-2103:** Manual review process
- [ ] **TC-2104:** Persona reassessment algorithm
- [ ] **TC-2105:** Report generation

#### 8.2 Integration Tests
- [ ] **TC-2201:** End-to-end review workflow
- [ ] **TC-2202:** Integration with behavioral signals
- [ ] **TC-2203:** Database updates after review
- [ ] **TC-2204:** Notification system integration

#### 8.3 Performance Tests
- [ ] **TC-2301:** Batch review of 100 clients
- [ ] **TC-2302:** Report generation performance
- [ ] **TC-2303:** Memory usage for complex analyses

## Test Data

### Sample Client Data
```json
{
  "clientId": "test-client-001",
  "biometrics": {
    "age": 35,
    "biologicalSex": "male",
    "weightKg": 80,
    "heightCm": 180,
    "bodyFatPercentage": 25
  },
  "goal": "fat_loss",
  "activityLevel": "moderately_active"
}
```

### Sample Conversation Data
```json
{
  "messages": [
    {
      "role": "user",
      "content": "I want to lose 10kg in 3 months for my wedding"
    },
    {
      "role": "assistant", 
      "content": "That's a great goal! What challenges have you faced with weight loss before?"
    }
  ]
}
```

### Sample Assessment Data
```json
{
  "responses": {
    "q1": 4,
    "q2": 2,
    "q3": 5,
    "q4": 3,
    "q5": 4,
    "q6": 2,
    "q7": 5,
    "q8": 3,
    "q9": 4,
    "q10": 2,
    "q11": 5,
    "q12": 3
  }
}
```

## Test Execution

### Automated Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- edge-functions/calculate-nutrition-targets

# Run with coverage
npm test -- --coverage

# Run performance tests
npm run test:performance
```

### Manual Tests
1. **API Testing:** Use Postman collection
2. **UI Testing:** Manual browser testing
3. **Integration Testing:** End-to-end user flows
4. **Security Testing:** Authentication, authorization

### Load Testing
```bash
# Using k6 (example)
k6 run tests/load/edge-functions.js

# Using Artillery
artillery run tests/load/artillery.yml
```

## Test Results

### Success Criteria
- **Unit Tests:** 100% pass rate
- **Integration Tests:** 95% pass rate
- **Performance Tests:** Meet SLA requirements
- **Security Tests:** No critical vulnerabilities

### Reporting
- **Test Execution Report:** Summary of all tests run
- **Defect Report:** List of bugs found
- **Performance Report:** Metrics and benchmarks
- **Coverage Report:** Code coverage percentages

### Defect Management
1. **Priority 1 (Critical):** Blocking deployment, fix immediately
2. **Priority 2 (High):** Major functionality affected, fix before release
3. **Priority 3 (Medium):** Minor issues, fix in next release
4. **Priority 4 (Low):** Cosmetic issues, fix when possible

## Test Environment Management

### CI/CD Pipeline
```yaml
# GitHub Actions example
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
```

### Test Data Management
- **Fresh Data:** For each test run
- **Isolation:** Tests don't interfere with each other
- **Cleanup:** Remove test data after tests
- **Backup:** Backup before destructive tests

### Environment Variables
```env
# Test environment
NODE_ENV=test
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=test-key
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:54322/bilt_test
```

## Regression Testing

### Automated Regression Suite
- [ ] Run after each code change
- [ ] Run before each deployment
- [ ] Run weekly on schedule

### Manual Regression Checklist
- [ ] Critical user paths work
- [ ] Database migrations don't break existing data
- [ ] Performance hasn't degraded
- [ ] Security controls still work

### Smoke Tests for Deployment
```bash
# After deployment, run smoke tests
npm run test:smoke

# Check critical endpoints
curl https://deployed-app.com/api/health
curl https://deployed-app.com/api/auth/health
```

## Performance Benchmarks

### Acceptable Performance
- **API Response Time:** < 500ms (p95)
- **Database Queries:** < 100ms (p95)
- **Page Load Time:** < 2 seconds
- **Concurrent Users:** 100+ without degradation

### Load Testing Scenarios
1. **Normal Load:** 50 concurrent users
2. **Peak Load:** 200 concurrent users
3. **Stress Test:** 500+ concurrent users
4. **Endurance Test:** 24-hour sustained load

### Monitoring During Tests
- **Application Metrics:** CPU, memory, response times
- **Database Metrics:** Query performance, connections
- **Network Metrics:** Bandwidth, latency
- **Business Metrics:** Successful transactions, error rates

## Security Testing

### Authentication & Authorization
- [ ] Password policies enforced
- [ ] Session management secure
- [ ] Role-based access control works
- [ ] API keys properly secured

### Data Protection
- [ ] PII data encrypted
- [ ] Database RLS policies work
- [ ] Data backups secure
- [ ] Data deletion works properly

### API Security
- [ ] Input validation prevents injection
- [ ] Rate limiting works
- [ ] CORS properly configured
- [ ] HTTPS enforced

## Accessibility Testing

### WCAG Compliance
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast sufficient
- [ ] Text resizing works

### Mobile Responsiveness
- [ ] Works on mobile devices
- [ ] Touch targets appropriate size
- [ ] Orientation changes handled
- [ ] Offline functionality (if applicable)

## Browser Compatibility

### Supported Browsers
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)

### Mobile Browsers
- [ ] iOS Safari
- [ ] Chrome for Android
- [ ] Samsung Internet

## Test Completion Criteria

### Must Have (Blocking)
- [ ] All unit tests pass
- [ ] Critical integration tests pass
- [ ] No security vulnerabilities
- [ ] Performance meets SLA

### Should Have (Important)
- [ ] 80%+ code coverage
- [ ] All integration tests pass
- [ ] Accessibility requirements met
- [ ] Browser compatibility verified

### Nice to Have (Optional)
- [ ] 90%+ code coverage
- [ ] Performance optimized
- [ ] Load testing completed
- [ ] User acceptance testing done

## Sign-off

### Test Lead
- [ ] All tests completed
- [ ] Results reviewed
- [ ] Defects tracked
- [ ] Ready for deployment

### Development Lead
- [ ] Code reviewed
- [ ] Defects addressed
- [ ] Performance verified
- [ ] Ready for deployment

### Product Owner
- [ ] Requirements met
- [ ] User acceptance verified
- [ ] Business value confirmed
- [ ] Ready for deployment

---

**Test Plan Version:** 1.0  
**Last Updated:** 2026-04-12 1:15 PM AEDT  
**Status:** ✅ Ready for Execution  
**Next Steps:** Set up test environment, execute test cases, report results