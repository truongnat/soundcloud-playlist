<template>
  <div class="h-full flex flex-col">
    <!-- Performance Dashboard -->
    <div class="border-b border-gray-700/50">
      <PerformanceDashboard />
    </div>
    
    <!-- Queue Actions -->
    <div v-if="downloadStats.queued > 0" class="p-4 bg-gray-800/30 border-b border-gray-700/50">
      <button
        @click="handleDownloadAll"
        :disabled="downloadStats.active > 0"
        class="w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors"
        :class="downloadStats.active > 0 
          ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed' 
          : 'bg-orange-600 text-white hover:bg-orange-700'"
      >
        <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Start All Downloads ({{ downloadStats.queued }})
      </button>
    </div>

    <!-- Action Buttons -->
    <div v-if="downloadStats.total > 0" class="p-4 border-b border-gray-700/50 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <!-- Clear completed button -->
        <button v-if="downloadStats.completed > 0"
          @click="downloadQueueStore.clearCompleted"
          class="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded transition-colors"
          title="Clear completed downloads"
        >
          Clear completed
        </button>

        <!-- Retry all failed button -->
        <button v-if="downloadStats.failed > 0"
          @click="handleRetryAllFailed"
          class="flex items-center space-x-1 px-3 py-1.5 text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 rounded transition-colors font-medium"
          title="Retry all failed downloads"
        >
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Retry Failed</span>
        </button>
      </div>

      <!-- Discard all button -->
      <button
        @click="handleDiscardAll"
        class="flex items-center space-x-1 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors font-medium"
        title="Stop all downloads and clear queue"
      >
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>Discard All</span>
      </button>
    </div>

    <!-- Queue List -->
    <div class="flex-1 overflow-y-auto min-h-0">
      <div v-if="storeQueueItems.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 p-8">
        <div class="bg-gray-800/50 rounded-full p-4 mb-4">
          <svg class="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
        <p class="text-base font-medium">Queue is empty</p>
        <p class="text-sm text-gray-500 mt-1 text-center">Add tracks from the playlist to download them</p>
      </div>

      <div v-else class="divide-y divide-gray-700/30">
        <div v-for="item in storeQueueItems"
          :key="item.track.id" 
          class="p-4 hover:bg-gray-800/30 transition-colors"
        >
          <!-- Track Info -->
          <div class="flex items-start space-x-3">
            <div class="w-10 h-10 bg-gray-800/50 rounded-lg flex-shrink-0 flex items-center justify-center">
              <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
              </svg>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <div class="min-w-0 flex-1 mr-4">
                  <h4 class="font-medium text-gray-200 text-sm max-w-[200px] truncate">{{ item.track.title }}</h4>
                  <p class="text-xs text-gray-400 truncate">{{ item.track.artist }}</p>
                </div>
                <div class="flex items-center space-x-2 flex-shrink-0">
                  <button 
                    v-if="item.status === 'queued'"
                    @click="handleDownload(item.track.id)"
                    :disabled="downloadStats.active > 0"
                    class="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                    :class="downloadStats.active > 0 
                      ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed' 
                      : 'bg-orange-600 text-white hover:bg-orange-700'"
                    title="Start download"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    <span>Start</span>
                  </button>
                  <button
                    v-if="item.status === 'queued'"
                    @click="downloadQueueStore.removeFromQueue(item.track.id.toString())"
                    class="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-colors"
                    title="Remove from queue"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <!-- Status and Progress -->
              <div class="mt-2">
                <div v-if="['downloading', 'converting'].includes(item.status)" class="space-y-2">
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center space-x-2">
                      <span class="flex items-center" :class="{
                        'text-blue-400': item.status === 'downloading',
                        'text-green-400': item.status === 'converting'
                      }">
                        <svg v-if="item.status === 'downloading'" class="w-4 h-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else-if="item.status === 'converting'" class="w-4 h-4 mr-1 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                        </svg>
                        {{ getStatusText(item) }}
                      </span>
                      <span class="px-2 py-0.5 rounded-full text-xs" :class="{
                        'bg-blue-900/50 text-blue-300': item.status === 'downloading',
                        'bg-green-900/50 text-green-300': item.status === 'converting'
                      }">
                        {{ item.progress }}%
                      </span>
                    </div>
                  </div>
                  <div class="w-full bg-gray-700/50 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-300" 
                      :class="{
                        'bg-blue-500': item.status === 'downloading',
                        'bg-green-500': item.status === 'converting'
                      }" 
                      :style="{ width: `${item.progress}%` }"
                    ></div>
                  </div>
                </div>

                <div v-else-if="item.status === 'completed'" 
                  class="flex items-center text-sm text-green-400 mt-1 bg-green-900/20 px-3 py-1.5 rounded-lg"
                >
                  <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Download Completed
                </div>

                <div v-else-if="item.status === 'error'"
                  class="flex items-center justify-between text-sm text-red-400 bg-red-900/20 px-3 py-1.5 rounded-lg mt-1"
                >
                  <div class="flex items-center flex-1 min-w-0">
                    <svg class="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="truncate">{{ item.error }}</span>
                  </div>
                  <button
                    @click="handleRetry(item.track.id)"
                    class="ml-2 px-2 py-1 text-xs bg-red-800/50 hover:bg-red-800/70 text-red-300 rounded transition-colors flex-shrink-0"
                    title="Retry download"
                  >
                    Retry
                  </button>
                </div>

                <div v-else class="text-sm text-gray-400 mt-1 flex items-center">
                  <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ getStatusText(item) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Track, QueueItem } from '@/types'
