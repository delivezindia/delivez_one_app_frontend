import { apiRequest, ApiError } from '@/services/api/apiClient.js'
import { getUserAccessToken } from '@/features/auth/services/userAuthService.js'

function getAuthHeaders() {
  const token = getUserAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function authorizedRequest(path, options = {}) {
  const token = getUserAccessToken()
  return apiRequest(path, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

export async function fetchCourierOptions() {
  const response = await apiRequest('/courier-delivery/options')
  return response.data
}

export async function fetchSavedAddresses() {
  try {
    const response = await authorizedRequest('/addresses')
    return response.data?.addresses || []
  } catch {
    return []
  }
}

export async function saveAddress(address) {
  const response = await authorizedRequest('/addresses', {
    method: 'POST',
    body: JSON.stringify(address),
  })
  return response.data?.address
}

export async function fetchCourierQuote(details) {
  const response = await authorizedRequest('/courier-delivery/quote', {
    method: 'POST',
    body: JSON.stringify(details),
  })
  return response.data?.quote
}

export async function createCourierBooking(details, idempotencyKey) {
  const key = idempotencyKey || ('idemp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7))
  const response = await authorizedRequest('/courier-delivery/bookings', {
    method: 'POST',
    headers: { 'Idempotency-Key': key },
    body: JSON.stringify(details),
  })
  return response.data?.booking
}

export async function fetchCourierBookings({ page = 1, limit = 10 } = {}) {
  const response = await authorizedRequest(`/courier-delivery/bookings?page=${page}&limit=${limit}`)
  return response.data
}

export async function fetchCourierBooking(id) {
  const response = await authorizedRequest(`/courier-delivery/bookings/${id}`)
  return response.data?.booking
}

export async function updateCourierBooking(id, details) {
  const response = await authorizedRequest(`/courier-delivery/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(details),
  })
  return response.data?.booking
}

export async function fetchCourierTracking(id) {
  const response = await apiRequest(`/courier-delivery/bookings/${id}/track`, {
    headers: getAuthHeaders(),
  })
  return response.data?.tracking
}

export async function fetchCourierPod(id) {
  const response = await apiRequest(`/courier-delivery/bookings/${id}/pod`, {
    headers: getAuthHeaders(),
  })
  return response.data
}
