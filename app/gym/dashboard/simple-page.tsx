'use client'

import { useState, useEffect } from 'react'

export default function SimpleGymDashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gym Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your gym management dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 font-bold">👥</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">142</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Active Clients</h3>
            <p className="text-gray-600 text-sm">Currently training</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 font-bold">💰</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">$12,450</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Monthly Revenue</h3>
            <p className="text-gray-600 text-sm">From subscriptions</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-purple-600 font-bold">📈</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">12.3%</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Growth Rate</h3>
            <p className="text-gray-600 text-sm">Month over month</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-orange-600 font-bold">🏋️</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">8</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Trainers</h3>
            <p className="text-gray-600 text-sm">Active at your gym</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Add New Client', color: 'blue' },
              { label: 'Schedule Class', color: 'green' },
              { label: 'View Reports', color: 'purple' },
              { label: 'Manage Trainers', color: 'orange' },
              { label: 'Equipment Check', color: 'red' },
              { label: 'Billing', color: 'indigo' },
            ].map((action, index) => (
              <button
                key={index}
                className={`p-4 rounded-xl text-left hover:bg-gray-50 transition-colors border border-${action.color}-100 bg-${action.color}-50`}
              >
                <div className={`text-${action.color}-600 font-medium`}>{action.label}</div>
                <div className="text-sm text-gray-600 mt-1">Click to take action</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: 'New client registration', user: 'Jessica Brown', time: '2 hours ago' },
              { action: 'Class booked', user: 'Michael Chen', time: '4 hours ago' },
              { action: 'Payment received', user: 'Alex Johnson', time: '1 day ago' },
              { action: 'Trainer assigned', user: 'Sarah Miller', time: '2 days ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">{activity.action}</div>
                  <div className="text-sm text-gray-600">{activity.user}</div>
                </div>
                <div className="text-sm text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>This is a simplified dashboard for testing. Full functionality coming soon.</p>
          <p className="mt-2">Dashboard loaded successfully! 🎉</p>
        </div>
      </div>
    </div>
  )
}