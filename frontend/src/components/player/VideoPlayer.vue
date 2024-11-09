<template>
  <div class="bg-gray-900">
    <div class="relative aspect-video">
      <!-- Loading State -->
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-800">
        <div class="text-center">
          <LoaderIcon class="h-12 w-12 text-green-500 animate-spin mx-auto mb-2" />
          <p class="text-gray-300">{{ loadingMessage }}</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="absolute inset-0 flex items-center justify-center bg-gray-800">
        <div class="text-center p-4">
          <AlertCircleIcon class="h-12 w-12 text-red-500 mx-auto mb-2" />
          <p class="text-gray-300 mb-4">{{ error }}</p>
          <button 
            @click="retryInitialization" 
            class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all flex items-center mx-auto"
          >
            <RefreshCwIcon class="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>

      <!-- Video Player -->
      <video
        v-show="!loading && !error"
        ref="videoElement"
        class="w-full h-full"
        controls
        crossorigin="anonymous"
        playsinline
        @error="handleVideoError"
        @loadeddata="handleVideoLoaded"
      >
        <!-- Remove source element -->
      </video>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import Hls from 'hls.js'
import { 
  LoaderIcon, 
  AlertCircleIcon, 
  RefreshCwIcon,
  Settings2Icon,
  PlayIcon
} from 'lucide-vue-next'

const props = defineProps({
  episodeId: {
    type: String,
    required: true
  },
  currentEpisode: {
    type: Object,
    required: true
  }
})

const store = useStore()
const videoElement = ref(null)
const hls = ref(null)
const loading = ref(true)
const error = ref(null)
const currentSource = ref('')
const currentQuality = ref('auto')
const availableQualities = ref([])
const showQualityMenu = ref(false)

const sourceType = computed(() => {
  if (!currentSource.value) return '';
  return currentSource.value.includes('.m3u8') 
    ? 'application/x-mpegURL' 
    : 'video/mp4';
})

const initializePlayer = async () => {
  try {
    console.log('=== Initializing Video Player ===');
    loading.value = true;
    error.value = null;

    await nextTick();

    if (!videoElement.value) {
      throw new Error('Video element not initialized');
    }

    // Get streaming links
    await store.dispatch('fetchStreamingLinks', props.episodeId);
    const links = store.state.streamingLinks;
    
    console.log('Streaming links received:', {
      hasLinks: !!links?.sources,
      sourcesCount: links?.sources?.length,
      firstSource: links?.sources?.[0]
    });

    if (!links?.sources?.length) {
      throw new Error('No streaming sources available');
    }

    // Try HLS source first
    const hlsSource = links.sources.find(s => s.isM3U8);
    if (hlsSource) {
      console.log('Using HLS source:', hlsSource);
      currentSource.value = hlsSource.url;
      currentQuality.value = hlsSource.quality;
      await setupHLS(hlsSource.url, hlsSource.headers);
    } else {
      // Fall back to MP4
      const mp4Source = links.sources[0];
      console.log('Using MP4 source:', mp4Source);
      currentSource.value = mp4Source.url;
      currentQuality.value = mp4Source.quality;
      videoElement.value.src = mp4Source.url;
    }

    loading.value = false;
  } catch (err) {
    console.error('Error initializing player:', err);
    error.value = err.message;
    loading.value = false;
  }
};

const loadStreamingLinks = async () => {
  try {
    // Only fetch if not already loading
    if (!loading.value) {
      await store.dispatch('fetchStreamingLinks', props.episodeId);
    }
    const links = store.state.streamingLinks;
    
    if (!links?.sources?.length) {
      throw new Error('No streaming sources available');
    }

    // Try HLS source first
    const hlsSource = links.sources.find(s => s.isM3U8);
    if (hlsSource && currentSource.value !== hlsSource.url) {
      console.log('Using HLS source:', hlsSource);
      currentSource.value = hlsSource.url;
      currentQuality.value = hlsSource.quality;
      await setupHLS(hlsSource.url, hlsSource.headers);
    } else if (!hlsSource) {
      // Fall back to MP4
      const mp4Source = links.sources[0];
      if (currentSource.value !== mp4Source.url) {
        console.log('Using MP4 source:', mp4Source);
        currentSource.value = mp4Source.url;
        currentQuality.value = mp4Source.quality;
        
        if (!videoElement.value) {
          throw new Error('Video player not initialized');
        }
        videoElement.value.src = mp4Source.url;
      }
    }
    loading.value = false;
  } catch (error) {
    console.error('Error loading streaming links:', error);
    error.value = error.message;
    loading.value = false;
  }
};

