<template>
  <div>
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-4">
        Download Single Track
      </h1>
      <p class="text-gray-400">Enter a SoundCloud track URL to download it directly</p>
    </div>

      <!-- URL Input Section -->
      <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-700/50 mb-8">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input
              v-model="trackUrl"
              type="text"
              placeholder="https://soundcloud.com/artist/track"
              class="w-full px-4 py-3 bg-gray-900/50 text-gray-100 rounded-xl border border-gray-700 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500
                     transition-all duration-200"
              :disabled="isLoading"
            />
          </div>
          <button
            @click="fetchTrack"
            class="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl
                   hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 
                   focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
                   disabled:opacity-50 transition-all duration-200 shadow-lg 
                   hover:shadow-blue-500/20 flex items-center gap-2 min-w-[140px] justify-center"
            :disabled="isLoading || !isValidUrl"
          >
            <svg v-if="isLoading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isLoading ? 'Loading...' : 'Get Track' }}</span>
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" 
           class="bg-red-900/20 border border-red-800/50 text-red-200 p-4 rounded-xl mb-8 backdrop-blur-sm">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- Track Display -->
      <TransitionRoot
        :show="!!track"
        enter="transition-opacity duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="transition-opacity duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <!-- Track Banner -->
          <div class="relative h-48 md:h-64">
            <img
              :src="track.artwork"
              :alt="track.title"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
            
            <!-- Track Info Overlay -->
            <div class="absolute bottom-0 left-0 right-0 p-6">
              <h2 class="text-2xl font-bold text-white mb-2 line-clamp-1">{{ track.title }}</h2>
              <p class="text-gray-300 line-clamp-1">{{ track.artist }}</p>
            </div>
          </div>

          <!-- Download Section -->
          <div class="p-6">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <span class="text-gray-400 text-sm">Duration: {{ formatDuration(track.duration) }}</span>
                <a :href="track.url" target="_blank" rel="noopener noreferrer" 
                   class="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.75c-5.385 0-9.75-4.365-9.75-9.75S6.615 2.25 12 2.25s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/>
                  </svg>
                  <span>View on SoundCloud</span>
                </a>
              </div>
              
              <button
                @click="downloadTrack"
                class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium 
                       rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none 
                       focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 
                       disabled:opacity-50 transition-all duration-200 shadow-lg 
                       hover:shadow-green-500/20 flex items-center gap-2"
                :disabled="isDownloading"
              >
                <svg v-if="isDownloading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                <span>{{ isDownloading ? 'Downloading...' : 'Download Now' }}</span>
              </button>
            </div>
          </div>
        </div>
      </TransitionFade>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue'
import { TransitionRoot } from '@headlessui/vue'
import type { Track } from '~/types'

// Inject download functionality from layout
const handleDownloadTrack = inject('handleDownloadTrack') as (track: Track) => Promise<void>
const downloadingTracks = inject('downloadingTracks') as Ref<string[]>
const errorTracks = inject('errorTracks') as Ref<Record<string, string>>

const trackUrl = ref('')
const track = ref<Track | null>(null)
const error = ref('')
const isLoading = ref(false)

const isValidUrl = computed(() => {
  try {
    const url = new URL(trackUrl.value)
    return url.hostname === 'soundcloud.com'
  } catch {
    return false
  }
})

const isDownloading = computed(() => {
  return track.value ? downloadingTracks.value.has(track.value.id) : false
})

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

async function fetchTrack() {
  if (!isValidUrl.value) return

  error.value = ''
  isLoading.value = true
  track.value = null

  try {
    const response = await $fetch<{ track: Track }>('/api/track-download', {
      query: { url: trackUrl.value }
    })
    track.value = response.track
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to fetch track'
  } finally {
    isLoading.value = false
  }
}

function downloadTrack() {
  if (!track.value) return
  handleDownloadTrack(track.value)
}

// Reset data when component is destroyed
onUnmounted(() => {
  track.value = null
  trackUrl.value = ''
  error.value = ''
})
</script>

