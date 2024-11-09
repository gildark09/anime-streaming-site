<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
    <Navbar />
    
    <div class="flex flex-1">
      <main class="flex-1 p-6">
        <div class="container mx-auto">
          <div class="flex items-center mb-8">
            <HeartIcon class="h-8 w-8 text-green-500 mr-2" />
            <h2 class="text-2xl font-bold text-green-500">My Favorites</h2>
          </div>

          <div v-if="favorites.length === 0" class="flex flex-col items-center justify-center py-16">
            <HeartOffIcon class="h-16 w-16 text-gray-600 mb-4" />
            <p class="text-gray-400 text-lg">No favorites added yet</p>
            <router-link 
              to="/" 
              class="mt-4 flex items-center text-green-500 hover:text-green-400"
            >
              <HomeIcon class="h-5 w-5 mr-1" />
              Browse Anime
            </router-link>
          </div>

          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="anime in favorites" :key="anime.id" 
                class="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-green-500 transition-all">
              <img :src="anime.image" :alt="anime.title" class="w-full h-48 object-cover" />
              <div class="p-4">
                <h3 class="text-lg font-semibold text-green-500 mb-2 line-clamp-1">{{ anime.title }}</h3>
                <div class="flex items-center justify-between">
                  <button 
                    @click="navigateToAnime(anime.id)"
                    class="text-gray-300 hover:text-green-500 flex items-center"
                  >
                    <PlayIcon class="h-4 w-4 mr-1" />
                    Watch
                  </button>
                  <button 
                    @click="removeFavorite(anime.id)"
                    class="text-red-500 hover:text-red-400 flex items-center"
                  >
                    <TrashIcon class="h-4 w-4 mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <footer class="bg-gray-800 text-center p-4">
      <div class="flex justify-center space-x-4 mb-2">
        <a href="#" class="hover:text-green-500 transition-all">About</a>
        <a href="#" class="hover:text-green-500 transition-all">Contact</a>
        <a href="#" class="hover:text-green-500 transition-all">Terms of Service</a>
      </div>
      <p class="text-sm text-gray-400">&copy; 2024 AnimeVue. All rights reserved.</p>
    </footer>

    <div v-if="storageError" 
         class="bg-red-500/20 text-red-500 px-4 py-2 rounded-lg mb-4 flex items-center">
      <AlertCircleIcon class="h-5 w-5 mr-2" />
      {{ storageError }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Navbar from '../components/layout/Navbar.vue'
import { 
  HeartIcon, 
  HeartOffIcon, 
  HomeIcon, 
  TrashIcon,
  PlayIcon,
  AlertCircleIcon 
} from 'lucide-vue-next'

const store = useStore()
const router = useRouter()

const favorites = computed(() => store.getters.getFavorites)

const storageError = ref(null)

const removeFavorite = (id) => {
  try {
    store.dispatch('removeFromFavorites', id)
    storageError.value = null
  } catch (error) {
    storageError.value = 'Failed to remove from favorites. Please try again.'
  }
}

const navigateToAnime = (id) => {
  router.push(`/anime/${id}`)
}
</script> 