// Static Gym Dashboard - No dependencies, always works

export default function StaticGymDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">🏋️ Gym Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your gym management platform</p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            ✅ Dashboard loaded successfully
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[
            { label: 'Active Members', value: '142', change: '+12%', color: 'blue' },
            { label: 'Monthly Revenue', value: '$12,450', change: '+8%', color: 'green' },
            { label: 'Trainers', value: '8', change: '+2', color: 'purple' },
            { label: 'Classes Today', value: '14', change: 'Full', color: 'orange' },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
                <div className={`text-sm font-medium px-3 py-1 rounded-full bg-${stat.color}-100 text-${stat.color}-800`}>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Today's Schedule */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Today's Schedule</h2>
              <div className="space-y-4">
                {[
                  { time: '9:00 AM', class: 'HIIT Training', trainer: 'Alex J.', spots: '12/15' },
                  { time: '11:00 AM', class: 'Yoga Flow', trainer: 'Emma W.', spots: '18/20' },
                  { time: '4:00 PM', class: 'Strength Training', trainer: 'Mike C.', spots: '8/10' },
                  { time: '6:00 PM', class: 'Spin Class', trainer: 'Sarah M.', spots: 'Full' },
                ].map((session, index) => (
                  <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 text-center">
                      <div className="font-bold text-gray-900">{session.time}</div>
                      <div className="text-xs text-gray-500">Time</div>
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="font-semibold text-gray-900">{session.class}</div>
                      <div className="text-sm text-gray-600">Trainer: {session.trainer}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      session.spots === 'Full' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {session.spots}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Gym Performance</h2>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Equipment Usage', value: '92%', color: 'green' },
                  { label: 'Member Satisfaction', value: '4.8/5', color: 'blue' },
                  { label: 'Staff Attendance', value: '100%', color: 'purple' },
                  { label: 'Cleanliness Score', value: '4.9/5', color: 'orange' },
                ].map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-3xl font-bold text-${metric.color}-600 mb-2`}>{metric.value}</div>
                    <div className="text-sm text-gray-600">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 md:space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                {[
                  'Add New Member',
                  'Schedule Class',
                  'Process Payment',
                  'View Reports',
                  'Manage Staff',
                  'Equipment Check'
                ].map((action, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{action}</div>
                    <div className="text-sm text-gray-500 mt-1">Click to take action</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <h2 className="text-xl font-bold mb-4">Announcements</h2>
              <div className="space-y-4">
                <div className="bg-white/20 p-4 rounded-lg">
                  <div className="font-medium">New Equipment Arrival</div>
                  <div className="text-sm opacity-90 mt-1">5 new treadmills installed this week</div>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <div className="font-medium">Staff Training</div>
                  <div className="text-sm opacity-90 mt-1">CPR certification on Friday</div>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <div className="font-medium">Member Appreciation</div>
                  <div className="text-sm opacity-90 mt-1">Free smoothies for all members this month</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>BILT Platform • Gym Management Dashboard • v1.0</p>
          <p className="mt-2">This is a static demonstration dashboard. Full functionality coming soon.</p>
          <div className="mt-4 inline-flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span>System Status: Operational</span>
          </div>
        </div>
      </div>
    </div>
  )
}