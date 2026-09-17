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
  const response = await apiRequest('/luggage-delivery/options')
  return response.data
}

export async function fetchLuggageQuote(details) {
  const response = await apiRequest('/luggage-delivery/quote', {
    method: 'POST',
    body: JSON.stringify(details),
  })
  return response.data.quote
}

export async function createLuggageBooking(details, idempotencyKey) {
  const response = await authorizedRequest('/luggage-delivery/bookings', {
    method: 'POST',
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    body: JSON.stringify(details),
  })
  return response.data.booking
}

export async function fetchLuggageBookings({ page = 1, limit = 10 } = {}) {
  const response = await authorizedRequest(`/luggage-delivery/bookings?page=${page}&limit=${limit}`)
  return response.data
}

export async function fetchLuggageBookingDetails(id) {
  const response = await authorizedRequest(`/luggage-delivery/bookings/${encodeURIComponent(id)}`)
  return response.data.booking
}

export async function fetchLuggageTracking(trackingId) {
  const response = await apiRequest(`/luggage-delivery/tracking/${encodeURIComponent(trackingId)}`)
  return response.data.tracking
}

export async function verifyLuggageOtp(bookingId, otp, type = 'delivery') {
  const response = await apiRequest(`/luggage-delivery/bookings/${encodeURIComponent(bookingId)}/verify-otp`, {
    method: 'POST',
    body: JSON.stringify({ otp, type }),
  })
  return response.data
}

export async function submitLuggagePod(bookingId, podData) {
  const response = await apiRequest(`/luggage-delivery/bookings/${encodeURIComponent(bookingId)}/pod`, {
    method: 'POST',
    body: JSON.stringify(podData),
  })
  return response.data
}

export async function advanceLuggageMilestone(bookingId, targetIndex) {
  const response = await apiRequest(`/luggage-delivery/bookings/${encodeURIComponent(bookingId)}/advance-milestone`, {
    method: 'POST',
    body: JSON.stringify({ targetIndex }),
  })
  return response.data.booking
}

export async function processLuggagePayment(bookingId, paymentData = {}) {
  const response = await apiRequest(`/luggage-delivery/bookings/${encodeURIComponent(bookingId)}/pay`, {
    method: 'POST',
    body: JSON.stringify(paymentData),
  })
  return response.data
}

export async function cancelLuggageBooking(bookingId, reason = 'Cancelled by user') {
  const response = await authorizedRequest(`/luggage-delivery/bookings/${encodeURIComponent(bookingId)}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
  return response.data
}

// Backward compatibility aliases
export const fetchConfidentialOptions = fetchLuggageOptions
export const fetchConfidentialQuote = fetchLuggageQuote
export const createConfidentialBooking = createLuggageBooking
export const fetchConfidentialBookings = fetchLuggageBookings
