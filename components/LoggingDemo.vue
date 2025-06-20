<template>
  <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-700/50">
    <h3 class="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
      <svg class="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      Logging System Demo
    </h3>
    
    <p class="text-gray-400 text-sm mb-6">
      Test the activity monitor by triggering different types of logs. Check the left panel to see them in real-time.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Download Progress Demo -->
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-blue-400">Download Progress</h4>
        <div class="space-y-2">
          <button
            @click="simulateDownload"
            :disabled="isSimulating"
            class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors text-sm"
          >
            {{ isSimulating ? 'Simulating...' : 'Simulate Download' }}
          </button>
          <button
            @click="simulateDownloadError"
            class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
          >
            Simulate Download Error
          </button>
        </div>
      </div>

      <!-- API Requests Demo -->
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-green-400">API Requests</h4>
        <div class="space-y-2">
          <button
            @click="simulateApiSuccess"
            class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
          >
            Simulate API Success
          </button>
          <button
            @click="simulateApiError"
            class="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
          >
            Simulate API Error
          </button>
        </div>
      </div>

      <!-- System Status Demo -->
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-purple-400">System Status</h4>
        <div class="space-y-2">
          <button
            @click="simulateSystemOnline"
            class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
          >
            System Online
          </button>
          <button
            @click="simulateSystemOffline"
            class="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
          >
            System Offline
          </button>
        </div>
      </div>

      <!-- Error Logs Demo -->
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-red-400">Error Logs</h4>
        <div class="space-y-2">
          <button
            @click="simulateValidationError"
            class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
          >
            Validation Error
          </button>
          <button
            @click="simulateNetworkError"
            class="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm"
          >
            Network Error
          </button>
        </div>
      </div>
    </div>

    <!-- Batch Actions -->
    <div class="mt-6 pt-4 border-t border-gray-700/50">
      <h4 class="text-sm font-medium text-gray-300 mb-3">Batch Actions</h4>
      <div class="flex gap-2">
        <button
          @click="simulateBatchDownload"
          :disabled="isBatchSimulating"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white rounded-lg transition-colors text-sm"
        >
          {{ isBatchSimulating ? 'Running...' : 'Simulate Batch Download' }}
        </button>
        <button
          @click="generateRandomActivity"
          class="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors text-sm"
        >
          Generate Random Activity
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLogger } from '@/composables/useLogger'

const logger = useLogger()
const isSimulating = ref(false)
const isBatchSimulating = ref(false)

// Download simulation
const simulateDownload = async () => {
  isSimulating.value = true
  const trackTitle = `Demo Track ${Math.floor(Math.random() * 1000)}`
  const trackId = `demo-${Date.now()}`
  
  logger.logDownloadStart(trackTitle, trackId)
  
  // Simulate progress updates
  for (let progress = 0; progress <= 100; progress += 10) {
    await new Promise(resolve => setTimeout(resolve, 200))
    logger.logDownloadProgress(trackTitle, progress)
  }
  
  logger.logDownloadComplete(trackTitle)
  isSimulating.value = false
}

const simulateDownloadError = () => {
  const trackTitle = `Failed Track ${Math.floor(Math.random() * 1000)}`
  logger.logDownloadStart(trackTitle, `error-${Date.now()}`)
  
  setTimeout(() => {
    logger.logDownloadError(trackTitle, 'Network timeout - unable to download track')
  }, 1000)
}

// API simulation
const simulateApiSuccess = () => {
  const endpoints = [
    'https://api.soundcloud.com/tracks/123456',
    'https://api.soundcloud.com/playlists/789012',
    'https://api.soundcloud.com/users/345678'
  ]
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
  
  logger.logApiRequest('GET', endpoint, 200, Math.floor(Math.random() * 500) + 100)
}

const simulateApiError = () => {
  const endpoints = [
    'https://api.soundcloud.com/tracks/invalid',
    'https://api.soundcloud.com/playlists/private',
    'https://api.soundcloud.com/users/deleted'
  ]
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
  const status = [400, 401, 403, 404, 429, 500][Math.floor(Math.random() * 6)]
  
  logger.logApiError('GET', endpoint, `HTTP ${status} Error`, status)
}

// System status simulation
const simulateSystemOnline = () => {
  const components = ['Audio Processor', 'Download Manager', 'API Gateway', 'File System']
  const component = components[Math.floor(Math.random() * components.length)]
  
  logger.logSystemStatus(component, 'online', `${component} is running normally`)
}

const simulateSystemOffline = () => {
  const components = ['Audio Processor', 'Download Manager', 'API Gateway', 'File System']
  const component = components[Math.floor(Math.random() * components.length)]
  
  logger.logSystemStatus(component, 'offline', `${component} is temporarily unavailable`)
}

// Error simulation
const simulateValidationError = () => {
  const fields = ['URL', 'Track ID', 'Playlist ID', 'User ID']
  const field = fields[Math.floor(Math.random() * fields.length)]
  const value = 'invalid-value-' + Math.random().toString(36).substr(2, 5)
  
  logger.logValidationError(field, value, `${field} format is invalid`)
}

const simulateNetworkError = () => {
  const urls = [
    'https://soundcloud.com/timeout-test',
    'https://api.soundcloud.com/unreachable',
    'https://cdn.soundcloud.com/connection-failed'
  ]
  const url = urls[Math.floor(Math.random() * urls.length)]
  
  logger.logNetworkError(url, 'Connection timeout after 30 seconds')
}

// Batch simulation
const simulateBatchDownload = async () => {
  isBatchSimulating.value = true
  const trackCount = 5
  
  logger.logDownloadQueueStart(trackCount)
  
  let successCount = 0
  
  for (let i = 1; i <= trackCount; i++) {
    const trackTitle = `Batch Track ${i}`
    const trackId = `batch-${Date.now()}-${i}`
    
    logger.logDownloadStart(trackTitle, trackId)
    
    // Simulate variable download times
    const downloadTime = Math.random() * 2000 + 1000
    const progressSteps = 10
    const stepTime = downloadTime / progressSteps
    
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, stepTime))
      logger.logDownloadProgress(trackTitle, progress)
    }
    
    // Simulate occasional failures
    if (Math.random() < 0.2) {
      logger.logDownloadError(trackTitle, 'Random download failure for demo')
    } else {
      logger.logDownloadComplete(trackTitle)
      successCount++
    }
    
    // Small delay between tracks
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  
  logger.logDownloadQueueComplete(successCount, trackCount)
  isBatchSimulating.value = false
}

// Random activity generator
const generateRandomActivity = () => {
  const activities = [
    () => simulateApiSuccess(),
    () => simulateApiError(),
    () => simulateSystemOnline(),
    () => simulateValidationError(),
    () => logger.logUserAction('User clicked random button'),
    () => logger.logMemoryUsage(),
    () => logger.logSystem('Random Event', 'This is a random system event for demo purposes', 'info')
  ]
  
  // Generate 3-5 random activities
  const count = Math.floor(Math.random() * 3) + 3
  
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const activity = activities[Math.floor(Math.random() * activities.length)]
      activity()
    }, i * 500)
  }
}
</script>