import { useDownloadQueue } from '@/composables/useDownloadQueue'
import { useDownloadQueueStore } from '@/stores/downloadQueue'
import { useUIStore } from '@/stores/ui'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'download-complete', trackId: string): void
  (e: 'discard-all'): void
}>()

const downloadQueueStore = useDownloadQueueStore()
const uiStore = useUIStore()

const {
  queueItems,
  addToQueue,
  startDownload,
  removeFromQueue,
  clearCompleted,
  discardAll,
  retryDownload,
  startAllDownloads
} = useDownloadQueue()

// Sử dụng store để lấy queue items
const storeQueueItems = computed(() => downloadQueueStore.queueItems)

// Compute download statistics từ store
const downloadStats = computed(() => {
  const stats = storeQueueItems.value.reduce((acc, item) => {
    if (item.status === 'queued') acc.queued++
    else if (['downloading', 'converting'].includes(item.status)) acc.active++
    else if (item.status === 'completed') acc.completed++
    else if (item.status === 'error') acc.failed++
    return acc
  }, { queued: 0, active: 0, completed: 0, failed: 0, total: 0 })

  // Thêm total count
  stats.total = storeQueueItems.value.length

  return stats
})

// Status text formatter
const getStatusText = (item: QueueItem): string => {
  switch (item.status) {
    case 'queued':
      return 'Queued'
    case 'downloading':
      return 'Downloading...'
    case 'converting':
      return 'Converting...'
    case 'completed':
      return 'Completed'
    case 'error':
      return item.error || 'Error'
    default:
      return item.status
  }
}

// Handle individual download
const handleDownload = async (trackId: string | number) => {
  if (downloadStats.value.active > 0) return
  
  try {
    await startDownload(trackId.toString())
    emit('download-complete', trackId.toString())
  } catch (error) {
    console.error('Download failed:', error)
  }
}

// Handle download all
const handleDownloadAll = async () => {
  if (downloadStats.value.active > 0) return

  try {
    await startAllDownloads()
    // Emit download complete for successfully downloaded items
    storeQueueItems.value
      .filter(item => item.status === 'completed')
      .forEach(item => emit('download-complete', item.track.id.toString()))
  } catch (error) {
    console.error('Failed to download all tracks:', error)
  }
}

// Handle discard all
const handleDiscardAll = () => {
  discardAll() // Call the composable function to cancel active downloads
  emit('discard-all')
}

// Handle retry all failed downloads
const handleRetryAllFailed = async () => {
  if (downloadStats.value.active > 0) return

  const failedItems = storeQueueItems.value.filter(item => item.status === 'error')
  
  try {
    // Reset status to queued for failed items
    failedItems.forEach(item => {
      downloadQueueStore.updateTrackStatus(item.track.id.toString(), 'queued')
    })

    // Start downloads for all queued items
    await startAllDownloads()

    // Emit download complete for any items that succeeded
    storeQueueItems.value
      .filter(item => item.status === 'completed')
      .forEach(item => emit('download-complete', item.track.id.toString()))
  } catch (error) {
    console.error('Failed to retry downloads:', error)
  }
}

// Handle retry individual download
const handleRetry = async (trackId: string | number) => {
  if (downloadStats.value.active > 0) return
  
  try {
    // Reset status to queued
    downloadQueueStore.updateTrackStatus(trackId.toString(), 'queued')
    
    // Start the download
    await startDownload(trackId.toString())
    emit('download-complete', trackId.toString())
  } catch (error) {
    console.error('Failed to retry download:', error)
  }
}

// Expose methods for parent component
defineExpose({
  addToQueue,
  startAllDownloads,
  discardAll: handleDiscardAll
})
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(55, 65, 81, 0.3);
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

/* Smooth transitions for queue items */
.queue-item {
  transition: all 0.2s ease;
}

.queue-item:hover {
  transform: translateX(2px);
}

/* Progress bar animations */
.progress-bar {
  position: relative;
  overflow: hidden;
}

/* Status indicators */
.status-downloading {
  position: relative;
}

.status-downloading::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: inherit;
  border-radius: inherit;
  transform: translate(-50%, -50%);
  animation: pulse 2s infinite;
}

/* Loading spinner for active downloads */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

/* Pulse animation for active elements */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Enhanced hover effects */
.hover-lift:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .queue-item {
    padding: 0.75rem;
  }
}

/* Focus states for accessibility */
button:focus-visible,
.focusable:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>