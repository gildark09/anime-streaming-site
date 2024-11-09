<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Navbar from '../components/layout/Navbar.vue'
import { 
  TrendingUpIcon, 
  PlayIcon,
  LoaderIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-vue-next'
import WatchHistory from '@/components/WatchHistory.vue'

const store = useStore()
const router = useRouter()

const isHistoryOpen = ref(false)

// Computed properties from Vuex store
const loading = computed(() => store.state.loading)
const error = computed(() => store.state.error)
const trendingAnime = computed(() => {
  console.log('Trending anime computed:', store.state.trendingAnime);
  return store.state.trendingAnime || [];
})

const featuredAnime = computed(() => {
  const anime = trendingAnime.value[0];
  if (!anime) return null;
  return anime;
})

// Add pagination state
const currentPage = ref(1)
const itemsPerPage = 10

// Define loadTrendingAnime function before using it
const loadTrendingAnime = async () => {
  try {
    console.log('Fetching trending anime...')
    await store.dispatch('fetchTrending', { limit: 50 })
  } catch (error) {
    console.error('Error fetching trending:', error)
  }
}

// Compute paginated anime list
const paginatedAnime = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return trendingAnime.value.slice(start, end)
})

// Check if there are more pages
const hasMorePages = computed(() => {
  return currentPage.value * itemsPerPage < trendingAnime.value.length
})

// Navigation methods
const nextPage = () => {
  if (hasMorePages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const toggleHistory = () => {
  isHistoryOpen.value = !isHistoryOpen.value
}

const closeHistory = () => {
  isHistoryOpen.value = false
}

// Methods
const navigateToAnime = (anime) => {
  if (!anime) {
    console.error('No anime provided')
    return
  }
  
  const id = anime.id
  if (!id) {
    console.error('No valid ID found in anime:', anime)
    return
  }
  
  router.push({
    name: 'animeDetail',
    params: { id: id.toString() }
  })
}

// Add retry loading function
const retryLoading = async () => {
  try {
    console.log('Retrying data fetch...')
    await loadTrendingAnime()
  } catch (error) {
    console.error('Retry failed:', error)
  }
}

// Now we can safely use loadTrendingAnime in onMounted
onMounted(loadTrendingAnime)
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-gray-100">
    <Navbar />
    
    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-96">
        <LoaderIcon class="h-12 w-12 text-green-500 animate-spin" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" 
           class="flex flex-col items-center justify-center h-96 text-red-500 bg-red-500/10 rounded-2xl">
        <AlertCircleIcon class="h-12 w-12 mb-4" />
        <p class="text-lg font-medium">{{ error }}</p>
        <button 
          @click="retryLoading"
          class="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center"
        >
          <RefreshCwIcon class="h-5 w-5 mr-2" />
          Retry
        </button>
      </div>

      <template v-else>
        <!-- Featured Anime -->
        <section v-if="featuredAnime" class="mb-12">
          <div class="relative h-[500px] rounded-2xl overflow-hidden group">
            <img 
              :src="featuredAnime.image" 
              :alt="featuredAnime.title" 
              class="w-full h-full object-cover object-center"
              loading="eager"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
              <div class="flex items-start justify-between">
                <div class="flex-1 max-w-3xl">
                  <h1 class="text-4xl lg:text-5xl font-bold mb-4 text-white">
                    {{ featuredAnime.title }}
                  </h1>
                  <button 
                    @click="navigateToAnime(featuredAnime)"
                    class="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-all flex items-center group"
                  >
                    <PlayIcon class="h-5 w-5 mr-2 transition-transform group-hover:translate-x-1" />
                    Watch Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Trending Anime -->
        <section class="mb-12">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center">
              <TrendingUpIcon class="h-6 w-6 text-green-500 mr-2" />
              <h2 class="text-2xl font-bold text-green-500">Trending Now</h2>
            </div>
            <!-- Add pagination controls -->
            <div class="flex items-center space-x-2">
              <button 
                @click="previousPage"
                :disabled="currentPage === 1"
                class="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon class="h-5 w-5 text-green-500" />
              </button>
              <span class="text-gray-400">Page {{ currentPage }}</span>
              <button 
                @click="nextPage"
                :disabled="!hasMorePages"
                class="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon class="h-5 w-5 text-green-500" />
              </button>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <div v-for="anime in paginatedAnime" 
                 :key="anime.id" 
                 class="group cursor-pointer"
                 @click="navigateToAnime(anime)"
            >
              <div class="relative aspect-[2/3] rounded-lg overflow-hidden mb-3">
                <img 
                  :src="anime.image" 
                  :alt="anime.title" 
                  class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div class="absolute bottom-0 left-0 right-0 p-4">
                    <button class="w-full bg-green-500 text-white py-2 rounded-lg flex items-center justify-center">
                      <PlayIcon class="h-5 w-5 mr-2" />
                      Watch Now
                    </button>
                  </div>
                </div>
              </div>
              <h3 class="font-semibold text-lg line-clamp-1 group-hover:text-green-500 transition-colors">
                {{ anime.title }}
              </h3>
            </div>
          </div>
        </section>

        <!-- Add Watch History section -->
        <section class="mb-12">
          <WatchHistory 
            :is-open="isHistoryOpen"
            @toggle="toggleHistory"
            @close="closeHistory"
          />
        </section>
      </template>
    </main>

    <!-- Watch History Sidebar -->
    <WatchHistory 
      :is-open="isHistoryOpen"
      @toggle="toggleHistory"
      @close="closeHistory"
    />
  </div>
</template>

<style scoped>
.aspect-\[2\/3\] {
  aspect-ratio: 2/3;
}

/* Optimize image rendering */
img {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}
</style>
