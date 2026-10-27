import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useDetailScrollSpy(sectionIds) {
  const activeId = ref(sectionIds[0])
  const route = useRoute()
  const router = useRouter()
  const visibleSections = new Map()
  let observer
  let initialScrollTimer

  function prioritizeFinalSectionAtBottom() {
    const finalSectionId = sectionIds.at(-1)
    const finalSection = finalSectionId ? document.getElementById(finalSectionId) : null
    if (!finalSection) return false

    const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
    const isAtBottom = window.scrollY + window.innerHeight >= documentHeight - 8
    const bounds = finalSection.getBoundingClientRect()
    const isInContentViewport = bounds.top < window.innerHeight && bounds.bottom > 112
    if (!isAtBottom || !isInContentViewport) return false

    activeId.value = finalSectionId
    return true
  }

  function scrollToSection(id, updateHash = true) {
    const element = document.getElementById(id)
    if (!element) return

    activeId.value = id
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (updateHash && route.hash !== `#${id}`) {
      router.replace({ hash: `#${id}` })
    }
  }

  function observeSections() {
    if (!observer) return

    observer.disconnect()
    visibleSections.clear()
    sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .forEach((element) => observer.observe(element))
  }

  onMounted(async () => {
    await nextTick()

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) visibleSections.set(entry.target.id, entry)
            else visibleSections.delete(entry.target.id)
          })

          if (prioritizeFinalSectionAtBottom()) return

          const visible = [...visibleSections.values()]
            .sort((a, b) => Math.abs(a.boundingClientRect.top - 112) - Math.abs(b.boundingClientRect.top - 112))
          if (visible[0]) activeId.value = visible[0].target.id
        },
        { rootMargin: '-112px 0px -70% 0px', threshold: [0, 0.05, 0.25] },
      )
    }
    observeSections()

    window.addEventListener('scroll', prioritizeFinalSectionAtBottom, { passive: true })
    prioritizeFinalSectionAtBottom()

    const hashId = route.hash.slice(1)
    if (hashId && sectionIds.includes(hashId)) {
      initialScrollTimer = window.setTimeout(() => scrollToSection(hashId, false), 80)
    }
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    window.removeEventListener('scroll', prioritizeFinalSectionAtBottom)
    visibleSections.clear()
    if (initialScrollTimer) window.clearTimeout(initialScrollTimer)
  })

  return { activeId, scrollToSection, refresh: observeSections }
}

