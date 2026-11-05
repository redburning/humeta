<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import HighlightedText from '../common/HighlightedText.vue'

const LENS_SIZE = 124
const LENS_ZOOM = 2.2

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
  explanation: {
    type: Object,
    default: null,
  },
  queries: {
    type: Array,
    default: () => [],
  },
})

const CROP_PADDING = 4

const structureImageFailed = ref(false)
const structureSource = ref('')
const structureFrame = ref(null)
const structureImage = ref(null)
const lensVisible = ref(false)
const lens = reactive({
  size: 0,
  left: 0,
  top: 0,
  backgroundWidth: 0,
  backgroundHeight: 0,
  backgroundX: 0,
  backgroundY: 0,
})

let paintFrame = 0
let pointerX = 0
let pointerY = 0
let structureObjectUrl = ''
let structureRequestId = 0

function hideLens() {
  lensVisible.value = false
  if (paintFrame) {
    window.cancelAnimationFrame(paintFrame)
    paintFrame = 0
  }
}

function releaseStructureUrl() {
  if (!structureObjectUrl) return
  URL.revokeObjectURL(structureObjectUrl)
  structureObjectUrl = ''
}

function useStructureSource(source) {
  releaseStructureUrl()
  structureSource.value = source
}

function handleImageError() {
  if (structureObjectUrl && structureSource.value === structureObjectUrl) {
    useStructureSource(props.result.structureImage)
    return
  }

  structureImageFailed.value = true
  hideLens()
}

function cropStructureSvg(source) {
  const parsed = new DOMParser().parseFromString(source, 'image/svg+xml')
  const svg = parsed.documentElement
  if (!svg || svg.localName !== 'svg') return null

  const holder = document.createElement('div')
  holder.setAttribute('aria-hidden', 'true')
  holder.style.cssText = 'position:fixed;left:-10000px;top:0;width:200px;height:200px;visibility:hidden;pointer-events:none;'

  const liveSvg = document.importNode(svg, true)
  holder.appendChild(liveSvg)
  document.body.appendChild(holder)

  let box = null
  try {
    // Canvas backgrounds must not enlarge the drawing bounds. Only remove
    // them from this measurement clone; the displayed SVG stays intact.
    const viewport = liveSvg.viewBox.baseVal
    if (viewport.width > 0 && viewport.height > 0) {
      for (const child of Array.from(liveSvg.children)) {
        if (child.localName !== 'rect' || getComputedStyle(child).stroke !== 'none') continue

        const background = child.getBBox()
        if (background.x <= viewport.x && background.y <= viewport.y
          && background.x + background.width >= viewport.x + viewport.width
          && background.y + background.height >= viewport.y + viewport.height) {
          child.remove()
        }
      }
    }
    box = liveSvg.getBBox()
  } catch {
    box = null
  } finally {
    holder.remove()
  }

  if (!box || !(box.width > 0) || !(box.height > 0)) return null

  const viewBox = [
    box.x - CROP_PADDING,
    box.y - CROP_PADDING,
    box.width + CROP_PADDING * 2,
    box.height + CROP_PADDING * 2,
  ]
  if (!viewBox.every((value) => Number.isFinite(value))) return null

  const cropped = svg.cloneNode(true)
  cropped.setAttribute('viewBox', viewBox.join(' '))
  cropped.setAttribute('width', String(viewBox[2]))
  cropped.setAttribute('height', String(viewBox[3]))

  return new XMLSerializer().serializeToString(cropped)
}

