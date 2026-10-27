import { shallowRef } from 'vue'
import { structureSearchData } from '../data/structureSearchData'

export function useLocalStructureSearch() {
  const kekuleRef = shallowRef(null)
  const moleculeCache = new Map()
  const parseErrors = new Map()

  function extractMolecule(Kekule, chemObj) {
    if (!chemObj) return null
    if (chemObj instanceof Kekule.Molecule) return chemObj

    const children = Kekule.ChemStructureUtils.getChildStructureObjs(chemObj, true) || []
    return children.find((item) => item instanceof Kekule.Molecule) || null
  }

  function parseRecord(record) {
    const Kekule = kekuleRef.value
    if (!Kekule) throw new Error('Kekule.js is not ready yet.')
    if (moleculeCache.has(record.key)) return moleculeCache.get(record.key)

    try {
      const chemObj = Kekule.IO.loadFormatData(record.smiles, 'smi')
      let molecule = extractMolecule(Kekule, chemObj)
      if (!molecule?.getNodeCount?.()) throw new Error('No molecule was parsed.')

      molecule = Kekule.OpenBabel.StructUtils.generate2DStructure(molecule, {}) || molecule
      moleculeCache.set(record.key, molecule)
      parseErrors.delete(record.key)
      return molecule
    } catch {
      parseErrors.set(record.key, `Unable to parse ${record.id}.`)
      return null
    }
  }

  function initialize(Kekule) {
    if (!Kekule) throw new Error('Kekule.js is not ready yet.')
    if (kekuleRef.value && kekuleRef.value !== Kekule) moleculeCache.clear()
    kekuleRef.value = Kekule

    // Parse the small dataset once. Later searches reuse these plain Map entries.
    structureSearchData.forEach(parseRecord)
    return {
      availableCount: moleculeCache.size,
      errors: Array.from(parseErrors.values()),
    }
  }

  function createComparisonOptions(compareCharge, compareMass) {
    const Kekule = kekuleRef.value
    return {
      level: Kekule.StructureComparationLevel.CONSTITUTION,
      compareCharge,
      compareMass,
      compareStereo: false,
    }
  }

  function createResult(record, molecule, match) {
    return Object.freeze({ record, molecule, match: Object.freeze(match) })
  }

  function cloneForComparison(molecule) {
    // Kekule's comparison/search path standardizes structures internally and may
    // mutate them. Keep cached preview molecules pristine across search modes.
    return typeof molecule?.clone === 'function' ? molecule.clone() : molecule
  }

  function exactSearch(queryMolecule, options) {
    const compareOptions = createComparisonOptions(options.compareCharge, options.compareMass)

    return structureSearchData.flatMap((record) => {
      const molecule = parseRecord(record)
      if (!molecule) return []

      try {
        const queryClone = cloneForComparison(queryMolecule)
        const targetClone = cloneForComparison(molecule)
        const matched = queryClone.isSameStructureWith(targetClone, compareOptions)
        return matched
          ? [createResult(record, molecule, { label: 'Exact matched', score: null })]
          : []
      } catch {
        return []
      }
    })
  }

  function substructureSearch(queryMolecule, options) {
    const Kekule = kekuleRef.value
    const compareOptions = createComparisonOptions(options.compareCharge, options.compareMass)

    return structureSearchData.flatMap((record) => {
      const molecule = parseRecord(record)
      if (!molecule) return []

      try {
        const queryClone = cloneForComparison(queryMolecule)
        const targetClone = cloneForComparison(molecule)
        const matchItems = targetClone.search(queryClone, compareOptions)
        if (!Array.isArray(matchItems) || !matchItems.length) return []

        const matchedAtomCount = matchItems.filter(
          (item) => item instanceof Kekule.ChemStructureNode,
        ).length
        const matchedBondCount = matchItems.filter(
          (item) => item instanceof Kekule.ChemStructureConnector,
        ).length

        return [
          createResult(record, molecule, {
            label: 'Substructure matched',
            matchedAtomCount,
            matchedBondCount,
            score: null,
          }),
        ]
      } catch {
        return []
      }
    })
  }

  function similaritySearch(options) {
    return structureSearchData.flatMap((record) => {
      if (record.demoSimilarity < options.similarityThreshold) return []
      const molecule = parseRecord(record)
      if (!molecule) return []

      return [
        createResult(record, molecule, {
          label: 'Demo similarity',
          score: record.demoSimilarity,
        }),
      ]
    })
  }

  function search(queryMolecule, options) {
    if (!queryMolecule?.getNodeCount?.()) throw new Error('Draw or import a structure first.')
    if (!kekuleRef.value) throw new Error('Kekule.js is not ready yet.')

    if (options.mode === 'substructure') return substructureSearch(queryMolecule, options)
    if (options.mode === 'similarity') return similaritySearch(options)
    return exactSearch(queryMolecule, options)
  }

  function clearCache() {
    moleculeCache.clear()
    parseErrors.clear()
    kekuleRef.value = null
  }

  return {
    clearCache,
    initialize,
    search,
  }
}
