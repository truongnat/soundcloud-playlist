<template>
  <div class="bg-white rounded-lg border border-gray-100 p-3 hover:shadow transition-all duration-200 group">
    <div class="flex gap-4">
      <!-- Artwork -->
      <div class="relative flex-shrink-0">
        <!-- Track Image -->
        <img
          v-if="track.artwork"
          :src="track.artwork"
          :alt="track.title"
          class="w-24 h-24 object-cover rounded-md shadow-sm transition-transform group-hover:scale-[1.02]"
          loading="lazy"
        />

        <!-- Placeholder -->
        <div
          v-else
          class="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-md flex items-center justify-center"
        >
          <svg
            class="w-10 h-10 text-gray-300"
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
          class="absolute -top-1.5 -right-1.5 bg-blue-500 text-white p-1 rounded-full shadow-sm animate-pulse"
        >
          <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
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
            ></path>
          </svg>
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div class="flex items-start justify-between gap-3">
            <!-- Title & Artist -->
            <div class="min-w-0">
              <h3 class="font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                {{ track.title }}
              </h3>
              <p class="text-sm text-gray-500 mt-1 flex items-center">
                <svg
                  class="w-3.5 h-3.5 mr-1 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {{ track.artist }}
              </p>
            </div>

            <!-- Duration -->
            <span class="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
              <svg
                class="w-3 h-3 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {{ formatDuration(track.duration) }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 mt-3">
          <button
            @click="downloadTrack(track)"
            :disabled="!track.streamUrl || activeDownloads.includes(getTrackId(track.id))"
            class="flex items-center px-3 py-1.5 rounded text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
            :class="!track.streamUrl || activeDownloads.includes(getTrackId(track.id))
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 focus:ring-blue-500'"
          >
            <svg
              class="w-3.5 h-3.5 mr-1"
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
            {{ !track.streamUrl
              ? 'Unavailable'
              : activeDownloads.includes(getTrackId(track.id))
                ? 'Processing...'
                : 'Download' }}
          </button>

          <a
            :href="track.url"
            target="_blank"
            rel="noopener noreferrer"
            class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
            title="Open in SoundCloud"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>

        <!-- Error Message -->
        <p
          v-if="downloadErrors[track.id]"
          class="mt-2 text-xs text-red-600 bg-red-50 px-2.5 py-1.5 rounded flex items-center gap-1.5"
        >
          <svg
            class="w-3.5 h-3.5 flex-shrink-0 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="line-clamp-2">{{ downloadErrors[track.id] }}</span>
        </p>
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