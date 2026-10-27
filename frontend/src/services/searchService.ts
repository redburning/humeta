import { httpSearchAdapter } from './adapters/httpSearchAdapter'
import { normalizeFilters } from './searchFilter'
import { applyFilters } from './searchFilterExecutor'
import { parseSearchKeyword } from './searchParser'
import { rankSearchResults } from './searchRanking'
import type {
  AdvancedSearchQuery,
  MetaboliteSearchPage,
  MetaboliteSearchRecord,
  RankedMetaboliteSearchRecord,
  SearchAdapter,
  SearchField,
  SearchFilter,
  SearchQuery,
} from '../types/search'

/** 关键字检索需要先拉全量命中结果，在前端做排序与解释；后端单页最多 2000。 */
const CLIENT_SEARCH_LIMIT = 1000

const SEARCH_FIELDS = new Set<SearchField>([
  'name',
  'id',
  'hmdb',
  'kegg',
  'chebi',
  'formula',
  'inchikey',
  'smiles',
])

const NORMALIZED_NAME_KEYWORDS = new Map<string, string>([
  ['l-色氨酸', 'tryptophan'],
  ['l-tryptophan', 'tryptophan'],
])

type RouteQueryValue = string | null | undefined | readonly (string | null)[]
type SearchRequest = SearchQuery | AdvancedSearchQuery

export function isSearchField(value: unknown): value is SearchField {
  return typeof value === 'string' && SEARCH_FIELDS.has(value as SearchField)
}

function normalizeSearchKeyword(keyword: string, field: SearchField): string {
  const normalizedKeyword = keyword.normalize('NFKC').trim()
  if (field !== 'name') return normalizedKeyword

  const normalizedName = normalizedKeyword.toLocaleLowerCase()
  return NORMALIZED_NAME_KEYWORDS.get(normalizedName) ?? normalizedName
}

export function createSearchQuery(
  keyword: string,
  field?: unknown,
  normalizedKeyword?: string,
): SearchQuery {
  const originalKeyword = keyword.trim()

  if (!isSearchField(field)) {
    const parsedQuery = parseSearchKeyword(originalKeyword)
    return {
      ...parsedQuery,
      normalizedKeyword: normalizeSearchKeyword(
        normalizedKeyword ?? parsedQuery.normalizedKeyword,
        parsedQuery.field,
      ),
    }
  }

  return {
    keyword: originalKeyword,
    normalizedKeyword: normalizeSearchKeyword(normalizedKeyword ?? originalKeyword, field),
    field,
  }
}

function routeValues(value: RouteQueryValue): string[] {
  const values = Array.isArray(value) ? value : [value]
  return values.filter((item): item is string => typeof item === 'string')
}

export function parseSearchRouteQuery(
  keywordValue: RouteQueryValue,
  fieldValue: RouteQueryValue,
): SearchQuery[] {
  const keywords = routeValues(keywordValue)
    .map((keyword) => keyword.trim())
    .filter(Boolean)
  const fields = routeValues(fieldValue)

  return keywords.map((keyword, index) => createSearchQuery(keyword, fields[index]))
}

export function serializeSearchQuery(query: SearchQuery | readonly SearchQuery[]): {
  keyword: string | string[]
  field: SearchField | SearchField[]
} {
  const queries = Array.isArray(query) ? query : [query]

  if (queries.length === 1) {
    return {
      keyword: queries[0].keyword,
      field: queries[0].field,
    }
  }

  return {
    keyword: queries.map((item) => item.keyword),
    field: queries.map((item) => item.field),
  }
}

function isCompleteSearchQuery(query: SearchRequest): query is SearchQuery {
  return (
    typeof query.keyword === 'string'
    && typeof query.normalizedKeyword === 'string'
    && isSearchField(query.field)
  )
}

function requestFilters(request: SearchRequest): SearchFilter[] {
  return 'filters' in request && Array.isArray(request.filters)
    ? request.filters
    : []
}

/**
 * 浏览模式：直接使用后端分页，返回当前页数据与真实总数。
 */
export async function browseMetabolites(
  page = 1,
  size = 20,
  adapter: SearchAdapter = httpSearchAdapter,
): Promise<MetaboliteSearchPage> {
  return adapter.searchMetabolites([], { page, size })
}

export async function searchMetabolites(
  query: SearchRequest | readonly SearchRequest[],
  adapter: SearchAdapter = httpSearchAdapter,
): Promise<Array<MetaboliteSearchRecord | RankedMetaboliteSearchRecord>> {
  const toAdapterQuery = (searchQuery: SearchQuery): SearchQuery => ({
    ...searchQuery,
    keyword: searchQuery.normalizedKeyword,
  })

  const requests: readonly SearchRequest[] = Array.isArray(query)
    ? query
    : [query as SearchRequest]
  const searchQueries = requests.filter(isCompleteSearchQuery)
  const filters = normalizeFilters(requests.flatMap(requestFilters))
  const adapterQueries = searchQueries.map(toAdapterQuery)
  const adapterQuery = searchQueries.length === 0 || Array.isArray(query)
    ? adapterQueries
    : adapterQueries[0]
  const keywordPage = await adapter.searchMetabolites(adapterQuery, {
    page: 1,
    size: CLIENT_SEARCH_LIMIT,
  })
  const filteredResults = applyFilters(keywordPage.items, filters)

  if (searchQueries.length === 0) return filteredResults

  return rankSearchResults(filteredResults, searchQueries)
}
