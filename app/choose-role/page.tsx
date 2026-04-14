'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ChooseRolePage() {
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const roles = [
    {
      id: 'owner',
      title: 'Platform Owner',
      description: 'Manage the entire BILT platform',
      testEmail: 'owner@bilt.com'
    },
    {
      id: 'gym',
      title: 'Gym Owner',
      description: 'Manage your gym business and trainers',
      testEmail: 'gym@bilt.com'
    },
    {
      id: 'pt',
      title: 'Personal Trainer',
      description: 'Manage clients and training programs',
      testEmail: 'pt@bilt.com'
    },
    {
      id: 'client',
      title: 'Client',
      description: 'Track your fitness journey',
      testEmail: 'client@bilt.com'
    }
  ]

  const handleContinue = () => {
    if (!selectedRole) return

    setLoading(true)
    
    // Simple redirect - no complex auth
    router.push(`/${selectedRole}/dashboard`)
  }

  const handleLogout = () => {
    localStorage.removeItem('supabase.auth.token')
    localStorage.removeItem('supabase.auth.refresh_token')
    localStorage.removeItem('supabase.auth.expires_at')
    router.push('/auth/login')
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Choose Your Role</h1>
      <p>Select how you want to use the BILT platform</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '30px' }}>
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            style={{
              border: selectedRole === role.id ? '2px solid #0070f3' : '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              cursor: 'pointer',
              background: selectedRole === role.id ? '#f0f8ff' : 'white'
            }}
          >
            <h3>{role.title}</h3>
            <p style={{ color: '#666', marginBottom: '10px' }}>{role.description}</p>
            <div style={{ fontSize: '12px', color: '#888' }}>
              Test: {role.testEmail} / password123
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
        <button
          onClick={handleContinue}
          disabled={!selectedRole || loading}
          style={{
            background: '#0070f3',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            cursor: !selectedRole || loading ? 'not-allowed' : 'pointer',
            opacity: !selectedRole || loading ? 0.6 : 1
          }}
        >
          {loading ? 'Continuing...' : 'Continue to Dashboard'}
        </button>

        <button
          onClick={handleLogout}
          style={{
            background: '#6c757d',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <p><strong>Current token:</strong> {localStorage.getItem('supabase.auth.token') ? 'Present' : 'Missing'}</p>
        <p><strong>Selected role:</strong> {selectedRole || 'None'}</p>
      </div>
    </div>
  )
}