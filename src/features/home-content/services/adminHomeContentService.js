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

// ==========================================
// 1. QUICK ACTIONS MANAGEMENT
// ==========================================

export async function fetchAdminQuickActions() {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest('/admin/home/quick-actions', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response?.data?.quickActions ?? []
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function createAdminQuickAction(payload) {
  const accessToken = requireAdminToken()
  const isFormData = payload instanceof FormData
  try {
    const response = await apiRequest('/admin/home/quick-actions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? payload : JSON.stringify(payload),
    })
    return response?.data?.quickAction ?? response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminQuickAction(id, payload) {
  const accessToken = requireAdminToken()
  const isFormData = payload instanceof FormData
  try {
    const response = await apiRequest(`/admin/home/quick-actions/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? payload : JSON.stringify(payload),
    })
    return response?.data?.quickAction ?? response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function uploadAdminQuickActionImage(id, imageFile) {
  const accessToken = requireAdminToken()
  const formData = new FormData()
  formData.append('image', imageFile)

  try {
    const response = await apiRequest(`/admin/home/quick-actions/${id}/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    })
    return response?.data?.quickAction ?? response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function removeAdminQuickActionImage(id) {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest(`/admin/home/quick-actions/${id}/image`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response?.data?.quickAction ?? response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function deleteAdminQuickAction(id) {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest(`/admin/home/quick-actions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response?.data ?? true
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ==========================================
// 2. PROMO BANNER MANAGEMENT
// ==========================================

export async function fetchAdminBanner() {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest('/admin/home/banner', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response?.data?.banner ?? null
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminBanner(payload) {
  const accessToken = requireAdminToken()
  const isFormData = payload instanceof FormData
  try {
    const response = await apiRequest('/admin/home/banner', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? payload : JSON.stringify(payload),
    })
    return response?.data?.banner ?? response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function uploadAdminBannerImage(imageFile) {
  const accessToken = requireAdminToken()
  const formData = new FormData()
  formData.append('image', imageFile)

  try {
    const response = await apiRequest('/admin/home/banner/image', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    })
    return response?.data?.banner ?? response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function removeAdminBannerImage() {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest('/admin/home/banner/image', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response?.data?.banner ?? response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ==========================================
// 3. ACTION CHIPS MANAGEMENT
// ==========================================

export async function fetchAdminChips() {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest('/admin/home/chips', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response?.data?.chips ?? []
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminChips(chips) {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest('/admin/home/chips', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chips }),
    })
    return response?.data?.chips ?? response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ==========================================
// 4. HERO & GOLDEN MASCOT MANAGEMENT
// ==========================================

export async function fetchAdminHero() {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest('/admin/home/hero', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response?.data?.hero ?? null
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminHero(payload) {
  const accessToken = requireAdminToken()
  const isFormData = payload instanceof FormData
  try {
    const response = await apiRequest('/admin/home/hero', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? payload : JSON.stringify(payload),
    })
    return response?.data?.hero ?? response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function uploadAdminHeroImage(imageFile) {
  const accessToken = requireAdminToken()
  const formData = new FormData()
  formData.append('image', imageFile)

  try {
    const response = await apiRequest('/admin/home/hero/image', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    })
    return response?.data?.hero ?? response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function removeAdminHeroImage() {
  const accessToken = requireAdminToken()
  try {
    const response = await apiRequest('/admin/home/hero/image', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response?.data?.hero ?? response?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}
