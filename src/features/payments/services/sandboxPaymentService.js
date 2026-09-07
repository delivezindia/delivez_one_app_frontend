import { apiRequest } from '@/services/api/apiClient.js'
import { getUserAccessToken } from '@/features/auth/services/userAuthService.js'

const supportedServices = new Set([
  'personal-courier',
  'courier-delivery',
  'luggage-delivery',
  'confidential-delivery',
  'confidential-courier',
  'airport-luggage',
  'forgot-something',
  'fetch',
  'gift-delivery',
  'gifts',
  'return-pickup',
  'returns',
])

function resolveEndpoint(serviceSlug) {
  if (serviceSlug === 'confidential-courier' || serviceSlug === 'luggage-delivery' || serviceSlug === 'airport-luggage') {
    return 'confidential-delivery'
  }
  if (serviceSlug === 'fetch') return 'forgot-something'
  if (serviceSlug === 'gifts') return 'gift-delivery'
  if (serviceSlug === 'returns') return 'return-pickup'
  if (serviceSlug === 'courier-delivery') return 'personal-courier'
  return serviceSlug
}

export async function completeSandboxPayment(serviceSlug, bookingId, { method, outcome = 'SUCCESS' }) {
  if (!supportedServices.has(serviceSlug)) throw new Error('This service does not support sandbox payments.')
  const endpoint = resolveEndpoint(serviceSlug)
  const response = await apiRequest(`/${endpoint}/bookings/${bookingId}/payments/sandbox`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getUserAccessToken()}` },
    body: JSON.stringify({ method, outcome }),
  })
  return response.data
}

export async function fetchSandboxPaymentBooking(serviceSlug, bookingId) {
  if (!supportedServices.has(serviceSlug)) throw new Error('This service does not support sandbox payments.')
  const endpoint = resolveEndpoint(serviceSlug)
  const response = await apiRequest(`/${endpoint}/bookings/${bookingId}`, {
    headers: { Authorization: `Bearer ${getUserAccessToken()}` },
  })
  return response.data.booking
}