async function cropStructureRaster(blob) {
  const sourceUrl = URL.createObjectURL(blob)
  const image = new Image()

  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve
      image.onerror = () => reject(new Error('Structure image could not be decoded.'))
      image.src = sourceUrl
    })

    const width = image.naturalWidth
    const height = image.naturalHeight
    if (!width || !height || width * height > 16_000_000) return null

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return null
    context.drawImage(image, 0, 0)

    const { data } = context.getImageData(0, 0, width, height)
    const tolerance = 8
    const colorAt = (offset) => [0, 1, 2].map((channel) => (
      255 + (data[offset + channel] - 255) * data[offset + 3] / 255
    ))
    const corners = [0, (width - 1) * 4, (height - 1) * width * 4, (width * height - 1) * 4]
      .map(colorAt)
    const background = corners[0]
    const uniformBackground = corners.every((color) => color.every((value, channel) => (
      Math.abs(value - background[channel]) <= tolerance
    )))
    let left = width
    let top = height
    let right = -1
    let bottom = -1

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = (y * width + x) * 4
        const alpha = data[offset + 3] / 255
        if (!alpha) continue

        let isBackground = true
        for (let channel = 0; channel < 3; channel += 1) {
          const color = 255 + (data[offset + channel] - 255) * alpha
          if (Math.abs(color - (uniformBackground ? background[channel] : 255)) > tolerance) {
            isBackground = false
            break
          }
        }
        if (isBackground) continue

        left = Math.min(left, x)
        top = Math.min(top, y)
        right = Math.max(right, x)
        bottom = Math.max(bottom, y)
      }
    }

    if (right < left || bottom < top) return null
    left = Math.max(0, left - CROP_PADDING)
    top = Math.max(0, top - CROP_PADDING)
    right = Math.min(width - 1, right + CROP_PADDING)
    bottom = Math.min(height - 1, bottom + CROP_PADDING)
    if (left === 0 && top === 0 && right === width - 1 && bottom === height - 1) return null

    const cropped = document.createElement('canvas')
    cropped.width = right - left + 1
    cropped.height = bottom - top + 1
    const croppedContext = cropped.getContext('2d')
    if (!croppedContext) return null
    croppedContext.drawImage(
      canvas, left, top, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height,
    )
    return await new Promise((resolve) => cropped.toBlob(resolve, 'image/png'))
  } finally {
    image.onload = null
    image.onerror = null
    URL.revokeObjectURL(sourceUrl)
  }
}

async function prepareStructureImage(url) {
  const requestId = ++structureRequestId

  try {
    const response = await fetch(url)
    if (!response.ok) return

    const source = await response.blob()
    if (requestId !== structureRequestId) return

    const prefix = await source.slice(0, 1024).text()
    if (requestId !== structureRequestId) return

    let cropped
    if (source.type.includes('svg') || /<svg[\s>]/i.test(prefix)) {
      const text = await source.text()
      if (requestId !== structureRequestId) return
      const svg = cropStructureSvg(text)
      if (svg) cropped = new Blob([svg], { type: 'image/svg+xml' })
    } else {
      cropped = await cropStructureRaster(source)
    }
    if (!cropped || requestId !== structureRequestId) return

    const objectUrl = URL.createObjectURL(cropped)
    if (requestId !== structureRequestId) {
      URL.revokeObjectURL(objectUrl)
      return
    }

    releaseStructureUrl()
    structureObjectUrl = objectUrl
    structureSource.value = objectUrl
    hideLens()
  } catch {
    // Keep the original image as the fallback.
  }
}

watch(
  () => props.result.structureImage,
  (url) => {
    structureImageFailed.value = false
    structureRequestId += 1
    hideLens()
    useStructureSource(url || '')

    if (url) prepareStructureImage(url)
  },
  { immediate: true },
)

const hasStructureImage = computed(() => (
  Boolean(props.result.structureImage) && !structureImageFailed.value
))

function measureDrawnImage() {
  const frame = structureFrame.value
  const image = structureImage.value
  if (!frame || !image || !image.complete) return null

  const frameRect = frame.getBoundingClientRect()
  const imageRect = image.getBoundingClientRect()
  const naturalWidth = image.naturalWidth || imageRect.width
  const naturalHeight = image.naturalHeight || imageRect.height
  if (!naturalWidth || !naturalHeight) return null

  const scale = Math.min(
    imageRect.width / naturalWidth,
    imageRect.height / naturalHeight,
  )

  return {
    left: frameRect.left + frame.clientLeft,
    top: frameRect.top + frame.clientTop,
    frameWidth: frame.clientWidth,
    frameHeight: frame.clientHeight,
    x: imageRect.left - frameRect.left - frame.clientLeft
      + (imageRect.width - naturalWidth * scale) / 2,
    y: imageRect.top - frameRect.top - frame.clientTop
      + (imageRect.height - naturalHeight * scale) / 2,
    width: naturalWidth * scale,
    height: naturalHeight * scale,
  }
}

function paintLens() {
  paintFrame = 0
  const drawn = measureDrawnImage()
  if (!drawn) {
    lensVisible.value = false
    return
  }

  const localX = pointerX - drawn.left
  const localY = pointerY - drawn.top
  const insideImage = localX >= drawn.x
    && localX <= drawn.x + drawn.width
    && localY >= drawn.y
    && localY <= drawn.y + drawn.height

  if (!insideImage) {
    lensVisible.value = false
    return
  }

  const { frameWidth, frameHeight } = drawn
  const size = Math.min(LENS_SIZE, frameWidth, frameHeight)
  const left = Math.min(Math.max(localX - size / 2, 0), frameWidth - size)
  const top = Math.min(Math.max(localY - size / 2, 0), frameHeight - size)

  lens.size = size
  lens.left = left
  lens.top = top
  lens.backgroundWidth = drawn.width * LENS_ZOOM
  lens.backgroundHeight = drawn.height * LENS_ZOOM
  lens.backgroundX = (localX - left) - (localX - drawn.x) * LENS_ZOOM
  lens.backgroundY = (localY - top) - (localY - drawn.y) * LENS_ZOOM
  lensVisible.value = true
}

