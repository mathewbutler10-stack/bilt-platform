// Updated Workouts Page with API Integration
// Uses real workout API with graceful fallback to mock data

import WorkoutsWithAPI from './workouts-with-api'

export default function WorkoutsPage() {
  return <WorkoutsWithAPI />
}
      rating: 4.8,
      clients: 42,
      description: 'Complete full body workout focusing on compound movements',
      tags: ['Strength', 'Compound', 'Full Body']
    },
    {
      id: 2,
      name: 'HIIT Burn',
      category: 'hiit',
      duration: '30 min',
      difficulty: 'Advanced',
      exercises: 8,
      rating: 4.9,
      clients: 38,
      description: 'High intensity interval training for maximum calorie burn',
      tags: ['HIIT', 'Cardio', 'Fat Burn']
    },
    {
      id: 3,
      name: 'Yoga Flow',
      category: 'yoga',
      duration: '45 min',
      difficulty: 'Beginner',
      exercises: 15,
      rating: 4.7,
      clients: 28,
      description: 'Gentle yoga sequence for flexibility and relaxation',
      tags: ['Yoga', 'Flexibility', 'Recovery']
    },
    {
      id: 4,
      name: 'Upper Body Power',
      category: 'strength',
      duration: '50 min',
      difficulty: 'Intermediate',
      exercises: 10,
      rating: 4.6,
      clients: 35,
      description: 'Focus on chest, back, shoulders, and arms',
      tags: ['Upper Body', 'Strength', 'Power']
    },
    {
      id: 5,
      name: 'Lower Body Blast',
      category: 'strength',
      duration: '55 min',
      difficulty: 'Advanced',
      exercises: 9,
      rating: 4.8,
      clients: 31,
      description: 'Intense leg and glute workout for strength and growth',
      tags: ['Lower Body', 'Legs', 'Strength']
    },
    {
      id: 6,
      name: 'Cardio Endurance',
      category: 'cardio',
      duration: '40 min',
      difficulty: 'Beginner',
      exercises: 6,
      rating: 4.5,
      clients: 24,
      description: 'Steady state cardio for building endurance',
      tags: ['Cardio', 'Endurance', 'Fatigue']
    },
  ]

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || workout.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
              <h1 className="text-2xl font-bold text-gray-900">Workout Library</h1>
              <p className="text-gray-600">Manage and create workout plans for your gym</p>
            </div>
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Create Workout</span>
            </button>
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
                  placeholder="Search workouts by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
                
                <button className="flex items-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Filters</span>
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category.name}
                  <span className={`ml-2 text-sm ${
                    selectedCategory === category.id ? 'text-white' : 'text-gray-500'
                  }`}>
                    ({category.count})
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
                  <Dumbbell className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{workouts.length}</p>
                  <p className="text-gray-600">Total Workouts</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-secondary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">198</p>
                  <p className="text-gray-600">Active Assignments</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mr-4">
                  <Star className="w-6 h-6 text-accent-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">4.7</p>
                  <p className="text-gray-600">Average Rating</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">92%</p>
                  <p className="text-gray-600">Completion Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Workouts Grid/List */}
          {filteredWorkouts.length === 0 ? (
            <EmptyWorkouts />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkouts.map((workout) => (
                <div key={workout.id} className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden card-hover">
                  {/* Workout Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            workout.category === 'strength' ? 'bg-blue-100 text-blue-800' :
                            workout.category === 'hiit' ? 'bg-red-100 text-red-800' :
                            workout.category === 'yoga' ? 'bg-green-100 text-green-800' :
                            workout.category === 'cardio' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {workout.category.charAt(0).toUpperCase() + workout.category.slice(1)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{workout.name}</h3>
                        <p className="text-gray-600 mb-4">{workout.description}</p>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Star className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {workout.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-medium text-gray-900">{workout.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Target className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Difficulty</p>
                          <p className="font-medium text-gray-900">{workout.difficulty}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Dumbbell className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Exercises</p>
                          <p className="font-medium text-gray-900">{workout.exercises}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Clients</p>
                          <p className="font-medium text-gray-900">{workout.clients}</p>
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(workout.rating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-gray-700 font-medium">{workout.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({workout.clients} reviews)</span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <button className="flex-1 btn-primary py-3">
                        Assign to Client
                      </button>
                      <button className="p-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Workout</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Category</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Duration</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Difficulty</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Rating</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Clients</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkouts.map((workout) => (
                      <tr key={workout.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{workout.name}</p>
                            <p className="text-sm text-gray-600">{workout.description}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            workout.category === 'strength' ? 'bg-blue-100 text-blue-800' :
                            workout.category === 'hiit' ? 'bg-red-100 text-red-800' :
                            workout.category === 'yoga' ? 'bg-green-100 text-green-800' :
                            workout.category === 'cardio' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {workout.category.charAt(0).toUpperCase() + workout.category.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">{workout.duration}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`font-medium ${
                            workout.difficulty === 'Beginner' ? 'text-green-600' :
                            workout.difficulty === 'Intermediate' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {workout.difficulty}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="flex mr-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(workout.rating)
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-gray-700">{workout.rating}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">{workout.clients}</span>
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
                              <Share2 className="w-4 h-4" />
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
                    Showing {filteredWorkouts.length} of {workouts.length} workouts
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

          {/* Quick Actions Footer */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Need help creating workouts?</h3>
                <p className="text-gray-600">Use our workout builder or browse templates</p>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                <button className="btn-outline flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Download Templates</span>
                </button>
                <button className="btn-primary flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create Custom Workout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}