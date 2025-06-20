<template>  <div class="bg-gray-800/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-5 
              hover:bg-gray-800/40 hover:border-orange-500/30 transition-all duration-300 group 
              hover:shadow-lg hover:shadow-orange-500/10 hover:translate-y-[-2px]">
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
                 text-white p-2 rounded-full shadow-lg animate-bounce"
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
                 text-white p-2 rounded-full shadow-lg"
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
          <h3 class="font-semibold text-gray-100 truncate group-hover:text-orange-400 transition-colors">
            {{ track.title }}
          </h3>
          <p class="text-sm text-gray-400 truncate mt-1 group-hover:text-gray-300 transition-colors">
            {{ track.artist }}
          </p>
          <p class="text-xs text-gray-500 mt-2 group-hover:text-gray-400 transition-colors">
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
            class="text-gray-400 hover:text-orange-500 transition-colors 
                   hover:scale-110 transform duration-200"
            :title="'Open in SoundCloud'"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.75c-5.385 0-9.75-4.365-9.75-9.75S6.615 2.25 12 2.25s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75zm0-17.5c-4.28 0-7.75 3.47-7.75 7.75S7.72 19.75 12 19.75s7.75-3.47 7.75-7.75S16.28 4.25 12 4.25zm3.75 8.75l-5.5 4-5.5-4v-2l5.5 4 5.5-4v2z"/>
            </svg>
          </a>

          <!-- Download Button -->
          <button
            @click="$emit('download', track)"
            :disabled="isDownloading || isCompleted || hasError"
            class="flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   bg-gradient-to-r from-orange-500/20 to-orange-600/20 
                   hover:from-orange-500 hover:to-orange-600
                   text-orange-500 hover:text-white
                   border border-orange-500/30 hover:border-orange-500
                   focus:outline-none focus:ring-2 focus:ring-orange-500/50
                   group-hover:shadow-lg group-hover:shadow-orange-500/10"
          >
            <span v-if="isDownloading">Downloading...</span>
            <span v-else-if="isCompleted">Downloaded</span>
            <span v-else-if="hasError">{{ errorMessage }}</span>
            <span v-else>Download</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Track } from '@/types'

const props = defineProps<{
  track: Track
  activeDownloads?: string[]
  errorTracks?: Record<string, string>
}>()

defineEmits<{
  (e: 'download', track: Track): void
}>()

const getTrackId = (id: number | string): string => String(id)

const isDownloading = computed(() => 
  props.activeDownloads?.includes(getTrackId(props.track.id)) ?? false
)

const hasError = computed(() => 
  props.errorTracks?.[getTrackId(props.track.id)] !== undefined
)

const errorMessage = computed(() => 
  props.errorTracks?.[getTrackId(props.track.id)] || 'Error'
)

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const completedDownloads = computed(() => {
  // Logic for completed downloads would go here
  return []
})

const isCompleted = computed(() => 
  completedDownloads.value.includes(getTrackId(props.track.id))
)
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