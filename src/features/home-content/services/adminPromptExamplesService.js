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
 * Fetch all prompt examples (including active and inactive) for admin management
 */
export async function fetchAdminPromptExamples() {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest('/admin/home/prompt-examples', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response?.data?.promptExamples ?? response?.data?.promptExample ?? []
  } catch (error) {
    handleAuthenticationError(error)
  }
}

/**
 * Create a new prompt example item
 * @param {FormData | object} payload
 */
export async function createAdminPromptExample(payload) {
  const accessToken = requireAdminToken()
  try {
    const isFormData = payload instanceof FormData
    const response = await apiRequest('/admin/home/prompt-examples', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? payload : JSON.stringify(payload),
    })
    return response?.data?.promptExample ?? response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

/**
 * Update an existing prompt example item (name, text, icon, color, image, order, active)
 * @param {string} id
 * @param {FormData | object} payload
 */
export async function updateAdminPromptExample(id, payload) {
  const accessToken = requireAdminToken()
  try {
    const isFormData = payload instanceof FormData
    const response = await apiRequest(`/admin/home/prompt-examples/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? payload : JSON.stringify(payload),
    })
    return response?.data?.promptExample ?? response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

/**
 * Upload a dedicated custom image for a prompt example item
 * @param {string} id
 * @param {File} imageFile
 */
export async function uploadAdminPromptExampleImage(id, imageFile) {
  const accessToken = requireAdminToken()
  const formData = new FormData()
  formData.append('image', imageFile)

  try {
    const response = await apiRequest(`/admin/home/prompt-examples/${id}/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    })
    return response?.data?.promptExample ?? response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

/**
 * Remove custom image for a prompt example item
 * @param {string} id
 */
export async function removeAdminPromptExampleImage(id) {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest(`/admin/home/prompt-examples/${id}/image`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response?.data?.promptExample ?? response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

/**
 * Delete a prompt example item
 * @param {string} id
 */
export async function deleteAdminPromptExample(id) {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest(`/admin/home/prompt-examples/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response?.data ?? true
  } catch (error) {
    handleAuthenticationError(error)
  }
}
