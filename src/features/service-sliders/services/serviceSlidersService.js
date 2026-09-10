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
 * Fetch public service image sliders (1 slider per service with multiple images)
 */
export async function fetchPublicServiceSliders(serviceSlug) {
  const query = serviceSlug && serviceSlug !== 'all' ? `?service=${encodeURIComponent(serviceSlug)}` : ''
  const response = await apiRequest(`/services/sliders${query}`)
  return response?.data ?? []
}

/**
 * Fetch single service image slider
 */
export async function fetchServiceSliderBySlug(serviceSlug) {
  const response = await apiRequest(`/services/${encodeURIComponent(serviceSlug)}/slider`)
  return response?.data ?? null
}

/**
 * Fetch all service image sliders for admin
 */
export async function fetchAdminServiceSliders() {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest('/admin/service-sliders', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response?.data ?? []
  } catch (error) {
    handleAuthenticationError(error)
  }
}

/**
 * Update a service's image slider (update images array and active status)
 */
export async function updateAdminServiceSlider(serviceSlug, payload) {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest(`/admin/service-sliders/${encodeURIComponent(serviceSlug)}`, {
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
 * Upload an image file for a service slider
 */
export async function uploadAdminServiceSliderImage(file) {
  const accessToken = requireAdminToken()
  try {
    const formData = new FormData()
    formData.append('image', file)

    const apiBase = (typeof window !== 'undefined' && window.__VITE_API_URL__) || 'http://localhost:4000/api/v1'
    const res = await fetch(`${apiBase}/admin/service-sliders/upload-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) {
      throw new ApiError(data?.message || 'Failed to upload slider image', res.status, data)
    }

    return data?.data?.imageUrl
  } catch (error) {
    handleAuthenticationError(error)
  }
}
