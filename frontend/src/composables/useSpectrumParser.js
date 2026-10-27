const MAX_FILE_SIZE = 2 * 1024 * 1024
const SUPPORTED_EXTENSIONS = new Set(['txt', 'csv', 'tsv', 'mgf', 'msp'])

function error(line, message) {
  return { line, message: line ? `Line ${line}: ${message}` : message }
}

function parsePeakLines(lines, startingLine = 1) {
  const peaks = []
  const errors = []

  lines.forEach((source, index) => {
    const lineNumber = startingLine + index
    const line = source.trim()
    if (!line || line.startsWith('#')) return

    const values = line.split(/[\s,;]+/).filter(Boolean)
    if (values.length !== 2) {
      errors.push(error(lineNumber, 'expected exactly two values: m/z and intensity.'))
      return
    }

    const mz = Number(values[0])
    const intensity = Number(values[1])
    if (!Number.isFinite(mz) || mz <= 0) {
      errors.push(error(lineNumber, 'm/z must be a finite positive number.'))
      return
    }
    if (!Number.isFinite(intensity) || intensity < 0) {
      errors.push(error(lineNumber, 'intensity must be a finite non-negative number.'))
      return
    }

    peaks.push([mz, intensity])
  })

  return { peaks, errors }
}

export function validatePeaks(peaks) {
  const errors = []
  if (peaks.length < 2) errors.push(error(0, 'At least two valid peaks are required.'))
  if (peaks.length && peaks.every(([, intensity]) => intensity === 0)) {
    errors.push(error(0, 'Peak intensities cannot all be zero.'))
  }
  return errors
}

export function parsePlainPeakList(text) {
  const parsed = parsePeakLines(String(text || '').replace(/\r/g, '').split('\n'))
  return {
    ...parsed,
    errors: [...parsed.errors, ...validatePeaks(parsed.peaks)],
    warnings: [],
    metadata: {},
    format: 'plain',
  }
}

export function parseMgf(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n')
  const starts = []
  const ends = []
  lines.forEach((line, index) => {
    if (/^BEGIN IONS\s*$/i.test(line.trim())) starts.push(index)
    if (/^END IONS\s*$/i.test(line.trim())) ends.push(index)
  })

  if (!starts.length) {
    return { peaks: [], errors: [error(0, 'MGF does not contain a BEGIN IONS block.')], warnings: [], metadata: {}, format: 'mgf' }
  }

  const start = starts[0]
  const end = ends.find((index) => index > start)
  if (end === undefined) {
    return { peaks: [], errors: [error(start + 1, 'MGF block is missing END IONS.')], warnings: [], metadata: {}, format: 'mgf' }
  }

  const metadata = {}
  const peakLines = []
  const peakLineNumbers = []
  for (let index = start + 1; index < end; index += 1) {
    const line = lines[index].trim()
    if (!line) continue
    const separator = line.indexOf('=')
    if (separator > 0) {
      const key = line.slice(0, separator).trim().toUpperCase()
      const value = line.slice(separator + 1).trim()
      if (key === 'PEPMASS') metadata.precursorMz = Number(value.split(/[\s,]+/)[0])
      if (key === 'CHARGE') {
        metadata.charge = value
        metadata.ionMode = value.includes('-') ? 'negative' : 'positive'
      }
      if (key === 'TITLE') metadata.title = value
      continue
    }
    peakLines.push(line)
    peakLineNumbers.push(index + 1)
  }

  const peaks = []
  const errors = []
  peakLines.forEach((line, index) => {
    const parsed = parsePeakLines([line], peakLineNumbers[index])
    peaks.push(...parsed.peaks)
    errors.push(...parsed.errors)
  })
  errors.push(...validatePeaks(peaks))
  if (metadata.precursorMz !== undefined && (!Number.isFinite(metadata.precursorMz) || metadata.precursorMz <= 0)) {
    errors.push(error(0, 'MGF PEPMASS must contain a finite positive precursor m/z.'))
  }

  return {
    peaks,
    errors,
    warnings: starts.length > 1 ? ['Multiple MGF spectra detected; only the first spectrum was used.'] : [],
    metadata,
    format: 'mgf',
  }
}

export function parseMsp(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n')
  const firstName = lines.findIndex((line) => /^Name\s*:/i.test(line.trim()))
  if (firstName < 0) {
    return { peaks: [], errors: [error(0, 'MSP does not contain a Name field.')], warnings: [], metadata: {}, format: 'msp' }
  }

  const metadata = {}
  const peaks = []
  const errors = []
  let declaredPeakCount = null
  let peakStart = -1
  let nextRecord = -1

  for (let index = firstName; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (index > firstName && /^Name\s*:/i.test(line)) {
      nextRecord = index
      break
    }
    if (peakStart >= 0) {
      if (!line) continue
      const parsed = parsePeakLines([line], index + 1)
      peaks.push(...parsed.peaks)
      errors.push(...parsed.errors)
      continue
    }

    const match = line.match(/^([^:]+):\s*(.*)$/)
    if (!match) continue
    const key = match[1].replace(/[\s_]/g, '').toLowerCase()
    const value = match[2].trim()
    if (key === 'name') metadata.title = value
    if (key === 'precursormz') metadata.precursorMz = Number(value)
    if (key === 'precursortype') metadata.adduct = value
    if (key === 'ionmode') metadata.ionMode = value.toLowerCase().startsWith('neg') ? 'negative' : 'positive'
    if (key === 'numpeaks') {
      declaredPeakCount = Number.parseInt(value, 10)
      peakStart = index + 1
    }
  }

  errors.push(...validatePeaks(peaks))
  if (!Number.isInteger(declaredPeakCount) || declaredPeakCount < 0) {
    errors.push(error(0, 'MSP Num Peaks is missing or invalid.'))
  } else {
    const difference = Math.abs(declaredPeakCount - peaks.length)
    if (difference > Math.max(2, Math.ceil(declaredPeakCount * 0.2))) {
      errors.push(error(0, `MSP Num Peaks declares ${declaredPeakCount}, but ${peaks.length} valid peaks were found.`))
    }
  }

  return {
    peaks,
    errors,
    warnings: nextRecord >= 0 ? ['Multiple MSP spectra detected; only the first spectrum was used.'] : [],
    metadata,
    format: 'msp',
  }
}

export function parseSpectrumFile({ name, size, text }) {
  const extension = String(name || '').split('.').pop().toLowerCase()
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    return { peaks: [], errors: [error(0, 'Unsupported file type. Use TXT, CSV, TSV, MGF, or MSP.')], warnings: [], metadata: {}, format: extension }
  }
  if (size > MAX_FILE_SIZE) {
    return { peaks: [], errors: [error(0, 'File exceeds the 2 MB local limit.')], warnings: [], metadata: {}, format: extension }
  }
  if (!String(text || '').trim()) {
    return { peaks: [], errors: [error(0, 'The selected file is empty.')], warnings: [], metadata: {}, format: extension }
  }
  if (extension === 'mgf') return parseMgf(text)
  if (extension === 'msp') return parseMsp(text)
  return { ...parsePlainPeakList(text), format: extension }
}

export function serializePeaks(peaks) {
  return peaks.map(([mz, intensity]) => `${Number(mz).toFixed(4)} ${Number(intensity).toFixed(2)}`).join('\n')
}

export function useSpectrumParser() {
  return {
    maxFileSize: MAX_FILE_SIZE,
    supportedExtensions: [...SUPPORTED_EXTENSIONS],
    parsePlainPeakList,
    parseMgf,
    parseMsp,
    parseSpectrumFile,
    serializePeaks,
    validatePeaks,
  }
}

