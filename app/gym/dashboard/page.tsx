'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/robust-client'
import SidebarNavigation from '@/components/SidebarNavigation'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { EmptyState } from '@/components/EmptyState'
import { 
  Building2,
  Users,
  User,
  DollarSign,
  Calendar,
  TrendingUp,
  Settings,
  LogOut,
  Bell,
  MessageSquare,
  BarChart3,
  CheckCircle,
  Plus,
  ArrowRight,
  Activity,
  Target,
  Clock,
  Award,
  PieChart,
  AlertCircle
} from 'lucide-react'

export default function GymDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTrainers: 8,
    activeClients: 142,
    monthlyRevenue: 12450,
    membershipGrowth: 12.3,
    classAttendance: 89,
    equipmentStatus: 92
  })

  useEffect(() => {
    checkUser()
    fetchGymData()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login?role=gym')
      return
    }
    setUser(user)
  }

  async function fetchGymData() {
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SidebarNavigation 
          userRole="gym" 
          userName={user?.email?.split('@')[0]} 
          userEmail={user?.email}
        />
        <div className="lg:pl-64">
          <div className="p-6">
            <LoadingSkeleton type="dashboard" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarNavigation 
        userRole="gym" 
        userName={user?.email?.split('@')[0]} 
        userEmail={user?.email}
      />
      
      <main className="lg:pl-64 pb-16 lg:pb-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gym Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.email?.split('@')[0] || 'Gym Owner'}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200">
                <MessageSquare className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'G'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  FitLife Sydney Management
                </h2>
                <p className="text-gray-600">
                  Monitor your gym performance, manage trainers, and grow your business
                </p>
              </div>
              <button className="btn-primary flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add New Trainer</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200 card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.totalTrainers}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Personal Trainers</h3>
              <p className="text-gray-600 text-sm">Active at your gym</p>
              <div className="mt-4 flex items-center text-sm text-primary-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+2 this month</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200 card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-secondary-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.activeClients}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Active Clients</h3>
              <p className="text-gray-600 text-sm">Currently training</p>
              <div className="mt-4 flex items-center text-sm text-secondary-600">
                <Activity className="w-4 h-4 mr-1" />
                <span>92% retention rate</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200 card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-accent-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Monthly Revenue</h3>
              <p className="text-gray-600 text-sm">From subscriptions</p>
              <div className="mt-4 flex items-center text-sm text-accent-600">
                <ArrowRight className="w-4 h-4 mr-1" />
                <span>12.3% growth</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200 card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.membershipGrowth}%</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Membership Growth</h3>
              <p className="text-gray-600 text-sm">Month over month</p>
              <div className="mt-4 flex items-center text-sm text-purple-600">
                <Target className="w-4 h-4 mr-1" />
                <span>On track for Q2</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Today's Schedule & Performance */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Schedule */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Today's Schedule</h3>
                    <p className="text-gray-600">Manage classes and appointments</p>
                  </div>
                  <button className="btn-outline flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>View Calendar</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {[
                    { time: '9:00 AM', title: 'Group Fitness: HIIT Class', location: 'Main Studio', participants: 12, trainer: 'Alex Johnson' },
                    { time: '2:00 PM', title: 'Personal Training', location: 'PT Room', client: 'Michael Chen', trainer: 'Sarah Miller' },
                    { time: '6:00 PM', title: 'Yoga & Mindfulness', location: 'Yoga Studio', participants: 18, trainer: 'Emma Wilson' }
                  ].map((session, index) => (
                    <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex flex-col items-center justify-center mr-4">
                        <Clock className="w-5 h-5 text-primary-600 mb-1" />
                        <span className="text-xs font-medium text-primary-600">{session.time}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{session.title}</h4>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Building2 className="w-4 h-4 mr-1" />
                          <span>{session.location}</span>
                          {session.participants && (
                            <>
                              <Users className="w-4 h-4 ml-3 mr-1" />
                              <span>{session.participants} participants</span>
                            </>
                          )}
                          {session.client && (
                            <>
                              <User className="w-4 h-4 ml-3 mr-1" />
                              <span>Client: {session.client}</span>
                            </>
                          )}
                        </div>
                        {session.trainer && (
                          <div className="text-sm text-gray-500 mt-1">
                            Trainer: {session.trainer}
                          </div>
                        )}
                      </div>
                      <button className="btn-primary px-4 py-2">
                        {session.participants ? 'View Roster' : 'View Details'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Performance Metrics</h3>
                    <p className="text-gray-600">Key indicators for gym performance</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                      Weekly
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
                      Monthly
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="text-2xl font-bold text-primary-600">{stats.classAttendance}%</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Class Attendance</h4>
                    <p className="text-sm text-gray-600">Average across all classes</p>
                    <div className="mt-4 h-2 bg-white rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${stats.classAttendance}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-secondary-600" />
                      </div>
                      <span className="text-2xl font-bold text-secondary-600">{stats.equipmentStatus}%</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Equipment Status</h4>
                    <p className="text-sm text-gray-600">Functional equipment rate</p>
                    <div className="mt-4 h-2 bg-white rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary-500 rounded-full"
                        style={{ width: `${stats.equipmentStatus}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="mt-6 h-64 bg-gray-50 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Performance trends will appear here</p>
                    <p className="text-sm text-gray-500">Connected to analytics in production</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Quick Actions & Insights */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  {[
                    { icon: User, label: 'Manage Trainers', description: 'Add or remove personal trainers', color: 'primary' },
                    { icon: Users, label: 'Client Management', description: 'View and manage all clients', color: 'secondary' },
                    { icon: DollarSign, label: 'Billing & Payments', description: 'Process payments and invoices', color: 'accent' },
                    { icon: Calendar, label: 'Schedule Classes', description: 'Create new group fitness sessions', color: 'purple' },
                    { icon: Settings, label: 'Gym Settings', description: 'Configure gym preferences', color: 'gray' },
                    { icon: PieChart, label: 'Generate Reports', description: 'Create performance reports', color: 'blue' },
                  ].map((action, index) => {
                    const Icon = action.icon
                    const colorClass = `bg-${action.color}-100 text-${action.color}-600`
                    
                    return (
                      <button
                        key={index}
                        className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 group-hover:text-primary-600">{action.label}</p>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Recent Messages */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Recent Messages</h3>
                  <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                    5 unread
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    { sender: 'Alex Johnson', role: 'Trainer', message: 'Need to schedule equipment maintenance...', time: '1h ago', unread: true },
                    { sender: 'Sarah Miller', role: 'Client', message: 'Question about membership upgrade...', time: '3h ago', unread: true },
                    { sender: 'Michael Chen', role: 'Client', message: 'Requesting personal training session...', time: '5h ago', unread: false },
                  ].map((msg, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-xl transition-all duration-200 ${msg.unread ? 'bg-primary-50 border border-primary-100' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center mr-2">
                            <User className="w-4 h-4 text-secondary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{msg.sender}</p>
                            <p className="text-xs text-gray-500">{msg.role}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{msg.time}</span>
                      </div>
                      <p className="text-sm text-gray-600">{msg.message}</p>
                      {msg.unread && (
                        <div className="mt-2 flex items-center text-xs text-primary-600">
                          <div className="w-2 h-2 bg-primary-600 rounded-full mr-1"></div>
                          <span>Unread</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-3 border-2 border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50 font-medium transition-all duration-200">
                  View All Messages
                </button>
              </div>

              {/* Equipment Status */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Equipment Status</h3>
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Treadmills', status: 'good', value: '8/10 working', color: 'secondary' },
                    { name: 'Weight Machines', status: 'excellent', value: 'All working', color: 'secondary' },
                    { name: 'Free Weights', status: 'good', value: 'Fully stocked', color: 'secondary' },
                    { name: 'Studio Sound', status: 'warning', value: 'Needs check', color: 'accent' },
                    { name: 'Air Conditioning', status: 'good', value: 'Optimal', color: 'secondary' },
                    { name: 'Lighting System', status: 'warning', value: 'Partial outage', color: 'accent' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${item.color === 'secondary' ? 'bg-secondary-500' : 'bg-accent-500'}`}></div>
                        <span className="text-gray-700">{item.name}</span>
                      </div>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        item.status === 'excellent' 
                          ? 'bg-secondary-100 text-secondary-800'
                          : item.status === 'good'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-accent-100 text-accent-800'
                      }`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all duration-200">
                  View Maintenance Log
                </button>
              </div>

              {/* Achievements */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <Award className="w-6 h-6 mr-3" />
                  <h3 className="text-xl font-bold">This Month's Achievements</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-300 mr-3" />
                    <span>Reached 150+ active clients</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-300 mr-3" />
                    <span>95% client satisfaction rate</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-300 mr-3" />
                    <span>Added 3 new trainers</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-300 mr-3" />
                    <span>12.3% revenue growth</span>
                  </div>
                </div>
                <button className="w-full mt-6 py-3 bg-white text-primary-600 rounded-xl hover:bg-gray-100 font-medium transition-all duration-200">
                  View Full Report
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section - Recent Activity */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                <p className="text-gray-600">Latest updates from your gym</p>
              </div>
              <button className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
                <span>View All Activity</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { action: 'New membership', user: 'Jessica Brown', time: '2 hours ago', type: 'success' },
                { action: 'Equipment maintenance', user: 'Alex Johnson', time: '4 hours ago', type: 'warning' },
                { action: 'Trainer onboarding', user: 'Ryan Davis', time: '1 day ago', type: 'info' },
                { action: 'Class scheduled', user: 'Emma Wilson', time: '1 day ago', type: 'success' },
                { action: 'Payment processed', user: 'Michael Chen', time: '2 days ago', type: 'success' },
                { action: 'Client feedback', user: 'Sarah Miller', time: '3 days ago', type: 'info' },
              ].map((activity, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      activity.type === 'success' 
                        ? 'bg-green-100 text-green-800'
                        : activity.type === 'warning'
                        ? 'bg-accent-100 text-accent-800'
                        : 'bg-primary-100 text-primary-800'
                    }`}>
                      {activity.action}
                    </span>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                  <p className="font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.type === 'success' && 'Successfully completed'}
                    {activity.type === 'warning' && 'Requires attention'}
                    {activity.type === 'info' && 'New update available'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}