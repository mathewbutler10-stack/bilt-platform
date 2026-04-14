// Integration test for BILT Platform Edge Functions
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const TEST_DATA = {
  clientId: 'test-client-123',
  trainerId: 'test-trainer-456',
  gymId: 'test-gym-789',
  userId: 'test-user-999',
  conversation: 'Client wants to lose weight and build muscle. They have a busy schedule and prefer home workouts.',
  checkinResponse: 'Feeling good this week! Completed all workouts and stayed on track with nutrition.',
  sentimentText: 'I\'m really enjoying the program and seeing great results!',
  personaData: {
    answers: [3, 4, 2, 5, 1, 4, 3, 2, 5, 1]
  }
};

async function testEdgeFunction(name, endpoint, method = 'POST', body = null) {
  console.log(`\n🔍 Testing ${name}...`);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${name}: SUCCESS`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Response keys: ${Object.keys(data).join(', ')}`);
      return true;
    } else {
      console.log(`❌ ${name}: FAILED`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error || JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR`);
    console.log(`   ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting BILT Platform Integration Tests');
  console.log('===========================================');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // Test 1: Health endpoint
  results.total++;
  if (await testEdgeFunction('Health Check', '/api/health', 'GET')) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 2: Calculate Nutrition Targets
  results.total++;
  if (await testEdgeFunction('Calculate Nutrition Targets', '/api/edge-functions/calculate-nutrition-targets', 'POST', {
    clientId: TEST_DATA.clientId,
    age: 35,
    gender: 'male',
    heightCm: 180,
    weightKg: 85,
    activityLevel: 'moderate',
    goal: 'weight_loss',
    targetWeightKg: 75,
    timelineWeeks: 12
  })) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 3: Extract Onboarding Data
  results.total++;
  if (await testEdgeFunction('Extract Onboarding Data', '/api/edge-functions/extract-onboarding-data', 'POST', {
    conversation: TEST_DATA.conversation,
    clientId: TEST_DATA.clientId
  })) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 4: Assign DISC Persona
  results.total++;
  if (await testEdgeFunction('Assign DISC Persona', '/api/edge-functions/assign-disc-persona', 'POST', {
    clientId: TEST_DATA.clientId,
    assessmentData: TEST_DATA.personaData
  })) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 5: Run Sentiment Analysis
  results.total++;
  if (await testEdgeFunction('Run Sentiment Analysis', '/api/edge-functions/run-sentiment-analysis', 'POST', {
    text: TEST_DATA.sentimentText,
    clientId: TEST_DATA.clientId,
    context: 'weekly_checkin'
  })) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 6: Schedule Checkin Cycle
  results.total++;
  if (await testEdgeFunction('Schedule Checkin Cycle', '/api/edge-functions/schedule-checkin-cycle', 'POST', {
    clientId: TEST_DATA.clientId,
    trainerId: TEST_DATA.trainerId,
    frequency: 'weekly',
    startDate: new Date().toISOString(),
    durationWeeks: 12,
    checkinType: 'comprehensive'
  })) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 7: Flag Missed Checkins
  results.total++;
  if (await testEdgeFunction('Flag Missed Checkins', '/api/edge-functions/flag-missed-checkins', 'POST', {
    trainerId: TEST_DATA.trainerId,
    lookbackDays: 7,
    notificationThreshold: 3
  })) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 8: Calculate Behavioural Signals
  results.total++;
  if (await testEdgeFunction('Calculate Behavioural Signals', '/api/edge-functions/calculate-behavioural-signals', 'POST', {
    clientId: TEST_DATA.clientId,
    calculationPeriodDays: 28,
    analysisDepth: 'standard'
  })) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 9: Persona Review
  results.total++;
  if (await testEdgeFunction('Persona Review', '/api/edge-functions/persona-review', 'POST', {
    clientId: TEST_DATA.clientId,
    weeksSinceAssessment: 8,
    includeProgressData: true
  })) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('===============');
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! BILT Platform is ready for deployment.');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some tests failed. Please check the edge function implementations.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});