import { apiRequest } from '@/services/api/apiClient.js'

export async function fetchPublicServices() {
  const response = await apiRequest('/services')
  return response.data.services
}
