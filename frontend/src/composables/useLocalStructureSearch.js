import { shallowRef } from 'vue'
import { structureSearchData } from '../data/structureSearchData'

// These private caches contain only the existing eight fixed records. Runtime
// identity keeps chemical objects from different Kekule instances isolated.
const sessionMoleculeCaches = new WeakMap()

export function useLocalStructureSearch() {
  const kekuleRef = shallowRef(null)
  let moleculeCache = null
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
    const cached = moleculeCache.get(record.key)
    if (cached?.smiles === record.smiles) {
      parseErrors.delete(record.key)
      return cached.molecule
    }

    try {
      const chemObj = Kekule.IO.loadFormatData(record.smiles, 'smi')
      let molecule = extractMolecule(Kekule, chemObj)
      if (!molecule?.getNodeCount?.()) throw new Error('No molecule was parsed.')

      molecule = Kekule.OpenBabel.StructUtils.generate2DStructure(molecule, {}) || molecule
      moleculeCache.set(record.key, { smiles: record.smiles, molecule })
      parseErrors.delete(record.key)
      return molecule
    } catch {
      parseErrors.set(record.key, `Unable to parse ${record.id}.`)
      return null
    }
  }

  function initialize(Kekule) {
    if (!Kekule) throw new Error('Kekule.js is not ready yet.')
    if (kekuleRef.value !== Kekule) parseErrors.clear()
    kekuleRef.value = Kekule

    moleculeCache = sessionMoleculeCaches.get(Kekule)
    if (!moleculeCache) {
      moleculeCache = new Map()
      sessionMoleculeCaches.set(Kekule, moleculeCache)
    }

    // Prepare a record through the existing parse-and-gen2D path only when a
    // search needs it. Binding a runtime performs no chemical preprocessing.
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
    return Object.freeze({ record, molecule: cloneForComparison(molecule), match: Object.freeze(match) })
  }

  function cloneForComparison(molecule) {
    // Kekule's comparison/search path standardizes structures internally and may
    // mutate them. Give comparison operations and result viewers their own
    // copies so the session cache stays pristine across searches and mounts.
    if (typeof molecule?.clone !== 'function') throw new Error('Unable to clone the demonstration structure.')
    return molecule.clone()
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

    parseErrors.clear()
    let results
    if (options.mode === 'substructure') results = substructureSearch(queryMolecule, options)
    else if (options.mode === 'similarity') results = similaritySearch(options)
    else results = exactSearch(queryMolecule, options)

    if (parseErrors.size) throw new Error('The local demonstration dataset could not be prepared.')
    return results
  }

  function clearCache() {
    moleculeCache?.clear()
    release()
  }

  function release() {
    moleculeCache = null
    parseErrors.clear()
    kekuleRef.value = null
  }

  return {
    clearCache,
    initialize,
    release,
    search,
  }
}
