import { apiClient } from './api/client'
import type { MetaboliteDetail } from '../types/metabolite'

export function getMetaboliteDetail(id: string): Promise<MetaboliteDetail> {
  return apiClient.get<MetaboliteDetail>(`/metabolites/${encodeURIComponent(id)}`)
}
