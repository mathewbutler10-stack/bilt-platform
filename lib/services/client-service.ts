// Client service for client-side API calls

const API_BASE = '/api/clients'

export interface Client {
  id: string
  user_id: string
  full_name: string
  email: string
  phone?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  membership_type: 'standard' | 'premium' | 'elite' | 'trial'
  join_date: string
  notes?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  medical_conditions?: string
  allergies?: string
  fitness_level?: 'beginner' | 'intermediate' | 'advanced' | 'elite'
  primary_goals?: string[]
  created_at: string
  updated_at: string
  
  // Joined data
  profiles?: {
    email: string
    full_name: string
    avatar_url?: string
    created_at?: string
  }
  client_goals?: any[]
  client_biometrics?: any[]
  training_programs?: any[]
  nutrition_targets?: any[]
  checkin_cycles?: any[]
}

export interface ClientFilters {
  search?: string
  status?: string
  membership_type?: string
  limit?: number
  offset?: number
}

export interface ClientResponse {
  clients: Client[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface CreateClientData {
  user_id: string
  full_name: string
  email: string
  phone?: string
  date_of_birth?: string
  gender?: Client['gender']
  membership_type?: Client['membership_type']
  notes?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  medical_conditions?: string
  allergies?: string
  fitness_level?: Client['fitness_level']
  primary_goals?: string[]
}

export interface UpdateClientData extends Partial<CreateClientData> {
  status?: Client['status']
}

// Fetch clients with optional filters
export async function fetchClients(filters: ClientFilters = {}): Promise<ClientResponse> {
  const params = new URLSearchParams()
  
  if (filters.search) params.append('search', filters.search)
  if (filters.status) params.append('status', filters.status)
  if (filters.limit) params.append('limit', filters.limit.toString())
  if (filters.offset) params.append('offset', filters.offset.toString())
  
  const queryString = params.toString()
  const url = `${API_BASE}${queryString ? `?${queryString}` : ''}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching clients:', error)
    throw error
  }
}

// Fetch single client by ID
export async function fetchClient(id: string): Promise<Client> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Error fetching client ${id}:`, error)
    throw error
  }
}

// Create new client
export async function createClient(clientData: CreateClientData): Promise<Client> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating client:', error)
    throw error
  }
}

// Update client
export async function updateClient(id: string, clientData: UpdateClientData): Promise<Client> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Error updating client ${id}:`, error)
    throw error
  }
}

// Delete (soft delete) client
export async function deleteClient(id: string): Promise<{ success: boolean; message: string; client: Client }> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Error deleting client ${id}:`, error)
    throw error
  }
}

// Get client statistics
export async function getClientStats(): Promise<{
  total: number
  active: number
  inactive: number
  pending: number
  byMembershipType: Record<string, number>
  byGender: Record<string, number>
  byFitnessLevel: Record<string, number>
}> {
  try {
    const response = await fetch(`${API_BASE}?limit=1000`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    const clients = data.clients || []
    
    const stats = {
      total: clients.length,
      active: clients.filter((c: Client) => c.status === 'active').length,
      inactive: clients.filter((c: Client) => c.status === 'inactive').length,
      pending: clients.filter((c: Client) => c.status === 'pending').length,
      byMembershipType: {} as Record<string, number>,
      byGender: {} as Record<string, number>,
      byFitnessLevel: {} as Record<string, number>,
    }
    
    // Count by membership type
    clients.forEach((client: Client) => {
      stats.byMembershipType[client.membership_type] = (stats.byMembershipType[client.membership_type] || 0) + 1
      if (client.gender) {
        stats.byGender[client.gender] = (stats.byGender[client.gender] || 0) + 1
      }
      if (client.fitness_level) {
        stats.byFitnessLevel[client.fitness_level] = (stats.byFitnessLevel[client.fitness_level] || 0) + 1
      }
    })
    
    return stats
  } catch (error) {
    console.error('Error fetching client stats:', error)
    throw error
  }
}