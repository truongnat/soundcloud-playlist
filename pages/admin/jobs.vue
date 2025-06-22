<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-4">
        Background Jobs Admin
      </h1>
      <p class="text-gray-400">Monitor and manage background processing jobs</p>
    </div>

    <!-- Job Statistics -->
    <div v-if="stats" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
      <div class="bg-gray-800/50 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-blue-400">{{ stats.total }}</div>
        <div class="text-sm text-gray-400">Total</div>
      </div>
      <div class="bg-gray-800/50 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-yellow-400">{{ stats.pending }}</div>
        <div class="text-sm text-gray-400">Pending</div>
      </div>
      <div class="bg-gray-800/50 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-blue-400">{{ stats.processing }}</div>
        <div class="text-sm text-gray-400">Processing</div>
      </div>
      <div class="bg-gray-800/50 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-green-400">{{ stats.completed }}</div>
        <div class="text-sm text-gray-400">Completed</div>
      </div>
      <div class="bg-gray-800/50 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-red-400">{{ stats.failed }}</div>
        <div class="text-sm text-gray-400">Failed</div>
      </div>
      <div class="bg-gray-800/50 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-purple-400">{{ stats.currentlyProcessing }}/{{ stats.processingCapacity }}</div>
        <div class="text-sm text-gray-400">Active</div>
      </div>
    </div>

    <!-- Refresh Button -->
    <div class="mb-6">
      <button
        @click="refreshStats"
        :disabled="loading"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        <svg v-if="loading" class="animate-spin w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Refresh Stats
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-900/20 border border-red-800/50 text-red-200 p-4 rounded-xl mb-6">
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Job Creation Form -->
    <div class="bg-gray-800/50 rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Create Test Job</h2>
      <div class="flex gap-4">
        <input
          v-model="testUrl"
          type="text"
          placeholder="https://soundcloud.com/user/sets/playlist"
          class="flex-1 px-4 py-2 bg-gray-900/50 text-gray-100 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
        <input
          v-model.number="maxTracks"
          type="number"
          placeholder="Max tracks (optional)"
          class="w-40 px-4 py-2 bg-gray-900/50 text-gray-100 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
        <button
          @click="createTestJob"
          :disabled="!testUrl || loading"
          class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          Create Job
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !stats" class="text-center py-12">
      <div class="inline-flex items-center gap-3 text-gray-400">
        <svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading job statistics...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBackgroundJobs } from '@/composables/useBackgroundJobs'
import type { JobStats } from '@/composables/useBackgroundJobs'

const { getJobStats, createJob } = useBackgroundJobs()

const stats = ref<JobStats | null>(null)
const loading = ref(false)
const error = ref('')
const testUrl = ref('')
const maxTracks = ref<number | undefined>(undefined)

const refreshStats = async () => {
  loading.value = true
  error.value = ''
  
  try {
    stats.value = await getJobStats()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load job statistics'
  } finally {
    loading.value = false
  }
}

const createTestJob = async () => {
  if (!testUrl.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await createJob('playlist', testUrl.value, maxTracks.value)
    
    // Clear form
    testUrl.value = ''
    maxTracks.value = undefined
    
    // Refresh stats
    await refreshStats()
    
    // Show success message
    error.value = `Job created successfully: ${response.jobId}`
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create job'
  } finally {
    loading.value = false
  }
}

// Load stats on mount
onMounted(() => {
  refreshStats()
})

// Auto-refresh every 5 seconds
const refreshInterval = setInterval(refreshStats, 5000)

onUnmounted(() => {
  clearInterval(refreshInterval)
})
</script>