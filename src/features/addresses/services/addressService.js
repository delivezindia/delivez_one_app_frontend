import { apiRequest } from '@/services/api/apiClient.js'
import { getUserAccessToken } from '@/features/auth/services/userAuthService.js'

function getAuthHeader() {
  const token = getUserAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchSavedAddresses() {
  const response = await apiRequest('/addresses', {
    headers: getAuthHeader(),
  })
  return response?.data?.addresses || []
}

export async function createSavedAddress(payload) {
  const response = await apiRequest('/addresses', {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return response?.data?.address
}

export async function updateSavedAddress(id, payload) {
  const response = await apiRequest(`/addresses/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return response?.data?.address
}

export async function deleteSavedAddress(id) {
  await apiRequest(`/addresses/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  })
  return true
}
