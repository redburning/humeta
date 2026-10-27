import { mockMetabolites } from '../../mock/metabolites'
import type {
  MetaboliteSearchRecord,
  SearchAdapter,
  SearchField,
  SearchQuery,
} from '../../types/search'

function normalizeText(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase()
}

function normalizeIdentifier(value: string): string {
  return value.normalize('NFKC').trim().toLocaleUpperCase()
}

function matchesName(record: MetaboliteSearchRecord, keyword: string): boolean {
  const normalizedKeyword = normalizeText(keyword)

  return [record.name, record.chineseName, ...record.synonyms]
    .some((value) => normalizeText(value).includes(normalizedKeyword))
}

function matchesIdentifier(value: string, keyword: string): boolean {
  return normalizeIdentifier(value) === normalizeIdentifier(keyword)
}

const exactFieldGetters: Record<
  Exclude<SearchField, 'name' | 'id' | 'smiles'>,
  (record: MetaboliteSearchRecord) => string
> = {
  hmdb: (record) => record.hmdb,
  kegg: (record) => record.kegg,
  chebi: (record) => record.chebi,
  formula: (record) => record.formula,
  inchikey: (record) => record.inchikey,
}

function matchesQuery(record: MetaboliteSearchRecord, query: SearchQuery): boolean {
  const keyword = query.keyword.trim()
  if (!keyword) return false

  if (query.field === 'name') return matchesName(record, keyword)

  if (query.field === 'id') {
    return [record.metaboliteId, ...record.alternateIds]
      .some((value) => matchesIdentifier(value, keyword))
  }

  if (query.field === 'smiles') return record.smiles.includes(keyword)

  return matchesIdentifier(exactFieldGetters[query.field](record), keyword)
}

export const mockSearchAdapter: SearchAdapter = {
  async searchMetabolites(query, options = {}) {
    const queries = Array.isArray(query) ? query : [query]
    const matches = queries.length === 0
      ? [...mockMetabolites]
      : mockMetabolites.filter((record) => (
          queries.every((searchQuery) => matchesQuery(record, searchQuery))
        ))

    const page = Math.max(1, options.page ?? 1)
    const size = Math.max(1, options.size ?? Math.max(matches.length, 1))
    const start = (page - 1) * size

    return {
      items: matches.slice(start, start + size),
      total: matches.length,
      page,
      size,
      totalPages: Math.ceil(matches.length / size),
    }
  },
}
