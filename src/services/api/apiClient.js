import { env } from '@/config/env.js'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function apiRequest(path, options = {}) {
  let response
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  let resolvedBody = options.body
  if (resolvedBody && !isFormData && typeof resolvedBody === 'object' && !(typeof Blob !== 'undefined' && resolvedBody instanceof Blob)) {
    resolvedBody = JSON.stringify(resolvedBody)
  }

  const baseUrl = options._overrideBaseUrl || env.apiBaseUrl

  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      body: resolvedBody,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    })
  } catch (error) {
    // If connection to remote server failed in development, check if local backend is up
    if (env.isDevelopment && !options._retriedLocal && baseUrl !== 'http://localhost:4000/api/v1') {
      try {
        const localCheck = await fetch('http://localhost:4000/api/v1/health', { signal: AbortSignal.timeout(1500) })
        if (localCheck.ok) {
          console.warn(`[apiClient] Connection to ${baseUrl} failed. Automatically falling back to local backend at http://localhost:4000/api/v1`)
          return await apiRequest(path, { ...options, _retriedLocal: true, _overrideBaseUrl: 'http://localhost:4000/api/v1' })
        }
      } catch {
        // Continue to regular error
      }
    }

    throw new ApiError(
      env.isDevelopment
        ? `Unable to connect to the API at ${baseUrl}. Confirm that the backend server is running.`
        : 'Unable to connect to the service. Please check your connection and try again.',
      0,
      error,
    )
  }

  // If remote server returns 429 (Rate Limit Exceeded) in development, seamlessly fallback to local server
  if (response.status === 429 && env.isDevelopment && !options._retriedLocal && baseUrl !== 'http://localhost:4000/api/v1') {
    try {
      const localCheck = await fetch('http://localhost:4000/api/v1/health', { signal: AbortSignal.timeout(1500) })
      if (localCheck.ok) {
        console.warn(`[apiClient] Remote server ${baseUrl} returned 429 (Rate Limited). Transparently falling back to local backend at http://localhost:4000/api/v1`)
        return await apiRequest(path, { ...options, _retriedLocal: true, _overrideBaseUrl: 'http://localhost:4000/api/v1' })
      }
    } catch {
      // Continue to regular 429 handling
    }
  }

  const contentType = response.headers.get('content-type')
  const data = contentType?.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    let message = ''
    if (typeof data === 'string' && data.trim()) {
      message = data.trim()
    } else if (data?.message) {
      message = data.message
    } else if (data?.error?.message) {
      message = data.error.message
    } else if (response.status === 429) {
      message = 'Too many requests. The server rate limit has been exceeded. Please wait a moment.'
    } else {
      message = `Request failed with status ${response.status}`
    }

    throw new ApiError(message, response.status, data)
  }

  return data
}
