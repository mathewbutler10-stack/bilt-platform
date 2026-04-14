'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/robust-client'
import { 
  User,
  Users,
  Calendar,
  Target,
  TrendingUp,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Bell,
  CheckCircle,
  Clock,
  Award
} from 'lucide-react'

export default function PTDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeClients: 14,
    sessionsThisWeek: 28,
    clientRetention: 92,
    avgClientProgress: 78
  })

  useEffect(() => {
    checkUser()
    fetchPTData()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login?role=pt')
      return
    }
    setUser(user)
  }

  async function fetchPTData() {
    // Simulate API call
    setTimeout(() => {
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
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your trainer dashboard...</p>
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
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Personal Trainer Dashboard</h1>
                <p className="text-sm text-gray-600">Alex Johnson • Certified Personal Trainer</p>
              </div>
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
            Welcome back, Alex!
          </h2>
          <p className="text-gray-600">
            Manage your clients, schedule sessions, and track progress from your dashboard.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.activeClients}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Active Clients</h3>
            <p className="text-gray-600 text-sm">Currently training</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.sessionsThisWeek}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Sessions This Week</h3>
            <p className="text-gray-600 text-sm">Completed & scheduled</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.clientRetention}%</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Client Retention</h3>
            <p className="text-gray-600 text-sm">6-month average</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.avgClientProgress}%</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Avg. Client Progress</h3>
            <p className="text-gray-600 text-sm">Towards goals</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Today's Schedule */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Today's Schedule</h3>
                <button className="text-purple-600 hover:text-purple-700 font-medium">
                  View Full Week →
                </button>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {item === 1 && 'Michael Chen - Strength Training'}
                        {item === 2 && 'Sarah Miller - Weight Loss Program'}
                        {item === 3 && 'Group Session: HIIT Class'}
                        {item === 4 && 'David Wilson - Mobility & Recovery'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item === 1 && '9:00 AM • PT Room • 60 min'}
                        {item === 2 && '11:30 AM • PT Room • 45 min'}
                        {item === 3 && '3:00 PM • Main Studio • 12 participants'}
                        {item === 4 && '5:00 PM • PT Room • 45 min'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                        {item === 3 ? 'Start Class' : 'Start Session'}
                      </button>
                      <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                        Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Client Progress Overview</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Client progress charts will appear here</p>
                  <p className="text-sm text-gray-500">Connected to client data in production</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Client List */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Add New Client</p>
                    <p className="text-sm text-gray-600">Onboard a new training client</p>
                  </div>
                </button>

                <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Create Workout Plan</p>
                    <p className="text-sm text-gray-600">Design custom program</p>
                  </div>
                </button>

                <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Check Messages</p>
                    <p className="text-sm text-gray-600">Respond to clients</p>
                  </div>
                </button>

                <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <Target className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Update Client Goals</p>
                    <p className="text-sm text-gray-600">Review and adjust targets</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Upcoming Check-ins */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Upcoming Check-ins</h3>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">4 due</span>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">Michael Chen</p>
                    <span className="text-xs text-gray-500">Tomorrow</span>
                  </div>
                  <p className="text-sm text-gray-600">Weekly progress review</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">Sarah Miller</p>
                    <span className="text-xs text-gray-500">Tomorrow</span>
                  </div>
                  <p className="text-sm text-gray-600">Nutrition plan adjustment</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">Group Class</p>
                    <span className="text-xs text-gray-500">Friday</span>
                  </div>
                  <p className="text-sm text-gray-600">Monthly feedback session</p>
                </div>
              </div>
              <button className="w-full mt-4 py-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium">
                Schedule All Check-ins
              </button>
            </div>

            {/* Top Performing Clients */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Top Performing Clients</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                    <span className="text-gray-700">Michael Chen</span>
                  </div>
                  <span className="font-medium text-green-600">+15% progress</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                    <span className="text-gray-700">Emma Wilson</span>
                  </div>
                  <span className="font-medium text-green-600">+12% progress</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                    <span className="text-gray-700">James Rodriguez</span>
                  </div>
                  <span className="font-medium text-green-600">+10% progress</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                    <span className="text-gray-700">Lisa Thompson</span>
                  </div>
                  <span className="font-medium text-green-600">+8% progress</span>
                </div>
              </div>
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
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-lg font-bold text-gray-900">Alex Johnson - Personal Trainer</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Client management and progress tracking dashboard</p>
            </div>
            <div className="text-sm text-gray-600">
              <p>© 2026 BILT Platform. Personal trainer access.</p>
              <p className="mt-1">Certification: NASM CPT • 8 years experience</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
