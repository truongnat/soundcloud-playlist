<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">Loading playlist...</span>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-else-if="tracks.length" class="space-y-6">
      <!-- Playlist Header -->
      <div class="flex items-center justify-between bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center space-x-6">
          <img 
            v-if="playlistArtwork" 
            :src="playlistArtwork" 
            :alt="playlistTitle"
            class="w-32 h-32 object-cover rounded-xl shadow-md"
          >
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ playlistTitle }}</h1>
            <p v-if="playlistDescription" class="text-gray-600 mb-3">{{ playlistDescription }}</p>
            <div class="flex items-center text-sm text-gray-500">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              {{ tracks.length }} tracks
            </div>
          </div>
        </div>
        <button 
          @click="downloadAllTracks"
          class="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download All
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Track Cards -->
        <div 
          v-for="currentTrack in tracks" 
          :key="currentTrack.id" 
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex space-x-4">
            <img 
              v-if="currentTrack.artwork" 
              :src="currentTrack.artwork" 
              :alt="currentTrack.title"
              class="w-24 h-24 object-cover rounded-lg shadow-sm"
            >
            <div v-else class="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-medium text-gray-900 truncate">{{ currentTrack.title }}</h3>
                <span class="text-sm text-gray-500 whitespace-nowrap ml-2">{{ formatDuration(currentTrack.duration) }}</span>
              </div>
              <p class="text-sm text-gray-600 mb-3">{{ currentTrack.artist }}</p>
              
              <div class="flex items-center space-x-3">
                <button 
                  @click="downloadTrack(currentTrack)"                  :disabled="!currentTrack.streamUrl || activeDownloads.includes(getTrackId(currentTrack.id))"
                  class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="!currentTrack.streamUrl || activeDownloads.includes(getTrackId(currentTrack.id))
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'"
                >
                  <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {{ !currentTrack.streamUrl ? 'Unavailable' : activeDownloads.includes(getTrackId(currentTrack.id)) ? 'Downloading...' : 'Download' }}
                </button>

                <a 
                  v-if="currentTrack.url" 
                  :href="currentTrack.url" 
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  View
                </a>
              </div>
              
              <p v-if="downloadErrors[currentTrack.id]" class="mt-2 text-sm text-red-600">
                {{ downloadErrors[currentTrack.id] }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-12 text-gray-500">
      <svg class="w-16 h-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
      <p class="text-lg">Enter a SoundCloud playlist URL to see tracks</p>
    </div>    <!-- Download Queue Component -->
    <DownloadQueue ref="downloadQueueRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Track } from '@/types'
import DownloadQueue from './DownloadQueue.vue'

// Props
const props = defineProps<{
  tracks: Track[]
  loading?: boolean
  error?: string
  playlistTitle?: string
  playlistDescription?: string
  playlistArtwork?: string
}>()

const downloadQueueRef = ref<InstanceType<typeof DownloadQueue> | null>(null)
const downloadErrors = ref<Record<string, string>>({})
const activeDownloads = ref<string[]>([])

// Format duration from milliseconds to minutes:seconds
const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}:${seconds.padStart(2, '0')}`
}

// Convert track ID to string
const getTrackId = (id: string | number): string => id.toString()

// Download a single track
const downloadTrack = (track: Track) => {
  const trackId = getTrackId(track.id)
  if (!track.streamUrl) {
    downloadErrors.value[trackId] = 'This track is not available for download.'
    return
  }

  if (activeDownloads.value.includes(trackId)) {
    return
  }

  activeDownloads.value.push(trackId)
  downloadQueueRef.value?.addToQueue(track)
}

// Download all tracks in the playlist
const downloadAllTracks = () => {
  const availableTracks = props.tracks.filter(track => track.streamUrl)
  if (availableTracks.length === 0) {
    downloadErrors.value['all'] = 'No tracks available for download.'
    return
  }

  for (const track of availableTracks) {
    downloadTrack(track)
  }
}
</script>
