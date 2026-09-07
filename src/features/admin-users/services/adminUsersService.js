import { clearAdminSession, getAdminAccessToken } from '@/features/admin-auth/services/adminAuthService.js'
import { apiRequest, ApiError } from '@/services/api/apiClient.js'

function normalizeUsersResponse(response, requestedPage) {
  const data = response?.data ?? response ?? {}
  const users = Array.isArray(data)
    ? data
    : data.users ?? data.items ?? data.results ?? []
  const pagination = data.pagination ?? data.meta ?? response?.pagination ?? response?.meta ?? {}
  const page = Number(pagination.page ?? pagination.currentPage ?? requestedPage)
  const limit = Number(pagination.limit ?? pagination.pageSize ?? 20)
  const total = Number(pagination.total ?? pagination.totalItems ?? users.length)
  const totalPages = Number(
    pagination.totalPages ?? pagination.pages ?? Math.max(1, Math.ceil(total / limit)),
  )

  return { users, page, limit, total, totalPages }
}

export async function fetchAdminUsers({ page = 1, limit = 20, search = '', signal } = {}) {
  const accessToken = getAdminAccessToken()
  if (!accessToken) throw new ApiError('Administrator login is required.', 401, null)

  const query = new URLSearchParams({
    page: String(page),
    limit: String(Math.min(Math.max(limit, 1), 100)),
    search: search.trim(),
  })

  try {
    const response = await apiRequest(`/admin/users?${query}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    return normalizeUsersResponse(response, page)
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) clearAdminSession()
    throw error
  }
}
