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

  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      ...options,
      body: resolvedBody,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    })
  } catch (error) {
    throw new ApiError(
      env.isDevelopment
        ? `Unable to connect to the API at ${env.apiBaseUrl}. Confirm that the EZ Logistics server is running.`
        : 'Unable to connect to the service. Please check your connection and try again.',
      0,
      error,
    )
  }

  const contentType = response.headers.get('content-type')
  const data = contentType?.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? data?.error?.message ?? `Request failed with status ${response.status}`,
      response.status,
      data,
    )
  }

  return data
}
