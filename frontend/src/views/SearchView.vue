<template>
  <div class="min-h-screen bg-gray-900 text-gray-100">
    <Navbar />
    
    <main class="container mx-auto px-4 py-8">
      <!-- Search Status -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold mb-2">
          Search Results: "{{ searchQuery }}"
        </h1>
        <p v-if="loading" class="text-gray-400">
          Searching...
        </p>
        <p v-else-if="error" class="text-red-500">
          {{ error }}
        </p>
        <p v-else class="text-gray-400">
          Found {{ results.length }} results
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <LoaderIcon class="h-12 w-12 text-green-500 animate-spin" />
      </div>

      <!-- Results Grid -->
      <div v-else-if="results.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimeCard 
          v-for="anime in results" 
          :key="anime.id" 
          :anime="anime"
          @click="navigateToAnime(anime.id)"
        />
      </div>

      <!-- No Results -->
      <div v-else-if="!loading && !error" class="text-center py-12">
        <p class="text-gray-400">No results found for "{{ searchQuery }}"</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { LoaderIcon } from 'lucide-vue-next'
import Navbar from '../components/layout/Navbar.vue'
import AnimeCard from '../components/anime/AnimeCard.vue'
import { debounce } from 'lodash-es'

const route = useRoute()
const router = useRouter()
const store = useStore()

const searchQuery = ref('')
const loading = ref(false)
const error = ref(null)
const results = ref([])

const performSearch = async (query) => {
  if (!query) return
  
  loading.value = true
  error.value = null
  
  try {
    const searchResults = await store.dispatch('searchAnime', {
      query: query
    })
    results.value = searchResults || []
  } catch (err) {
    console.error('Search error:', err)
    error.value = err.message || 'Failed to search anime'
    results.value = []
  } finally {
    loading.value = false
  }
}

const navigateToAnime = (id) => {
  if (!id) return
  router.push(`/anime/${id}`)
}

const debouncedSearch = debounce(async (query) => {
  if (!query) return
  await performSearch(query)
}, 300)

watch(() => route.query.q, (newQuery) => {
  if (newQuery) {
    searchQuery.value = newQuery
    debouncedSearch(newQuery)
  } else {
    results.value = []
    searchQuery.value = ''
  }
}, { immediate: true })

onMounted(() => {
  return () => {
    debouncedSearch.cancel()
  }
})
</script> 