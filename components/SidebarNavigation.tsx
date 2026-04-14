'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home,
  Users,
  Calendar,
  Dumbbell,
  BarChart3,
  Settings,
  Bell,
  MessageSquare,
  FileText,
  Target,
  ChefHat,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Building2,
  User,
  CreditCard,
  HelpCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase/robust-client'

interface SidebarNavigationProps {
  userRole: 'owner' | 'gym' | 'pt' | 'client'
  userName?: string
  userEmail?: string
}

export default function SidebarNavigation({ userRole, userName, userEmail }: SidebarNavigationProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      { href: `/${userRole}/dashboard`, label: 'Dashboard', icon: Home },
      { href: `/${userRole}/profile`, label: 'Profile', icon: User },
      { href: `/${userRole}/notifications`, label: 'Notifications', icon: Bell, badge: 3 },
      { href: `/${userRole}/messages`, label: 'Messages', icon: MessageSquare, badge: 5 },
      { href: `/${userRole}/settings`, label: 'Settings', icon: Settings },
      { href: `/${userRole}/help`, label: 'Help & Support', icon: HelpCircle },
    ]

    const roleSpecificItems = {
      owner: [
        { href: '/owner/analytics', label: 'Platform Analytics', icon: BarChart3 },
        { href: '/owner/users', label: 'User Management', icon: Users },
        { href: '/owner/billing', label: 'Billing', icon: CreditCard },
        { href: '/owner/reports', label: 'Reports', icon: FileText },
      ],
      gym: [
        { href: '/gym/trainers', label: 'Trainer Management', icon: Users },
        { href: '/gym/clients', label: 'Client Management', icon: Users },
        { href: '/gym/schedule', label: 'Class Schedule', icon: Calendar },
        { href: '/gym/analytics', label: 'Gym Analytics', icon: BarChart3 },
        { href: '/gym/billing', label: 'Billing & Payments', icon: CreditCard },
      ],
      pt: [
        { href: '/pt/clients', label: 'My Clients', icon: Users },
        { href: '/pt/workouts', label: 'Workout Plans', icon: Dumbbell },
        { href: '/pt/schedule', label: 'Schedule', icon: Calendar },
        { href: '/pt/progress', label: 'Client Progress', icon: TrendingUp },
        { href: '/pt/nutrition', label: 'Nutrition Plans', icon: ChefHat },
      ],
      client: [
        { href: '/client/workouts', label: 'My Workouts', icon: Dumbbell },
        { href: '/client/nutrition', label: 'Nutrition', icon: ChefHat },
        { href: '/client/progress', label: 'Progress', icon: TrendingUp },
        { href: '/client/goals', label: 'Goals', icon: Target },
        { href: '/client/schedule', label: 'Schedule', icon: Calendar },
      ],
    }

    return [...commonItems, ...roleSpecificItems[userRole]]
  }

  const navItems = getNavItems()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  const getRoleDisplayName = () => {
    const names = {
      owner: 'Platform Owner',
      gym: 'Gym Owner',
      pt: 'Personal Trainer',
      client: 'Client'
    }
    return names[userRole]
  }

  const getRoleColor = () => {
    const colors = {
      owner: 'bg-primary-500',
      gym: 'bg-secondary-500',
      pt: 'bg-accent-500',
      client: 'bg-purple-500'
    }
    return colors[userRole]
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-gray-200"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 
        flex flex-col z-40 transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo and header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-gray-900">BILT Platform</h1>
                  <p className="text-xs text-gray-500">{getRoleDisplayName()}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg"
            >
              {isCollapsed ? (
                <Menu className="w-5 h-5 text-gray-600" />
              ) : (
                <X className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* User profile */}
        <div className={`p-4 border-b border-gray-200 ${isCollapsed ? 'text-center' : ''}`}>
          <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center space-x-3'}`}>
            <div className={`w-10 h-10 ${getRoleColor()} rounded-full flex items-center justify-center`}>
              <span className="text-white font-semibold">
                {userName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{userName || 'User'}</p>
                <p className="text-sm text-gray-500 truncate">{userEmail || 'user@example.com'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center rounded-xl px-4 py-3 text-sm font-medium
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                      ${isCollapsed ? 'justify-center' : 'justify-start'}
                    `}
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="relative">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className="ml-3">{item.label}</span>
                        {item.badge && !isCollapsed && (
                          <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-gray-200 ${isCollapsed ? 'text-center' : ''}`}>
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700
              hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-200
              ${isCollapsed ? 'justify-center' : 'justify-start'}
            `}
          >
            <LogOut className="w-5 h-5 text-gray-500" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
          
          {!isCollapsed && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                © 2026 BILT Platform
              </p>
              <p className="text-xs text-gray-400 mt-1">
                v1.0.0 • {getRoleDisplayName()}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Bottom navigation for mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center p-2
                  ${isActive ? 'text-primary-600' : 'text-gray-500'}
                `}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center justify-center p-2 text-gray-500"
          >
            <Menu className="w-6 h-6" />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </nav>
    </>
  )
}