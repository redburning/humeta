import { spectrumSearchData } from '../data/spectrumSearchData.js'

const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value))

function asPeakObjects(peaks) {
  return peaks
    .map((peak, index) => ({
      index,
      mz: Number(Array.isArray(peak) ? peak[0] : peak.mz),
      intensity: Number(Array.isArray(peak) ? peak[1] : peak.intensity),
    }))
    .filter((peak) => Number.isFinite(peak.mz) && peak.mz > 0 && Number.isFinite(peak.intensity) && peak.intensity >= 0)
}

export function normalizeToBasePeak(peaks) {
  const source = asPeakObjects(peaks)
  const baseIntensity = Math.max(0, ...source.map((peak) => peak.intensity))
  if (!baseIntensity) return source.map((peak) => [peak.mz, 0])
  return source.map((peak) => [peak.mz, peak.intensity / baseIntensity * 100])
}

export function normalizeToSum(peaks) {
  const source = asPeakObjects(peaks)
  const total = source.reduce((sum, peak) => sum + peak.intensity, 0)
  if (!total) return source.map((peak) => [peak.mz, 0])
  return source.map((peak) => [peak.mz, peak.intensity / total])
}

export function cleanSpectrum(peaks, options = {}) {
  const {
    minimumRelativeIntensity = 1,
    maximumPeakCount = 200,
    removePrecursorPeak = false,
    precursorMz = null,
    precursorExclusionDa = 0.5,
    mergeToleranceDa = 0.0001,
  } = options

  const sorted = asPeakObjects(peaks).sort((left, right) => left.mz - right.mz)
  const merged = []
  sorted.forEach((peak) => {
    const previous = merged[merged.length - 1]
    if (!previous || Math.abs(previous.mz - peak.mz) > mergeToleranceDa) {
      merged.push({ mz: peak.mz, intensity: peak.intensity, count: 1 })
      return
    }
    const totalIntensity = previous.intensity + peak.intensity
    previous.mz = totalIntensity
      ? (previous.mz * previous.intensity + peak.mz * peak.intensity) / totalIntensity
      : (previous.mz * previous.count + peak.mz) / (previous.count + 1)
    previous.intensity = totalIntensity
    previous.count += 1
  })

  const withoutPrecursor = removePrecursorPeak && Number.isFinite(Number(precursorMz))
    ? merged.filter((peak) => Math.abs(peak.mz - Number(precursorMz)) > precursorExclusionDa)
    : merged
  const basePeakIntensity = Math.max(0, ...withoutPrecursor.map((peak) => peak.intensity))
  const intensityFloor = basePeakIntensity * Math.max(0, Number(minimumRelativeIntensity)) / 100
  let filtered = withoutPrecursor.filter((peak) => peak.intensity >= intensityFloor)

  const peakLimit = Math.max(2, Math.floor(Number(maximumPeakCount) || 200))
  if (filtered.length > peakLimit) {
    filtered = filtered
      .sort((left, right) => right.intensity - left.intensity || left.mz - right.mz)
      .slice(0, peakLimit)
      .sort((left, right) => left.mz - right.mz)
  }

  const cleanedPeaks = filtered.map((peak) => [peak.mz, peak.intensity])
  return {
    peaks: cleanedPeaks,
    displayPeaks: normalizeToBasePeak(cleanedPeaks),
    sumNormalizedPeaks: normalizeToSum(cleanedPeaks),
  }
}

function toleranceDaForMz(mz, tolerance, unit) {
  return unit === 'ppm' ? mz * tolerance / 1e6 : tolerance
}

export function matchSpectrumPeaks(queryPeaks, referencePeaks, tolerance, unit = 'Da') {
  const query = asPeakObjects(queryPeaks)
  const reference = asPeakObjects(referencePeaks)
  const candidates = []

  query.forEach((queryPeak, queryIndex) => {
    reference.forEach((referencePeak, referenceIndex) => {
      const deltaDa = queryPeak.mz - referencePeak.mz
      const allowed = toleranceDaForMz(queryPeak.mz, Number(tolerance), unit)
      if (Math.abs(deltaDa) <= allowed) {
        candidates.push({
          queryIndex,
          referenceIndex,
          queryMz: queryPeak.mz,
          queryIntensity: queryPeak.intensity,
          referenceMz: referencePeak.mz,
          referenceIntensity: referencePeak.intensity,
          deltaDa,
          absoluteDeltaDa: Math.abs(deltaDa),
        })
      }
    })
  })

  candidates.sort((left, right) => (
    left.absoluteDeltaDa - right.absoluteDeltaDa
    || right.referenceIntensity - left.referenceIntensity
    || right.queryIntensity - left.queryIntensity
    || left.queryMz - right.queryMz
  ))

  const usedQuery = new Set()
  const usedReference = new Set()
  const matchedPairs = []
  candidates.forEach((candidate) => {
    if (usedQuery.has(candidate.queryIndex) || usedReference.has(candidate.referenceIndex)) return
    usedQuery.add(candidate.queryIndex)
    usedReference.add(candidate.referenceIndex)
    matchedPairs.push(candidate)
  })
  matchedPairs.sort((left, right) => left.queryMz - right.queryMz)

  return {
    matchedPairs,
    unmatchedQuery: query.filter((_, index) => !usedQuery.has(index)).map((peak) => [peak.mz, peak.intensity]),
    unmatchedReference: reference.filter((_, index) => !usedReference.has(index)).map((peak) => [peak.mz, peak.intensity]),
  }
}

