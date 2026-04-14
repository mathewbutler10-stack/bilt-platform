# BILT Platform - Demo Accounts

## Login Credentials

All demo accounts use the same password: **`password123`**

### Platform Roles:

#### 1. **Platform Owner** - Full System Access
- **Email:** `owner@bilt.com`
- **Password:** `password123`
- **Role:** Owner
- **Permissions:** Full platform management, multi-gym oversight, revenue tracking, staff management
- **Dashboard:** Owner dashboard with system analytics, revenue reports, gym performance

#### 2. **Gym Manager** - Local Operations
- **Email:** `gym@bilt.com`
- **Password:** `password123`
- **Role:** Gym Manager
- **Gym:** Prime Fitness Sydney
- **Permissions:** Local gym management, member oversight, class scheduling, staff coordination
- **Dashboard:** Gym dashboard with member analytics, class schedules, local revenue

#### 3. **Personal Trainer** - Client Coaching
- **Email:** `pt@bilt.com`
- **Password:** `password123`
- **Role:** Personal Trainer
- **Business:** Elite Performance Training
- **Permissions:** Client management, program design, meal planning, progress monitoring
- **Dashboard:** PT dashboard with client list, program assignment, progress tracking, nutrition planning

#### 4. **Client** - Training & Nutrition
- **Email:** `client@bilt.com`
- **Password:** `password123`
- **Role:** Client
- **Name:** Jamie Smith
- **Permissions:** Personal training program, meal plans, progress tracking, check-ins
- **Dashboard:** Client dashboard with workouts, nutrition, progress charts, messaging

## Client Profile Details (Jamie Smith)

### Biometrics:
- **Age:** 35 (DOB: 1990-05-15)
- **Gender:** Female
- **Height:** 165 cm
- **Weight:** 75 kg
- **Goal Weight:** 65 kg

### Goals:
- **Primary Goal:** Lose 10kg and improve cardiovascular fitness
- **Why:** "Want to feel more confident and have more energy for my kids"
- **Timeline:** 3 months
- **Target Date:** July 11, 2026

### Training Profile:
- **Experience Level:** Intermediate
- **Activity Level:** Moderately Active
- **Training Days:** 3 days per week
- **Location:** Gym
- **Preferred Types:** Strength, Cardio, HIIT

### Nutrition Profile:
- **Calorie Target:** 1,850 kcal/day
- **Protein:** 140g/day
- **Carbs:** 180g/day
- **Fat:** 60g/day
- **Allergies:** Nut allergy (no peanuts, tree nuts)
- **Tracking Preference:** Portion-based (not macro counting)
- **Cooking Time:** 30-60 minutes
- **Budget:** Moderate

### Persona Assignment:
- **DISC Primary:** Influential
- **PT Persona:** Supporter (60% support, 30% challenge, 10% data)
- **Communication Style:** Friendly, encouraging, celebrates small wins

## Platform Features by Role

### Owner Dashboard Features:
- Multi-gym performance analytics
- Revenue tracking and forecasting
- Staff management and permissions
- System configuration and settings
- Platform-wide reporting

### Gym Dashboard Features:
- Member management and onboarding
- Class scheduling and attendance
- Local revenue and expenses
- Staff scheduling and coordination
- Facility management

### PT Dashboard Features:
- Client list with status indicators
- Program design and assignment
- Meal plan creation and delivery
- Progress monitoring and analytics
- Client messaging and check-ins
- Nutrition target calculation

### Client Dashboard Features:
- Weekly workout schedule
- Meal plans with grocery lists
- Progress tracking and charts
- Check-in responses and feedback
- Messaging with PT
- Achievement badges and streaks

## Setup Instructions

### 1. Database Setup:
Run the SQL script to create demo accounts:
```sql
-- Run in Supabase SQL Editor for bilt-prod project
\i scripts/create-demo-accounts.sql
```

### 2. Auth Setup (if using Supabase Auth):
Create auth users with the same emails:
```bash
# Use Supabase Auth API or Dashboard to create users
# Email: owner@bilt.com, gym@bilt.com, pt@bilt.com, client@bilt.com
# Password: password123 for all
```

### 3. Application Login:
1. Navigate to the BILT application
2. Click "Get Started" or go to `/auth/login`
3. Use any of the demo credentials above
4. Role-specific dashboard will load automatically

## Testing Scenarios

### Scenario 1: PT Creating Client Program
1. Login as PT (`pt@bilt.com`)
2. Navigate to Client Management
3. Select Jamie Smith
4. Create new training program
5. Assign meal plan
6. Schedule weekly check-ins

### Scenario 2: Client Progress Tracking
1. Login as Client (`client@bilt.com`)
2. View weekly workout schedule
3. Log completed sessions
4. Track nutrition intake
5. Respond to weekly check-in
6. View progress charts

### Scenario 3: Gym Management
1. Login as Gym Manager (`gym@bilt.com`)
2. View member analytics
3. Schedule group classes
4. Monitor staff performance
5. Review local revenue

### Scenario 4: Platform Oversight
1. Login as Owner (`owner@bilt.com`)
2. View multi-gym performance
3. Analyze revenue trends
4. Manage platform settings
5. Generate system reports

## Security Notes

- **Demo Environment:** These credentials are for testing/demo only
- **Production:** Use proper user registration flow in production
- **Password:** Change from default in production environments
- **Data:** Demo data is synthetic and for testing purposes only
- **Permissions:** Role-based access control is implemented via RLS

## Troubleshooting

### Common Issues:

1. **Login Fails:** Ensure auth users are created in Supabase
2. **Role Not Recognized:** Check profiles table has correct role assignments
3. **Missing Data:** Run the complete SQL script for all demo data
4. **Permission Errors:** Verify RLS policies are correctly configured

### Support:
- Check application logs for errors
- Verify Supabase connection settings
- Ensure all required tables exist
- Confirm foreign key relationships

---

**Last Updated:** 2026-04-11  
**Platform Version:** BILT 1.0  
**Environment:** Development/Demo