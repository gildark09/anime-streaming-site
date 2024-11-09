<template>
  <div class="bg-gray-800 p-4 rounded-lg">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-green-500 flex items-center">
        <FilterIcon class="h-5 w-5 mr-2" />
        Filters
      </h3>
    </div>

    <!-- Genre Filter -->
    <div class="mb-6">
      <h4 class="text-gray-400 mb-2">Genres</h4>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="genre in genres"
          :key="genre"
          @click="toggleGenre(genre)"
          :class="[
            'px-3 py-1 rounded-full text-sm transition-all',
            selectedGenres.includes(genre)
              ? 'bg-green-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          ]"
        >
          {{ genre }}
        </button>
      </div>
    </div>

    <!-- Status Filter -->
    <div class="mb-6">
      <h4 class="text-gray-400 mb-2">Status</h4>
      <select 
        v-model="selectedStatus"
        class="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">All Status</option>
        <option v-for="status in statuses" :key="status" :value="status">
          {{ status }}
        </option>
      </select>
    </div>

    <!-- Year Filter -->
    <div class="mb-6">
      <h4 class="text-gray-400 mb-2">Year</h4>
      <select 
        v-model="selectedYear"
        class="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">All Years</option>
        <option v-for="year in years" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
    </div>

    <!-- Sort By -->
    <div class="mb-6">
      <h4 class="text-gray-400 mb-2">Sort By</h4>
      <select 
        v-model="sortBy"
        class="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="popularity">Popularity</option>
        <option value="latest">Latest</option>
        <option value="rating">Rating</option>
      </select>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-2">
      <button 
        @click="applyFilters"
        class="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center"
      >
        <CheckIcon class="h-4 w-4 mr-1" />
        Apply
      </button>
      <button 
        @click="resetFilters"
        class="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all flex items-center justify-center"
      >
        <RefreshCwIcon class="h-4 w-4 mr-1" />
        Reset
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { FilterIcon, CheckIcon, RefreshCwIcon } from 'lucide-vue-next'

const genres = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
  'Horror', 'Mecha', 'Mystery', 'Romance', 'Sci-Fi', 
  'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
]

const statuses = ['Ongoing', 'Completed', 'Upcoming']
const years = Array.from({ length: 24 }, (_, i) => 2024 - i)

const selectedGenres = ref([])
const selectedStatus = ref('')
const selectedYear = ref('')
const sortBy = ref('popularity')

const emit = defineEmits(['filter'])

const toggleGenre = (genre) => {
  const index = selectedGenres.value.indexOf(genre)
  if (index === -1) {
    selectedGenres.value.push(genre)
  } else {
    selectedGenres.value.splice(index, 1)
  }
}

const applyFilters = () => {
  emit('filter', {
    genres: selectedGenres.value,
    status: selectedStatus.value,
    year: selectedYear.value,
    sortBy: sortBy.value
  })
}

const resetFilters = () => {
  selectedGenres.value = []
  selectedStatus.value = ''
  selectedYear.value = ''
  sortBy.value = 'popularity'
  applyFilters()
}

// Watch for changes to automatically apply filters
watch([selectedStatus, selectedYear, sortBy], () => {
  applyFilters()
})
</script> 