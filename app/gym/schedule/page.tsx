'use client'

import { useState } from 'react'
import SidebarNavigation from '@/components/SidebarNavigation'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { EmptySchedule } from '@/components/EmptyState'
import { 
  Calendar,
  Clock,
  Users,
  Plus,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Video,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  MoreVertical,
  Download,
  Share2,
  Bell,
  Edit,
  Trash2
} from 'lucide-react'

export default function SchedulePage() {
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const timeSlots = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

  const sessions = [
    {
      id: 1,
      title: 'HIIT Class',
      type: 'group',
      trainer: 'Alex Johnson',
      location: 'Main Studio',
      time: '9:00 - 10:00',
      day: 'Mon',
      participants: 12,
      maxParticipants: 20,
      status: 'confirmed',
      color: 'bg-red-100 border-red-200'
    },
    {
      id: 2,
      title: 'Personal Training',
      type: 'individual',
      trainer: 'Sarah Miller',
      client: 'Michael Chen',
      location: 'PT Room 1',
      time: '14:00 - 15:00',
      day: 'Mon',
      status: 'confirmed',
      color: 'bg-blue-100 border-blue-200'
    },
    {
      id: 3,
      title: 'Yoga Session',
      type: 'group',
      trainer: 'Emma Wilson',
      location: 'Yoga Studio',
      time: '18:00 - 19:00',
      day: 'Mon',
      participants: 18,
      maxParticipants: 25,
      status: 'confirmed',
      color: 'bg-green-100 border-green-200'
    },
    {
      id: 4,
      title: 'Strength Training',
      type: 'group',
      trainer: 'Ryan Davis',
      location: 'Weight Room',
      time: '10:00 - 11:00',
      day: 'Tue',
      participants: 8,
      maxParticipants: 15,
      status: 'waiting',
      color: 'bg-purple-100 border-purple-200'
    },
    {
      id: 5,
      title: 'Personal Training',
      type: 'individual',
      trainer: 'Alex Johnson',
      client: 'Jessica Brown',
      location: 'PT Room 2',
      time: '16:00 - 17:00',
      day: 'Tue',
      status: 'confirmed',
      color: 'bg-blue-100 border-blue-200'
    },
    {
      id: 6,
      title: 'Spin Class',
      type: 'group',
      trainer: 'Sarah Miller',
      location: 'Spin Studio',
      time: '17:00 - 18:00',
      day: 'Wed',
      participants: 15,
      maxParticipants: 20,
      status: 'confirmed',
      color: 'bg-orange-100 border-orange-200'
    },
  ]

  const getDaySessions = (day: string) => {
    return sessions.filter(session => session.day === day)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setSelectedDate(newDate)
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
              <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
              <p className="text-gray-600">Manage gym classes and personal training sessions</p>
            </div>
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Schedule Session</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Calendar Controls */}
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateDate('prev')}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <h2 className="text-xl font-bold text-gray-900">
                  {formatDate(selectedDate)}
                </h2>
                
                <button
                  onClick={() => navigateDate('next')}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                  Today
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('day')}
                    className={`px-4 py-2 rounded-lg ${viewMode === 'day' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-4 py-2 rounded-lg ${viewMode === 'week' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-4 py-2 rounded-lg ${viewMode === 'month' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                  >
                    Month
                  </button>
                </div>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Filter</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">24</p>
                    <p className="text-gray-600">Sessions This Week</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">186</p>
                    <p className="text-gray-600">Total Participants</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">92%</p>
                    <p className="text-gray-600">Attendance Rate</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="flex items-center">
                  <User className="w-8 h-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                    <p className="text-gray-600">Trainers Scheduled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Week View Calendar */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden mb-8">
            {/* Calendar Header */}
            <div className="border-b border-gray-200">
              <div className="grid grid-cols-8">
                <div className="p-4 border-r border-gray-200">
                  <div className="text-sm font-medium text-gray-500">Time</div>
                </div>
                {days.map((day) => (
                  <div key={day} className="p-4 border-r border-gray-200 last:border-r-0">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{day}</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        {day === 'Mon' ? '15' : day === 'Tue' ? '16' : day === 'Wed' ? '17' : day === 'Thu' ? '18' : day === 'Fri' ? '19' : day === 'Sat' ? '20' : '21'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="divide-y divide-gray-200">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 min-h-20">
                  <div className="p-4 border-r border-gray-200">
                    <div className="text-sm font-medium text-gray-500">{time}</div>
                  </div>
                  {days.map((day) => {
                    const daySessions = getDaySessions(day).filter(session => {
                      const sessionTime = parseInt(session.time.split(':')[0])
                      const currentTime = parseInt(time.split(':')[0])
                      return sessionTime === currentTime
                    })
                    
                    return (
                      <div key={`${day}-${time}`} className="p-2 border-r border-gray-200 last:border-r-0 min-h-20">
                        {daySessions.map((session) => (
                          <div
                            key={session.id}
                            className={`p-3 rounded-lg border ${session.color} mb-2 last:mb-0`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{session.title}</p>
                                <p className="text-xs text-gray-600">{session.time}</p>
                              </div>
                              <div className="flex items-center">
                                {session.status === 'confirmed' ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <User className="w-3 h-3 mr-1" />
                              <span>{session.trainer}</span>
                            </div>
                            {session.type === 'group' && (
                              <div className="flex items-center text-xs text-gray-600 mt-1">
                                <Users className="w-3 h-3 mr-1" />
                                <span>{session.participants}/{session.maxParticipants}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Today's Sessions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Today's Sessions</h3>
                    <p className="text-gray-600">Manage today's classes and appointments</p>
                  </div>
                  <button className="btn-outline flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Send Reminders</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {sessions
                    .filter(session => session.day === 'Mon')
                    .map((session) => (
                      <div key={session.id} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                        <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center mr-4 ${session.color}`}>
                          <Clock className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">{session.time.split(' - ')[0]}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{session.title}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              session.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {session.status}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-2" />
                            <span className="mr-4">{session.trainer}</span>
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{session.location}</span>
                            {session.type === 'group' && (
                              <>
                                <Users className="w-4 h-4 ml-4 mr-2" />
                                <span>{session.participants} participants</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Quick Actions & Stats */}
            <div className="space-y-6">
              {/* Room Availability */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Room Availability</h3>
                <div className="space-y-4">
                  {[
                    { room: 'Main Studio', status: 'Available', nextBooking: '10:00 AM', color: 'bg-green-100 text-green-800' },
                    { room: 'Yoga Studio', status: 'In Use', nextBooking: '11:00 AM', color: 'bg-yellow-100 text-yellow-800' },
                    { room: 'PT Room 1', status: 'Booked', nextBooking: '2:00 PM', color: 'bg-blue-100 text-blue-800' },
                    { room: 'PT Room 2', status: 'Available', nextBooking: '3:00 PM', color: 'bg-green-100 text-green-800' },
                    { room: 'Weight Room', status: 'In Use', nextBooking: '12:00 PM', color: 'bg-yellow-100 text-yellow-800' },
                    { room: 'Spin Studio', status: 'Available', nextBooking: '5:00 PM', color: 'bg-green-100 text-green-800' },
                  ].map((room, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          room.status === 'Available' ? 'bg-green-500' :
                          room.status === 'In Use' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}></div>
                        <span className="font-medium text-gray-700">{room.room}</span>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${room.color}`}>
                          {room.status}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">Next: {room.nextBooking}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all duration-200">
                  View All Rooms
                </button>
              </div>

              {/* Trainer Availability */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Trainer Availability</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Alex Johnson', status: 'Available', sessions: 3, color: 'bg-green-100 text-green-800' },
                    { name: 'Sarah Miller', status: 'Booked', sessions: 5, color: 'bg-blue-100 text-blue-800' },
                    { name: 'Emma Wilson', status: 'Available', sessions: 2, color: 'bg-green-100 text-green-800' },
                    { name: 'Ryan Davis', status: 'Limited', sessions: 4, color: 'bg-yellow-100 text-yellow-800' },
                  ].map((trainer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-primary-600 font-medium text-sm">
                            {trainer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">{trainer.name}</p>
                          <p className="text-xs text-gray-500">{trainer.sessions} sessions today</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${trainer.color}`}>
                        {trainer.status}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 btn-outline">
                  Assign Trainer
                </button>
              </div>

              {/* Quick Booking */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <Plus className="w-6 h-6 mr-3" />
                  <h3 className="text-xl font-bold">Quick Booking</h3>
                </div>
                <p className="text-primary-100 mb-6">
                  Schedule a new class or personal training session in seconds
                </p>
                <div className="space-y-3">
                  <button className="w-full py-3 bg-white text-primary-600 rounded-xl hover:bg-gray-100 font-medium transition-all duration-200">
                    New Group Class
                  </button>
                  <button className="w-full py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 font-medium transition-all duration-200">
                    Personal Training
                  </button>
                  <button className="w-full py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 font-medium transition-all duration-200">
                    Workshop/Event
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Session Types Overview */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Session Types Overview</h3>
                <p className="text-gray-600">Distribution of different session types this week</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">
                  <Download className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Export</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">
                  <Share2 className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Share</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { type: 'Group Classes', count: 16, participants: 192, color: 'bg-red-100 text-red-800' },
                { type: 'Personal Training', count: 8, participants: 8, color: 'bg-blue-100 text-blue-800' },
                { type: 'Workshops', count: 3, participants: 45, color: 'bg-green-100 text-green-800' },
                { type: 'Open Gym', count: 7, participants: 84, color: 'bg-purple-100 text-purple-800' },
              ].map((sessionType, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${sessionType.color}`}>
                      {sessionType.type}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">{sessionType.count}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Participants</span>
                      <span className="font-medium text-gray-900">{sessionType.participants}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avg. Attendance</span>
                      <span className="font-medium text-gray-900">
                        {Math.round((sessionType.participants / sessionType.count))}/session
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      {sessionType.type === 'Group Classes' && 'Most popular: HIIT Class'}
                      {sessionType.type === 'Personal Training' && 'Top trainer: Alex Johnson'}
                      {sessionType.type === 'Workshops' && 'Next: Nutrition Workshop'}
                      {sessionType.type === 'Open Gym' && 'Peak hours: 5-7 PM'}
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