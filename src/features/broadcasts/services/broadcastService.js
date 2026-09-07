import { apiRequest } from '@/services/api/apiClient.js'
import { getAdminAccessToken } from '@/features/admin-auth/services/adminAuthService.js'

export async function fetchActiveBroadcasts(city) {
  try {
    const query = city ? `?city=${encodeURIComponent(city)}` : ''
    const response = await apiRequest(`/broadcasts/active${query}`)
    return response?.data?.broadcasts || []
  } catch {
    return []
  }
}

export async function fetchAdminBroadcasts() {
  const token = getAdminAccessToken()
  const response = await apiRequest('/admin/broadcasts', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response?.data?.broadcasts || []
}

export async function createAdminBroadcast(payload) {
  const token = getAdminAccessToken()
  const response = await apiRequest('/admin/broadcasts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return response?.data?.broadcast
}

export async function toggleAdminBroadcast(id) {
  const token = getAdminAccessToken()
  const response = await apiRequest(`/admin/broadcasts/${id}/toggle`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  })
  return response?.data?.broadcast
}

export async function deleteAdminBroadcast(id) {
  const token = getAdminAccessToken()
  await apiRequest(`/admin/broadcasts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return true
}
