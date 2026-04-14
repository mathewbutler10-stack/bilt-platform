'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/robust-client'
import { 
  Calendar, 
  Dumbbell, 
  ChefHat, 
  TrendingUp, 
  Target, 
  Users,
  Bell,
  Settings,
  LogOut,
  CheckCircle,
  Clock,
  Award
} from 'lucide-react'

export default function ClientDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    workoutsCompleted: 12,
    mealsLogged: 28,
    streakDays: 7,
    goalProgress: 65
  })

  useEffect(() => {
    checkUser()
    // In real app, fetch client data from API
    fetchClientData()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login?role=client')
      return
    }
    setUser(user)
  }

  async function fetchClientData() {
    // Simulate API call
    setTimeout(() => {
      setStats({
        workoutsCompleted: 12,
        mealsLogged: 28,
        streakDays: 7,
        goalProgress: 65
      })
      setLoading(false)
    }, 1000)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                <span className="text-xl font-bold text-blue-600">B</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-6 h-6" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'Client'}!
          </h2>
          <p className="text-gray-600">
            Here's your fitness journey at a glance. Keep up the great work!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.workoutsCompleted}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Workouts Completed</h3>
            <p className="text-gray-600 text-sm">This month</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.mealsLogged}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Meals Logged</h3>
            <p className="text-gray-600 text-sm">This month</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.streakDays} days</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Current Streak</h3>
            <p className="text-gray-600 text-sm">Keep it going!</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.goalProgress}%</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Goal Progress</h3>
            <p className="text-gray-600 text-sm">Weight loss target</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Today's Plan */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Today's Plan</h3>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  View Full Schedule →
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Dumbbell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Upper Body Strength</h4>
                    <p className="text-sm text-gray-600">45 min • 3:00 PM</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Start
                  </button>
                </div>

                <div className="flex items-center p-4 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <ChefHat className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">High Protein Dinner</h4>
                    <p className="text-sm text-gray-600">Grilled chicken with vegetables</p>
                  </div>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Log Meal
                  </button>
                </div>

                <div className="flex items-center p-4 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Weekly Check-in</h4>
                    <p className="text-sm text-gray-600">Due tomorrow with your trainer</p>
                  </div>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Complete
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Progress Overview</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Progress chart will appear here</p>
                  <p className="text-sm text-gray-500">Connected to real data in production</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Trainer */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Schedule Workout</p>
                    <p className="text-sm text-gray-600">Book a session with trainer</p>
                  </div>
                </button>

                <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <ChefHat className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Log Nutrition</p>
                    <p className="text-sm text-gray-600">Track today's meals</p>
                  </div>
                </button>

                <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Message Trainer</p>
                    <p className="text-sm text-gray-600">Get support or ask questions</p>
                  </div>
                </button>

                <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <Target className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Update Goals</p>
                    <p className="text-sm text-gray-600">Adjust your fitness targets</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Trainer Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Your Trainer</h3>
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-bold text-gray-900">Alex Johnson</h4>
                  <p className="text-gray-600">Certified Personal Trainer</p>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-500">★★★★★</span>
                    <span className="text-sm text-gray-600 ml-2">4.9 (128 reviews)</span>
                  </div>
                </div>
              </div>
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Schedule Session
              </button>
            </div>

            {/* Next Check-in */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Next Check-in</h4>
                  <p className="text-gray-600">Tomorrow, 10:00 AM</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Weekly progress review with your trainer. Come prepared with your questions!
              </p>
              <button className="w-full py-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium">
                Prepare Notes
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-lg font-bold text-blue-600">B</span>
                </div>
                <span className="text-lg font-bold text-gray-900">BILT Platform</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Your complete fitness journey companion</p>
            </div>
            <div className="text-sm text-gray-600">
              <p>© 2026 BILT Platform. All rights reserved.</p>
              <p className="mt-1">Need help? Contact support@bilt.com</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
