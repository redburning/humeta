import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { resolve } from 'node:path'

const sourceDirectory = resolve(process.argv[2] || 'artifacts/data-sources')

const categoryIds = Object.freeze({
  humanMetaboliteRole: '77746',
  lipid: '18059',
  fattyAcid: '35366',
  steroid: '35341',
  aminoAcid: '33709',
  carbohydrate: '16646',
  nucleobaseContaining: '61120',
  organicAcid: '64709',
  organicMolecularEntity: '50860',
})

function readGzipTsv(filename) {
  return gunzipSync(readFileSync(resolve(sourceDirectory, filename)))
    .toString('utf8')
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split('\t'))
}

const compounds = new Map(
  readGzipTsv('compounds.tsv.gz').map((columns) => [
    columns[0],
    { name: columns[1], stars: Number(columns[9]) },
  ]),
)

const massCandidates = new Map()

for (const columns of readGzipTsv('chemical_data.tsv.gz')) {
  const compoundId = columns[1]
  const monoisotopicMass = Number(columns[5])
  if (!Number.isFinite(monoisotopicMass) || monoisotopicMass <= 0) continue

  const statusScore = Number(columns[6]) === 1 ? 4 : Number(columns[6]) === 3 ? 3 : 0
  const curationScore = columns[8] === 'false' ? 2 : 0
  const score = statusScore + curationScore
  const current = massCandidates.get(compoundId)

  if (!current || score > current.score) {
    massCandidates.set(compoundId, { value: monoisotopicMass, score })
  }
}

const parentsByChild = new Map()
const roleAssignments = []

for (const columns of readGzipTsv('relation.tsv.gz')) {
  const relationType = Number(columns[1])
  const childId = columns[2]
  const parentId = columns[3]

  if (relationType === 5) {
    const parents = parentsByChild.get(childId) || []
    parents.push(parentId)
    parentsByChild.set(childId, parents)
  }

  if (relationType === 4) roleAssignments.push([childId, parentId])
}

const ancestryCache = new Map()

function isDescendantOf(id, ancestorId, visited = new Set()) {
  const cacheKey = `${id}>${ancestorId}`
  if (ancestryCache.has(cacheKey)) return ancestryCache.get(cacheKey)
  if (id === ancestorId) return true
  if (visited.has(id)) return false

  visited.add(id)
  const result = (parentsByChild.get(id) || []).some((parentId) =>
    isDescendantOf(parentId, ancestorId, new Set(visited)),
  )
  ancestryCache.set(cacheKey, result)
  return result
}

const humanMetaboliteIds = new Set(
  roleAssignments
    .filter(([, roleId]) => isDescendantOf(roleId, categoryIds.humanMetaboliteRole))
    .map(([compoundId]) => compoundId),
)

const classifiedIds = [...humanMetaboliteIds].filter(
  (id) => compounds.get(id)?.stars === 3 && massCandidates.has(id),
)

const classification = {
  fattyAcids: [],
  steroids: [],
  otherLipids: [],
  aminoAcids: [],
  carbohydrates: [],
  nucleobaseContaining: [],
  otherOrganicAcids: [],
  otherOrganic: [],
  otherEntities: [],
}

for (const id of classifiedIds) {
  if (isDescendantOf(id, categoryIds.fattyAcid)) classification.fattyAcids.push(id)
  else if (isDescendantOf(id, categoryIds.steroid)) classification.steroids.push(id)
  else if (isDescendantOf(id, categoryIds.lipid)) classification.otherLipids.push(id)
  else if (isDescendantOf(id, categoryIds.aminoAcid)) classification.aminoAcids.push(id)
  else if (isDescendantOf(id, categoryIds.carbohydrate)) classification.carbohydrates.push(id)
  else if (isDescendantOf(id, categoryIds.nucleobaseContaining)) classification.nucleobaseContaining.push(id)
  else if (isDescendantOf(id, categoryIds.organicAcid)) classification.otherOrganicAcids.push(id)
  else if (isDescendantOf(id, categoryIds.organicMolecularEntity)) classification.otherOrganic.push(id)
  else classification.otherEntities.push(id)
}

const masses = classifiedIds
  .map((id) => massCandidates.get(id).value)
  .filter((value) => value <= 1500)
  .sort((left, right) => left - right)

function quantile(proportion) {
  const position = (masses.length - 1) * proportion
  const lowerIndex = Math.floor(position)
  const upperIndex = Math.ceil(position)
  const interpolated = masses[lowerIndex] + (masses[upperIndex] - masses[lowerIndex]) * (position - lowerIndex)
  return Number(interpolated.toFixed(2))
}

const bins = Array.from({ length: 15 }, (_, index) => ({
  lower: index * 100,
  upper: (index + 1) * 100,
  count: 0,
}))

for (const mass of masses) bins[Math.min(14, Math.floor(mass / 100))].count += 1

const output = {
  release: 253,
  sourceDirectory,
  humanRoleEntities: humanMetaboliteIds.size,
  classifiedEntities: classifiedIds.length,
  classification: Object.fromEntries(
    Object.entries(classification).map(([key, ids]) => [key, ids.length]),
  ),
  massDistribution: {
    included: masses.length,
    excludedAbove1500Da: classifiedIds.length - masses.length,
    boxplot: [masses[0], quantile(0.25), quantile(0.5), quantile(0.75), masses.at(-1)],
    bins,
  },
}

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`)
