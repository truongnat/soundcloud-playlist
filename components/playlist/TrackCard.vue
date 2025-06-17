<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-100 transition-all duration-200 group">
    <div class="flex space-x-5">
      <!-- Artwork Section -->
      <div class="relative flex-shrink-0">
        <!-- Track Artwork -->
        <img
          v-if="track.artwork"
          :src="track.artwork"
          :alt="track.title"
          class="w-28 h-28 object-cover rounded-lg shadow-sm group-hover:shadow transition-shadow"
          loading="lazy"
        />

        <!-- Placeholder for Missing Artwork -->
        <div
          v-else
          class="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex items-center justify-center"
        >
          <svg
            class="w-12 h-12 text-gray-400"
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

        <!-- Download Status Badge -->
        <div
          v-if="activeDownloads.includes(getTrackId(track.id))"
          class="absolute -top-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full shadow-sm animate-pulse"
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
            ></path>
          </svg>
        </div>
      </div>

      <!-- Track Info Section -->
      <div class="flex-1 min-w-0">
        <!-- Track Title and Artist -->
        <div class="flex justify-between items-start space-x-4 mb-2">
          <div>
            <h3
              class="font-medium text-gray-900 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors"
            >
              {{ track.title }}
            </h3>
            <p class="text-sm text-gray-600 mt-1 flex items-center">
              <!-- Artist Icon -->
              <svg
                class="w-4 h-4 mr-1 text-gray-400"
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

          <!-- Track Duration -->
          <span class="text-sm text-gray-500 whitespace-nowrap flex items-center">
            <!-- Duration Icon -->
            <svg
              class="w-4 h-4 mr-1 text-gray-400"
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

        <!-- Action Buttons -->
        <div class="flex items-center space-x-3 mt-4">
          <!-- Download Button -->
          <button
            @click="downloadTrack(track)"
            :disabled="!track.streamUrl || activeDownloads.includes(getTrackId(track.id))"
            class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
            :class="!track.streamUrl || activeDownloads.includes(getTrackId(track.id))
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500'"
          >
            <!-- Download Icon -->
            <svg
              class="w-4 h-4 mr-1.5"
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

          <!-- Open in SoundCloud Link -->
          <a
            class="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            :href="track.url"
            target="_blank"
            rel="noopener noreferrer"
            title="Open in SoundCloud"
          >
            <!-- SoundCloud Icon -->
            <svg
              class="w-5 h-5"
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

        <!-- Download Error Message -->
        <p
          v-if="downloadErrors[track.id]"
          class="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center"
        >
          <!-- Error Icon -->
          <svg
            class="w-4 h-4 mr-1.5 flex-shrink-0"
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
          {{ downloadErrors[track.id] }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  track: {
    id: string | number
    title: string
    artist: string
    artwork?: string
    url: string
    streamUrl?: string
    duration: number
  }
  activeDownloads: string[]
  downloadErrors: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'download', track: any): void
}>()

// Format duration from milliseconds to minutes:seconds
const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}:${seconds.padStart(2, '0')}`
}

// Convert track ID to string
const getTrackId = (id: string | number): string => id.toString()

const downloadTrack = (track: any) => {
  emit('download', track)
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>