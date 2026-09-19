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

import {
  fetchCourierDeliveryConfig,
  COURIER_PACKAGE_CATEGORIES,
  COURIER_BOX_TYPES,
  COURIER_PARCEL_TYPES,
  COURIER_PARCEL_DIMENSIONS,
  COURIER_LOCAL_OPTIONS,
  COURIER_INTERCITY_OPTIONS,
  COURIER_DROP_OPTIONS,
  COURIER_INSURANCE_OPTIONS,
  getBoxesForWeight,
  getParcelDimensions,
  getPackageCategories,
  getServiceOptions,
  getDropOptions,
  getInsuranceOptions,
} from '@/services/api/courierDeliveryApi.js'

export {
  fetchCourierDeliveryConfig,
  COURIER_PACKAGE_CATEGORIES,
  COURIER_BOX_TYPES,
  COURIER_PARCEL_TYPES,
  COURIER_PARCEL_DIMENSIONS,
  COURIER_LOCAL_OPTIONS,
  COURIER_INTERCITY_OPTIONS,
  COURIER_DROP_OPTIONS,
  COURIER_INSURANCE_OPTIONS,
  getBoxesForWeight,
  getParcelDimensions,
  getPackageCategories,
  getServiceOptions,
  getDropOptions,
  getInsuranceOptions,
}

export async function fetchCourierOptions() {
  return await fetchCourierDeliveryConfig()
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

export function normalizeCourierAddress(addr = {}) {
  const line1 = addr.addressLine1 || addr.addressLine || addr.address || addr.fullAddress || addr.title || 'Address Line 1'
  return {
    ...addr,
    addressLine1: line1,
    addressLine: line1,
    contactName: addr.contactName || addr.contactPerson || addr.name || 'Contact Person',
    contactPerson: addr.contactPerson || addr.contactName || addr.name || 'Contact Person',
    phoneNumber: (addr.phoneNumber || addr.phone || '9876543210').toString().replace(/[^\d+]/g, '') || '9876543210',
    phone: (addr.phone || addr.phoneNumber || '9876543210').toString(),
    city: addr.city || 'Mumbai',
    state: addr.state || 'Maharashtra',
    postalCode: addr.postalCode || addr.pincode || '400077',
    pincode: addr.pincode || addr.postalCode || '400077',
  }
}

export async function fetchCourierQuote(details) {
  const token = getUserAccessToken()
  const payload = {
    ...details,
    pickup: details.pickup ? normalizeCourierAddress(details.pickup) : undefined,
    dropoff: details.dropoff ? normalizeCourierAddress(details.dropoff) : (details.delivery ? normalizeCourierAddress(details.delivery) : undefined),
  }
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const response = await apiRequest('/courier-delivery/quote', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  return response.data?.quote || response.data
}

export async function createCourierBooking(details, idempotencyKey) {
  const key = idempotencyKey || ('idemp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7))
  const payload = {
    ...details,
    pickup: details.pickup ? normalizeCourierAddress(details.pickup) : undefined,
    dropoff: details.dropoff ? normalizeCourierAddress(details.dropoff) : (details.delivery ? normalizeCourierAddress(details.delivery) : undefined),
  }
  const response = await authorizedRequest('/courier-delivery/bookings', {
    method: 'POST',
    headers: { 'Idempotency-Key': key },
    body: JSON.stringify(payload),
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
