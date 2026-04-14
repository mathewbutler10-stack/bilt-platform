'use client'

import { useState } from 'react'
import SidebarNavigation from '@/components/SidebarNavigation'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { EmptyClients } from '@/components/EmptyState'
import { 
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Target,
  Award,
  Clock,
  ChevronRight,
  MoreVertical,
  Download,
  Upload,
  BarChart3
} from 'lucide-react'

export default function ClientsPage() {
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const statuses = [
    { id: 'all', name: 'All Clients', count: 142 },
    { id: 'active', name: 'Active', count: 128 },
    { id: 'new', name: 'New', count: 14 },
    { id: 'inactive', name: 'Inactive', count: 8 },
    { id: 'premium', name: 'Premium', count: 42 },
    { id: 'at-risk', name: 'At Risk', count: 6 },
  ]

  const clients = [
    {
      id: 1,
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      phone: '+1 (555) 123-4567',
      joinDate: '2024-01-15',
      status: 'active',
      membership: 'Premium',
      trainer: 'Alex Johnson',
      lastVisit: '2 days ago',
      progress: 85,
      sessions: 24,
      goals: ['Weight Loss', 'Strength Gain']
    },
    {
      id: 2,
      name: 'Sarah Miller',
      email: 'sarah.m@example.com',
      phone: '+1 (555) 987-6543',
      joinDate: '2024-02-20',
      status: 'active',
      membership: 'Standard',
      trainer: 'Emma Wilson',
      lastVisit: '1 day ago',
      progress: 92,
      sessions: 32,
      goals: ['Muscle Tone', 'Endurance']
    },
    {
      id: 3,
      name: 'David Wilson',
      email: 'david.w@example.com',
      phone: '+1 (555) 456-7890',
      joinDate: '2024-03-10',
      status: 'new',
      membership: 'Premium',
      trainer: 'Ryan Davis',
      lastVisit: 'Today',
      progress: 45,
      sessions: 8,
      goals: ['Weight Loss', 'Flexibility']
    },
    {
      id: 4,
      name: 'Jessica Brown',
      email: 'jessica.b@example.com',
      phone: '+1 (555) 234-5678',
      joinDate: '2023-11-05',
      status: 'active',
      membership: 'Premium',
      trainer: 'Alex Johnson',
      lastVisit: '3 days ago',
      progress: 78,
      sessions: 45,
      goals: ['Strength', 'Competition Prep']
    },
    {
      id: 5,
      name: 'Robert Taylor',
      email: 'robert.t@example.com',
      phone: '+1 (555) 876-5432',
      joinDate: '2024-01-30',
      status: 'inactive',
      membership: 'Standard',
      trainer: 'Sarah Miller',
      lastVisit: '2 weeks ago',
      progress: 60,
      sessions: 16,
      goals: ['General Fitness']
    },
    {
      id: 6,
      name: 'Amanda Clark',
      email: 'amanda.c@example.com',
      phone: '+1 (555) 345-6789',
      joinDate: '2024-02-28',
      status: 'at-risk',
      membership: 'Standard',
      trainer: 'Emma Wilson',
      lastVisit: '1 week ago',
      progress: 35,
      sessions: 12,
      goals: ['Weight Loss', 'Cardio']
    },
  ]

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'premium': return 'bg-purple-100 text-purple-800'
      case 'at-risk': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMembershipColor = (membership: string) => {
    return membership === 'Premium' 
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SidebarNavigation userRole="gym" />
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
      <SidebarNavigation userRole="gym" />
      
      <main className="lg:pl-64 pb-16 lg:pb-0">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
              <p className="text-gray-600">Manage all gym clients and track their progress</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="btn-outline flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Import</span>
              </button>
              <button className="btn-primary flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Client</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clients by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Advanced Filters</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">
                  <Download className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Export</span>
                </button>
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => setSelectedStatus(status.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    selectedStatus === status.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status.name}
                  <span className={`ml-2 text-sm ${
                    selectedStatus === status.id ? 'text-white' : 'text-gray-500'
                  }`}>
                    ({status.count})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">142</p>
                  <p className="text-gray-600">Total Clients</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+12 this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mr-4">
                  <Award className="w-6 h-6 text-secondary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">42</p>
                  <p className="text-gray-600">Premium Members</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                29.6% of total
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-accent-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">78%</p>
                  <p className="text-gray-600">Avg. Progress</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+5% from last month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">92%</p>
                  <p className="text-gray-600">Retention Rate</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Industry avg: 85%
              </div>
            </div>
          </div>

          {/* Clients Table */}
          {filteredClients.length === 0 ? (
            <EmptyClients />
          ) : (
            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Client</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Contact</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Membership</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Trainer</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Progress</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{client.name}</p>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>Joined {client.joinDate}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {client.goals.map((goal, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                  {goal}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-gray-700">{client.email}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-gray-700">{client.phone}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>Last visit: {client.lastVisit}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(client.status)}`}>
                            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMembershipColor(client.membership)}`}>
                            {client.membership}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                              <span className="text-primary-600 font-medium text-sm">
                                {client.trainer.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-gray-700">{client.trainer}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-700 font-medium">{client.progress}%</span>
                              <span className="text-sm text-gray-500">{client.sessions} sessions</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  client.progress >= 80 ? 'bg-green-500' :
                                  client.progress >= 60 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${client.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                              <Mail className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {filteredClients.length} of {clients.length} clients
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">
                      Previous
                    </button>
                    <div className="flex items-center space-x-2">
                      <button className="w-10 h-10 bg-primary-600 text-white rounded-xl">1</button>
                      <button className="w-10 h-10 text-gray-700 hover:bg-gray-100 rounded-xl">2</button>
                      <button className="w-10 h-10 text-gray-700 hover:bg-gray-100 rounded-xl">3</button>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Client Insights */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Membership Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Membership Distribution</h3>
              <div className="space-y-4">
                {[
                  { type: 'Premium', count: 42, percentage: 29.6, color: 'bg-yellow-500' },
                  { type: 'Standard', count: 86, percentage: 60.6, color: 'bg-blue-500' },
                  { type: 'Basic', count: 14, percentage: 9.8, color: 'bg-gray-500' },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 ${item.color} rounded-full mr-3`}></div>
                        <span className="font-medium text-gray-700">{item.type}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-gray-900">{item.count} clients</span>
                        <span className="text-gray-500 ml-2">({item.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-all duration-200">
                  <div className="flex flex-col items-center text-center">
                    <Mail className="w-8 h-8 text-primary-600 mb-2" />
                    <span className="font-medium text-gray-900">Send Newsletter</span>
                    <span className="text-sm text-gray-600 mt-1">Email all clients</span>
                  </div>
                </button>
                <button className="p-4 bg-secondary-50 rounded-xl hover:bg-secondary-100 transition-all duration-200">
                  <div className="flex flex-col items-center text-center">
                    <Calendar className="w-8 h-8 text-secondary-600 mb-2" />
                    <span className="font-medium text-gray-900">Schedule Check-ins</span>
                    <span className="text-sm text-gray-600 mt-1">Plan client meetings</span>
                  </div>
                </button>
                <button className="p-4 bg-accent-50 rounded-xl hover:bg-accent-100 transition-all duration-200">
                  <div className="flex flex-col items-center text-center">
                    <BarChart3 className="w-8 h-8 text-accent-600 mb-2" />
                    <span className="font-medium text-gray-900">Generate Reports</span>
                    <span className="text-sm text-gray-600 mt-1">Client performance</span>
                  </div>
                </button>
                <button className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all duration-200">
                  <div className="flex flex-col items-center text-center">
                    <Target className="w-8 h-8 text-purple-600 mb-2" />
                    <span className="font-medium text-gray-900">Set Goals</span>
                    <span className="text-sm text-gray-600 mt-1">Client objectives</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Client Activity</h3>
                <p className="text-gray-600">Latest updates from your clients</p>
              </div>
              <button className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
                <span>View All Activity</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { client: 'Michael Chen', action: 'Completed HIIT workout', time: '2 hours ago', progress: '+5%' },
                { client: 'Sarah Miller', action: 'Achieved weight loss goal', time: '1 day ago', progress: 'Goal Met' },
                { client: 'David Wilson', action: 'Started new training program', time: '2 days ago', progress: 'Week 1' },
                { client: 'Jessica Brown', action: 'Renewed premium membership', time: '3 days ago', progress: '1 year' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-primary-600 font-medium">
                        {activity.client.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.client}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">{activity.time}</span>
                    <div className={`mt-1 text-sm font-medium ${
                      activity.progress.includes('+') ? 'text-green-600' :
                      activity.progress === 'Goal Met' ? 'text-secondary-600' :
                      'text-gray-600'
                    }`}>
                      {activity.progress}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}