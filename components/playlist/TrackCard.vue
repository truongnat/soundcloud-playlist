<template>  
  <div class="bg-gray-800/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-3 lg:p-4 xl:p-5 
              hover:bg-gray-800/40 hover:border-orange-500/30 transition-all duration-300 group 
              hover:shadow-lg hover:shadow-orange-500/10 hover:translate-y-[-2px]">
    
    <!-- Mobile Layout (stacked) -->
    <div class="block sm:hidden">
      <!-- Track Image -->
      <div class="relative w-full h-32 rounded-lg overflow-hidden mb-3">
        <img
          v-if="track.artwork"
          :src="track.artwork"
          :alt="track.title"
          class="w-full h-full object-cover shadow-lg transition-all duration-300
                 group-hover:scale-105 group-hover:brightness-110"
          loading="lazy"
        />
        <div
          v-else
          class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg 
                 flex items-center justify-center ring-1 ring-white/5"
        >
          <svg
            class="w-10 h-10 text-gray-600 group-hover:text-orange-500 transition-colors duration-300"
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
          v-if="activeDownloads?.includes(getTrackId(track.id))"
          class="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-pink-500 
                 text-white p-1.5 rounded-full shadow-lg animate-bounce"
        >
          <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>

        <!-- Download Complete Status -->
        <div
          v-else-if="isCompleted"
          class="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-500 
                 text-white p-1.5 rounded-full shadow-lg"
        >
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <!-- Track Info -->
      <div class="mb-3">
        <h3 class="font-semibold text-gray-100 truncate group-hover:text-orange-400 transition-colors text-sm">
          {{ track.title }}
        </h3>
        <p class="text-xs text-gray-400 truncate mt-1 group-hover:text-gray-300 transition-colors">
          {{ track.artist }}
        </p>
        <p class="text-xs text-gray-500 mt-1 group-hover:text-gray-400 transition-colors">
          {{ formatDuration(track.duration) }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <!-- Original Link -->
        <a
          :href="track.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-gray-400 hover:text-orange-500 transition-colors 
                 hover:scale-110 transform duration-200 flex-shrink-0 p-2"
          :title="'Open in SoundCloud'"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.75c-5.385 0-9.75-4.365-9.75-9.75S6.615 2.25 12 2.25s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/>
          </svg>
        </a>

        <!-- Download Button -->
        <button
          @click="$emit('download', track)"
          :disabled="isDownloading || isCompleted || hasError"
          class="flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed
                 bg-gradient-to-r from-orange-500/20 to-orange-600/20 
                 hover:from-orange-500 hover:to-orange-600
                 text-orange-500 hover:text-white
                 border border-orange-500/30 hover:border-orange-500
                 focus:outline-none focus:ring-2 focus:ring-orange-500/50
                 group-hover:shadow-lg group-hover:shadow-orange-500/10
                 text-xs"
        >
          <span v-if="isDownloading">Downloading...</span>
          <span v-else-if="isCompleted">Downloaded</span>
          <span v-else-if="hasError">Error</span>
          <span v-else>Download</span>
        </button>
      </div>
    </div>

    <!-- Desktop Layout -->
    <div class="hidden sm:block">
      <!-- Layout thay đổi: ngang khi panel đóng, dọc khi panel mở -->
      <div class="flex gap-3 lg:gap-4 transition-all duration-300" :class="isDownloadQueueOpen ? 'flex-col' : 'flex-row'">
        <!-- Artwork -->
        <div class="relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300" 
             :class="isDownloadQueueOpen ? 'w-full h-40' : 'w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24'">
          <!-- Track Image -->
          <img
            v-if="track.artwork"
            :src="track.artwork"
            :alt="track.title"
            class="w-full h-full object-cover shadow-lg transition-all duration-300
                   group-hover:scale-105 group-hover:brightness-110"
            loading="lazy"
          />

          <!-- Placeholder -->
          <div
            v-else
            class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg 
                   flex items-center justify-center ring-1 ring-white/5"
          >
            <svg
              class="text-gray-600 group-hover:text-orange-500 transition-colors duration-300"
              :class="isDownloadQueueOpen ? 'w-16 h-16' : 'w-6 h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10'"
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
            v-if="activeDownloads?.includes(getTrackId(track.id))"
            class="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-pink-500 
                   text-white p-1 lg:p-1.5 rounded-full shadow-lg animate-bounce"
          >
            <svg class="w-2.5 h-2.5 lg:w-3 lg:h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>

          <!-- Download Complete Status -->
          <div
            v-else-if="isCompleted"
            class="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 
                   text-white p-1 lg:p-1.5 rounded-full shadow-lg"
          >
            <svg class="w-2.5 h-2.5 lg:w-3 lg:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <!-- Info and Actions Container -->
        <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <!-- Track Info -->
          <div class="min-w-0" :class="isDownloadQueueOpen ? 'mb-3' : ''">
            <h3 class="font-semibold text-gray-100 truncate group-hover:text-orange-400 transition-colors text-xs lg:text-sm xl:text-base">
              {{ track.title }}
            </h3>
            <p class="text-xs lg:text-sm text-gray-400 truncate mt-0.5 lg:mt-1 group-hover:text-gray-300 transition-colors">
              {{ track.artist }}
            </p>
            <p class="text-xs text-gray-500 mt-0.5 lg:mt-1 group-hover:text-gray-400 transition-colors">
              {{ formatDuration(track.duration) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 mt-2 lg:mt-3">
            <!-- Original Link -->
            <a
              :href="track.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-400 hover:text-orange-500 transition-colors 
                     hover:scale-110 transform duration-200 flex-shrink-0 p-1"
              :title="'Open in SoundCloud'"
            >
              <svg class="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.75c-5.385 0-9.75-4.365-9.75-9.75S6.615 2.25 12 2.25s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/>
              </svg>
            </a>

            <!-- Download Button -->
            <button
              @click="$emit('download', track)"
              :disabled="isDownloading || isCompleted || hasError"
              class="flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     bg-gradient-to-r from-orange-500/20 to-orange-600/20 
                     hover:from-orange-500 hover:to-orange-600
                     text-orange-500 hover:text-white
                     border border-orange-500/30 hover:border-orange-500
                     focus:outline-none focus:ring-2 focus:ring-orange-500/50
                     group-hover:shadow-lg group-hover:shadow-orange-500/10
                     text-sm"
            >
              <span v-if="isDownloading" class="truncate">Downloading...</span>
              <span v-else-if="isCompleted" class="truncate">Downloaded</span>
              <span v-else-if="hasError" class="truncate">Error</span>
              <span v-else class="truncate">Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Track } from '@/types'
import { useUIStore } from '@/stores/ui'

const props = defineProps<{
  track: Track
  activeDownloads?: string[]
  completedDownloads?: string[]
  errorTracks?: Record<string, string>
}>()

defineEmits<{
  (e: 'download', track: Track): void
}>()

const uiStore = useUIStore()

const getTrackId = (id: number | string): string => String(id)

const isDownloadQueueOpen = computed(() => uiStore.showDownloadQueue)

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

const isCompleted = computed(() => 
  props.completedDownloads?.includes(getTrackId(props.track.id)) ?? false
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