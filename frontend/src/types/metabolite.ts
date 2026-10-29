export interface MetabolitePropertyField {
  label: string
  value: string
  wide?: boolean
}

export interface MetaboliteTaxonomyNode {
  id: string
  rank: string
  label: string
  children: MetaboliteTaxonomyNode[]
}

export interface MetaboliteTaxonomy {
  id: string
  title: string
  tree: MetaboliteTaxonomyNode
}

export interface MetaboliteChemicalDescription {
  rows: MetabolitePropertyField[][]
  structureImage: string
  structureAlt: string
  structureDownloadName: string
}

export interface MetaboliteOverview {
  label: string
  value: string
  description: string[]
}

export interface MetaboliteDetail {
  id: string
  heroLabel: string
  name: string
  chineseName: string
  identifiers: MetabolitePropertyField[]
  overview?: MetaboliteOverview | null
  chemicalDescription: MetaboliteChemicalDescription
  taxonomy: MetaboliteTaxonomy[]
}
