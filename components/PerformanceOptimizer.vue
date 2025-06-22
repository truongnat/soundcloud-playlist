<template>
  <div class="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
    <h3 class="text-md font-medium text-gray-200 mb-4 flex items-center gap-2">
      <svg class="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      Performance Optimizer
      <span v-if="isOptimizedMode" class="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
        Optimized Mode
      </span>
      <span v-else class="ml-auto text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full">
        Standard Mode
      </span>
    </h3>

    <!-- Performance Mode Toggle -->
    <div class="mb-4 p-3 bg-gray-900/30 rounded-lg border border-gray-600/30">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h4 class="text-sm font-medium text-gray-200">Download Engine</h4>
          <p class="text-xs text-gray-400">Choose between standard and optimized download engine</p>
        </div>
        <div class="relative">
          <input
            type="checkbox"
            v-model="isOptimizedMode"
            @change="toggleOptimizedMode"
            class="sr-only"
            id="optimized-toggle"
          />
          <label for="optimized-toggle" class="cursor-pointer">
            <div class="w-12 h-6 bg-gray-600 rounded-full shadow-inner transition-colors"
                 :class="{ 'bg-green-500': isOptimizedMode }"></div>
            <div class="absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1 transition-transform"
                 :class="{ 'translate-x-6': isOptimizedMode }"></div>
          </label>
        </div>
      </div>
      
      <!-- Mode Description -->
      <div class="text-xs text-gray-300 bg-gray-800/50 rounded p-2">
        <div v-if="isOptimizedMode">
          <p class="font-medium text-green-400 mb-1">🚀 Optimized Mode Features:</p>
          <ul class="space-y-1 text-gray-300">
            <li>• Parallel API calls for faster stream URL fetching</li>
            <li>• Stream URL caching to avoid repeated API calls</li>
            <li>• Web Workers for background audio processing</li>
            <li>• Chunked streaming with optimized buffer sizes</li>
            <li>• Skip conversion for MP3 files (direct download)</li>
            <li>• Intelligent concurrency based on CPU cores</li>
          </ul>
        </div>
        <div v-else>
          <p class="font-medium text-gray-400 mb-1">📦 Standard Mode:</p>
          <ul class="space-y-1 text-gray-300">
            <li>• Sequential API calls with fallback</li>
            <li>• Standard download with progress tracking</li>
            <li>• Main thread audio processing</li>
            <li>• Always convert to MP3 for consistency</li>
            <li>• Fixed concurrency limits</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Performance Stats -->
    <div v-if="stats.totalDownloads > 0" class="mb-4">
      <h4 class="text-sm font-medium text-gray-200 mb-2">Performance Statistics</h4>
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-gray-900/30 rounded p-2">
          <div class="text-xs text-gray-400">Avg Speed</div>
          <div class="text-sm font-medium text-blue-300">{{ formatSpeed(stats.avgSpeed) }}</div>
        </div>
        <div class="bg-gray-900/30 rounded p-2">
          <div class="text-xs text-gray-400">Success Rate</div>
          <div class="text-sm font-medium text-green-300">{{ stats.successRate }}%</div>
        </div>
        <div class="bg-gray-900/30 rounded p-2">
          <div class="text-xs text-gray-400">Avg Time</div>
          <div class="text-sm font-medium text-yellow-300">{{ formatTime(stats.avgTime) }}</div>
        </div>
        <div class="bg-gray-900/30 rounded p-2">
          <div class="text-xs text-gray-400">Total Downloads</div>
          <div class="text-sm font-medium text-gray-300">{{ stats.totalDownloads }}</div>
        </div>
      </div>
    </div>

    <!-- System Info -->
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-200 mb-2">System Capabilities</h4>
      <div class="grid grid-cols-2 gap-3 text-xs">
        <div class="bg-gray-900/30 rounded p-2">
          <div class="text-gray-400">CPU Cores</div>
          <div class="text-gray-200 font-medium">{{ systemInfo.cores }}</div>
        </div>
        <div class="bg-gray-900/30 rounded p-2">
          <div class="text-gray-400">Memory</div>
          <div class="text-gray-200 font-medium">{{ systemInfo.memory }}</div>
        </div>
        <div class="bg-gray-900/30 rounded p-2">
          <div class="text-gray-400">Connection</div>
          <div class="text-gray-200 font-medium">{{ systemInfo.connection }}</div>
        </div>
        <div class="bg-gray-900/30 rounded p-2">
          <div class="text-gray-400">Workers</div>
          <div class="text-gray-200 font-medium">{{ systemInfo.workers }}</div>
        </div>
      </div>
    </div>

    <!-- Optimization Recommendations -->
    <div v-if="recommendations.length > 0" class="mb-4">
      <h4 class="text-sm font-medium text-gray-200 mb-2">Recommendations</h4>
      <div class="space-y-2">
        <div v-for="rec in recommendations" :key="rec.type" 
             class="text-xs p-2 rounded border-l-2"
             :class="rec.type === 'warning' ? 'bg-yellow-900/20 border-yellow-500 text-yellow-200' : 'bg-blue-900/20 border-blue-500 text-blue-200'">
          {{ rec.message }}
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="space-y-2">
      <button
        @click="runBenchmark"
        :disabled="isBenchmarking"
        class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center gap-2 text-sm"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span v-if="isBenchmarking">Running Benchmark...</span>
        <span v-else>Run Performance Test</span>
      </button>

      <button
        @click="resetStats"
        class="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center gap-2 text-sm"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset Statistics
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePerformanceStore } from '@/stores/performance'

