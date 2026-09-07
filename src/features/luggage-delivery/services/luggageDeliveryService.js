import { apiRequest, ApiError } from '@/services/api/apiClient.js'
import { getUserAccessToken } from '@/features/auth/services/userAuthService.js'

function authorizedRequest(path, options = {}) {
  const token = getUserAccessToken()
  if (!token) {
    throw new ApiError('Please log in to continue.', 401, null)
  }
  return apiRequest(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function fetchLuggageOptions() {
  try {
    const response = await apiRequest('/luggage-delivery/options')
    return response.data
  } catch {
    const response = await apiRequest('/confidential-courier/options')
    return response.data
  }
}

export async function fetchLuggageQuote(details) {
  try {
    const response = await authorizedRequest('/luggage-delivery/quote', {
      method: 'POST',
      body: JSON.stringify(details),
    })
    return response.data.quote
  } catch {
    const response = await authorizedRequest('/confidential-courier/quote', {
      method: 'POST',
      body: JSON.stringify(details),
    })
    return response.data.quote
  }
}

export async function createLuggageBooking(details, idempotencyKey) {
  try {
    const response = await authorizedRequest('/luggage-delivery/bookings', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(details),
    })
    return response.data.booking
  } catch {
    const response = await authorizedRequest('/confidential-courier/bookings', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(details),
    })
    return response.data.booking
  }
}

export async function fetchLuggageBookings({ page = 1, limit = 10 } = {}) {
  try {
    const response = await authorizedRequest(`/luggage-delivery/bookings?page=${page}&limit=${limit}`)
    return response.data
  } catch {
    const response = await authorizedRequest(`/confidential-courier/bookings?page=${page}&limit=${limit}`)
    return response.data
  }
}

// Aliases for backward compatibility
export const fetchConfidentialOptions = fetchLuggageOptions
export const fetchConfidentialQuote = fetchLuggageQuote
export const createConfidentialBooking = createLuggageBooking
export const fetchConfidentialBookings = fetchLuggageBookings
