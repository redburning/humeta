<script setup>
import { computed } from 'vue'

const PAGE_JUMP = 5

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 20,
  },
})

const emit = defineEmits({
  'update:currentPage': (value) => Number.isInteger(value),
})

const visibleItems = computed(() => {
  const current = props.currentPage
  const total = props.totalPages
  const page = (value) => ({ type: 'page', value, key: `page-${value}`, optional: value !== current && value !== 1 && value !== total })
  const ellipsis = (key) => ({ type: 'ellipsis', key })

  if (total <= 7) return Array.from({ length: total }, (_, index) => page(index + 1))
  if (current <= 4) return [page(1), page(2), page(3), page(4), page(5), ellipsis('ellipsis-right'), page(total)]
  if (current >= total - 3) {
    return [page(1), ellipsis('ellipsis-left'), page(total - 4), page(total - 3), page(total - 2), page(total - 1), page(total)]
  }
  return [page(1), ellipsis('ellipsis-left'), page(current - 1), page(current), page(current + 1), ellipsis('ellipsis-right'), page(total)]
})

function setPage(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return
  const nextPage = Math.min(props.totalPages, Math.max(1, Math.round(parsed)))
  emit('update:currentPage', nextPage)
}
</script>

<!--
    Arrow geometry from Lucide (https://github.com/lucide-icons/lucide).
    Copyright (c) 2026 Lucide Icons and Contributors

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
    OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

    These Lucide icons are derived from Feather, under the MIT License.
    Copyright (c) 2013-present Cole Bemis

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
-->
<template>
  <nav class="result-pagination" aria-label="Search results pagination">
    <button
      type="button"
      class="result-pagination__arrow"
      aria-label="First page"
      :disabled="props.currentPage === 1"
      @click="setPage(1)"
    >
      <svg class="result-pagination__icon" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m8 17-4-5 4-5" />
        <path d="m14 17-4-5 4-5" />
        <path d="m20 17-4-5 4-5" />
      </svg>
    </button>

    <button
      type="button"
      class="result-pagination__arrow"
      aria-label="Jump back 5 pages"
      :disabled="props.currentPage === 1"
      @click="setPage(props.currentPage - PAGE_JUMP)"
    >
      <svg class="result-pagination__icon" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m11 17-5-5 5-5" />
        <path d="m18 17-5-5 5-5" />
      </svg>
    </button>

    <button
      type="button"
      class="result-pagination__arrow"
      aria-label="Previous page"
      :disabled="props.currentPage === 1"
      @click="setPage(props.currentPage - 1)"
    >
      <svg class="result-pagination__icon" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>

    <template v-for="item in visibleItems" :key="item.key">
      <span v-if="item.type === 'ellipsis'" class="result-pagination__ellipsis">...</span>
      <button
        v-else
        type="button"
        class="result-pagination__page"
        :class="{ 'result-pagination__page--optional': item.optional }"
        :aria-current="item.value === props.currentPage ? 'page' : undefined"
        :aria-label="`Page ${item.value}`"
        @click="setPage(item.value)"
      >
        {{ item.value }}
      </button>
    </template>

    <button
      type="button"
      class="result-pagination__arrow"
      aria-label="Next page"
      :disabled="props.currentPage === props.totalPages"
      @click="setPage(props.currentPage + 1)"
    >
      <svg class="result-pagination__icon" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>

    <button
      type="button"
      class="result-pagination__arrow"
      aria-label="Jump forward 5 pages"
      :disabled="props.currentPage === props.totalPages"
      @click="setPage(props.currentPage + PAGE_JUMP)"
    >
      <svg class="result-pagination__icon" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m6 17 5-5-5-5" />
        <path d="m13 17 5-5-5-5" />
      </svg>
    </button>

    <button
      type="button"
      class="result-pagination__arrow"
      aria-label="Last page"
      :disabled="props.currentPage === props.totalPages"
      @click="setPage(props.totalPages)"
    >
      <svg class="result-pagination__icon" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m4 17 4-5-4-5" />
        <path d="m10 17 4-5-4-5" />
        <path d="m16 17 4-5-4-5" />
      </svg>
    </button>
  </nav>
</template>

<style scoped>
.result-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;
  color: #4c6b79;
  font-size: 13px;
}

.result-pagination button {
  min-width: 38px;
  min-height: 38px;
  display: inline-grid;
  place-items: center;
  padding: 6px 10px;
  border: 1px solid #c4d9e3;
  border-radius: 5px;
  color: #4c6b79;
  background: #fff;
  font: inherit;
  line-height: 1;
  cursor: pointer;
}

.result-pagination__page,
.result-pagination__arrow {
  min-width: 38px;
  min-height: 38px;
}

.result-pagination button:hover:not(:disabled):not([aria-current='page']) {
  border-color: #8bbbd1;
  color: var(--primary-blue);
  background: #f4f9fb;
}

.result-pagination button:focus-visible {
  outline: 2px solid rgba(8, 127, 190, 0.28);
  outline-offset: 2px;
}

.result-pagination__page[aria-current='page'] {
  color: #fff;
  border-color: var(--primary-blue);
  background: var(--primary-blue);
}

.result-pagination__arrow:disabled {
  border-color: #e2ebef;
  color: #a8b6bd;
  background: #fbfcfd;
  cursor: not-allowed;
  opacity: 1;
}

.result-pagination__icon {
  /* Fit the 18px icon inside the existing 38px button and its padding. */
  margin-inline: -1px;
}

.result-pagination__icon path {
  vector-effect: non-scaling-stroke;
}

.result-pagination__arrow:not(:disabled) .result-pagination__icon {
  color: var(--primary-blue);
}

.result-pagination__ellipsis {
  min-width: 28px;
  text-align: center;
}

@media (max-width: 560px) {
  .result-pagination {
    gap: 4px;
  }

  .result-pagination__page--optional,
  .result-pagination__ellipsis {
    display: none;
  }

}
</style>
