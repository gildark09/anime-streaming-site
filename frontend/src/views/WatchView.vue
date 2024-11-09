<template>
  <div class="min-h-screen bg-gray-900 text-gray-100">
    <Navbar />
    
    <main class="container mx-auto px-4 py-8">
      <div v-if="loading" class="flex justify-center items-center h-96">
        <LoaderIcon class="h-12 w-12 text-green-500 animate-spin" />
      </div>

      <div v-else-if="error" class="text-center py-12">
        <AlertCircleIcon class="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 class="text-xl font-bold mb-2">Error Loading Video</h2>
        <p class="text-gray-400">{{ error }}</p>
        <button 
          @click="retryLoading"
          class="mt-4 bg-green-500 hover:bg-green-600 px-4 py-2 rounded inline-flex items-center"
        >
          <RefreshCwIcon class="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>

      <template v-else>
        <!-- Video Player -->
        <div class="mb-8">
          <AnimePlayer
            v-if="streamingLinks"
            :sources="streamingLinks.sources"
            :episode-id="route.params.episodeId"
            :has-previous-episode="hasPreviousEpisode"
            :has-next-episode="hasNextEpisode"
            class="w-full aspect-video"
            @error="handlePlayerError"
            @ended="handleVideoEnded"
            @previousEpisode="navigateToEpisode('previous')"
            @nextEpisode="navigateToEpisode('next')"
          />
        </div>

        <!-- Anime Info -->
        <div v-if="animeInfo" class="mb-8">
          <h1 class="text-2xl font-bold mb-4">{{ animeInfo.title }}</h1>
          <div class="flex items-center space-x-4 mb-4">
            <span class="text-gray-400">Episode {{ currentEpisodeNumber }}</span>
            <span class="text-gray-400">•</span>
            <span class="bg-green-500/20 text-green-500 px-2 py-1 rounded-full text-sm">
              {{ animeInfo.status }}
            </span>
          </div>
          <p class="text-gray-300">{{ animeInfo.description }}</p>
        </div>

        <!-- Episode List -->
        <div v-if="animeInfo?.episodes?.length" class="mb-8">
          <h2 class="text-xl font-bold mb-4">Episodes</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            <button
              v-for="episode in animeInfo.episodes"
              :key="episode.id"
              @click="watchEpisode(episode)"
              :class="[
                'px-4 py-2 rounded text-center',
                episode.id === route.params.episodeId
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 hover:bg-gray-700'
              ]"
            >
              {{ episode.number }}
            </button>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { LoaderIcon, AlertCircleIcon, RefreshCwIcon } from 'lucide-vue-next'
import Navbar from '../components/layout/Navbar.vue'
import AnimePlayer from '../components/player/AnimePlayer.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

const animeInfo = ref(null)
const streamingLinks = ref(null)
const loading = ref(true)
const error = ref(null)

const currentEpisodeNumber = ref(1)

// Compute previous/next episode availability
const currentEpisodeIndex = computed(() => {
  if (!animeInfo.value?.episodes) return -1
  return animeInfo.value.episodes.findIndex(ep => ep.id === route.params.episodeId)
})

const hasPreviousEpisode = computed(() => {
  return currentEpisodeIndex.value > 0
})

const hasNextEpisode = computed(() => {
  if (!animeInfo.value?.episodes) return false
  return currentEpisodeIndex.value < animeInfo.value.episodes.length - 1
})

// Navigate to previous/next episode
const navigateToEpisode = (direction) => {
  if (!animeInfo.value?.episodes || currentEpisodeIndex.value === -1) return
  
  const newIndex = direction === 'next' 
    ? currentEpisodeIndex.value + 1 
    : currentEpisodeIndex.value - 1
    
  if (newIndex >= 0 && newIndex < animeInfo.value.episodes.length) {
    const episode = animeInfo.value.episodes[newIndex]
    router.push(`/watch/${route.params.animeId}/${episode.id}`)
  }
}

// Handle video ended
const handleVideoEnded = () => {
  // Auto-play next episode if available
  if (hasNextEpisode.value) {
    navigateToEpisode('next')
  }
}

const loadAnimeInfo = async () => {
  try {
    const { animeId, episodeId } = route.params
    console.log('Loading anime info:', { animeId, episodeId })
    
    if (!animeId || !episodeId) {
      throw new Error('Invalid anime or episode ID')
    }
    
    // Load anime info
    const info = await store.dispatch('fetchAnimeDetails', animeId)
    console.log('Anime info loaded:', info)
    
    if (!info) {
      throw new Error('Failed to load anime information')
    }
    
    animeInfo.value = info
    
    // Find current episode
    const currentEp = info.episodes?.find(ep => ep.id === episodeId)
    if (!currentEp) {
      throw new Error('Episode not found')
    }

    currentEpisodeNumber.value = currentEp.number || extractEpisodeNumber(episodeId)
    
    // Load streaming links
    const links = await store.dispatch('fetchStreamingLinks', episodeId)
    streamingLinks.value = links

    // Add to watch history
    store.dispatch('addToWatchHistory', {
      episode: {
        id: episodeId,
        number: currentEp.number || extractEpisodeNumber(episodeId)
      },
      anime: {
        id: animeId,
        title: info.title,
        image: info.image
      }
    })
    
  } catch (err) {
    console.error('Failed to load anime info:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const watchEpisode = (episode) => {
  if (!episode?.id || !animeInfo.value?.id) {
    console.error('Invalid episode or anime data:', { episode, anime: animeInfo.value })
    return
  }
  
  const animeId = route.params.animeId
  const episodeId = episode.id
  
  router.push(`/watch/${animeId}/${episodeId}`)
}

const handlePlayerError = (err) => {
  console.error('Player error:', err)
  error.value = err.message || 'Failed to load video'
}

const retryLoading = () => {
  error.value = null
  loading.value = true
  loadAnimeInfo()
}

const extractEpisodeNumber = (episodeId) => {
  const match = episodeId.match(/episode-(\d+)/)
  return match ? parseInt(match[1]) : 1
}

// Watch for route changes
watch(
  () => route.params,
  () => {
    loading.value = true
    error.value = null
    streamingLinks.value = null
    loadAnimeInfo()
  },
  { immediate: true }
)

onMounted(() => {
  loadAnimeInfo()
})
</script>