function handlePointerMove(event) {
  if (event.pointerType === 'touch') return

  pointerX = event.clientX
  pointerY = event.clientY

  if (paintFrame) return
  paintFrame = window.requestAnimationFrame(paintLens)
}

onBeforeUnmount(() => {
  structureRequestId += 1
  releaseStructureUrl()
  hideLens()
})

const MATCH_TYPE_LABELS = Object.freeze({
  exact: 'Exact',
  identifier: 'Identifier',
  alias: 'Alias',
  fuzzy: 'Fuzzy',
})

const matchDescription = computed(() => {
  if (!props.explanation) return ''

  const matchType = MATCH_TYPE_LABELS[props.explanation.matchType]
  return matchType
    ? `${props.explanation.primaryMatch} · ${matchType}`
    : props.explanation.primaryMatch
})

const alsoMatched = computed(() => {
  if (!props.explanation) return []
  return props.explanation.matchedFields.filter((field) => (
    field !== props.explanation.primaryMatch
  ))
})

const HIDDEN_MATCH_FIELD_KEYS = Object.freeze({
  'HMDB identifier': 'hmdb',
  'KEGG identifier': 'kegg',
  'ChEBI identifier': 'chebi',
  'InChIKey': 'inchikey',
})

const hiddenMatchedField = computed(() => {
  if (!props.explanation) return null

  const key = HIDDEN_MATCH_FIELD_KEYS[props.explanation.primaryMatch]
  const value = key ? props.result[key] : ''

  return value ? { label: props.explanation.primaryMatch, value } : null
})

const fields = [
  { label: 'Chinese Name:', key: 'chineseName' },
  { label: 'Molecular Formula:', key: 'formula' },
  { label: 'Molecular Weight:', key: 'monoisotopicMw' },
  { label: 'Category:', key: 'category' },
  { label: 'PubChem:', key: 'pubchem' },
  { label: 'HMDB:', key: 'hmdb' },
]
</script>

<template>
  <article class="result-card">
    <header class="result-card__header">
      <span class="result-card__id">{{ props.result.id }}</span>
      <h3>
        <HighlightedText :text="props.result.name" :queries="props.queries" />
      </h3>

      <RouterLink
        :to="`/metabolites/${props.result.id}`"
        class="result-card__details"
        :aria-label="`View details for ${props.result.name} ${props.result.id}`"
      >
        Details
      </RouterLink>
    </header>

    <div v-if="props.explanation" class="result-card__explanation">
      <p>Matched by: {{ matchDescription }}</p>
      <p v-if="alsoMatched.length">Also matched: {{ alsoMatched.join(', ') }}</p>
      <p v-if="hiddenMatchedField" class="result-card__explanation-value">
        {{ hiddenMatchedField.label }}:
        <HighlightedText :text="hiddenMatchedField.value" :queries="props.queries" />
      </p>
    </div>

    <div class="result-card__content">
      <dl class="result-card__facts">
        <div
          v-for="field in fields"
          :key="field.key"
          class="result-card__row"
          :class="{ 'result-card__row--smiles': field.key === 'smiles' }"
        >
          <dt>{{ field.label }}</dt>
          <dd :title="field.key === 'smiles' ? props.result[field.key] : undefined">
            <HighlightedText :text="props.result[field.key]" :queries="props.queries" />
          </dd>
        </div>
      </dl>

      <div
        ref="structureFrame"
        class="result-card__structure"
        :class="{ 'result-card__structure--zoomable': hasStructureImage }"
        role="img"
        :aria-label="`${props.result.name} 2D molecular structure`"
        @pointerenter="handlePointerMove"
        @pointermove="handlePointerMove"
        @pointerleave="hideLens"
        @pointercancel="hideLens"
      >
        <img
          v-if="hasStructureImage && structureSource"
          ref="structureImage"
          :src="structureSource"
          alt=""
          aria-hidden="true"
          draggable="false"
          @load="hideLens"
          @error="handleImageError"
        />
        <span v-else class="result-card__structure-empty">No structure image</span>
        <span
          v-if="hasStructureImage && structureSource"
          class="result-card__lens"
          :class="{ 'result-card__lens--visible': lensVisible }"
          aria-hidden="true"
          :style="{
            width: `${lens.size}px`,
            height: `${lens.size}px`,
            transform: `translate3d(${lens.left}px, ${lens.top}px, 0)`,
            backgroundImage: `url('${structureSource}')`,
            backgroundSize: `${lens.backgroundWidth}px ${lens.backgroundHeight}px`,
            backgroundPosition: `${lens.backgroundX}px ${lens.backgroundY}px`,
          }"
        />
      </div>
    </div>
  </article>
