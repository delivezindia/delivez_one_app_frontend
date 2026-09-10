import {
  clearAdminSession,
  getAdminAccessToken,
} from '@/features/admin-auth/services/adminAuthService.js'
import { apiRequest, ApiError } from '@/services/api/apiClient.js'

function requireAdminToken() {
  const accessToken = getAdminAccessToken()
  if (!accessToken) throw new ApiError('Administrator login is required.', 401, null)
  return accessToken
}

function handleAuthenticationError(error) {
  if (error?.status === 401 || error?.status === 403) clearAdminSession()
  throw error
}

/**
 * Fetch public Know More cards (optionally filtered by service)
 */
export async function fetchPublicKnowMoreCards(serviceSlug) {
  const query = serviceSlug && serviceSlug !== 'all' ? `?service=${encodeURIComponent(serviceSlug)}` : ''
  const response = await apiRequest(`/know-more${query}`)
  return response?.data ?? []
}

/**
 * Fetch all Know More cards for admin (includes draft/inactive cards)
 */
export async function fetchAdminKnowMoreCards(serviceSlug) {
  const accessToken = requireAdminToken()
  try {
    const query = serviceSlug && serviceSlug !== 'all' ? `?service=${encodeURIComponent(serviceSlug)}` : ''
    const response = await apiRequest(`/admin/know-more${query}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response?.data ?? []
  } catch (error) {
    handleAuthenticationError(error)
  }
}

/**
 * Create a new Know More card
 */
export async function createAdminKnowMoreCard(payload) {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest('/admin/know-more', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: payload,
    })
    return response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

/**
 * Update an existing Know More card
 */
export async function updateAdminKnowMoreCard(id, payload) {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest(`/admin/know-more/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: payload,
    })
    return response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

/**
 * Delete a Know More card
 */
export async function deleteAdminKnowMoreCard(id) {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest(`/admin/know-more/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

/**
 * Toggle active status of a Know More card
 */
export async function toggleAdminKnowMoreCardActive(id) {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest(`/admin/know-more/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

/**
 * Upload an image file for a Know More card
 */
export async function uploadAdminKnowMoreImage(file) {
  const accessToken = requireAdminToken()
  try {
    const formData = new FormData()
    formData.append('image', file)

    const apiBase = (typeof window !== 'undefined' && window.__VITE_API_URL__) || 'http://localhost:4000/api/v1'
    const res = await fetch(`${apiBase}/admin/know-more/upload-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) {
      throw new ApiError(data?.message || 'Failed to upload image', res.status, data)
    }

    return data?.data?.imageUrl
  } catch (error) {
    handleAuthenticationError(error)
  }
}
