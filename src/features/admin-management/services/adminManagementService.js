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

export async function fetchUnifiedStats({ signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/stats', {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchUnifiedOrders(params = {}, { signal } = {}) {
  const accessToken = requireAdminToken()
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.append(k, v)
  })

  try {
    const res = await apiRequest(`/admin/orders/unified?${query.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function universalTrack(trackingId, { signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/track/${encodeURIComponent(trackingId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchAdminPartners(params = {}, { signal } = {}) {
  const accessToken = requireAdminToken()
  const query = new URLSearchParams()
  if (params.search) query.append('search', params.search)

  try {
    const res = await apiRequest(`/admin/partners?${query.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function createAdminPartner(payload) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/partners', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.partner
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchAdminFinanceSummary({ signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/finance', {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function triggerAdminSettlement() {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/finance/settlement', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchAdminAnalytics({ signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/analytics', {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}


export async function fetchAdminConfidentialBookings(params = {}, { signal } = {}) {
  const accessToken = requireAdminToken()
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v) query.append(k, v) })
  try {
    const res = await apiRequest(`/admin/confidential/bookings?${query.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// STATUS TIMING PAYLOAD BUILDER & EXTRACTOR
// ---------------------------------------------------------------------------
export function buildStatusTimingPayload(status, metadata = {}) {
  const timestamp = metadata?.timestamp || new Date().toISOString()
  const currentTimestamps = metadata?.statusTimestamps || {}
  const normStatus = String(status || '').toUpperCase().trim()

  const statusTimestamps = {
    ...currentTimestamps,
    [normStatus]: timestamp,
    ...(normStatus === 'DELIVERED' ? { COMPLETED: timestamp } : {}),
  }

  const existingHistory = Array.isArray(metadata?.statusHistory) ? metadata.statusHistory : []
  const newHistoryEntry = {
    status: normStatus,
    timestamp,
    actor: metadata?.actor || 'Admin Dispatcher',
    note: metadata?.note || metadata?.notes || `Status transitioned to ${normStatus}`,
  }

  const statusHistory = [
    newHistoryEntry,
    ...existingHistory.filter((h) => !(h.status === normStatus && h.timestamp === timestamp)),
  ]

  return {
    status: normStatus,
    timestamp,
    statusChangedAt: timestamp,
    updatedAt: timestamp,
    statusTimestamps,
    statusHistory,
    notes: metadata?.notes || metadata?.note || `Operational status marked as ${normStatus}`,
    ...metadata,
    // Preserve core fields
    status: normStatus,
    timestamp,
  }
}

export async function updateAdminConfidentialStatus(id, status, metadata = {}) {
  const accessToken = requireAdminToken()
  const payload = buildStatusTimingPayload(status, metadata)
  try {
    const res = await apiRequest(`/admin/confidential/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.booking
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchAdminForgotBookings(params = {}, { signal } = {}) {
  const accessToken = requireAdminToken()
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v) query.append(k, v) })
  try {
    const res = await apiRequest(`/admin/forgot/bookings?${query.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminForgotStatus(id, status, metadata = {}) {
  const accessToken = requireAdminToken()
  const payload = buildStatusTimingPayload(status, metadata)
  try {
    const res = await apiRequest(`/admin/forgot/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.booking
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchAdminReturnBookings(params = {}, { signal } = {}) {
  const accessToken = requireAdminToken()
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v) query.append(k, v) })
  try {
    const res = await apiRequest(`/admin/return/bookings?${query.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminReturnStatus(id, status, metadata = {}) {
  const accessToken = requireAdminToken()
  const payload = buildStatusTimingPayload(status, metadata)
  try {
    const res = await apiRequest(`/admin/return/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.booking
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// UNIFIED ORDERS DISPATCH & ACTIONS
// ---------------------------------------------------------------------------
export async function updateOrderStatusUnified(serviceKey, id, status, metadata = {}) {
  const accessToken = requireAdminToken()
  const payload = buildStatusTimingPayload(status, metadata)
  try {
    const res = await apiRequest(`/admin/orders/${encodeURIComponent(serviceKey)}/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.order
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function assignPartnerToOrder(serviceKey, id, partnerData = {}, metadata = {}) {
  const accessToken = requireAdminToken()
  const timestamp = metadata?.timestamp || partnerData?.assignedAt || new Date().toISOString()
  const timingPayload = buildStatusTimingPayload('AGENT_ASSIGNED', {
    ...partnerData,
    assignedAt: timestamp,
    timestamp,
    actor: 'Fleet Dispatcher',
    note: `Assigned partner ${partnerData.partnerName || partnerData.name || ''}`.trim(),
    ...metadata,
  })

  try {
    const res = await apiRequest(`/admin/orders/${encodeURIComponent(serviceKey)}/${encodeURIComponent(id)}/assign-partner`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timingPayload),
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function autoAssignOrderUnified(serviceKey, id, metadata = {}) {
  const accessToken = requireAdminToken()
  const timestamp = metadata?.timestamp || new Date().toISOString()
  try {
    const res = await apiRequest(`/admin/orders/${encodeURIComponent(serviceKey)}/${encodeURIComponent(id)}/auto-assign`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp,
        assignedAt: timestamp,
        statusChangedAt: timestamp,
        statusTimestamps: metadata?.statusTimestamps,
        statusHistory: metadata?.statusHistory,
        ...metadata,
      }),
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchPartnerScorecard(id) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/partners/${encodeURIComponent(id)}/scorecard`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return res?.data?.scorecard
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function cancelOrderUnified(serviceKey, id, reason, metadata = {}) {
  const accessToken = requireAdminToken()
  const timestamp = metadata?.timestamp || new Date().toISOString()
  const cancelPayload = {
    reason,
    ...buildStatusTimingPayload('CANCELLED', {
      note: reason || 'Cancelled by Dispatcher',
      actor: 'Admin Dispatcher',
      timestamp,
      cancelledAt: timestamp,
      ...metadata,
    }),
    cancelledAt: timestamp,
  }

  try {
    const res = await apiRequest(`/admin/orders/${encodeURIComponent(serviceKey)}/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cancelPayload),
    })
    return res
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// DELIVERY FLEET PARTNERS ACTIONS
// ---------------------------------------------------------------------------
export async function updateAdminPartnerStatus(id, status) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/partners/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminPartnerProfile(id, payload) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/partners/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.partner
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function deleteAdminPartner(id) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/partners/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return res
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchAdminPartnerDeliveries(id, { signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/partners/${encodeURIComponent(id)}/deliveries`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// CUSTOMER DIRECTORY & PROFILE DETAILS
// ---------------------------------------------------------------------------
export async function fetchAdminUserDetails(id, { signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/users/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminUserRole(id, role) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/users/${encodeURIComponent(id)}/role`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    })
    return res?.data?.user
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function deleteAdminUser(id) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return res
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// HELPDESK & SUPPORT TICKETS
// ---------------------------------------------------------------------------
export async function fetchSupportTickets(params = {}, { signal } = {}) {
  const accessToken = requireAdminToken()
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.append(k, v)
  })

  try {
    const res = await apiRequest(`/admin/support/tickets?${query.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function createSupportTicket(payload) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/support/tickets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.ticket
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateSupportTicket(id, payload) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/support/tickets/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.ticket
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function deleteSupportTicket(id) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/support/tickets/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return res
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// PLATFORM OPERATIONAL SETTINGS
// ---------------------------------------------------------------------------
export async function fetchPlatformSettings({ signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/settings', {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updatePlatformSettings(payload) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/settings', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// LIVE OPERATIONS RADAR & TELEMETRY
// ---------------------------------------------------------------------------
export async function fetchRadarTelemetry(city = 'ALL', { signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/radar/telemetry?city=${encodeURIComponent(city)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// PROMOTIONS & COUPON DISCOUNT ENGINE
// ---------------------------------------------------------------------------
export async function fetchPromos({ signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/promos', {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function createPromoCode(payload) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/promos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.promo
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function togglePromoCodeStatus(id) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/promos/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return res?.data?.promo
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function deletePromoCode(id) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/promos/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return res
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// DYNAMIC PRICING MATRIX & RATE CARDS
// ---------------------------------------------------------------------------
export async function fetchPricingMatrix({ signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/pricing', {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateServicePricing(serviceKey, payload) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/pricing/${encodeURIComponent(serviceKey)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.rateCard
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// ENTERPRISE AUDIT TRAIL & LOGS
// ---------------------------------------------------------------------------
export async function fetchAuditLogs(filterParams = {}, { signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const params = new URLSearchParams()
    if (typeof filterParams === 'string') {
      if (filterParams && filterParams !== 'ALL') params.set('category', filterParams)
      if (typeof arguments[1] === 'string' && arguments[1]) params.set('search', arguments[1])
    } else if (filterParams && typeof filterParams === 'object') {
      if (filterParams.category && filterParams.category !== 'ALL') params.set('category', filterParams.category)
      if (filterParams.severity && filterParams.severity !== 'ALL') params.set('severity', filterParams.severity)
      if (filterParams.timeframe && filterParams.timeframe !== 'ALL') params.set('timeframe', filterParams.timeframe)
      if (filterParams.search) params.set('search', filterParams.search)
      if (filterParams.page) params.set('page', String(filterParams.page))
      if (filterParams.limit) params.set('limit', String(filterParams.limit))
    }

    const res = await apiRequest(`/admin/audit-logs?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function exportAuditLogsCsv() {
  const accessToken = requireAdminToken()
  try {
    const response = await fetch('/api/v1/admin/export/audit-logs', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!response.ok) throw new Error('Failed to export audit logs')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `delivez-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// PERSONAL COURIER ADMIN MANAGEMENT
// ---------------------------------------------------------------------------
export async function fetchAdminCourierBookings(params = {}, { signal } = {}) {
  const accessToken = requireAdminToken()
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.append(k, v)
  })

  try {
    const res = await apiRequest(`/admin/courier/bookings?${query.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchAdminCourierBooking(id, { signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/courier/bookings/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return res?.data?.booking
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminCourierBooking(id, payload) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/courier/bookings/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.booking
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminCourierStatus(id, status, metadata = {}) {
  const accessToken = requireAdminToken()
  const payload = buildStatusTimingPayload(status, metadata)
  try {
    const res = await apiRequest(`/admin/courier/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.booking
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function recordAdminCourierPOD(id, podData = {}) {
  const accessToken = requireAdminToken()
  const timestamp = podData.deliveredAt || podData.timestamp || new Date().toISOString()
  const payload = {
    ...podData,
    timestamp,
    deliveredAt: timestamp,
    status: 'DELIVERED',
    statusTimestamps: {
      DELIVERED: timestamp,
      COMPLETED: timestamp,
      ...(podData.statusTimestamps || {}),
    },
    statusHistory: [
      {
        status: 'DELIVERED',
        timestamp,
        actor: podData.deliveredBy || 'Courier Rider',
        note: `Proof of Delivery confirmed via ${podData.method || 'Digital Signature'}. Recipient: ${podData.receivedBy || 'Consignee'}`,
      },
      ...(Array.isArray(podData.statusHistory) ? podData.statusHistory : []),
    ],
  }

  try {
    const res = await apiRequest(`/admin/courier/bookings/${id}/pod`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.booking
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// STATUS TIMINGS NORMALIZER FOR API RESPONSES
// ---------------------------------------------------------------------------
export function normalizeOrderWithStatusTimings(order) {
  if (!order || typeof order !== 'object') return order

  const rawKey = order.id || order.bookingNumber || order.orderNumber || ''
  let stored = {}
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(`dlvz_status_timings_${rawKey}`) : null
    if (raw) stored = JSON.parse(raw)
  } catch (_) {}

  // 1. Compile status timestamps map
  const statusTimestamps = {
    ...(order.statusTimestamps || {}),
    ...(stored.timestamps || stored || {}),
  }

  // Check direct order timestamp fields
  const created = order.createdAt || order.bookedAt || order.orderPlacedAt || order.created_at
  if (created && !statusTimestamps.CONFIRMED && !statusTimestamps.CREATED && !statusTimestamps.PLACED) {
    statusTimestamps.CONFIRMED = created
  }
  const assigned = order.assignedAt || order.partnerAssignedAt || order.driverAssignedAt || order.agent?.assignedAt
  if (assigned && !statusTimestamps.AGENT_ASSIGNED && !statusTimestamps.PARTNER_ASSIGNED) {
    statusTimestamps.AGENT_ASSIGNED = assigned
    statusTimestamps.PARTNER_ASSIGNED = assigned
  }
  const pickup = order.pickedUpAt || order.pickupTime || order.itemPickedAt || order.luggagePickedAt
  if (pickup && !statusTimestamps.PICKED_UP) {
    statusTimestamps.PICKED_UP = pickup
  }
  const transit = order.inTransitAt || order.departedAt || order.transitStartedAt
  if (transit && !statusTimestamps.IN_TRANSIT) {
    statusTimestamps.IN_TRANSIT = transit
  }
  const outForDelivery = order.outForDeliveryAt || order.out_for_delivery_at
  if (outForDelivery && !statusTimestamps.OUT_FOR_DELIVERY) {
    statusTimestamps.OUT_FOR_DELIVERY = outForDelivery
  }
  const delivered = order.deliveredAt || order.completedAt || order.delivered_at
  if (delivered && !statusTimestamps.DELIVERED) {
    statusTimestamps.DELIVERED = delivered
    if (!statusTimestamps.COMPLETED) statusTimestamps.COMPLETED = delivered
  }
  const cancelled = order.cancelledAt || order.canceledAt || order.cancelled_at
  if (cancelled && !statusTimestamps.CANCELLED) {
    statusTimestamps.CANCELLED = cancelled
  }

  // Check timeline checkpoints from backend tracking API
  const timelineArray = order.timeline || order.trackingEvents || order.trackingHistory || order.lifecycle || order.checkpoints
  if (Array.isArray(timelineArray)) {
    timelineArray.forEach((item) => {
      if (item?.status && item?.timestamp) {
        const normStatus = String(item.status).toUpperCase().replace(/[\s-]/g, '_')
        if (!statusTimestamps[normStatus]) {
          statusTimestamps[normStatus] = item.timestamp
        }
      }
    })
  }

  // Current status fallback
  if (order.status) {
    const currentNorm = String(order.status).toUpperCase()
    if (!statusTimestamps[currentNorm]) {
      statusTimestamps[currentNorm] = order.statusChangedAt || order.updatedAt || new Date().toISOString()
    }
  }

  // 2. Compile status history
  let statusHistory = []
  if (Array.isArray(order.statusHistory) && order.statusHistory.length > 0) {
    statusHistory = [...order.statusHistory]
  } else if (Array.isArray(timelineArray) && timelineArray.length > 0) {
    statusHistory = timelineArray.map((t) => ({
      status: String(t.status || 'UPDATE').toUpperCase().replace(/[\s-]/g, '_'),
      timestamp: t.timestamp || t.time || new Date().toISOString(),
      actor: t.actor || t.by || (t.location ? `Hub: ${t.location}` : 'System / Driver'),
      note: t.note || t.description || t.message || `Status changed to ${t.status}`,
    }))
  } else if (Array.isArray(stored.history) && stored.history.length > 0) {
    statusHistory = [...stored.history]
  } else {
    statusHistory = Object.entries(statusTimestamps)
      .filter(([k]) => k !== 'history' && k !== 'timestamps' && typeof statusTimestamps[k] === 'string')
      .map(([st, time]) => ({
        status: st,
        timestamp: time,
        actor: st === 'CONFIRMED' || st === 'PLACED' ? 'Customer Checkout' : 'Admin Dispatcher',
        note: `Consignment marked as ${st}`,
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  return {
    ...order,
    statusTimestamps,
    statusHistory,
    statusChangedAt: statusTimestamps[order.status] || order.statusChangedAt || order.updatedAt || new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// UNIFIED FULL ORDER DETAILS RETRIEVAL
// ---------------------------------------------------------------------------
export async function fetchAdminOrderFullDetails(serviceKey, orderId, { signal } = {}) {
  const accessToken = requireAdminToken()
  let detailedData = null

  const sKey = (serviceKey || '').toLowerCase()

  // 1. Attempt specific service endpoint
  try {
    if (sKey === 'gift-delivery' || sKey === 'gift-and-surprise') {
      const res = await apiRequest(`/admin/gift-delivery/orders/${encodeURIComponent(orderId)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal,
      })
      if (res?.data?.order) {
        detailedData = { ...res.data.order, serviceKey: 'gift-delivery', serviceName: 'Gift & Surprise Delivery' }
      }
    } else if (
      sKey === 'personal-courier' ||
      sKey === 'courier-delivery' ||
      sKey === 'luggage-delivery' ||
      sKey === 'airport-luggage'
    ) {
      const res = await apiRequest(`/admin/courier/bookings/${encodeURIComponent(orderId)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal,
      })
      if (res?.data?.booking) {
        detailedData = {
          ...res.data.booking,
          serviceKey: sKey.includes('luggage') ? 'luggage-delivery' : 'personal-courier',
          serviceName: sKey.includes('luggage') ? 'Luggage Delivery' : 'Personal Courier',
        }
      }
    }
  } catch (err) {
    console.warn(`Specific fetch failed for ${sKey}/${orderId}, trying unified search...`, err)
  }

  // 2. If not found or for other services, search in unified orders stream
  if (!detailedData) {
    try {
      const unifiedRes = await apiRequest(`/admin/orders/unified?search=${encodeURIComponent(orderId)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal,
      })
      const found = unifiedRes?.data?.orders?.find(
        (o) =>
          o.id === orderId ||
          o.bookingNumber === orderId ||
          o.id === String(orderId) ||
          (o.bookingNumber && o.bookingNumber.toLowerCase() === String(orderId).toLowerCase())
      )
      if (found) {
        detailedData = found
      }
    } catch (err) {
      console.warn(`Unified search failed for ${orderId}:`, err)
    }
  }

  // 3. Fallback to universalTrack telemetry endpoint
  if (!detailedData) {
    try {
      const trackRes = await apiRequest(`/admin/track/${encodeURIComponent(orderId)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal,
      })
      if (trackRes?.data) {
        detailedData = trackRes.data
      }
    } catch (err) {
      console.warn(`Universal track failed for ${orderId}:`, err)
    }
  }

  return normalizeOrderWithStatusTimings(detailedData)
}

export async function saveAdminOrderNote(serviceKey, orderId, noteText, metadata = {}) {
  const accessToken = requireAdminToken()
  const timestamp = metadata?.timestamp || new Date().toISOString()
  try {
    const res = await apiRequest(`/admin/orders/${encodeURIComponent(serviceKey || 'courier')}/${encodeURIComponent(orderId)}/notes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        note: noteText,
        timestamp,
        status: metadata?.status,
        statusTimestamps: metadata?.statusTimestamps,
        statusHistory: metadata?.statusHistory,
        ...metadata,
      }),
    })
    return res?.data
  } catch (err) {
    // If endpoint doesn't support notes POST, log and store locally in session
    console.warn('Backend order note endpoint optional, falling back:', err)
    return { note: noteText, timestamp }
  }
}

export async function recordOrderStatusTimingApi(serviceKey, orderId, status, metadata = {}) {
  const accessToken = requireAdminToken()
  const payload = buildStatusTimingPayload(status, metadata)
  try {
    const res = await apiRequest(`/admin/orders/${encodeURIComponent(serviceKey || 'courier')}/${encodeURIComponent(orderId)}/status-timing`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data
  } catch (err) {
    // Optional endpoint; status changes already transmit timing directly via the primary status API
    return null
  }
}

// ---------------------------------------------------------------------------
// UNIVERSAL ORDER STATUS MUTATIONS BY ORDER ID
// ---------------------------------------------------------------------------
export {
  updateOrderStatusByOrderId,
  fetchOrderStatusByOrderId,
  cancelOrderByOrderId,
  assignPartnerByOrderId,
  markOrderDeliveredByOrderId,
  detectServiceFromOrderId,
} from '@/services/api/orderStatusApi.js'



