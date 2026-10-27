const diseaseAssociationContentByMetaboliteId = Object.freeze({
  IPTM00001: Object.freeze({
    type: 'image',
    src: '/disease-association/IPTM00001/preview.jpg',
    alt: 'Disease Association visualization for IPTM00001',
  }),
})

const noDiseaseAssociationContent = Object.freeze({ type: 'none' })

export function getDiseaseAssociationContent(metaboliteId) {
  if (typeof metaboliteId !== 'string') return noDiseaseAssociationContent

  const normalizedId = metaboliteId.trim().toUpperCase()
  return diseaseAssociationContentByMetaboliteId[normalizedId] ?? noDiseaseAssociationContent
}
