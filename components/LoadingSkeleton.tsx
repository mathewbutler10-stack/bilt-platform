'use client'

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'dashboard' | 'profile'
  count?: number
}

export default function LoadingSkeleton({ type = 'card', count = 1 }: LoadingSkeletonProps) {
  const renderCardSkeleton = () => (
    <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
    </div>
  )

  const renderListSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center p-4 bg-gray-50 rounded-xl animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-lg mr-4"></div>
          <div className="flex-1">
            <div className="h-4 w-1/3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
        </div>
      ))}
    </div>
  )

  const renderDashboardSkeleton = () => (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-5 w-1/2 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
            <div className="h-6 w-1/4 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 w-1/3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
            <div className="h-6 w-1/3 bg-gray-200 rounded mb-6"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
            <div className="h-6 w-1/3 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center p-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 w-1/2 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
            <div className="h-6 w-1/2 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderProfileSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-200">
        {/* Profile header */}
        <div className="flex items-center mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-full mr-6"></div>
          <div className="flex-1">
            <div className="h-8 w-1/3 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
            <div className="flex space-x-4">
              <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
              <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4">
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="h-6 w-1/4 bg-gray-200 rounded mb-4"></div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                      <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  switch (type) {
    case 'list':
      return renderListSkeleton()
    case 'dashboard':
      return renderDashboardSkeleton()
    case 'profile':
      return renderProfileSkeleton()
    case 'card':
    default:
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i}>{renderCardSkeleton()}</div>
          ))}
        </div>
      )
  }
}