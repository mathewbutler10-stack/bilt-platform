'use client'

import { useState, useEffect } from 'react'
import SidebarNavigation from '@/components/SidebarNavigation'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { EmptyWorkouts } from '@/components/EmptyState'
import { 
  fetchWorkouts, 
  createWorkout, 
  updateWorkout, 
  deleteWorkout,
  type Workout,
  type WorkoutFilters
} from '@/lib/services/workout-service'
import {
  Dumbbell,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Share2,
  Star,
  Clock,
  Target,
  Users,
  BarChart3,
  ChevronRight,
  Grid,
  List,
  AlertCircle
} from 'lucide-react'

export default function WorkoutsWithAPI() {
  const [loading, setLoading] = useState(true)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)

  const categories = [
    { id: 'all', name: 'All Workouts', count: 0 },
    { id: 'strength', name: 'Strength Training', count: 0 },
    { id: 'cardio', name: 'Cardio', count: 0 },
    { id: 'hiit', name: 'HIIT', count: 0 },
    { id: 'flexibility', name: 'Flexibility', count: 0 },
    { id: 'recovery', name: 'Recovery', count: 0 },
    { id: 'circuit', name: 'Circuit Training', count: 0 },
  ]

  // Mock data for fallback
  const mockWorkouts: Workout[] = [
    {
      id: '1',
      name: 'Full Body Strength',
      description: 'Complete full body workout focusing on compound movements',
      category: 'strength',
      difficulty: 'intermediate',
      estimated_duration_minutes: 60,
      exercises: [
        { name: 'Squats', sets: 3, reps: 10 },
        { name: 'Bench Press', sets: 3, reps: 8 },
        { name: 'Rows', sets: 3, reps: 10 },
        { name: 'Shoulder Press', sets: 3, reps: 10 },
        { name: 'Plank', sets: 3, duration: '60s' }
      ],
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'HIIT Cardio Blast',
      description: 'High intensity interval training for maximum calorie burn',
      category: 'hiit',
      difficulty: 'advanced',
      estimated_duration_minutes: 30,
      exercises: [
        { name: 'Burpees', sets: 10, duration: '30s', rest: '15s' },
        { name: 'Mountain Climbers', sets: 10, duration: '30s', rest: '15s' },
        { name: 'Jump Squats', sets: 10, duration: '30s', rest: '15s' },
        { name: 'High Knees', sets: 10, duration: '30s', rest: '15s' }
      ],
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Yoga Flow',
      description: 'Gentle yoga sequence for flexibility and relaxation',
      category: 'flexibility',
      difficulty: 'beginner',
      estimated_duration_minutes: 45,
      exercises: [
        { name: 'Sun Salutations', sets: 5 },
        { name: 'Warrior Poses', sets: 3, duration: '30s each side' },
        { name: 'Forward Folds', sets: 3, duration: '30s' },
        { name: 'Child\'s Pose', sets: 3, duration: '60s' }
      ],
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  useEffect(() => {
    loadWorkouts()
  }, [selectedCategory])

  async function loadWorkouts() {
    setLoading(true)
    setError(null)
    
    try {
      const filters: WorkoutFilters = {
        category: selectedCategory === 'all' ? undefined : selectedCategory
      }
      
      const response = await fetchWorkouts(filters)
      setWorkouts(response.workouts)
      setTotalWorkouts(response.total)
      setUsingMockData(false)
      
      // Update category counts
      updateCategoryCounts(response.workouts)
      
    } catch (err) {
      console.error('Failed to load workouts:', err)
      setError('Failed to load workouts from API. Using demo data.')
      setWorkouts(mockWorkouts)
      setTotalWorkouts(mockWorkouts.length)
      setUsingMockData(true)
      updateCategoryCounts(mockWorkouts)
    } finally {
      setLoading(false)
    }
  }

  function updateCategoryCounts(workoutsList: Workout[]) {
    const categoryCounts: Record<string, number> = {
      all: workoutsList.length,
      strength: 0,
      cardio: 0,
      hiit: 0,
      flexibility: 0,
      recovery: 0,
      circuit: 0
    }
    
    workoutsList.forEach(workout => {
      if (categoryCounts[workout.category] !== undefined) {
        categoryCounts[workout.category]++
      }
    })
    
    // Update categories array with counts
    categories.forEach(cat => {
      cat.count = categoryCounts[cat.id] || 0
    })
  }

  async function handleCreateWorkout() {
    try {
      const newWorkout = {
        name: 'New Workout Template',
        description: 'Custom workout template',
        category: 'strength' as const,
        difficulty: 'intermediate' as const,
        estimated_duration_minutes: 45,
        exercises: [],
        is_public: false
      }
      
      const created = await createWorkout(newWorkout)
      setWorkouts([...workouts, created])
      setTotalWorkouts(totalWorkouts + 1)
      
    } catch (err) {
      console.error('Failed to create workout:', err)
      setError('Failed to create workout. API may be unavailable.')
    }
  }

  async function handleDeleteWorkout(id: string) {
    if (!confirm('Are you sure you want to delete this workout?')) return
    
    try {
      await deleteWorkout(id)
      setWorkouts(workouts.filter(w => w.id !== id))
      setTotalWorkouts(totalWorkouts - 1)
      
    } catch (err) {
      console.error('Failed to delete workout:', err)
      setError('Failed to delete workout. API may be unavailable.')
    }
  }

  const filteredWorkouts = workouts.filter(workout => 
    workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SidebarNavigation />
        <div className="ml-64 p-8">
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarNavigation />
      
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Workout Library</h1>
              <p className="text-gray-600 mt-2">
                Manage your workout templates and programs
                {usingMockData && (
                  <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Using demo data
                  </span>
                )}
              </p>
            </div>
            
            <button
              onClick={handleCreateWorkout}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Workout
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center text-red-800">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
              <div className="mt-2 text-sm text-red-700">
                The workout API may be unavailable. You can still view and manage demo workouts.
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <Dumbbell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalWorkouts}</div>
                <div className="text-gray-600">Total Workouts</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {workouts.filter(w => w.is_public).length}
                </div>
                <div className="text-gray-600">Public Templates</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {workouts.filter(w => w.difficulty === 'advanced').length}
                </div>
                <div className="text-gray-600">Advanced Level</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(workouts.reduce((sum, w) => sum + w.estimated_duration_minutes, 0) / 60)}
                </div>
                <div className="text-gray-600">Total Hours</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workouts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 border border-gray-300 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                >
                  <Grid className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                >
                  <List className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Workouts Grid/List */}
        {filteredWorkouts.length === 0 ? (
          <EmptyWorkouts />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkouts.map(workout => (
              <div key={workout.id} className="bg-white rounded-2xl p-6 shadow border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        workout.category === 'strength' ? 'bg-blue-100 text-blue-800' :
                        workout.category === 'cardio' ? 'bg-red-100 text-red-800' :
                        workout.category === 'hiit' ? 'bg-orange-100 text-orange-800' :
                        workout.category === 'flexibility' ? 'bg-green-100 text-green-800' :
                        workout.category === 'recovery' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {workout.category.charAt(0).toUpperCase() + workout.category.slice(1)}
                      </span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                        workout.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        workout.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        workout.difficulty === 'advanced' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {workout.difficulty}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{workout.name}</h3>
                    <p className="text-gray-600 mt-2">{workout.description}</p>
                  </div>
                  {workout.is_public && (
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {workout.estimated_duration_minutes} min
                  </div>
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    {workout.exercises?.length || 0} exercises
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteWorkout(workout.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Assign <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-6 font-medium text-gray-700">Workout</th>
                  <th className="text-left p-6 font-medium text-gray-700">Category</th>
                  <th className="text-left p-6 font-medium text-gray-700">Difficulty</th>
                  <th className="text-left p-6 font-medium text-gray-700">Duration</th>
                  <th className="text-left p-6 font-medium text-gray-700">Exercises</th>
                  <th className="text-left p-6 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkouts.map((workout, index) => (
                  <tr key={workout.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-6">
                      <div>
                        <div className="font-medium text-gray-900">{workout.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{workout.description}</div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        workout.category === 'strength' ? 'bg-blue-100 text-blue-800' :
                        workout.category === 'cardio' ? 'bg-red-100 text-red-800' :
                        workout.category === 'hiit' ? 'bg-orange-100 text-orange-800' :
                        workout.category === 'flexibility' ? 'bg-green-100 text-green-800' :
                        workout.category === 'recovery' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {workout.category}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        workout.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        workout.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        workout.difficulty === 'advanced' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {workout.difficulty}
                      </span>
                    </td>
                    <td className="p-6 text-gray-700">{workout.estimated_duration_minutes} min</td>
                    <td className="p-6 text-gray-700">{workout.exercises?.length || 0}</td>
                    <td className="p-6">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* API Status */}
        {usingMockData && (
          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-2xl">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
              <h3 className="text-lg font-medium text-yellow-800">API Integration Status</h3>
            </div>
            <div className="text-yellow-700">
              <p className="mb-2">The workout API is currently unavailable. This could be because:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Database tables haven't been created in Supabase yet</li>
                <li>Railway deployment hasn't updated with the latest API code</li>
                <li>Supabase connection has CORS or network issues</li>
              </ul>
              <p className="mt-4 font-medium">You're currently viewing demo data. All CRUD operations will use mock data until the API is available.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}