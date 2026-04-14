# BILT Platform - Integration Test Execution Plan

## 📋 **TEST EXECUTION STATUS**

**Current Status:** 🔄 **READY FOR EXECUTION** (Awaiting Database)
**Database Status:** ❌ **NOT AVAILABLE** (Awaiting Mat's SQL migrations)
**Test Readiness:** ✅ **TEST SCRIPTS READY**
**Estimated Test Time:** 30 minutes (when database available)

## 🎯 **TEST SCOPE**

### **1. Health & Infrastructure Tests**
- ✅ **Health Check:** `/api/health` - Verifies platform is running
- **Status:** ✅ **PASSING** (Server is healthy)

### **2. Edge Function Integration Tests (8 Functions)**
- **Status:** ❌ **BLOCKED** (Requires database connection)
- **Functions to Test:**
  1. `calculate_nutrition_targets` - Nutrition calculation
  2. `extract_onboarding_data` - NLP conversation extraction
  3. `assign_disc_persona` - DISC assessment scoring
  4. `run_sentiment_analysis` - Mood detection
  5. `schedule_checkin_cycle` - Weekly check-in scheduling
  6. `flag_missed_checkins` - Non-response detection
  7. `calculate_behavioural_signals` - Engagement metrics
  8. `persona_review` - Persona reassessment

### **3. Dashboard Functional Tests**
- **Status:** 🔄 **PARTIAL** (UI works, data integration blocked)
- **Dashboards to Test:**
  1. Client Dashboard - Fitness journey tracking
  2. PT Dashboard - Client management
  3. Gym Dashboard - Business operations
  4. Owner Dashboard - Platform administration

### **4. Authentication & Authorization Tests**
- **Status:** 🔄 **READY** (Supabase Auth configured)
- **Roles to Test:**
  1. Client role access permissions
  2. Personal Trainer role permissions
  3. Gym Owner role permissions
  4. Platform Owner role permissions

## 🚀 **TEST EXECUTION PREREQUISITES**

### **✅ COMPLETED:**
1. **Test Scripts Created:** `scripts/integration-test.js`
2. **Test Data Prepared:** Mock data structures defined
3. **API Endpoints Verified:** All endpoints accessible
4. **Health Checks Passing:** Platform is running

### **🚨 BLOCKED BY DATABASE:**
1. **SQL Migrations:** Need to be executed in Supabase `bilt-prod`
2. **Database Connection:** Edge functions require Supabase client
3. **Data Validation:** Request validation fails without database schema
4. **User Authentication:** Demo users need to be created in Supabase Auth

### **🔧 TECHNICAL REQUIREMENTS:**
1. **Supabase Project:** `bilt-prod` with migrations executed
2. **Environment Variables:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Demo Users:** Auth accounts for all 4 roles
4. **Test Data:** Seed data in database (2,150 meals, 520 workouts, etc.)

## 📊 **TEST DATA REQUIREMENTS**

### **For Edge Function Tests:**
```javascript
// Example test data for calculate_nutrition_targets
const nutritionTestData = {
  clientId: "123e4567-e89b-12d3-a456-426614174000", // Valid UUID
  goalType: "fat_loss",
  activityLevel: "moderately_active",
  biometrics: {
    age: 35,
    biologicalSex: "male",
    weightKg: 85,
    heightCm: 180,
    bodyFatPercentage: 25
  },
  preferences: {
    proteinPreference: "high",
    carbPreference: "moderate",
    dietaryLifestyle: "omnivore"
  }
};

// Example test data for extract_onboarding_data
const onboardingTestData = {
  conversation: "I want to lose weight and build muscle. I work 9-5 and can workout in the evenings. I prefer home workouts with minimal equipment.",
  clientId: "123e4567-e89b-12d3-a456-426614174000"
};
```

### **For Authentication Tests:**
```javascript
// Demo user credentials (need to be created in Supabase Auth)
const demoUsers = {
  client: { email: "client@bilt.com", password: "password123" },
  pt: { email: "pt@bilt.com", password: "password123" },
  gym: { email: "gym@bilt.com", password: "password123" },
  owner: { email: "owner@bilt.com", password: "password123" }
};
```

## ⏱️ **TEST EXECUTION TIMELINE**

### **Phase 1: Database Setup (15 minutes)**
1. **Execute SQL migrations** in Supabase `bilt-prod`
2. **Create demo auth users** in Supabase Auth
3. **Load seed data** (meals, workouts, ingredients, exercises)
4. **Verify database connections** and RLS policies

### **Phase 2: Edge Function Tests (15 minutes)**
1. **Run integration test script** with proper test data
2. **Verify all 8 edge functions** return valid responses
3. **Test error handling** with invalid inputs
4. **Validate data persistence** in database

### **Phase 3: Dashboard & UI Tests (15 minutes)**
1. **Test all 4 dashboards** with demo user logins
2. **Verify role-based access** permissions
3. **Test data display** and UI functionality
4. **Validate navigation** between dashboard sections

### **Phase 4: Performance & Security (15 minutes)**
1. **Load testing** on critical endpoints
2. **Security validation** of RLS policies
3. **Error rate monitoring** during tests
4. **Performance benchmarking** of edge functions

### **Total Estimated Test Time:** 60 minutes

## 🧪 **TEST SCRIPT ENHANCEMENTS NEEDED**

### **Current Script Issues:**
1. **Test data validation** - Needs proper UUIDs and data structures
2. **Database dependency** - Tests fail without database connection
3. **Authentication integration** - Needs Supabase Auth token handling
4. **Error handling** - Better error messages and recovery

### **Enhancements to Implement (When Database Ready):**
1. **Add authentication headers** to API requests
2. **Implement retry logic** for transient failures
3. **Add data cleanup** between test runs
4. **Include performance metrics** collection
5. **Add comprehensive logging** for debugging

## 📈 **SUCCESS CRITERIA**

### **Minimum Viable Test Success:**
1. ✅ **Health check passes** (200 OK)
2. ✅ **All 8 edge functions** return valid responses (not 400/500 errors)
3. ✅ **All 4 dashboards** load without JavaScript errors
4. ✅ **Authentication works** for all 4 user roles
5. ✅ **No critical security issues** identified

### **Comprehensive Test Success:**
1. ✅ **All edge functions** process data correctly
2. ✅ **Database operations** succeed (CRUD operations)
3. ✅ **RLS policies** enforce proper data isolation
4. ✅ **Performance metrics** meet acceptable thresholds
5. ✅ **Error handling** works for all failure scenarios

## 🚨 **RISK MITIGATION**

### **Test Failure Scenarios:**
1. **Database connection fails** - Rollback migrations, verify credentials
2. **Edge functions return errors** - Check request data, validate schemas
3. **Authentication fails** - Verify Supabase Auth configuration
4. **Performance issues** - Optimize queries, add caching

### **Contingency Plans:**
1. **Have database backups** ready before testing
2. **Maintain test environment** separate from production
3. **Implement feature flags** for problematic components
4. **Prepare rollback procedures** for failed deployments

## 📝 **TEST REPORTING**

### **Automated Reports:**
1. **Test execution summary** - Pass/fail counts
2. **Performance metrics** - Response times, error rates
3. **Coverage report** - API endpoints tested
4. **Security findings** - Any vulnerabilities identified

### **Manual Verification:**
1. **Dashboard functionality** - Manual UI testing
2. **User experience** - End-to-end workflow validation
3. **Data accuracy** - Verify calculations and displays
4. **Mobile responsiveness** - Cross-device compatibility

## 🔄 **CONTINUOUS TESTING PLAN**

### **Post-Deployment Testing:**
1. **Scheduled health checks** every 15 minutes
2. **Weekly integration tests** of critical paths
3. **Monthly security audits** of all components
4. **Quarterly performance reviews** and optimization

### **Monitoring & Alerting:**
1. **Real-time error tracking** with Sentry
2. **Performance monitoring** of edge functions
3. **User behavior analytics** for feature usage
4. **Automated alerts** for test failures

---

**TEST READINESS STATUS:** 🔄 **AWAITING DATABASE**
**BLOCKED BY:** Mat's SQL migrations and environment configuration
**ESTIMATED TEST START:** When database setup complete
**TEST DURATION:** 60 minutes (when database ready)

**Last Updated:** April 12, 2026 - 9:30 PM AEDT
**Prepared by:** Alfred (AI Assistant)
**Next Action:** Execute tests when Mat completes database setup