</template>

<style scoped>
.result-card {
  min-width: 0;
  height: auto;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--structure-border, #dbe6eb);
  border-radius: 6px;
  background: #fff;
  box-shadow: none;
}

.result-card__header {
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  padding: 4px 14px;
  border-bottom: 1px solid var(--structure-divider, #edf2f4);
  background: #f5fafc;
}

.result-card__id {
  flex: 0 0 auto;
  padding: 6px 9px;
  border-radius: 4px;
  color: #fff;
  background: var(--deep-blue, #004f98);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
}

.result-card__header h3 {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--structure-heading, #173b4d);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-card__explanation {
  margin: 0;
  padding: 8px 14px 0;
  color: #617684;
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.result-card__explanation p {
  margin: 0;
  color: inherit;
  font: inherit;
}

.result-card__explanation p + p {
  margin-top: 2px;
}

.result-card__details {
  min-width: 82px;
  min-height: 32px;
  display: inline-grid;
  place-items: center;
  padding: 6px 13px;
  border: 1px solid var(--primary-blue, #087fbe);
  border-radius: 4px;
  color: var(--primary-blue, #087fbe);
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
}

.result-card__details:hover,
.result-card__details:focus-visible {
  background: #f1f8fb;
}

.result-card__content {
  min-width: 0;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(168px, 1fr);
  align-items: stretch;
  gap: 16px;
  padding: 10px 14px;
}

.result-card__facts {
  min-width: 0;
  display: grid;
  align-content: start;
  gap: 6px;
  margin: 0;
}

.result-card__row {
  min-width: 0;
  display: flex;
  align-items: baseline;
  flex-wrap: nowrap;
  gap: 4px;
  font-size: 14px;
  line-height: 1.55;
}

.result-card__row--smiles {
  align-items: stretch;
  flex-direction: column;
  gap: 2px;
}

.result-card__row dt {
  flex: 0 0 auto;
  color: #667f8b;
  font-weight: 500;
}

.result-card__row dd {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  margin: 0;
  color: #294b5b;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-card__row--smiles dd {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  padding: 6px 8px;
  overflow: visible;
  border: 1px solid #e4edf1;
  border-radius: 4px;
  color: #4d6672;
  background: #f7fafb;
  font: 13px/1.55 Consolas, "SFMono-Regular", monospace;
  overflow-wrap: anywhere;
  text-overflow: clip;
  white-space: normal;
  word-break: break-all;
}

.result-card__structure {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: 320px;
  min-height: 90px;
  aspect-ratio: 2.2;
  overflow: hidden;
  justify-self: center;
  align-self: stretch;
  border: 1px solid #d7e5eb;
  border-radius: 4px;
  background: #fff;
}

.result-card__structure--zoomable {
  cursor: crosshair;
}

.result-card__structure img {
  position: absolute;
  inset: 4px;
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

.result-card__lens {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  border-radius: 50%;
  background-color: #fff;
  background-repeat: no-repeat;
  box-shadow:
    inset 0 0 0 2px rgba(8, 127, 190, 0.72),
    0 6px 18px rgba(16, 63, 87, 0.26);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s ease-out;
  will-change: transform, background-position;
  z-index: 2;
}

.result-card__lens--visible {
  opacity: 1;
}

.result-card__structure-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8aa0ab;
  font-size: 12px;
  letter-spacing: 0.02em;
}

@media (min-width: 920px) {
  .result-card__content {
    grid-template-columns: minmax(0, 1fr) clamp(147.2px, calc(47.4664% - 23.4664px), 326.4px);
  }

  .result-card__structure {
    max-width: 341.6px;
    aspect-ratio: 2.9333;
  }
}

@media (max-width: 700px) {
  .result-card__content {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
  }

  .result-card__structure {
    height: clamp(105px, 31.5vw, 126px);
    aspect-ratio: auto;
  }
}

@media (max-width: 350px) {
  .result-card__header {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 6px 8px;
  }

  .result-card__id {
    justify-self: start;
  }

  .result-card__header h3 {
    grid-column: 1;
    grid-row: 2;
  }

  .result-card__details {
    grid-column: 2;
    grid-row: 1 / 3;
  }
}

@media (prefers-reduced-motion: reduce) {
  .result-card__lens {
    transition: none;
  }
}
</style>
