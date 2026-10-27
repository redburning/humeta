export const SEARCH_FIELD_LABELS = Object.freeze({
  name: 'Metabolite name',
  id: 'Humeta identifier',
  hmdb: 'HMDB identifier',
  kegg: 'KEGG identifier',
  chebi: 'ChEBI identifier',
  formula: 'Molecular formula',
  inchikey: 'InChIKey',
  smiles: 'SMILES structure',
})

export function searchFieldLabel(field) {
  return SEARCH_FIELD_LABELS[field] ?? SEARCH_FIELD_LABELS.name
}
