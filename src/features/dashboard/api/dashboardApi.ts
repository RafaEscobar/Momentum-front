import { api } from '@/api/client'
import type { ApiRequestOptions } from '@/api/client'
import type { DashboardData } from '@/features/dashboard/types'

const dashboardEndpoint = '/dashboard'

export async function getDashboard(options?: ApiRequestOptions): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>(dashboardEndpoint, options)

  return data
}
