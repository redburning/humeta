import type {
  MetaboliteSearchRecord,
  RankedMetaboliteSearchRecord,
  SearchField,
  SearchMatchType,
  SearchQuery,
  SearchResultItem,
} from '../types/search'

const MATCH_SCORES: Record<SearchMatchType, number> = {
  exact: 100,
  identifier: 95,
  alias: 90,
  fuzzy: 70,
}

const IDENTIFIER_FIELDS = new Set<SearchField>([
  'hmdb',
  'kegg',
  'chebi',
  'formula',
  'inchikey',
])

const MATCHED_FIELD_LABELS: Record<SearchField, string> = {
  name: 'Metabolite name',
  id: 'Humeta ID',
  hmdb: 'HMDB ID',
  kegg: 'KEGG ID',
  chebi: 'ChEBI ID',
  formula: 'Molecular formula',
  inchikey: 'InChIKey',
  smiles: 'SMILES',
}

function normalizeText(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase()
}

function classifyNameMatch(
  record: MetaboliteSearchRecord,
  query: SearchQuery,
): SearchMatchType {
  const originalKeyword = normalizeText(query.keyword)
  const normalizedKeyword = normalizeText(query.normalizedKeyword)
  const primaryName = normalizeText(record.name)
  const aliases = [record.chineseName, ...record.synonyms].map(normalizeText)

  if (primaryName === originalKeyword) return 'exact'
  if (aliases.some((alias) => alias === originalKeyword)) return 'alias'

  const searchableNames = [primaryName, ...aliases]
  if (searchableNames.some((value) => value.includes(originalKeyword))) return 'fuzzy'
  if (searchableNames.some((value) => value.includes(normalizedKeyword))) return 'fuzzy'

  return 'fuzzy'
}

function classifyMatch(
  record: MetaboliteSearchRecord,
  query: SearchQuery,
): SearchMatchType {
  if (IDENTIFIER_FIELDS.has(query.field)) return 'identifier'
  if (query.field === 'name') return classifyNameMatch(record, query)

  if (query.field === 'smiles') {
    const originalKeyword = query.keyword.trim()
    const normalizedKeyword = query.normalizedKeyword.trim()
    if (record.smiles === originalKeyword || record.smiles === normalizedKeyword) return 'exact'
    return 'fuzzy'
  }

  return 'exact'
}

export function scoreSearchResult(
  record: MetaboliteSearchRecord,
  query: SearchQuery,
): SearchResultItem {
  const matchType = classifyMatch(record, query)

  return {
    id: record.id,
    name: record.name,
    matchedField: MATCHED_FIELD_LABELS[query.field],
    matchType,
    score: MATCH_SCORES[matchType],
  }
}

export function rankSearchResults(
  records: readonly MetaboliteSearchRecord[],
  query: SearchQuery | readonly SearchQuery[],
): RankedMetaboliteSearchRecord[] {
  const queries = Array.isArray(query) ? query : [query]

  return records
    .map((record, originalIndex) => {
      const rankedMatches = queries.map((searchQuery) => scoreSearchResult(record, searchQuery))
      const bestMatch = rankedMatches.reduce((best, candidate) => (
        candidate.score > best.score ? candidate : best
      ))

      return {
        originalIndex,
        result: { ...record, ...bestMatch },
      }
    })
    .sort((left, right) => (
      right.result.score - left.result.score || left.originalIndex - right.originalIndex
    ))
    .map(({ result }) => result)
}
