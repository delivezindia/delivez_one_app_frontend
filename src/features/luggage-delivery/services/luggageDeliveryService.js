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

/**
 * 1. Discovery & Catalog
 */
export async function fetchLuggageOptions() {
  const response = await apiRequest('/luggage-delivery/options')
  return response.data
}

/**
 * 2. Pricing Quote (Master Contract)
 */
export async function fetchLuggageQuote(details) {
  const response = await apiRequest('/luggage-delivery/bookings/quote', {
    method: 'POST',
    body: JSON.stringify(details),
  })
  const raw = response.data?.pricing || response.data?.quote || response.data || {}
  const pricing = response.data?.pricing || raw
  return {
    ...raw,
    ...pricing,
    baseFare: pricing.base_fare ?? raw.baseFare ?? 499,
    distanceFare: pricing.distance_fee ?? raw.distanceFare ?? 0,
    luggageHandlingFee: pricing.luggage_handling_fee ?? raw.luggageHandlingFee ?? 0,
    airportHandlingFee: pricing.airport_handling_fee ?? raw.airportHandlingFee ?? 0,
    hotelHandlingFee: pricing.hotel_handling_fee ?? raw.hotelHandlingFee ?? 0,
    deliverySpeedFare: pricing.delivery_speed_fee ?? raw.deliverySpeedFare ?? 0,
    protectionsFare: pricing.luggage_protection_fee ?? raw.protectionsFare ?? 0,
    addOnsFare: pricing.add_on_fee ?? raw.addOnsFare ?? 0,
    assistanceFare: pricing.airport_assistance_fee ?? raw.assistanceFare ?? 0,
    subtotal: pricing.subtotal ?? raw.subtotal ?? 0,
    gstAmount: pricing.tax?.total_tax ?? raw.gstAmount ?? Math.round((pricing.subtotal || 0) * 0.18),
    discountAmount: pricing.discount?.discount_amount ?? raw.discountAmount ?? 0,
    totalAmount: pricing.total_amount ?? raw.totalAmount ?? 0,
  }
}

/**
 * 3. Coupon Validation
 */
export async function validateLuggageCoupon(couponCode, subtotal = 0, draftDetails = {}) {
  const response = await apiRequest('/luggage-delivery/bookings/validate-coupon', {
    method: 'POST',
    body: JSON.stringify({
      coupon_code: couponCode,
      subtotal,
      ...draftDetails,
    }),
  })
  return response.data
}

/**
 * 4. Create Master Booking
 */
export async function createLuggageBooking(details, idempotencyKey) {
  const payload = { ...details }
  if (idempotencyKey && !payload.client_request_id) {
    payload.client_request_id = idempotencyKey
  }
  const response = await authorizedRequest('/luggage-delivery/bookings', {
    method: 'POST',
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    body: JSON.stringify(payload),
  })
  return response.data?.booking || response.data
}

/**
 * 5. Fetch Bookings List & Details
 */
export async function fetchLuggageBookings({ page = 1, limit = 10, status } = {}) {
  let url = `/luggage-delivery/bookings?page=${page}&limit=${limit}`
  if (status) url += `&status=${encodeURIComponent(status)}`
  const response = await authorizedRequest(url)
  return response.data
}

export async function fetchLuggageBookingDetails(id) {
  const response = await authorizedRequest(`/luggage-delivery/bookings/${encodeURIComponent(id)}`)
  return response.data?.booking || response.data
}

/**
 * 6. Receipt Generation
 */
export async function fetchLuggageReceipt(bookingId) {
  const response = await authorizedRequest(`/luggage-delivery/bookings/${encodeURIComponent(bookingId)}/receipt`)
  return response.data?.receipt || response.data
}

/**
 * 7. Payment Lifecycle
 */
export async function createLuggagePayment(bookingId, gateway = 'razorpay', paymentMethod = 'upi') {
  const response = await authorizedRequest('/luggage-delivery/payments/create', {
    method: 'POST',
    body: JSON.stringify({
      booking_id: bookingId,
      gateway,
      payment_method: paymentMethod,
    }),
  })
  return response.data
}

export async function verifyLuggagePayment(verifyPayload) {
  const response = await authorizedRequest('/luggage-delivery/payments/verify', {
    method: 'POST',
    body: JSON.stringify(verifyPayload),
  })
  return response.data
}

export async function processLuggagePayment(bookingId, paymentData = {}) {
  const response = await apiRequest(`/luggage-delivery/bookings/${encodeURIComponent(bookingId)}/pay`, {
    method: 'POST',
    body: JSON.stringify(paymentData),
  })
  return response.data
}

/**
 * 8. Tracking & Milestones
 */
export async function fetchLuggageTracking(trackingId) {
  const response = await apiRequest(`/luggage-delivery/tracking/${encodeURIComponent(trackingId)}`)
  return response.data?.tracking || response.data
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
  return response.data?.booking || response.data
}

/**
 * 9. Cancellation
 */
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
