import { apiClient } from '../api/client'
import type {
  MetaboliteSearchPage,
  SearchAdapter,
  SearchField,
  SearchQuery,
} from '../../types/search'

interface MetaboliteSearchPayload {
  queries: Array<{ keyword: string; field: SearchField }>
  page: number
  size: number
}

function toPayloadQuery(query: SearchQuery): { keyword: string; field: SearchField } {
  return { keyword: query.keyword.trim(), field: query.field }
}

export const httpSearchAdapter: SearchAdapter = {
  async searchMetabolites(query, options = {}) {
    const queries = Array.isArray(query) ? [...query] : [query as SearchQuery]
    const payloadQueries = queries
      .map(toPayloadQuery)
      .filter((item) => item.keyword.length > 0)

    const payload: MetaboliteSearchPayload = {
      queries: payloadQueries,
      page: Math.max(1, options.page ?? 1),
      size: Math.max(1, options.size ?? 20),
    }

    return apiClient.post<MetaboliteSearchPage>('/metabolites/search', payload)
  },
}
