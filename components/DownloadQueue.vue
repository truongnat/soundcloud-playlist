<template>
  <div>
    <!-- Queue Toggle Button -->
    <button 
      @click="toggleQueue"
      class="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
    >
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path v-if="isQueueVisible" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Download Queue Panel -->
    <div
      class="fixed inset-x-0 bottom-0 transform transition-transform duration-300 ease-in-out z-40"
      :class="{ 'translate-y-full': !isQueueVisible }"
    >
      <div class="bg-white border-t border-gray-200 shadow-lg">
        <div class="max-w-6xl mx-auto">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div class="flex items-center space-x-4">
              <h2 class="text-lg font-semibold text-gray-900">Download Queue</h2>
              <div v-if="activeCount > 0" class="flex items-center space-x-2">
                <span class="flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span class="text-sm font-medium text-blue-600">{{ activeCount }} active</span>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <button 
                v-if="queuedItems.length" 
                @click="startAllDownloads"
                class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Start All
              </button>
              <button 
                v-if="hasCompletedDownloads" 
                @click="clearCompleted"
                class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear Completed
              </button>
              <button 
                @click="toggleQueue"
                class="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Queue List -->
          <div class="overflow-y-auto max-h-80 p-4 space-y-4">
            <div v-if="queueItems.length === 0" class="flex flex-col items-center justify-center py-8 text-gray-500">
              <svg class="w-12 h-12 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Queue is empty</p>
            </div>

            <div v-for="item in queueItems" :key="item.track.id" class="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <!-- Track Info -->
              <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                </svg>
              </div>

              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-gray-900 truncate">{{ item.track.title }}</h4>
                <p class="text-sm text-gray-500">{{ getStatusText(item) }}</p>
              </div>

              <!-- Progress -->
              <div v-if="['downloading', 'converting'].includes(item.status)" class="w-64">
                <div class="flex items-center">
                  <div class="flex-1">
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
                  <span class="ml-2 text-sm text-gray-500">{{ item.progress }}%</span>
                </div>
              </div>

              <!-- Status Icons -->
              <div class="flex items-center space-x-2">
                <div v-if="item.status === 'completed'" class="text-green-500">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div v-if="item.status === 'error'" class="text-red-500">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
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

const downloadQueue = ref<Record<string, QueueItem>>({})
const isQueueVisible = ref(true)
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
const addToQueue = async (track: Track): Promise<void> => {
  const trackId = getTrackId(track.id)
  console.log('Adding and starting download for track:', track.title)
  
  downloadQueue.value[trackId] = {
    track,
    status: 'downloading',
    progress: 0,
    error: undefined
  }

  await startDownload(trackId)
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

const toggleQueue = () => {
  isQueueVisible.value = !isQueueVisible.value
}

const startAllDownloads = async () => {
  for (const item of queuedItems.value) {
    await startDownload(getTrackId(item.track.id))
  }
}

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
