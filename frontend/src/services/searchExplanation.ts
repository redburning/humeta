import type {
  RankedMetaboliteSearchRecord,
  SearchExplanation,
  SearchField,
  SearchMatchType,
  SearchQuery,
} from '../types/search'

const RANKING_FIELD_LABELS: Record<SearchField, string> = {
  name: 'Metabolite name',
  id: 'Humeta ID',
  hmdb: 'HMDB ID',
  kegg: 'KEGG ID',
  chebi: 'ChEBI ID',
  formula: 'Molecular formula',
  inchikey: 'InChIKey',
  smiles: 'SMILES',
}

const EXPLANATION_FIELD_LABELS: Record<SearchField, string> = {
  name: 'Metabolite name',
  id: 'Humeta identifier',
  hmdb: 'HMDB identifier',
  kegg: 'KEGG identifier',
  chebi: 'ChEBI identifier',
  formula: 'Molecular formula',
  inchikey: 'InChIKey',
  smiles: 'SMILES structure',
}

const RANKING_TO_EXPLANATION_LABEL = Object.freeze(
  Object.fromEntries(
    (Object.keys(RANKING_FIELD_LABELS) as SearchField[]).map((field) => [
      RANKING_FIELD_LABELS[field],
      EXPLANATION_FIELD_LABELS[field],
    ]),
  ) as Record<string, string>,
)

function primaryMatchLabel(
  matchedField: string,
  matchType: SearchMatchType,
): string {
  if (matchType === 'alias') return 'Synonym'
  return RANKING_TO_EXPLANATION_LABEL[matchedField] ?? matchedField
}

function additionalMatchedFields(
  result: RankedMetaboliteSearchRecord,
  query: SearchQuery | readonly SearchQuery[],
): string[] {
  const queries = Array.isArray(query) ? query : [query]
  const primaryField = queries.find((item) => (
    RANKING_FIELD_LABELS[item.field] === result.matchedField
  ))?.field

  return queries
    .filter((item) => item.field !== primaryField)
    .map((item) => EXPLANATION_FIELD_LABELS[item.field])
}

export function buildSearchExplanation(
  result: RankedMetaboliteSearchRecord,
  query: SearchQuery | readonly SearchQuery[],
): SearchExplanation {
  const primaryMatch = primaryMatchLabel(result.matchedField, result.matchType)
  const matchedFields = Array.from(new Set([
    primaryMatch,
    ...additionalMatchedFields(result, query),
  ]))

  return {
    primaryMatch,
    matchedFields,
    matchType: result.matchType,
    score: result.score,
  }
}
