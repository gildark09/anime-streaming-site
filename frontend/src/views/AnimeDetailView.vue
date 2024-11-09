<template>
  <div class="min-h-screen bg-gray-900 text-gray-100">
    <Navbar />

    <!-- Main Content -->
    <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center min-h-[300px]">
        <LoaderIcon class="h-12 w-12 text-green-500 animate-spin" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[300px] text-red-500">
        <AlertCircleIcon class="h-12 w-12 mb-2" />
        <p class="text-lg">{{ error }}</p>
      </div>

      <template v-else-if="anime">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Main Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <!-- Left Column: Anime Info -->
            <div class="lg:col-span-3">
              <!-- Anime Info Card -->
              <div class="bg-gray-800 rounded-2xl overflow-hidden shadow-xl mb-8">
                <!-- Hero Section -->
                <div class="relative h-[300px] w-full">
                  <img 
                    :src="anime.image" 
                    :alt="anime.title"
                    class="w-full h-full object-cover blur-sm opacity-50"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent"></div>
                  <div class="absolute bottom-0 left-0 right-0 p-8 flex items-end">
                    <img 
                      :src="anime.image" 
                      :alt="anime.title"
                      class="h-48 w-36 object-cover rounded-lg shadow-2xl mr-6"
                    />
                    <div class="flex-1">
                      <h1 class="text-3xl font-bold mb-2">{{ anime.title }}</h1>
                      <div class="flex flex-wrap gap-2 mb-4">
                        <span 
                          v-for="genre in anime.genres" 
                          :key="genre"
                          class="px-3 py-1 bg-gray-700/80 rounded-full text-sm text-gray-300"
                        >
                          {{ genre }}
                        </span>
                      </div>
                      <div class="flex items-center space-x-4 text-sm text-gray-400">
                        <span class="flex items-center">
                          <CalendarIcon class="h-5 w-5 mr-1" />
                          {{ anime.releaseDate || 'Unknown' }}
                        </span>
                        <span class="flex items-center">
                          <PlayCircleIcon class="h-5 w-5 mr-1" />
                          {{ anime.episodes?.length || 0 }} Episodes
                        </span>
                      </div>
                    </div>
                    <button 
                      @click="toggleFavorite"
                      class="p-3 rounded-full bg-gray-700/80 hover:bg-gray-600 transition-all"
                      :title="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
                    >
                      <component 
                        :is="isFavorite ? HeartIcon : HeartOffIcon" 
                        class="h-6 w-6"
                        :class="{ 'text-pink-500': isFavorite }"
                      />
                    </button>
                  </div>
                </div>

                <!-- Description -->
                <div class="p-8 border-t border-gray-700">
                  <h2 class="text-xl font-semibold text-green-400 mb-4">Synopsis</h2>
                  <p class="text-gray-300 leading-relaxed">
                    {{ anime.description || 'No description available.' }}
                  </p>
                </div>
              </div>

              <!-- Episodes Grid -->
              <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-xl font-semibold text-green-400 mb-6 flex items-center">
                  <PlayCircleIcon class="h-6 w-6 mr-2" />
                  Episodes
                </h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <button
                    v-for="episode in anime.episodes"
                    :key="episode.id"
                    @click="watchEpisode(episode)"
                    class="bg-gray-700 rounded-xl p-4 hover:bg-gray-600 transition-all flex items-center group text-left w-full"
                  >
                    <PlayIcon class="h-5 w-5 text-green-400 mr-2 group-hover:text-green-500 transition-colors" />
                    <span class="font-medium">Episode {{ episode.number }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Right Column: Recommendations -->
            <div class="lg:col-span-1">
              <div class="bg-gray-800 rounded-2xl p-6 sticky top-24">
                <h2 class="text-xl font-semibold text-green-400 mb-6 flex items-center">
                  <SparklesIcon class="h-6 w-6 mr-2" />
                  You might also like
                </h2>
                <div v-if="loadingRecommendations" class="flex justify-center py-4">
                  <LoaderIcon class="h-6 w-6 text-green-500 animate-spin" />
                </div>
                <div v-else class="space-y-4">
                  <div 
                    v-for="recommendation in recommendations" 
                    :key="recommendation.id"
                    @click="navigateToAnime(recommendation.id)"
                    class="group cursor-pointer"
                  >
                    <div class="flex space-x-3 p-2 rounded-xl hover:bg-gray-700/50 transition-all">
                      <img 
                        :src="recommendation.image" 
                        :alt="recommendation.title"
                        class="w-20 h-28 object-cover rounded-lg shadow-md"
                        loading="lazy"
                      />
                      <div class="flex-1 min-w-0">
                        <h3 class="font-medium text-gray-100 group-hover:text-green-400 transition-colors line-clamp-2">
                          {{ recommendation.title }}
                        </h3>
                        <p class="text-sm text-gray-400 mt-1">
                          {{ recommendation.releaseDate || 'Unknown' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Navbar from '@/components/layout/Navbar.vue'
import { 
  PlayIcon, 
  PlayCircle as PlayCircleIcon,
  Heart as HeartIcon,
  HeartOff as HeartOffIcon,
  Calendar as CalendarIcon,
  Sparkles as SparklesIcon,
  AlertCircle as AlertCircleIcon,
  Loader as LoaderIcon
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useStore()

const anime = ref(null)
const loading = ref(true)
const error = ref(null)
const recommendations = ref([])

const isFavorite = computed(() => {
  return store.state.favorites.some(f => f.id === anime.value?.id)
})

const toggleFavorite = () => {
  if (!anime.value) return
  if (isFavorite.value) {
    store.dispatch('removeFromFavorites', anime.value.id)
  } else {
    store.dispatch('addToFavorites', anime.value)
  }
}

const watchEpisode = (episode) => {
  if (!episode?.id || !anime.value?.id) {
    console.error('Invalid episode or anime data:', { episode, anime: anime.value });
    return;
  }
  
  // Get the anime ID from the current route
  const animeId = route.params.id; // This is the correct anime ID
  const episodeId = episode.id;
  
  console.log('Navigating to watch view:', {
    animeId,
    episodeId
  });
  
  // Use router.push with the correct path
  router.push(`/watch/${animeId}/${episodeId}`);
}

const navigateToAnime = (anime) => {
  if (!anime?.id) return
  router.push(`/anime/${anime.id}`)
}

const fetchRecommendations = async () => {
  try {
    // Get trending anime and filter out current anime
    const trending = await store.dispatch('fetchTrending')
    recommendations.value = trending
      .filter(a => a.id !== anime.value.id)
      .slice(0, 5) // Show only 5 recommendations
  } catch (error) {
    console.error('Failed to fetch recommendations:', error)
  }
}

onMounted(async () => {
  try {
    loading.value = true
    const { id } = route.params
    const data = await store.dispatch('fetchAnimeDetails', id)
    anime.value = data
    await fetchRecommendations()
  } catch (err) {
    console.error('Failed to load anime:', err)
    error.value = err.message || 'Failed to load anime details'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Smooth scrolling */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #4B5563 #1F2937;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #1F2937;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #4B5563;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #6B7280;
}

/* Image optimization */
img {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);
}
</style> 