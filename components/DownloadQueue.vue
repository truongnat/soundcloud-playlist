<template>
  <div class="h-screen flex flex-col">
    <!-- Queue Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div class="flex items-center space-x-3">
        <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <h2 class="text-lg font-semibold text-gray-900">Download Queue</h2>
        <span v-if="activeCount > 0" class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {{ activeCount }} active
        </span>
      </div>
      <div class="flex items-center space-x-3">
        <button v-if="hasCompletedDownloads"
          @click="clearCompleted"
          class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear completed
        </button>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Queue Actions -->
    <div v-if="queuedItems.length > 0" class="p-4 bg-gray-50 border-b border-gray-200">
      <button
        @click="startQueuedDownloads"
        class="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Start Downloads ({{ queuedItems.length }})
      </button>
    </div>

    <!-- Queue List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="queueItems.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <div class="bg-gray-50 rounded-full p-4 mb-4">
          <svg class="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
        <p class="text-base font-medium">Queue is empty</p>
        <p class="text-sm text-gray-400 mt-1 text-center">Add tracks from the playlist to download them</p>
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div v-for="item in queueItems" 
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
              <h4 class="font-medium text-gray-900 text-sm truncate">{{ item.track.title }}</h4>
              <p class="text-xs text-gray-500">{{ item.track.artist }}</p>
              
              <!-- Status and Progress -->
              <div class="mt-2">
                <div v-if="['downloading', 'converting'].includes(item.status)" class="space-y-1">
                  <div class="flex items-center justify-between text-xs">
                    <span :class="{
                      'text-blue-600': item.status === 'downloading',
                      'text-green-600': item.status === 'converting'
                    }">{{ getStatusText(item) }}</span>
                    <span class="text-gray-500">{{ item.progress }}%</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-1.5">
                    <div class="h-1.5 rounded-full transition-all duration-300" 
                      :class="{
                        'bg-blue-600': item.status === 'downloading',
                        'bg-green-500': item.status === 'converting'
                      }" 
                      :style="{ width: `${item.progress}%` }"
                    ></div>
                  </div>
                </div>

                <div v-else-if="item.status === 'completed'" 
                  class="flex items-center text-sm text-green-600 mt-1"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Completed
                </div>

                <div v-else-if="item.status === 'error'" 
                  class="text-xs text-red-600 bg-red-50 rounded p-2 mt-1"
                >
                  {{ item.error }}
                </div>

                <div v-else class="text-xs text-gray-500 mt-1">
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
import { ref, computed } from 'vue'
import type { Track, QueueItem } from '@/types'
import { useAudioProcessor } from '@/composables/useAudioProcessor'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const downloadQueue = ref<Record<string, QueueItem>>({})
const { convertToMp3 } = useAudioProcessor()

// Queue state
const queueItems = computed(() => Object.values(downloadQueue.value))
const hasActiveDownloads = computed(() => queueItems.value.some(item => ['downloading', 'converting'].includes(item.status)))
const activeCount = computed(() => queueItems.value.filter(item => ['downloading', 'converting'].includes(item.status)).length)
const hasCompletedDownloads = computed(() => queueItems.value.some(item => item.status === 'completed'))
const queuedItems = computed(() => queueItems.value.filter(item => item.status === 'queued'))

// Helpers
const getTrackId = (id: string | number): string => id.toString()

const downloadFile = async (blob: Blob, filename: string): Promise<void> => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

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

// Download processing
const startDownload = async (trackId: string): Promise<void> => {
  try {
    // Get stream URL from our API
    const response = await fetch(`/api/stream-mp3?url=${encodeURIComponent(downloadQueue.value[trackId].track.url)}`)
    if (!response.ok) throw new Error('Failed to get stream URL')
    
    const data = await response.json()
    if (!data?.streamUrl) throw new Error('No stream URL in response')

    // Download the audio file directly from streamUrl
    const audioResponse = await fetch(data.streamUrl)
    if (!audioResponse.ok) throw new Error('Failed to download audio')
    
    if (!audioResponse.body) throw new Error('No response body')

    downloadQueue.value[trackId].status = 'downloading'

    // Download with progress tracking
    const reader = audioResponse.body.getReader()
    const contentLength = +(audioResponse.headers.get('Content-Length') || 0)
    let receivedLength = 0
    const chunks: Uint8Array[] = []

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      chunks.push(value)
      receivedLength += value.length

      if (contentLength) {
        downloadQueue.value[trackId].progress = Math.round((receivedLength / contentLength) * 100)
      }
    }

    // Combine chunks
    const audioData = new Uint8Array(receivedLength)
    let position = 0
    for (const chunk of chunks) {
      audioData.set(chunk, position)
      position += chunk.length
    }

    // Convert to MP3
    downloadQueue.value[trackId].status = 'converting'
    const mp3Blob = await convertToMp3(audioData)

    // Save file
    const filename = `${downloadQueue.value[trackId].track.title}.mp3`.replace(/[<>:"/\\|?*]/g, '_')
    await downloadFile(mp3Blob, filename)

    // Mark as completed
    downloadQueue.value[trackId] = {
      ...downloadQueue.value[trackId],
      status: 'completed',
      progress: 100
    }
  } catch (error: any) {
    console.error('Download failed:', error)
    downloadQueue.value[trackId] = {
      ...downloadQueue.value[trackId],
      status: 'error',
      error: error.message
    }
  }
}

// Queue management
const addToQueue = (track: Track): void => {
  const trackId = getTrackId(track.id)
  console.log('Adding track to queue:', track.title)
  
  if (downloadQueue.value[trackId]?.status === 'completed') {
    return // Skip if already downloaded
  }

  downloadQueue.value[trackId] = {
    track,
    status: 'queued',
    progress: 0,
    error: undefined
  }
}

const removeFromQueue = (trackId: string): void => {
  if (downloadQueue.value[trackId]?.status === 'queued') {
    const { [trackId]: removed, ...rest } = downloadQueue.value
    downloadQueue.value = rest
  }
}

const clearCompleted = (): void => {
  downloadQueue.value = Object.entries(downloadQueue.value).reduce((acc, [id, item]) => {
    if (item.status !== 'completed') {
      acc[id] = item
    }
    return acc
  }, {} as Record<string, QueueItem>)
}

const startQueuedDownloads = async (): Promise<void> => {
  const queued = queuedItems.value
  for (const item of queued) {
    if (item.status === 'queued') {
      await startDownload(getTrackId(item.track.id))
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
