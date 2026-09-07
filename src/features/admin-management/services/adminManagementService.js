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

export async function updateAdminConfidentialStatus(id, status) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/confidential/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
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

export async function updateAdminForgotStatus(id, status) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/forgot/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
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

export async function updateAdminReturnStatus(id, status) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/return/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
    return res?.data?.booking
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// UNIFIED ORDERS DISPATCH & ACTIONS
// ---------------------------------------------------------------------------
export async function updateOrderStatusUnified(serviceKey, id, status) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/orders/${encodeURIComponent(serviceKey)}/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
    return res?.data?.order
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function assignPartnerToOrder(serviceKey, id, partnerData) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/orders/${encodeURIComponent(serviceKey)}/${encodeURIComponent(id)}/assign-partner`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partnerData),
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function autoAssignOrderUnified(serviceKey, id) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/orders/${encodeURIComponent(serviceKey)}/${encodeURIComponent(id)}/auto-assign`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
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

export async function cancelOrderUnified(serviceKey, id, reason) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/orders/${encodeURIComponent(serviceKey)}/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
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
export async function fetchAuditLogs(category = 'ALL', search = '', { signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const params = new URLSearchParams()
    if (category && category !== 'ALL') params.set('category', category)
    if (search) params.set('search', search)

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

export async function updateAdminCourierStatus(id, status) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/courier/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
    return res?.data?.booking
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function recordAdminCourierPOD(id, podData) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(`/admin/courier/bookings/${id}/pod`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(podData),
    })
    return res?.data?.booking
  } catch (error) {
    handleAuthenticationError(error)
  }
}

