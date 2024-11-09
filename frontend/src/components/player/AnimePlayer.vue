<template>
  <div class="relative bg-black group">
    <!-- Previous Episode Button -->
    <button 
      v-if="hasPreviousEpisode"
      @click="emit('previousEpisode')"
      class="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 
             bg-green-500/20 hover:bg-green-500/40 text-green-500 
             px-6 py-8 rounded-r-full flex items-center transition-all duration-300 
             backdrop-blur-sm opacity-0 group-hover:opacity-100"
    >
      <span class="text-3xl font-bold">&lt;</span>
    </button>

    <!-- Video Player -->
    <video
      ref="videoRef"
      class="w-full aspect-video"
      controls
      @loadedmetadata="$emit('loaded')"
    />

    <!-- Next Episode Button -->
    <button 
      v-if="hasNextEpisode"
      @click="emit('nextEpisode')"
      class="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 
             bg-green-500/20 hover:bg-green-500/40 text-green-500 
             px-6 py-8 rounded-l-full flex items-center transition-all duration-300 
             backdrop-blur-sm opacity-0 group-hover:opacity-100"
    >
      <span class="text-3xl font-bold">&gt;</span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Hls from 'hls.js'

const props = defineProps({
  sources: {
    type: Array,
    required: true
  },
  episodeId: {
    type: String,
    required: true
  },
  hasPreviousEpisode: Boolean,
  hasNextEpisode: Boolean
})

const emit = defineEmits(['previousEpisode', 'nextEpisode'])

const videoRef = ref(null)
const hls = ref(null)
const currentTime = ref(0)
const saveTimeInterval = ref(null)

// Clean up function for HLS and intervals
const cleanup = () => {
  if (saveTimeInterval.value) {
    clearInterval(saveTimeInterval.value)
    saveTimeInterval.value = null
  }
  
  if (hls.value) {
    hls.value.destroy()
    hls.value = null
  }
}

// Initialize player with HLS source
const initializePlayer = async () => {
  if (!videoRef.value) return

  const hlsSource = props.sources.find(source => source.isM3U8)
  if (!hlsSource) {
    console.error('No HLS source found')
    return
  }

  console.log('Using HLS source:', hlsSource)

  try {
    cleanup() // Clean up existing instance first

    if (Hls.isSupported()) {
      hls.value = new Hls({
        xhrSetup: (xhr, url) => {
          if (hlsSource.headers) {
            Object.entries(hlsSource.headers).forEach(([key, value]) => {
              try {
                xhr.setRequestHeader(key, value)
              } catch (e) {
                console.warn(`Could not set header ${key}:`, e)
              }
            })
          }
        }
      })

      hls.value.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('HLS: Media attached')
      })

      hls.value.loadSource(hlsSource.url)
      hls.value.attachMedia(videoRef.value)

      // Start saving time periodically
      saveTimeInterval.value = setInterval(() => {
        if (videoRef.value) {
          currentTime.value = videoRef.value.currentTime
          localStorage.setItem(`episode-time-${props.episodeId}`, currentTime.value.toString())
        }
      }, 5000)

      // Restore previous time
      const savedTime = localStorage.getItem(`episode-time-${props.episodeId}`)
      if (savedTime) {
        videoRef.value.currentTime = parseFloat(savedTime)
      }
    }
  } catch (error) {
    console.error('Error initializing player:', error)
  }
}

// Watch for source changes
watch(() => props.episodeId, () => {
  cleanup()
  initializePlayer()
})

onMounted(() => {
  initializePlayer()
})

onBeforeUnmount(() => {
  cleanup()
})
</script>

<style scoped>
.video-player {
  aspect-ratio: 16/9;
}

/* Navigation button hover effects */
button {
  transition: all 0.3s ease;
  text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
}

button:hover {
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
}

/* Fade effect for buttons */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.group:hover button {
  animation: fadeIn 0.3s ease-out forwards;
}

/* Hide buttons by default */
button {
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* Show buttons on hover */
.group:hover button {
  opacity: 1;
}
</style>