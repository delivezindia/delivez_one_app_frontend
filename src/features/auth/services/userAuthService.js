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

export function clearUserSession() {
  for (const storage of [sessionStorage(), persistentStorage()]) {
    storage.removeItem(ACCESS_TOKEN_KEY)
    storage.removeItem(PROFILE_KEY)
  }
}

export function storeUserSession(accessToken, user, rememberMe) {
  clearUserSession()
  const storage = rememberMe ? persistentStorage() : sessionStorage()
  storage.setItem(ACCESS_TOKEN_KEY, accessToken)
  storage.setItem(PROFILE_KEY, JSON.stringify(user))
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

export async function registerUser(details) {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(details),
  })
  return readOtpChallenge(response)
}

export async function loginUser(credentials) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
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

export async function verifyUserOtp({ challengeId, otp, rememberMe = false }) {
  const response = await apiRequest('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ challengeId, otp }),
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

