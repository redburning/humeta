<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: [String, Number],
    default: '',
  },
  queries: {
    type: Array,
    default: () => [],
  },
})

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const normalizedQueries = computed(() => {
  const seen = new Set()

  return props.queries
    .map((query) => String(query ?? '').trim())
    .filter((query) => {
      if (!query) return false

      const key = query.toLocaleLowerCase()
      if (seen.has(key)) return false

      seen.add(key)
      return true
    })
    .sort((left, right) => right.length - left.length)
})

const segments = computed(() => {
  const text = String(props.text ?? '')

  if (!text || normalizedQueries.value.length === 0) {
    return [{ text, highlighted: false }]
  }

  const pattern = new RegExp(
    `(${normalizedQueries.value.map((query) => escapeRegExp(query)).join('|')})`,
    'gi',
  )
  const parts = []
  let lastIndex = 0

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0

    if (index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, index), highlighted: false })
    }

    parts.push({ text: match[0], highlighted: true })
    lastIndex = index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlighted: false })
  }

  return parts.length > 0 ? parts : [{ text, highlighted: false }]
})
</script>

<template>
  <template v-for="(segment, index) in segments" :key="index">
    <mark v-if="segment.highlighted" class="keyword-highlight">{{ segment.text }}</mark>
    <template v-else>{{ segment.text }}</template>
  </template>
</template>

<style scoped>
.keyword-highlight {
  padding: 2px 4px;
  border-radius: 2px;
  color: #173b4d;
  background: #fff1a8;
  font-weight: inherit;
}
</style>