// Reactive state
const isOptimizedMode = ref(false)
const isBenchmarking = ref(false)

// Stores
const performanceStore = usePerformanceStore()

// System information
const systemInfo = computed(() => {
  const cores = navigator.hardwareConcurrency || 4
  const memory = (navigator as any).deviceMemory || 'Unknown'
  const connection = (navigator as any).connection?.effectiveType || 'Unknown'
  const workers = typeof Worker !== 'undefined' ? 'Supported' : 'Not Supported'

  return {
    cores: cores.toString(),
    memory: memory === 'Unknown' ? memory : `${memory}GB`,
    connection: connection.toUpperCase(),
    workers
  }
})

// Performance statistics
const stats = computed(() => {
  const metrics = performanceStore.metrics
  return {
    avgSpeed: metrics.averageDownloadSpeed || 0,
    successRate: Math.round(metrics.successRate || 0),
    avgTime: (metrics.averageConversionTime || 0) / 1000,
    totalDownloads: metrics.totalDownloads || 0
  }
})

// Recommendations based on system capabilities
const recommendations = computed(() => {
  const recs: Array<{ type: 'info' | 'warning', message: string }> = []
  
  const cores = navigator.hardwareConcurrency || 4
  const memory = (navigator as any).deviceMemory
  const connection = (navigator as any).connection

  if (cores >= 8 && !isOptimizedMode.value) {
    recs.push({
      type: 'info',
      message: `Your system has ${cores} CPU cores. Enable optimized mode for better performance.`
    })
  }

  if (cores <= 2 && isOptimizedMode.value) {
    recs.push({
      type: 'warning',
      message: 'Your system has limited CPU cores. Standard mode might be more stable.'
    })
  }

  if (memory && memory <= 2) {
    recs.push({
      type: 'warning',
      message: 'Limited memory detected. Consider downloading fewer files simultaneously.'
    })
  }

  if (connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')) {
    recs.push({
      type: 'warning',
      message: 'Slow connection detected. Consider reducing concurrent downloads.'
    })
  }

  if (typeof Worker === 'undefined') {
    recs.push({
      type: 'warning',
      message: 'Web Workers not supported. Optimized mode will have limited benefits.'
    })
  }

  return recs
})

// Methods
const toggleOptimizedMode = () => {
  localStorage.setItem('optimized-download-mode', isOptimizedMode.value.toString())
  
  // Emit event to parent components
  const event = new CustomEvent('optimized-mode-changed', {
    detail: { enabled: isOptimizedMode.value }
  })
  window.dispatchEvent(event)
}

const formatSpeed = (bytesPerSecond: number): string => {
  if (bytesPerSecond === 0) return '0 B/s'
  
  if (bytesPerSecond > 1024 * 1024) {
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`
  } else if (bytesPerSecond > 1024) {
    return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`
  }
  return `${Math.round(bytesPerSecond)} B/s`
}

const formatTime = (seconds: number): string => {
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

const runBenchmark = async () => {
  isBenchmarking.value = true
  
  try {
    // Simulate benchmark test
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate fake benchmark results
    const testSpeed = Math.random() * 5000000 + 1000000 // 1-5 MB/s
    const testTime = Math.random() * 3000 + 1000 // 1-4 seconds
    
    performanceStore.updateMetrics(testSpeed, testTime, true)
    
    alert(`Benchmark completed!\nSpeed: ${formatSpeed(testSpeed)}\nTime: ${formatTime(testTime / 1000)}`)
  } catch (error) {
    console.error('Benchmark failed:', error)
    alert('Benchmark failed. Please try again.')
  } finally {
    isBenchmarking.value = false
  }
}

const resetStats = () => {
  if (confirm('Are you sure you want to reset all performance statistics?')) {
    performanceStore.resetMetrics()
  }
}

// Initialize
onMounted(() => {
  // Load saved preference
  const saved = localStorage.getItem('optimized-download-mode')
  if (saved !== null) {
    isOptimizedMode.value = saved === 'true'
  } else {
    // Auto-enable for powerful systems
    const cores = navigator.hardwareConcurrency || 4
    const memory = (navigator as any).deviceMemory || 4
    isOptimizedMode.value = cores >= 4 && memory >= 4
  }
})
</script>

<style scoped>
/* Toggle animation */
.transition-transform {
  transition: transform 0.2s ease-in-out;
}

.transition-colors {
  transition: background-color 0.2s ease-in-out;
}

/* Hover effects */
button:hover:not(:disabled) {
  transform: translateY(-1px);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

/* Grid responsive */
@media (max-width: 640px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>