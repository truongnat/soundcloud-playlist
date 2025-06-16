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

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">      <!-- Track Cards -->
        <div 
          v-for="currentTrack in tracks" 
          :key="currentTrack.id" 
          class="group bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-100 transition-all duration-200"
        >
          <div class="flex space-x-5">
            <div class="relative flex-shrink-0">
              <img 
                v-if="currentTrack.artwork" 
                :src="currentTrack.artwork" 
                :alt="currentTrack.title"
                class="w-28 h-28 object-cover rounded-lg shadow-sm group-hover:shadow transition-shadow"
                loading="lazy"
              >
              <div v-else class="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              
              <div class="absolute -top-2 -right-2">
                <div v-if="activeDownloads.includes(getTrackId(currentTrack.id))" 
                  class="animate-pulse bg-blue-500 text-white p-1.5 rounded-full shadow-sm">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start space-x-4 mb-2">
                <div>
                  <h3 class="font-medium text-gray-900 text-lg leading-tight line-clamp-2">
                    {{ currentTrack.title }}
                  </h3>
                  <p class="text-sm text-gray-600 mt-1 flex items-center">
                    <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {{ currentTrack.artist }}
                  </p>
                </div>
                <span class="text-sm text-gray-500 whitespace-nowrap flex items-center">
                  <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatDuration(currentTrack.duration) }}
                </span>
              </div>
                <div class="flex items-center space-x-3 mt-4">
                <button 
                  @click="downloadTrack(currentTrack)"
                  :disabled="!currentTrack.streamUrl || activeDownloads.includes(getTrackId(currentTrack.id))"
                  class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                  :class="!currentTrack.streamUrl || activeDownloads.includes(getTrackId(currentTrack.id))
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500'"
                >
                  <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      :d="activeDownloads.includes(getTrackId(currentTrack.id))
                        ? 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                        : 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'" />
                  </svg>                  {{ !currentTrack.streamUrl 
                    ? 'Unavailable' 
                    : activeDownloads.includes(getTrackId(currentTrack.id)) 
                      ? 'Processing...' 
                      : 'Download' }}
                </button>                <a 
                  class="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  :href="currentTrack.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in SoundCloud"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              
              <p v-if="downloadErrors[currentTrack.id]" class="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center">
                <svg class="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Track } from '@/types'

// Props
const props = defineProps<{
  tracks: Track[]
  loading?: boolean
  error?: string
  playlistTitle?: string
  playlistDescription?: string
  playlistArtwork?: string
}>()

const emit = defineEmits<{
  (e: 'download-track', track: Track): void
  (e: 'download-all', tracks: Track[]): void
}>()

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
  emit('download-track', track)
}

// Download all tracks in the playlist
const downloadAllTracks = () => {
  const availableTracks = props.tracks.filter(track => track.streamUrl)
  if (availableTracks.length === 0) {
    downloadErrors.value['all'] = 'No tracks available for download.'
    return
  }

  emit('download-all', availableTracks)
}
</script>
