import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useNewsLanguage(titleFactory) {
  const route = useRoute()
  const router = useRouter()
  const language = computed(() => (route.query.lang === 'en' ? 'en' : 'zh'))
  let previousDocumentLanguage
  let previousDocumentTitle

  function selectLanguage(nextLanguage) {
    if (nextLanguage === language.value) return
    router.push({
      path: route.path,
      query: { ...route.query, lang: nextLanguage },
      hash: route.hash,
    })
  }

  function syncDocument() {
    document.documentElement.lang = language.value === 'en' ? 'en' : 'zh-CN'
    if (titleFactory) document.title = titleFactory(language.value)
  }

  onMounted(() => {
    previousDocumentLanguage = document.documentElement.lang
    previousDocumentTitle = document.title
    syncDocument()
  })

  watch(language, syncDocument)

  onBeforeUnmount(() => {
    if (previousDocumentLanguage !== undefined) document.documentElement.lang = previousDocumentLanguage
    if (previousDocumentTitle !== undefined) document.title = previousDocumentTitle
  })

  return { language, selectLanguage }
}