const setupHLS = async (url, headers) => {
  try {
    console.log('Setting up HLS with URL:', url);
    
    if (Hls.isSupported()) {
      cleanup();
      
      const config = {
        debug: true,
        enableWorker: true,
        maxBufferSize: 0,
        maxBufferLength: 30,
        startLevel: -1,
        xhrSetup: function(xhr, url) {
          // Don't set headers in the browser
          xhr.withCredentials = false;
        },
        loader: class CustomLoader extends Hls.DefaultConfig.loader {
          constructor(config) {
            super(config);
            const load = this.load.bind(this);
            this.load = (context, config, callbacks) => {
              const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
              
              if (context.type === 'manifest') {
                // For manifest requests
                context.url = `http://localhost:5000/api/anime/proxy/hls?url=${encodeURIComponent(url)}`;
                console.log('Loading manifest:', context.url);
              } else if (context.type === 'fragment') {
                // For TS segments
                const segmentUrl = baseUrl + context.url;
                context.url = `http://localhost:5000/api/anime/proxy/ts?url=${encodeURIComponent(segmentUrl)}`;
                console.log('Loading segment:', context.url);
              }
              
              load(context, config, callbacks);
            };
          }
        }
      };

      const newHls = new Hls(config);
      
      return new Promise((resolve, reject) => {
        newHls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log('HLS: Media attached');
          newHls.loadSource(url);
        });

        newHls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS: Manifest parsed');
          resolve(newHls);
        });

        newHls.on(Hls.Events.ERROR, (event, data) => {
          console.log('HLS Error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover...');
                newHls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                newHls.recoverMediaError();
                break;
              default:
                cleanup();
                reject(new Error('Fatal HLS error'));
                break;
            }
          }
        });

        newHls.attachMedia(videoElement.value);
      });
    } else if (videoElement.value.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.value.src = url;
      return Promise.resolve();
    } else {
      return Promise.reject(new Error('HLS not supported'));
    }
  } catch (error) {
    console.error('HLS setup error:', error);
    throw error;
  }
};

const changeQuality = (quality) => {
  currentQuality.value = quality.quality;
  currentSource.value = quality.url;
  showQualityMenu.value = false;
  
  if (quality.isM3U8) {
    setupHLS(quality.url);
  } else {
    videoElement.value.src = quality.url;
  }
};

const retryInitialization = async () => {
  error.value = null;
  loading.value = true;
  try {
    await initializePlayer();
  } catch (err) {
    console.error('Retry failed:', err);
    error.value = 'Failed to retry video initialization';
  } finally {
    loading.value = false;
  }
};

// Add cleanup method
const cleanup = () => {
  if (hls.value) {
    hls.value.destroy();
    hls.value = null;
  }
  if (videoElement.value) {
    videoElement.value.pause();
    videoElement.value.removeAttribute('src');
    videoElement.value.load();
  }
};

// Initialize on mount
onMounted(() => {
  console.log('=== Video Player Mounted ===');
  if (videoElement.value) {
    console.log('Video element found, initializing...');
    initializePlayer();
  } else {
    console.error('Video element not found on mount');
  }
});

// Watch for episode changes
watch(videoElement, (newVal) => {
  if (newVal && !loading.value) {
    initializePlayer();
  }
});

// Add a flag to prevent multiple initializations
const isInitializing = ref(false);

// Update watch handler
watch(() => props.episodeId, async (newId, oldId) => {
  console.log('Episode ID changed:', { newId, oldId });
  if (newId && newId !== oldId && !isInitializing.value) {
    try {
      isInitializing.value = true;
      console.log('Reinitializing player for new episode:', newId);
      loading.value = true;
      error.value = null;
      cleanup();

      // Get streaming links
      await store.dispatch('fetchStreamingLinks', newId);
      const links = store.state.streamingLinks;
      
      if (!links?.sources?.length) {
        throw new Error('No streaming sources available');
      }

      // Try HLS source first
      const hlsSource = links.sources.find(s => s.isM3U8);
      if (hlsSource) {
        console.log('Using HLS source:', hlsSource);
        currentSource.value = hlsSource.url;
        currentQuality.value = hlsSource.quality;
        await setupHLS(hlsSource.url, hlsSource.headers);
      } else {
        // Fall back to MP4
        const mp4Source = links.sources[0];
        console.log('Using MP4 source:', mp4Source);
        currentSource.value = mp4Source.url;
        currentQuality.value = mp4Source.quality;
        
        if (!videoElement.value) {
          throw new Error('Video player not initialized');
        }
        videoElement.value.src = mp4Source.url;
      }

      loading.value = false;
    } catch (error) {
      console.error('Error loading episode:', error);
      error.value = error.message;
    } finally {
      isInitializing.value = false;
    }
  }
}, { immediate: true });

// Add onUnmounted hook
onUnmounted(() => {
  cleanup();
});

// Add play button overlay
const showPlayButton = ref(true);
const handlePlayClick = async () => {
  try {
    await videoElement.value.play();
    showPlayButton.value = false;
  } catch (error) {
    console.error('Error playing video:', error);
  }
};

// Add loading message
const loadingMessage = computed(() => {
  if (!currentSource.value) return 'Loading video sources...';
  return 'Initializing video player...';
});

// Add error handler for video element
const handleVideoError = (event) => {
  console.error('Video error:', event);
  const error = event.target.error;
  let errorMessage = 'Unknown video error';
  
  if (error) {
    switch (error.code) {
      case error.MEDIA_ERR_ABORTED:
        errorMessage = 'Video playback aborted';
        break;
      case error.MEDIA_ERR_NETWORK:
        errorMessage = 'Network error while loading video';
        break;
      case error.MEDIA_ERR_DECODE:
        errorMessage = 'Error decoding video';
        break;
      case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        errorMessage = 'Video format not supported';
        break;
    }
  }
  
  error.value = errorMessage;
};

// Add video loaded handler
const handleVideoLoaded = () => {
  console.log('Video loaded successfully');
  loading.value = false;
};
</script>

<style scoped>
video {
  width: 100%;
  height: 100%;
  background: #000;
}

.video-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}
</style> 