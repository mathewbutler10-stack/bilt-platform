'use client'

import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  variant?: 'default' | 'success' | 'warning' | 'info'
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  variant = 'default'
}: EmptyStateProps) {
  const variantStyles = {
    default: {
      container: 'bg-gray-50 border-gray-200',
      icon: 'text-gray-400',
      title: 'text-gray-900',
      description: 'text-gray-600',
      button: 'bg-primary-600 hover:bg-primary-700 text-white'
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-500',
      title: 'text-green-900',
      description: 'text-green-700',
      button: 'bg-green-600 hover:bg-green-700 text-white'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-900',
      description: 'text-yellow-700',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-900',
      description: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  }

  const styles = variantStyles[variant]

  return (
    <div className={`rounded-2xl border ${styles.container} p-8 text-center`}>
      <div className="flex flex-col items-center">
        {Icon && (
          <div className={`w-16 h-16 ${styles.icon} mb-4`}>
            <Icon className="w-full h-full" />
          </div>
        )}
        
        <h3 className={`text-xl font-semibold ${styles.title} mb-2`}>
          {title}
        </h3>
        
        <p className={`${styles.description} max-w-md mx-auto mb-6`}>
          {description}
        </p>

        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${styles.button}`}
          >
            {actionLabel}
          </button>
        )}

        {/* Decorative elements */}
        <div className="mt-8 flex space-x-2">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  )
}

// Pre-configured empty states for common scenarios
export function EmptyWorkouts() {
  return (
    <EmptyState
      title="No Workouts Yet"
      description="Create your first workout plan to get started with your fitness journey."
      actionLabel="Create Workout"
      variant="info"
    />
  )
}

export function EmptyClients() {
  return (
    <EmptyState
      title="No Clients Yet"
      description="Start adding clients to manage their training programs and track progress."
      actionLabel="Add Client"
      variant="success"
    />
  )
}

export function EmptySchedule() {
  return (
    <EmptyState
      title="No Scheduled Sessions"
      description="Schedule your first training session to start building your calendar."
      actionLabel="Schedule Session"
      variant="warning"
    />
  )
}

export function EmptyProgress() {
  return (
    <EmptyState
      title="No Progress Data"
      description="Start tracking your workouts and nutrition to see progress over time."
      actionLabel="Log Activity"
      variant="default"
    />
  )
}

export function EmptyNotifications() {
  return (
    <EmptyState
      title="No Notifications"
      description="You're all caught up! Notifications will appear here when you have updates."
      variant="success"
    />
  )
}

export function EmptyMessages() {
  return (
    <EmptyState
      title="No Messages"
      description="Start a conversation with your trainer or clients to stay connected."
      actionLabel="New Message"
      variant="info"
    />
  )
}