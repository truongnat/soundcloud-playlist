<template>
  <div class="container mx-auto p-4">
    <div v-if="error" class="bg-red-50 text-red-500 p-4 rounded mb-4">
      {{ error }}
    </div>

    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Download Single Track</h1>
      
      <div class="bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
        <div class="mb-4">
          <label for="trackUrl" class="block text-sm font-medium text-gray-700 mb-2">SoundCloud Track URL</label>
          <input
            id="trackUrl"
            v-model="trackUrl"
            type="text"
            placeholder="https://soundcloud.com/artist/track"
            class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :disabled="isLoading"
          />
        </div>
        <button
          @click="fetchTrack"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          :disabled="isLoading || !isValidUrl"
        >
          {{ isLoading ? 'Loading...' : 'Get Track' }}
        </button>
      </div>

      <div v-if="track" class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex gap-4">
          <img
            :src="track.artwork"
            :alt="track.title"
            class="w-24 h-24 rounded object-cover"
          />
          <div class="flex-1">
            <h2 class="text-xl font-semibold mb-1">{{ track.title }}</h2>
            <p class="text-gray-600 mb-4">{{ track.artist }}</p>
            <button
              @click="downloadTrack"
              class="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              :disabled="isDownloading"
            >
              {{ isDownloading ? 'Downloading...' : 'Download Track' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Track } from '~/types'

const trackUrl = ref('')
const track = ref<Track | null>(null)
const error = ref('')
const isLoading = ref(false)
const isDownloading = ref(false)

const isValidUrl = computed(() => {
  try {
    const url = new URL(trackUrl.value)
    return url.hostname === 'soundcloud.com'
  } catch {
    return false
  }
})

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

async function downloadTrack() {
  if (!track.value?.streamUrl) return

  isDownloading.value = true
  error.value = ''

  try {
    // Create a blob from the stream
    const response = await fetch(track.value.streamUrl)
    const blob = await response.blob()
    
    // Create a download link and trigger it
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${track.value.artist} - ${track.value.title}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (e) {
    error.value = 'Failed to download track'
  } finally {
    isDownloading.value = false
  }
}
</script>
