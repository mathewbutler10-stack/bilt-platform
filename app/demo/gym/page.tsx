// Demo Gym Dashboard - Simple fallback that always works
export default function DemoGymDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🏋️ BILT Platform - Demo Gym Dashboard</h1>
          <p className="text-gray-600 text-lg">Working fallback while Railway deployment is being fixed</p>
          <div className="mt-6 inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-full font-medium">
            ✅ This page works! Deployment fix in progress
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Active Members', value: '156', change: '+12%', color: 'blue' },
            { label: 'Monthly Revenue', value: '$18,240', change: '+8.5%', color: 'green' },
            { label: 'Trainer Satisfaction', value: '4.8/5', change: 'Stable', color: 'purple' },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-600 mt-2">{stat.label}</div>
                </div>
                <div className={`text-sm font-semibold px-4 py-2 rounded-full bg-${stat.color}-100 text-${stat.color}-800`}>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Platform Features (Ready for Integration)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Workout Management', status: '✅ API Complete', desc: 'Full CRUD operations with TypeScript' },
              { title: 'Client Management', status: '🔧 In Progress', desc: 'Client profiles, goals, biometrics' },
              { title: 'Scheduling System', status: '📅 Planned', desc: 'Class booking, trainer assignments' },
              { title: 'Nutrition Tracking', status: '🍎 Ready', desc: 'Meal plans, macro calculations' },
              { title: 'AI Coaching', status: '🤖 8/8 Edge Functions', desc: 'Personalized recommendations' },
              { title: 'Multi-Tenant', status: '🏢 Expert Design', desc: 'Scalable architecture ready' },
            ].map((feature, index) => (
              <div key={index} className="p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="font-bold text-gray-900 text-lg mb-2">{feature.title}</div>
                <div className="text-sm font-medium text-gray-700 mb-3">{feature.status}</div>
                <div className="text-gray-600 text-sm">{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Deployment Status */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Deployment Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/20 rounded-xl">
              <div>
                <div className="font-medium">Railway Deployment</div>
                <div className="text-sm opacity-90">Auto-deploy pipeline investigation</div>
              </div>
              <div className="px-4 py-2 bg-yellow-500 text-white rounded-full text-sm font-medium">⚠️ Investigating</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/20 rounded-xl">
              <div>
                <div className="font-medium">Supabase Connection</div>
                <div className="text-sm opacity-90">Database ready, CORS configuration needed</div>
              </div>
              <div className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium">✅ Ready</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/20 rounded-xl">
              <div>
                <div className="font-medium">Workout Management</div>
                <div className="text-sm opacity-90">API complete, UI integration in progress</div>
              </div>
              <div className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium">🚀 Active</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-gray-500 text-sm">
          <p>BILT Platform • AI-Powered Fitness Management • v1.0</p>
          <p className="mt-2">This is a working demo while Railway deployment is being fixed.</p>
          <div className="mt-4 flex items-center justify-center space-x-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span>Local Development: 100% Working</span>
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <span>Railway Deployment: Investigation Required</span>
          </div>
        </div>
      </div>
    </div>
  )
}