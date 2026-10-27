import type { SearchField, SearchHistoryItem, SearchQuery } from '../types/search'

export const SEARCH_HISTORY_STORAGE_KEY = 'humeta_search_history'
export const SEARCH_HISTORY_UPDATED_EVENT = 'humeta-search-history-updated'

const MAX_SEARCH_HISTORY_ITEMS = 10
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

type SearchHistoryInput = SearchQuery & { label?: string }
type SearchHistoryIdentity = Pick<SearchHistoryItem, 'keyword' | 'field'>

function canUseLocalStorage(): boolean {
  if (typeof window === 'undefined') return false

  try {
    return typeof window.localStorage !== 'undefined'
  } catch {
    return false
  }
}

function isSearchField(value: unknown): value is SearchField {
  return typeof value === 'string' && SEARCH_FIELDS.has(value as SearchField)
}

function isSearchHistoryItem(value: unknown): value is SearchHistoryItem {
  if (!value || typeof value !== 'object') return false

  const item = value as Partial<SearchHistoryItem>
  return (
    typeof item.keyword === 'string'
    && item.keyword.trim().length > 0
    && typeof item.normalizedKeyword === 'string'
    && isSearchField(item.field)
    && typeof item.label === 'string'
    && typeof item.timestamp === 'number'
    && Number.isFinite(item.timestamp)
  )
}

function historyIdentity(keyword: string, field: SearchField): string {
  return `${field}:${keyword.normalize('NFKC').trim().toLocaleLowerCase()}`
}

function notifyHistoryUpdated(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(SEARCH_HISTORY_UPDATED_EVENT))
}

function writeSearchHistory(items: readonly SearchHistoryItem[]): SearchHistoryItem[] {
  const limitedItems = items.slice(0, MAX_SEARCH_HISTORY_ITEMS)
  if (!canUseLocalStorage()) return limitedItems

  try {
    window.localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(limitedItems))
    notifyHistoryUpdated()
  } catch {
    return limitedItems
  }

  return limitedItems
}

export function getSearchHistory(): SearchHistoryItem[] {
  if (!canUseLocalStorage()) return []

  try {
    const storedValue = window.localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY)
    if (!storedValue) return []

    const parsedValue: unknown = JSON.parse(storedValue)
    if (!Array.isArray(parsedValue)) return []

    return parsedValue
      .filter(isSearchHistoryItem)
      .slice(0, MAX_SEARCH_HISTORY_ITEMS)
  } catch {
    return []
  }
}

export function saveSearch(query: SearchHistoryInput): SearchHistoryItem[] {
  const keyword = query.keyword.trim()
  const normalizedKeyword = query.normalizedKeyword.trim()
  if (!keyword || !normalizedKeyword || !isSearchField(query.field)) return getSearchHistory()

  const item: SearchHistoryItem = {
    keyword,
    normalizedKeyword,
    field: query.field,
    label: query.label?.trim() || keyword,
    timestamp: Date.now(),
  }
  const identity = historyIdentity(item.keyword, item.field)
  const history = getSearchHistory().filter((historyItem) => (
    historyIdentity(historyItem.keyword, historyItem.field) !== identity
  ))

  return writeSearchHistory([item, ...history])
}

export function removeSearchHistory(
  itemOrKeyword: SearchHistoryIdentity | string,
  field?: SearchField,
): SearchHistoryItem[] {
  const keyword = typeof itemOrKeyword === 'string' ? itemOrKeyword : itemOrKeyword.keyword
  const searchField = typeof itemOrKeyword === 'string' ? field : itemOrKeyword.field
  if (!keyword.trim() || !searchField || !isSearchField(searchField)) return getSearchHistory()

  const identity = historyIdentity(keyword, searchField)
  return writeSearchHistory(getSearchHistory().filter((historyItem) => (
    historyIdentity(historyItem.keyword, historyItem.field) !== identity
  )))
}

export function clearSearchHistory(): SearchHistoryItem[] {
  if (!canUseLocalStorage()) return []

  try {
    window.localStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY)
    notifyHistoryUpdated()
  } catch {
    return []
  }

  return []
}
