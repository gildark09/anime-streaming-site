<template>
  <div 
    class="fixed top-0 right-0 h-full bg-gray-800/95 backdrop-blur-sm transform transition-transform duration-300 ease-in-out z-50 w-80"
    :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
  >
    <!-- Header -->
    <div class="p-6 border-b border-gray-700 flex items-center justify-between">
      <h2 class="text-xl font-semibold text-green-500 flex items-center">
        <ClockIcon class="h-5 w-5 mr-2" />
        Watch History
      </h2>
      <button 
        @click="$emit('close')"
        class="p-2 hover:bg-gray-700 rounded-full transition-colors"
      >
        <XIcon class="h-5 w-5" />
      </button>
    </div>

    <!-- Content -->
    <div class="p-6 h-[calc(100vh-80px)] overflow-y-auto">
      <!-- Clear History Button -->
      <button 
        v-if="watchHistory.length"
        @click="clearHistory"
        class="w-full mb-4 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center"
      >
        <TrashIcon class="h-4 w-4 mr-2" />
        Clear History
      </button>

      <!-- Empty State -->
      <div v-if="!watchHistory.length" class="text-center text-gray-400 py-8">
        <ClockIcon class="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No watch history yet</p>
      </div>

      <!-- History List -->
      <div v-else class="space-y-4">
        <div 
          v-for="item in watchHistory" 
          :key="item.id"
          class="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-700/50 transition-all cursor-pointer"
          @click="navigateToEpisode(item)"
        >
          <img 
            :src="item.thumbnail" 
            :alt="item.animeTitle"
            class="w-20 h-28 object-cover rounded-lg"
          />
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-white line-clamp-2">{{ item.animeTitle }}</h3>
            <p class="text-sm text-gray-400">Episode {{ item.episodeNumber }}</p>
            <p class="text-xs text-gray-500 mt-1">
              {{ formatDate(item.watchedAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toggle Button (Fixed) -->
  <button 
    @click="$emit('toggle')"
    class="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 group flex items-center"
    :class="{ 
      'translate-x-[-320px]': isOpen,
      'hover:scale-110': !isOpen
    }"
  >
    <!-- When Closed -->
    <div v-if="!isOpen" class="flex items-center">
      <div class="relative">
        <ClockIcon class="h-6 w-6" />
        <!-- Badge showing number of history items -->
        <div 
          v-if="watchHistory.length"
          class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
        >
          {{ watchHistory.length }}
        </div>
      </div>
      <!-- Label that appears on hover -->
      <span class="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out">
        History
      </span>
    </div>
    
    <!-- When Open -->
    <div v-else class="flex items-center">
      <XIcon class="h-6 w-6" />
    </div>

    <!-- Tooltip -->
    <div 
      v-if="!isOpen"
      class="absolute right-full mr-3 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
    >
      View Watch History
    </div>
  </button>

  <!-- Backdrop -->
  <div 
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 z-40 lg:hidden"
    @click="$emit('close')"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { 
  ClockIcon, 
  TrashIcon, 
  XIcon,
  History as HistoryIcon
} from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle', 'close'])

const store = useStore()
const router = useRouter()

const watchHistory = computed(() => store.state.watchHistory)

const clearHistory = () => {
  if (confirm('Are you sure you want to clear your watch history?')) {
    store.dispatch('clearWatchHistory')
  }
}

const navigateToEpisode = (item) => {
  router.push(`/watch/${item.animeId}/${item.id}`)
  emit('close')
}

const formatDate = (date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d

  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours === 0) {
      const minutes = Math.floor(diff / (60 * 1000))
      return `${minutes} minutes ago`
    }
    return `${hours} hours ago`
  }

  return d.toLocaleDateString()
}
</script>

<style scoped>
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 
              0 4px 6px -2px rgba(0, 0, 0, 0.1);
}

.group:hover .shadow-lg {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3),
              0 10px 10px -5px rgba(0, 0, 0, 0.1);
}
</style> 