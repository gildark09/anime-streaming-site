<template>
  <header class="bg-gray-800/95 backdrop-blur-sm fixed w-full top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and Brand -->
        <router-link 
          to="/" 
          class="flex items-center space-x-2"
          @click="handleLogoClick"
        >
          <img src="/yume-icon.png" alt="YumeStream" class="h-10 w-10">
          <span class="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            YumeStream
          </span>
        </router-link>

        <!-- Search Bar -->
        <form 
          @submit.prevent="handleSearch" 
          class="flex-1 max-w-xl mx-4"
        >
          <div class="relative">
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search anime..."
              class="w-full bg-gray-700/50 text-gray-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400/50"
            >
            <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </form>

        <!-- Navigation Links -->
        <nav class="flex items-center space-x-4">
          <router-link 
            to="/favorites" 
            class="text-gray-300 hover:text-pink-400 transition-colors"
            active-class="text-pink-400"
            @click="handleFavoritesClick"
          >
            Favorites
          </router-link>
        </nav>
      </div>
    </div>
  </header>

  <!-- Spacer to prevent content from hiding under fixed navbar -->
  <div class="h-16"></div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { SearchIcon } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const searchQuery = ref('')

const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  
  router.push({
    name: 'search',
    query: { q: searchQuery.value.trim() }
  })
  
  searchQuery.value = ''
}

// Updated navigation handlers with page refresh when coming from WatchView
const handleLogoClick = async () => {
  console.log('Logo clicked, navigating to home')
  
  // Check if we're coming from WatchView
  if (route.name === 'watch') {
    await router.push('/')
    window.location.reload()
  } else {
    router.push('/')
  }
}

const handleFavoritesClick = async () => {
  console.log('Favorites clicked, navigating to favorites')
  
  // Check if we're coming from WatchView
  if (route.name === 'watch') {
    await router.push('/favorites')
    window.location.reload()
  } else {
    router.push('/favorites')
  }
}
</script>

<style scoped>
.router-link-active {
  @apply text-pink-400;
}

/* Gradient animation for logo text */
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.text-gradient {
  background-size: 200% auto;
  animation: gradient 3s ease infinite;
}

/* Logo hover effect */
.router-link-active img {
  filter: drop-shadow(0 0 8px rgba(244, 114, 182, 0.5));
  transition: filter 0.3s ease;
}

img:hover {
  filter: drop-shadow(0 0 12px rgba(244, 114, 182, 0.6));
}
</style>