import { apiRequest } from '@/services/api/apiClient.js'

export async function fetchHomeAll() {
  try {
    const res = await apiRequest('/home/all')
    return res?.data ?? null
  } catch (error) {
    console.error('Failed to fetch /home/all:', error)
    return null
  }
}

export async function fetchCurrentLocation(latitude, longitude) {
  try {
    const qs = latitude && longitude ? `?lat=${latitude}&lng=${longitude}` : ''
    const res = await apiRequest(`/location/current${qs}`)
    return res?.data?.location ?? null
  } catch (error) {
    console.error('Failed to fetch /location/current:', error)
    return null
  }
}

export async function detectGpsLocation(latitude, longitude) {
  try {
    const res = await apiRequest(`/location/detect?lat=${latitude}&lng=${longitude}`)
    return res?.data?.location ?? null
  } catch (error) {
    console.error('Failed to detect location:', error)
    return null
  }
}

export async function fetchLocationPresets() {
  try {
    const res = await apiRequest('/location/presets')
    return res?.data?.presets ?? []
  } catch (error) {
    console.error('Failed to fetch presets:', error)
    return []
  }
}

export async function fetchHeroConfig() {
  try {
    const res = await apiRequest('/home/hero')
    return res?.data?.hero ?? null
  } catch (error) {
    console.error('Failed to fetch /home/hero:', error)
    return null
  }
}

export async function fetchQuickActions() {
  try {
    const res = await apiRequest('/home/quick-actions')
    return res?.data?.quickActions ?? []
  } catch (error) {
    console.error('Failed to fetch /home/quick-actions:', error)
    return []
  }
}

export async function checkPincodeServiceability(pincode) {
  try {
    const res = await apiRequest(`/pincode/check?pincode=${encodeURIComponent(pincode)}`)
    return res?.data ?? null
  } catch (error) {
    return {
      isServiceable: false,
      message: error?.message || 'Pincode check failed. Please try again.',
    }
  }
}

export async function fetchSupportConfig() {
  try {
    const res = await apiRequest('/support/config')
    return res?.data ?? null
  } catch (error) {
    console.error('Failed to fetch /support/config:', error)
    return null
  }
}

export async function submitSupportHelpRequest(payload) {
  return await apiRequest('/support/inquiry', {
    method: 'POST',
    body: payload,
  })
}

export async function fetchPromptExamples() {
  try {
    const res = await apiRequest('/home/prompt-examples')
    return res?.data?.promptExamples ?? []
  } catch (error) {
    console.error('Failed to fetch /home/prompt-examples:', error)
    return []
  }
}

