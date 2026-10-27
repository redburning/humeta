import { ref, unref, watch } from 'vue'

const DEFAULT_SHOW_DELAY = 150
const DEFAULT_MINIMUM_VISIBLE = 420

/**
 * Presents an existing asynchronous state without altering the operation itself.
 * Brief operations never show the indicator; an indicator that has appeared stays
 * visible long enough to avoid a distracting flash.
 */
export function useDelayedLoading(rawLoading, options = {}) {
  const showDelay = options.showDelay ?? DEFAULT_SHOW_DELAY
  const minimumVisible = options.minimumVisible ?? DEFAULT_MINIMUM_VISIBLE
  const visibleLoading = ref(false)
  let delayTimer = null
  let hideTimer = null
  let visibleSince = 0

  function clearDelayTimer() {
    if (delayTimer === null) return
    window.clearTimeout(delayTimer)
    delayTimer = null
  }

  function clearHideTimer() {
    if (hideTimer === null) return
    window.clearTimeout(hideTimer)
    hideTimer = null
  }

  function stopTimers() {
    clearDelayTimer()
    clearHideTimer()
  }

  watch(
    () => unref(rawLoading),
    (isLoading, _, onCleanup) => {
      stopTimers()

      if (isLoading) {
        if (!visibleLoading.value) {
          delayTimer = window.setTimeout(() => {
            delayTimer = null
            if (!unref(rawLoading)) return

            visibleSince = performance.now()
            visibleLoading.value = true
          }, showDelay)
        }
      } else if (visibleLoading.value) {
        const elapsed = performance.now() - visibleSince
        const remaining = Math.max(0, minimumVisible - elapsed)

        hideTimer = window.setTimeout(() => {
          hideTimer = null
          if (!unref(rawLoading)) visibleLoading.value = false
        }, remaining)
      }

      onCleanup(stopTimers)
    },
    { immediate: true },
  )

  return { visibleLoading }
}
