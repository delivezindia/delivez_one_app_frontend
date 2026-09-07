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

export async function fetchAdminServices({ signal } = {}) {
  const accessToken = requireAdminToken()

  try {
    const response = await apiRequest('/admin/services', {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return response?.data?.services ?? []
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function uploadAdminServiceImage(serviceId, image) {
  const accessToken = requireAdminToken()
  const formData = new FormData()
  formData.append('image', image)

  try {
    const response = await apiRequest(`/admin/services/${serviceId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    })
    return response?.data?.service
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function removeAdminServiceImage(serviceId) {
  const accessToken = requireAdminToken()

  try {
    const response = await apiRequest(`/admin/services/${serviceId}/image`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response?.data?.service
  } catch (error) {
    handleAuthenticationError(error)
  }
}
