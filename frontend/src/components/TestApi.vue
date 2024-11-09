<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">API Test Component</h2>
    
    <!-- Trending Anime -->
    <button @click="testTrending" class="bg-blue-500 text-white px-4 py-2 rounded mr-2">
      Test Trending
    </button>
    
    <!-- Search Anime -->
    <button @click="testSearch" class="bg-green-500 text-white px-4 py-2 rounded mr-2">
      Test Search
    </button>
    
    <!-- Results Display -->
    <div v-if="loading" class="mt-4">Loading...</div>
    <div v-if="error" class="mt-4 text-red-500">{{ error }}</div>
    <pre v-if="results" class="mt-4 bg-gray-100 p-4 rounded overflow-auto">
      {{ JSON.stringify(results, null, 2) }}
    </pre>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const loading = ref(false)
const error = ref(null)
const results = ref(null)

const testTrending = async () => {
  try {
    loading.value = true
    error.value = null
    await store.dispatch('fetchTrending')
    results.value = store.state.trendingAnime
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const testSearch = async () => {
  try {
    loading.value = true
    error.value = null
    await store.dispatch('searchAnime', 'naruto')
    results.value = store.state.searchResults
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>