<template>
  <div class="h-screen flex flex-col">    <!-- Queue Header -->
    <UCard class="sticky top-0 z-10" ui="p-4">
      <!-- Left side: Title and status -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-cloud-arrow-down" class="text-gray-500" />
          <h2 class="text-lg font-semibold">Download Queue</h2>
          <UBadge
            v-if="downloadStats.active > 0"
            color="primary"
            variant="subtle"
          >
            {{ downloadStats.active }} active
          </UBadge>
        </div>

        <!-- Right side: Action buttons -->
        <div class="flex items-center gap-2">
          <!-- Clear completed button -->
          <UTooltip text="Clear completed downloads">
            <UButton
              v-if="downloadStats.completed > 0"
              @click="downloadQueueStore.clearCompleted"
              color="neutral"
              variant="ghost"
              size="sm"
            >
              Clear completed
            </UButton>
          </UTooltip>

          <!-- Retry all failed button -->
          <UTooltip text="Retry all failed downloads">
            <UButton
              v-if="downloadStats.failed > 0"
              @click="handleRetryAllFailed"
              color="warning"
              variant="ghost"
              size="sm"
              icon="i-heroicons-arrow-path"
            >
              Retry Failed
            </UButton>
          </UTooltip>

          <!-- Discard all button -->
          <UTooltip text="Stop all downloads and clear queue">
            <UButton
              v-if="downloadStats.total > 0"
              @click="handleDiscardAll"
              color="error"
              variant="ghost"
              size="sm"
              icon="i-heroicons-trash"
            >
              Discard All
            </UButton>
          </UTooltip>
        </div>
      </div>
    </UCard>

        <!-- Close button -->
        <button @click="$emit('close')" class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors ml-1">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Queue Actions -->
    <div v-if="downloadStats.queued > 0" class="p-4 bg-gray-50 border-b border-gray-200">
      <button
        @click="handleDownloadAll"
        :disabled="downloadStats.active > 0"
        class="w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors"
        :class="downloadStats.active > 0 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700'"
      >
        <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Start All Downloads ({{ downloadStats.queued }})
      </button>
    </div>

    <!-- Queue List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="storeQueueItems.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <div class="bg-gray-50 rounded-full p-4 mb-4">
          <svg class="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
        <p class="text-base font-medium">Queue is empty</p>
        <p class="text-sm text-gray-400 mt-1 text-center">Add tracks from the playlist to download them</p>
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div v-for="item in storeQueueItems"
          :key="item.track.id" 
          class="p-4 hover:bg-gray-50 transition-colors"
        >
          <!-- Track Info -->
          <div class="flex items-start space-x-3">
            <div class="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
              <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
              </svg>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <div class="min-w-0 flex-1 mr-4">
                  <h4 class="font-medium text-gray-900 text-sm max-w-[200px] truncate">{{ item.track.title }}</h4>
                  <p class="text-xs text-gray-500 truncate">{{ item.track.artist }}</p>
                </div>
                <div class="flex items-center space-x-2 flex-shrink-0">
                  <button 
                    v-if="item.status === 'queued'"
                    @click="handleDownload(item.track.id)"
                    :disabled="downloadStats.active > 0"
                    class="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                    :class="downloadStats.active > 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'"
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
                    class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
                        'text-blue-600': item.status === 'downloading',
                        'text-green-600': item.status === 'converting'
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
                        'bg-blue-50 text-blue-700': item.status === 'downloading',
                        'bg-green-50 text-green-700': item.status === 'converting'
                      }">
                        {{ item.progress }}%
                      </span>
                    </div>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-300" 
                      :class="{
                        'bg-blue-600': item.status === 'downloading',
                        'bg-green-500': item.status === 'converting'
                      }" 
                      :style="{ width: `${item.progress}%` }"
                    ></div>
                  </div>
                </div>

                <div v-else-if="item.status === 'completed'" 
                  class="flex items-center text-sm text-green-600 mt-1 bg-green-50 px-3 py-1.5 rounded-lg"
                >
                  <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Download Completed
                </div>

                <div v-else-if="item.status === 'error'"
                  class="flex items-center justify-between text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg mt-1"
                >
                  <div class="flex items-center flex-1 min-w-0">
                    <svg class="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="truncate">{{ item.error }}</span>
                  </div>
                  <button
                    @click="handleRetry(item.track.id)"
                    class="ml-2 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors flex-shrink-0"
                    title="Retry download"
                  >
                    Retry
                  </button>
                </div>

                <div v-else class="text-sm text-gray-500 mt-1 flex items-center">
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
  if (confirm('Are you sure you want to stop all downloads and clear the queue? This action cannot be undone.')) {
    console.log('Discarding all downloads...')
    discardAll()
  }
}

// Handle retry failed download
const handleRetry = async (trackId: string | number) => {
  try {
    console.log('Retrying download for track:', trackId)
    await retryDownload(trackId.toString())
    emit('download-complete', trackId.toString())
  } catch (error) {
    console.error('Retry failed:', error)
  }
}

// Handle retry all failed downloads
const handleRetryAllFailed = async () => {
  const failedItems = storeQueueItems.value.filter(item => item.status === 'error')
  if (failedItems.length === 0) return

  console.log(`Retrying ${failedItems.length} failed downloads...`)

  for (const item of failedItems) {
    try {
      await retryDownload(item.track.id.toString())
      // Small delay between retries to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`Retry failed for track ${item.track.id}:`, error)
    }
  }
}

defineExpose({
  addToQueue
})
</script>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
