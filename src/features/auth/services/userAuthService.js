import { apiRequest, ApiError } from '@/services/api/apiClient.js'

const ACCESS_TOKEN_KEY = 'delivez-user-access-token'
const PROFILE_KEY = 'delivez-user-profile'

const ADMIN_ACCESS_TOKEN_KEY = 'delivez-admin-access-token'
const ADMIN_PROFILE_KEY = 'delivez-admin-profile'

const sessionStorage = () => window.sessionStorage
const persistentStorage = () => window.localStorage

function getActiveStorage() {
  if (sessionStorage().getItem(ACCESS_TOKEN_KEY)) return sessionStorage()
  if (persistentStorage().getItem(ACCESS_TOKEN_KEY)) return persistentStorage()
  return null
}

export function getUserAccessToken() {
  const token = getActiveStorage()?.getItem(ACCESS_TOKEN_KEY)
  if (token) return token

  // Fallback to admin token if logged in as admin
  const adminToken = sessionStorage().getItem(ADMIN_ACCESS_TOKEN_KEY) ?? persistentStorage().getItem(ADMIN_ACCESS_TOKEN_KEY)
  return adminToken ?? null
}

export function getStoredUser() {
  const value = getActiveStorage()?.getItem(PROFILE_KEY)
  if (value) {
    try {
      return JSON.parse(value)
    } catch {
      // ignore
    }
  }

  const adminValue = sessionStorage().getItem(ADMIN_PROFILE_KEY) ?? persistentStorage().getItem(ADMIN_PROFILE_KEY)
  if (adminValue) {
    try {
      return JSON.parse(adminValue)
    } catch {
      // ignore
    }
  }

  return null
}

const DEVICE_ID_KEY = 'delivez-device-id'

export function getDeviceId() {
  if (typeof window === 'undefined') return null
  try {
    let id = window.localStorage.getItem(DEVICE_ID_KEY)
    if (!id) {
      id = `web-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
      window.localStorage.setItem(DEVICE_ID_KEY, id)
    }
    return id
  } catch {
    return null
  }
}

export function clearUserSession() {
  try {
    sessionStorage()?.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage()?.removeItem(PROFILE_KEY)
  } catch {}
  try {
    persistentStorage()?.removeItem(ACCESS_TOKEN_KEY)
    persistentStorage()?.removeItem(PROFILE_KEY)
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:change', { detail: { user: null, accessToken: null } }))
  }
}

export function logoutUser() {
  clearUserSession()
}

export function storeUserSession(accessToken, user, rememberMe = true) {
  clearUserSession()
  // Save in both persistent storage and session storage to guarantee availability across all routes and tabs
  try {
    persistentStorage()?.setItem(ACCESS_TOKEN_KEY, accessToken)
    persistentStorage()?.setItem(PROFILE_KEY, JSON.stringify(user))
  } catch {}
  try {
    sessionStorage()?.setItem(ACCESS_TOKEN_KEY, accessToken)
    sessionStorage()?.setItem(PROFILE_KEY, JSON.stringify(user))
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:change', { detail: { user, accessToken } }))
  }
}

function readAuthResponse(response) {
  const accessToken = response?.data?.accessToken
  const user = response?.data?.user

  if (!accessToken || !user) {
    throw new ApiError('The authentication response is incomplete.', 500, response)
  }

  return { accessToken, user }
}

function readOtpChallenge(response) {
  const challenge = response?.data
  if (!challenge?.otpRequired || !challenge.challengeId) {
    throw new ApiError('The OTP challenge was not returned.', 500, response)
  }
  return challenge
}

export async function registerUser({ fullName, countryCode = '+91', mobileNumber, email, acceptedTerms = true, deviceId }) {
  const payload = {
    fullName: String(fullName ?? '').trim(),
    countryCode: String(countryCode ?? '+91').trim(),
    mobileNumber: String(mobileNumber ?? '').replace(/\D/g, '').trim(),
    acceptedTerms: Boolean(acceptedTerms),
  }
  if (email && String(email).trim()) {
    payload.email = String(email).trim().toLowerCase()
  }
  const resolvedDeviceId = deviceId || getDeviceId()
  if (resolvedDeviceId) {
    payload.deviceId = resolvedDeviceId
  }

  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return readOtpChallenge(response)
}

export async function loginUser(credentials) {
  const payload = { ...credentials }
  if (payload.mobileNumber) {
    payload.mobileNumber = String(payload.mobileNumber).replace(/\D/g, '').trim()
  }
  if (payload.countryCode) {
    payload.countryCode = String(payload.countryCode).trim()
  }

  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  // Direct password login response
  if (response?.data?.accessToken && response?.data?.user) {
    const auth = readAuthResponse(response)
    storeUserSession(auth.accessToken, auth.user, credentials.rememberMe)
    return { isOtp: false, ...auth }
  }

  // OTP challenge response
  return { isOtp: true, ...readOtpChallenge(response) }
}

export async function resendUserOtp(challengeId) {
  const response = await apiRequest('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ challengeId }),
  })
  return readOtpChallenge(response)
}

export async function verifyUserOtp({ challengeId, otp, rememberMe = true, deviceId }) {
  const payload = {
    challengeId: String(challengeId ?? '').trim(),
    otp: String(otp ?? '').replace(/\D/g, '').trim(),
  }
  const resolvedDeviceId = deviceId || getDeviceId()
  if (resolvedDeviceId) {
    payload.deviceId = resolvedDeviceId
  }

  const response = await apiRequest('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  const auth = readAuthResponse(response)
  storeUserSession(auth.accessToken, auth.user, rememberMe)
  return auth.user
}

export async function fetchCurrentUser() {
  const accessToken = getUserAccessToken()
  if (!accessToken) throw new ApiError('Please log in to continue.', 401, null)

  try {
    const response = await apiRequest('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const user = response?.data?.user
    if (!user) throw new ApiError('The user profile was not returned.', 500, response)

    const storage = getActiveStorage()
    storage?.setItem(PROFILE_KEY, JSON.stringify(user))
    return user
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) clearUserSession()
    throw error
  }
}

export async function updateUserProfile({ fullName, email }) {
  const accessToken = getUserAccessToken()
  if (!accessToken) throw new ApiError('Please log in to continue.', 401, null)

  const response = await apiRequest('/auth/me', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fullName, email }),
  })

  const updatedUser = response?.data?.user
  if (updatedUser) {
    const storage = getActiveStorage() || window.localStorage
    storage.setItem(PROFILE_KEY, JSON.stringify(updatedUser))
  }
  return updatedUser
}

