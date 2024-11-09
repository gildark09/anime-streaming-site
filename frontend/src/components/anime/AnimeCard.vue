<template>
  <div 
    class="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-200"
    @click="$emit('click')"
  >
    <img 
      :src="anime.image" 
      :alt="anime.title" 
      class="w-full h-48 object-cover hover:opacity-75 transition-opacity duration-200" 
    />
    <div class="p-4">
      <h3 class="font-semibold text-white text-lg mb-2 line-clamp-1">{{ anime.title }}</h3>
      <p class="text-sm text-gray-400 mb-3 line-clamp-2">{{ description }}</p>
      <div class="flex justify-between items-center">
        <span class="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full">
          {{ anime.status || 'Unknown' }}
        </span>
        <div class="flex items-center text-gray-400 text-sm">
          <span class="mr-2">Rating: {{ anime.rating || 'N/A' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  anime: {
    type: Object,
    required: true,
    default: () => ({
      title: '',
      image: '',
      description: '',
      status: 'Unknown',
      rating: 'N/A'
    })
  }
})

const description = computed(() => {
  if (!props.anime.description) return 'No description available'
  return props.anime.description.length > 100
    ? props.anime.description.substring(0, 100) + '...'
    : props.anime.description
})
</script> 