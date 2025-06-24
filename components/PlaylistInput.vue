<template>  <div class="max-w-4xl mx-auto px-4">
    <div class="bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700/30 hover:border-orange-500/30 transition-colors">
      <div class="mb-8">
        <label for="playlist-url" class="block text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-4">
          Enter your SoundCloud playlist
        </label>
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-500 group-hover:text-orange-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          <input
            id="playlist-url"
            v-model="playlistUrl"
            type="text"
            placeholder="https://soundcloud.com/user/sets/playlist-name"
            class="block w-full pl-11 pr-14 py-4 text-gray-100 placeholder-gray-500 bg-gray-900/50 border border-gray-700/50 rounded-xl 
                   focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300
                   hover:border-gray-600/50"
            :class="{'border-red-500 focus:border-red-500 focus:ring-red-500': error}"
            :disabled="loading"
            @keyup.enter="handleFetchPlaylist"
          >
          <div class="absolute inset-y-0 right-0 flex py-2 pr-3">
            <kbd class="inline-flex items-center border border-gray-700/50 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-400 
                       tracking-wide bg-gray-800/30 backdrop-blur-sm group-hover:border-orange-500/30 transition-colors">
              Enter ↵
            </kbd>
          </div>
        </div>
        
        <div class="mt-3 space-y-3">
          <div class="flex items-start space-x-2">
            <p v-if="!error" class="text-sm text-gray-400 flex items-center">
              <svg class="w-4 h-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Paste any public SoundCloud playlist URL
            </p>
            <p v-else class="text-sm text-red-400 flex items-center">
              <svg class="w-4 h-4 mr-1.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ error }}
            </p>
          </div>
          
          <!-- Background Processing Option -->
          <div class="flex items-center space-x-3">
            <label class="flex items-center cursor-pointer">
              <input
                v-model="useBackgroundProcessing"
                type="checkbox"
                class="sr-only"
                :disabled="loading"
              >
              <div class="relative">
                <div class="w-10 h-6 bg-gray-600 rounded-full shadow-inner transition-colors"
                     :class="{ 'bg-blue-500': useBackgroundProcessing }"></div>
                <div class="absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1 transition-transform"
                     :class="{ 'transform translate-x-4': useBackgroundProcessing }"></div>
              </div>
              <span class="ml-3 text-sm text-gray-300">
                Use background processing
              </span>
            </label>
            <div class="group relative">
              <svg class="w-4 h-4 text-gray-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Recommended for large playlists (>50 tracks)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <button
          @click="handleFetchPlaylist"
          :disabled="loading || !isValidUrl"
          class="flex-1 inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-xl 
                 text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-gray-900 
                 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
        >
          <template v-if="loading">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading playlist...
          </template>
          <template v-else>
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
            </svg>
            Get Playlist
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { usePlaylist } from '@/composables/usePlaylist'
import { useBackgroundJobs } from '@/composables/useBackgroundJobs'
import type { PlaylistResponse } from '@/types'
import type { JobStatus } from '@/composables/useBackgroundJobs'

const playlistUrl = ref('')
const error = ref('')
const loading = ref(false)
const useBackgroundProcessing = ref(false)

const emit = defineEmits<{
  'playlist-loaded': [data: PlaylistResponse]
  'background-job-created': [job: JobStatus]
  'before-fetch': [data: { url: string; useBackground: boolean }]
  'error': [message: string]
}>()

defineProps<{
  loading?: boolean
}>()

const { fetchPlaylist } = usePlaylist()
const { processPlaylistBackground } = useBackgroundJobs()

const isValidUrl = computed(() => {
  if (!playlistUrl.value) return false
  try {
    const url = new URL(playlistUrl.value)
    const isValidDomain = url.hostname === 'soundcloud.com'
    const isPlaylist = url.pathname.includes('/sets/')
    return isValidDomain && isPlaylist
  } catch {
    return false
  }
})

const handleFetchPlaylist = async () => {
  error.value = ''
  if (!playlistUrl.value) {
    error.value = 'Please enter a SoundCloud playlist URL'
    return
  }
  
  if (!isValidUrl.value) {
    error.value = 'Please enter a valid SoundCloud playlist URL (must contain /sets/)'
    return
  }

  // Set loading state temporarily while checking for confirmation
  loading.value = true

  // Emit before-fetch event to check if confirmation is needed
  emit('before-fetch', {
    url: playlistUrl.value.trim(),
    useBackground: useBackgroundProcessing.value
  })
}

// Function to actually perform the fetch (called after confirmation)
const performFetch = async (url: string, useBackground: boolean) => {
  loading.value = true
  
  try {
    if (useBackground) {
      // Use background processing
      const { jobId, result } = await processPlaylistBackground(url)
      
      // Emit job created event so parent can track it
      const jobStatus: JobStatus = {
        id: jobId,
        type: 'playlist',
        status: 'pending',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      emit('background-job-created', jobStatus)
      
      // Wait for result in background
      result.then((data) => {
        emit('playlist-loaded', data)
      }).catch((err) => {
        const message = err instanceof Error ? err.message : 'Background processing failed'
        error.value = message
        emit('error', message)
      })
      
    } else {
      // Use immediate processing (legacy)
      const data = await fetchPlaylist(url)
      emit('playlist-loaded', data)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load playlist'
    error.value = message
    emit('error', message)
  } finally {
    loading.value = false
  }
}

// Listen for proceed-fetch and cancel-fetch events from parent
onMounted(() => {
  const handleProceedFetch = (event: CustomEvent) => {
    const { url, useBackground } = event.detail
    performFetch(url, useBackground)
  }
  
  const handleCancelFetch = () => {
    // Reset loading state when user cancels
    loading.value = false
    error.value = ''
    console.log('Fetch cancelled by user - resetting loading state')
  }
  
  window.addEventListener('proceed-fetch', handleProceedFetch as EventListener)
  window.addEventListener('cancel-fetch', handleCancelFetch as EventListener)
  
  onUnmounted(() => {
    window.removeEventListener('proceed-fetch', handleProceedFetch as EventListener)
    window.removeEventListener('cancel-fetch', handleCancelFetch as EventListener)
  })
})
</script>