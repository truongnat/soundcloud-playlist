<template>  <div class="bg-gray-800/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-5 
              hover:bg-gray-800/40 hover:border-orange-500/30 transition-all duration-300 group 
              hover:shadow-lg hover:shadow-orange-500/5">
    <div class="flex gap-6">
      <!-- Artwork -->
      <div class="relative flex-shrink-0 rounded-lg overflow-hidden">
        <!-- Track Image -->
        <img
          v-if="track.artwork"
          :src="track.artwork"
          :alt="track.title"
          class="w-28 h-28 object-cover shadow-lg transition-all duration-300
                 group-hover:scale-105 group-hover:brightness-110"
          loading="lazy"
        />

        <!-- Placeholder -->
        <div
          v-else
          class="w-28 h-28 bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg 
                 flex items-center justify-center ring-1 ring-white/5"
        >
          <svg
            class="w-12 h-12 text-gray-600 group-hover:text-orange-500 transition-colors duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>

        <!-- Download Status -->
        <div
          v-if="activeDownloads.includes(getTrackId(track.id))"
          class="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-pink-500 
                 text-white p-1.5 rounded-full shadow-lg"
        >
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>

        <!-- Download Complete Status -->
        <div
          v-else-if="completedDownloads.includes(getTrackId(track.id))"
          class="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 
                 text-white p-1.5 rounded-full shadow-lg"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div>
          <h3 class="font-semibold text-gray-100 truncate group-hover:text-orange-500 transition-colors">
            {{ track.title }}
          </h3>
          <p class="text-sm text-gray-400 truncate mt-1">
            {{ track.artist }}
          </p>
          <p class="text-xs text-gray-500 mt-2">
            {{ formatDuration(track.duration) }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 mt-4">
          <!-- Original Link -->
          <a
            :href="track.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-400 hover:text-orange-500 transition-colors"
            :title="'Open in SoundCloud'"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.5 0c-6.347 0-11.5 5.153-11.5 11.5 0 6.346 5.153 11.5 11.5 11.5 6.346 0 11.5-5.154 11.5-11.5 0-6.347-5.154-11.5-11.5-11.5zm0 21c-5.243 0-9.5-4.257-9.5-9.5s4.257-9.5 9.5-9.5 9.5 4.257 9.5 9.5-4.257 9.5-9.5 9.5z" />
            </svg>
          </a>

          <!-- Download Button -->
          <button
            @click="handleDownload"
            :disabled="isDownloading"
            class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium
                   rounded-lg border-2 border-gray-700/50 text-gray-300
                   hover:text-white hover:border-orange-500/50 hover:bg-orange-500/10
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500/40 
                   focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-300"
            :class="{
              'animate-pulse': isDownloading
            }"
          >
            <svg
              v-if="!isDownloading"
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <svg
              v-else
              class="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{ isDownloading ? 'Downloading...' : 'Download' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Track } from '@/types'

defineProps<{
  track: Track
  activeDownloads: string[]
  downloadErrors: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'download', track: Track): void
}>()

// Format duration from milliseconds to minutes:seconds
const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}:${seconds.padStart(2, '0')}`
}

// Convert track ID to string
const getTrackId = (id: string | number): string => id.toString()

const downloadTrack = (track: Track) => {
  emit('download', track)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>