import { apiRequest, ApiError } from '@/services/api/apiClient.js'

const ACCESS_TOKEN_KEY = 'delivez-admin-access-token'
const PROFILE_KEY = 'delivez-admin-profile'

function getSessionStorage() {
  return window.sessionStorage
}

function getPersistentStorage() {
  return window.localStorage
}

function getActiveStorage() {
  if (getSessionStorage().getItem(ACCESS_TOKEN_KEY)) return getSessionStorage()
  if (getPersistentStorage().getItem(ACCESS_TOKEN_KEY)) return getPersistentStorage()
  return null
}

export function getAdminAccessToken() {
  return getActiveStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null
}

export function getStoredAdminProfile() {
  const value = getActiveStorage()?.getItem(PROFILE_KEY)
  if (!value) return null

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export function clearAdminSession() {
  for (const storage of [getSessionStorage(), getPersistentStorage()]) {
    storage.removeItem(ACCESS_TOKEN_KEY)
    storage.removeItem(PROFILE_KEY)
  }
}

function storeAdminSession(accessToken, profile, rememberMe) {
  clearAdminSession()
  const storage = rememberMe ? getPersistentStorage() : getSessionStorage()
  storage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (profile) storage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function updateStoredAdminProfile(profile) {
  const storage = getActiveStorage()
  if (storage && profile) storage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export async function loginAdmin(credentials) {
  const response = await apiRequest('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

  const accessToken = response?.data?.accessToken
  if (!accessToken) {
    throw new ApiError('The login response did not include an administrator access token.', 500, response)
  }

  const profile = response?.data?.admin ?? response?.data?.user ?? null
  storeAdminSession(accessToken, profile, credentials.rememberMe)
  return { accessToken, profile }
}

export async function fetchAdminProfile() {
  const accessToken = getAdminAccessToken()
  if (!accessToken) throw new ApiError('Administrator login is required.', 401, null)

  const response = await apiRequest('/admin/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const profile = response?.data?.admin ?? response?.data?.user ?? response?.data
  updateStoredAdminProfile(profile)
  return profile
}