export function calculateDotProductSimilarity(queryPeaks, referencePeaks, matchedPairs) {
  const query = asPeakObjects(queryPeaks)
  const reference = asPeakObjects(referencePeaks)
  const numerator = matchedPairs.reduce((sum, pair) => sum + pair.queryIntensity * pair.referenceIntensity, 0)
  const queryNorm = Math.sqrt(query.reduce((sum, peak) => sum + peak.intensity ** 2, 0))
  const referenceNorm = Math.sqrt(reference.reduce((sum, peak) => sum + peak.intensity ** 2, 0))
  if (!queryNorm || !referenceNorm) return 0
  return clamp(numerator / (queryNorm * referenceNorm))
}

function entropyTerm(value) {
  return value > 0 ? value * Math.log2(value) : 0
}

export function calculateUnweightedEntropySimilarity(queryPeaks, referencePeaks, matchedPairs) {
  if (!matchedPairs.length) return 0
  const query = normalizeToSum(queryPeaks)
  const reference = normalizeToSum(referencePeaks)
  const similarity = 0.5 * matchedPairs.reduce((sum, pair) => {
    const queryIntensity = query[pair.queryIndex]?.[1] || 0
    const referenceIntensity = reference[pair.referenceIndex]?.[1] || 0
    return sum
      + entropyTerm(queryIntensity + referenceIntensity)
      - entropyTerm(queryIntensity)
      - entropyTerm(referenceIntensity)
  }, 0)
  return clamp(similarity)
}

export function calculateMassError(queryMz, referenceMz) {
  const deltaDa = Number(queryMz) - Number(referenceMz)
  const deltaPpm = deltaDa / Number(referenceMz) * 1e6
  return { deltaDa, deltaPpm }
}

export function calculateSearchWindow(queryMz, tolerance, unit) {
  const halfWindow = unit === 'ppm' ? queryMz * tolerance / 1e6 : tolerance
  return { minimum: queryMz - halfWindow, maximum: queryMz + halfWindow, halfWindow }
}

export function searchMs1(parameters, records = spectrumSearchData) {
  const queryMz = Number(parameters.queryMz)
  const tolerance = Number(parameters.tolerance)
  return records
    .filter((record) => record.polarity === parameters.polarity && record.adduct === parameters.adduct)
    .map((record) => ({ record, ...calculateMassError(queryMz, record.precursorMz) }))
    .filter((result) => (
      parameters.toleranceUnit === 'ppm'
        ? Math.abs(result.deltaPpm) <= tolerance
        : Math.abs(result.deltaDa) <= tolerance
    ))
    .sort((left, right) => Math.abs(left.deltaPpm) - Math.abs(right.deltaPpm) || left.record.name.localeCompare(right.record.name))
}

export function searchMs2(queryPeaks, parameters, algorithm, records = spectrumSearchData) {
  const queryClean = cleanSpectrum(queryPeaks, {
    minimumRelativeIntensity: parameters.minimumRelativeIntensity,
    maximumPeakCount: parameters.maximumPeakCount,
    removePrecursorPeak: parameters.removePrecursorPeak,
    precursorMz: Number(parameters.precursorMz),
    precursorExclusionDa: parameters.fragmentToleranceUnit === 'ppm'
      ? Number(parameters.precursorMz) * Number(parameters.fragmentTolerance) / 1e6
      : Number(parameters.fragmentTolerance),
  })

  return records
    .filter((record) => record.polarity === parameters.ionMode && record.adduct === parameters.adduct)
    .map((record) => {
      const massError = calculateMassError(Number(parameters.precursorMz), record.precursorMz)
      const precursorMatched = parameters.precursorToleranceUnit === 'ppm'
        ? Math.abs(massError.deltaPpm) <= Number(parameters.precursorTolerance)
        : Math.abs(massError.deltaDa) <= Number(parameters.precursorTolerance)
      if (!precursorMatched) return null

      const referenceClean = cleanSpectrum(record.peaks, {
        minimumRelativeIntensity: parameters.minimumRelativeIntensity,
        maximumPeakCount: parameters.maximumPeakCount,
        removePrecursorPeak: parameters.removePrecursorPeak,
        precursorMz: record.precursorMz,
        precursorExclusionDa: parameters.fragmentToleranceUnit === 'ppm'
          ? record.precursorMz * Number(parameters.fragmentTolerance) / 1e6
          : Number(parameters.fragmentTolerance),
      })
      const queryScoringPeaks = parameters.normalizeSpectrum ? queryClean.displayPeaks : queryClean.peaks
      const referenceScoringPeaks = parameters.normalizeSpectrum ? referenceClean.displayPeaks : referenceClean.peaks
      const matching = matchSpectrumPeaks(
        queryScoringPeaks,
        referenceScoringPeaks,
        Number(parameters.fragmentTolerance),
        parameters.fragmentToleranceUnit,
      )
      if (matching.matchedPairs.length < Number(parameters.minimumMatchedPeaks)) return null

      const score = algorithm === 'entropy'
        ? calculateUnweightedEntropySimilarity(queryScoringPeaks, referenceScoringPeaks, matching.matchedPairs)
        : calculateDotProductSimilarity(queryScoringPeaks, referenceScoringPeaks, matching.matchedPairs)
      if (score < Number(parameters.minimumScore)) return null

      return {
        record,
        score,
        algorithm,
        massError,
        ...matching,
        queryDisplayPeaks: queryClean.displayPeaks,
        referenceDisplayPeaks: referenceClean.displayPeaks,
      }
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score || Math.abs(left.massError.deltaPpm) - Math.abs(right.massError.deltaPpm))
}

export function useLocalSpectrumSearch() {
  return {
    records: spectrumSearchData,
    searchMs1,
    searchMs2,
    cleanSpectrum,
    matchSpectrumPeaks,
    calculateDotProductSimilarity,
    calculateUnweightedEntropySimilarity,
    calculateMassError,
    calculateSearchWindow,
  }
}
