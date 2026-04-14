import Link from 'next/link'
import { Dumbbell, Users, ChefHat, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-blue-600">BILT</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
              The market-leading platform for gym owners, personal trainers, and clients.
              Everything you need to build, manage, and grow your fitness business.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/auth/login?role=owner"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-900 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Platform Owner Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <Dumbbell className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Workout Management</h3>
            <p className="text-gray-600">
              Comprehensive workout library with progressive tracking and form guides.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <ChefHat className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">AI Meal Planning</h3>
            <p className="text-gray-600">
              Intelligent meal generation with dietary customization and grocery lists.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Client Management</h3>
            <p className="text-gray-600">
              Complete client tracking, progress monitoring, and communication tools.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Business Analytics</h3>
            <p className="text-gray-600">
              Revenue tracking, growth forecasting, and business intelligence.
            </p>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Role
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            BILT is designed for everyone in the fitness ecosystem. Select your role to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/auth/login?role=owner"
            className="group bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-xl"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-blue-600">👑</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Platform Owner</h3>
              <p className="text-gray-600 text-sm">
                Manage the entire platform, view analytics, and oversee all gyms.
              </p>
            </div>
          </Link>

          <Link
            href="/auth/login?role=gym"
            className="group bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border-2 border-green-100 hover:border-green-300 transition-all hover:shadow-xl"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-green-600">🏢</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gym Owner</h3>
              <p className="text-gray-600 text-sm">
                Manage your gym, PTs, clients, and subscriptions.
              </p>
            </div>
          </Link>

          <Link
            href="/auth/login?role=pt"
            className="group bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-xl"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-purple-600">💪</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Personal Trainer</h3>
              <p className="text-gray-600 text-sm">
                Manage clients, create plans, track progress, and schedule sessions.
              </p>
            </div>
          </Link>

          <Link
            href="/auth/login?role=client"
            className="group bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl border-2 border-orange-100 hover:border-orange-300 transition-all hover:shadow-xl"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-orange-600">👤</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Client</h3>
              <p className="text-gray-600 text-sm">
                Follow personalized plans, track progress, and communicate with your PT.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Fitness Business?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of gym owners, trainers, and clients who trust BILT to power their fitness journey.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-gray-900 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Your Free Trial
            </Link>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>© 2026 BILT Platform. All rights reserved.</p>
            <p className="mt-2">Built with ❤️ for the fitness community</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
