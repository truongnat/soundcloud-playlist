<template>
  <div class="h-full flex flex-col bg-gray-900/50">
    <!-- Settings Panel Header -->
    <div class="p-4 border-b border-gray-700/50 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-3">
        <div class="bg-gray-800/50 rounded-lg p-2">
          <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-200">Settings</h2>
          <p class="text-xs text-gray-400">Configure download optimization</p>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <button
          @click="autoOptimize"
          :disabled="isOptimizing"
          class="p-1.5 text-gray-400 hover:text-orange-400 hover:bg-orange-900/20 rounded transition-colors disabled:opacity-50"
          title="Auto-optimize settings"
        >
          <svg v-if="!isOptimizing" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>
        <button
          @click="resetToDefaults"
          class="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-900/20 rounded transition-colors"
          title="Reset to defaults"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Settings Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      
      <!-- Performance Optimization -->
      <div class="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-lg p-4 border border-orange-500/30">
        <h3 class="text-md font-medium text-orange-300 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          🚀 Performance Optimization
        </h3>
        
        <!-- Auto-Optimization Toggle -->
        <div class="flex items-center justify-between mb-4 p-3 bg-orange-900/10 rounded-lg">
          <div>
            <label class="text-sm font-medium text-orange-200">Auto-Optimization</label>
            <p class="text-xs text-orange-200/70">Automatically adjust settings for best performance</p>
          </div>
          <button
            @click="toggleAutoOptimization"
            :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900',
              localSettings.enableAutoOptimization ? 'bg-orange-600' : 'bg-gray-600'
            ]"
          >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                localSettings.enableAutoOptimization ? 'translate-x-6' : 'translate-x-1'
              ]"
            />
          </button>
        </div>

        <!-- Optimization Stats -->
        <div v-if="optimizationStats" class="grid grid-cols-2 gap-3 text-xs">
          <div class="bg-orange-900/20 rounded p-2">
            <div class="text-orange-200/60">Cache Hit Rate</div>
            <div class="text-orange-300 font-medium">{{ optimizationStats.cacheHitRate }}%</div>
          </div>
          <div class="bg-orange-900/20 rounded p-2">
            <div class="text-orange-200/60">Avg Bandwidth</div>
            <div class="text-orange-300 font-medium">{{ formatBandwidth(optimizationStats.averageBandwidth) }}</div>
          </div>
          <div class="bg-orange-900/20 rounded p-2">
            <div class="text-orange-200/60">Recommended</div>
            <div class="text-orange-300 font-medium">{{ optimizationStats.recommendedConcurrency }} concurrent</div>
          </div>
          <div class="bg-orange-900/20 rounded p-2">
            <div class="text-orange-200/60">Bitrate</div>
            <div class="text-orange-300 font-medium">{{ optimizationStats.recommendedBitrate }}</div>
          </div>
        </div>
      </div>

      <!-- Download Settings -->
      <div class="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
        <h3 class="text-md font-medium text-gray-200 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Download Settings
        </h3>
        
        <div class="space-y-4">
          <!-- Concurrent Downloads -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Max Concurrent Downloads
              <span v-if="optimizationStats?.recommendedConcurrency" class="text-orange-400 text-xs">
                (Recommended: {{ optimizationStats.recommendedConcurrency }})
              </span>
            </label>
            <select
              v-model="localSettings.maxConcurrentDownloads"
              @change="updateSettings"
              class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="1">1 (Slowest, Most Stable)</option>
              <option value="2">2 (Conservative)</option>
              <option value="3">3 (Balanced)</option>
              <option value="4">4 (Fast)</option>
              <option value="5">5 (Very Fast)</option>
              <option value="6">6 (Aggressive)</option>
              <option value="8">8 (Maximum)</option>
            </select>
            <p class="text-xs text-gray-400 mt-1">Higher values = faster downloads but may cause errors</p>
          </div>

          <!-- Audio Quality -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Audio Quality
              <span v-if="optimizationStats?.recommendedBitrate" class="text-orange-400 text-xs">
                (Recommended: {{ optimizationStats.recommendedBitrate }})
              </span>
            </label>
            <select
              v-model="localSettings.audioQuality"
              @change="updateSettings"
              class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="96k">96 kbps (Fastest, Smaller Files)</option>
              <option value="128k">128 kbps (Balanced)</option>
              <option value="192k">192 kbps (High Quality)</option>
              <option value="256k">256 kbps (Highest Quality, Slower)</option>
            </select>
            <p class="text-xs text-gray-400 mt-1">Lower quality = faster downloads and smaller files</p>
          </div>

          <!-- Compression Preset -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Compression Preset
            </label>
            <select
              v-model="localSettings.compressionPreset"
              @change="updateSettings"
              class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="ultrafast">Ultra Fast (Fastest Processing)</option>
              <option value="superfast">Super Fast</option>
              <option value="veryfast">Very Fast</option>
              <option value="faster">Faster</option>
              <option value="fast">Fast</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="slow">Slow (Better Quality)</option>
            </select>
            <p class="text-xs text-gray-400 mt-1">Faster presets = quicker conversion but larger files</p>
          </div>
        </div>
      </div>

      <!-- Advanced Optimizations -->
      <div class="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
        <h3 class="text-md font-medium text-gray-200 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Advanced Optimizations
        </h3>
        
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Stream URL Caching</label>
              <p class="text-xs text-gray-400">Cache stream URLs to avoid repeated API calls</p>
            </div>
            <button
              @click="toggleStreamCaching"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900',
                localSettings.enableStreamCaching ? 'bg-orange-600' : 'bg-gray-600'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  localSettings.enableStreamCaching ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Connection Pooling</label>
              <p class="text-xs text-gray-400">Reuse HTTP connections for better performance</p>
            </div>
            <button
              @click="toggleConnectionPooling"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900',
                localSettings.enableConnectionPooling ? 'bg-orange-600' : 'bg-gray-600'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  localSettings.enableConnectionPooling ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Multi-threading</label>
              <p class="text-xs text-gray-400">Enable parallel processing for faster downloads</p>
            </div>
            <button
              @click="toggleMultiThreading"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900',
                localSettings.enableMultiThreading ? 'bg-orange-600' : 'bg-gray-600'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  localSettings.enableMultiThreading ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Adaptive Bitrate</label>
              <p class="text-xs text-gray-400">Automatically adjust quality based on connection speed</p>
            </div>
            <button
              @click="toggleAdaptiveBitrate"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900',
                localSettings.enableAdaptiveBitrate ? 'bg-orange-600' : 'bg-gray-600'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  localSettings.enableAdaptiveBitrate ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Cache Management -->
      <div class="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
        <h3 class="text-md font-medium text-gray-200 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          Cache Management
        </h3>
        
        <div class="space-y-3">
          <div v-if="optimizationStats" class="grid grid-cols-2 gap-3 text-xs">
            <div class="bg-gray-700/30 rounded p-2">
              <div class="text-gray-400">Cache Size</div>
              <div class="text-gray-200 font-medium">{{ optimizationStats.cacheSize }} URLs</div>
            </div>
            <div class="bg-gray-700/30 rounded p-2">
              <div class="text-gray-400">Active Connections</div>
              <div class="text-gray-200 font-medium">{{ optimizationStats.activeConnections }}</div>
            </div>
          </div>
          
          <div class="flex gap-2">
            <button
              @click="clearOptimizationCache"
              class="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Cache
            </button>
            <button
              @click="clearAllCache"
              class="flex-1 px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Clear All
            </button>
          </div>
        </div>
      </div>

      <!-- Performance Tips -->
      <div class="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
        <h3 class="text-md font-medium text-blue-300 mb-3 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          💡 Performance Tips
        </h3>
        
        <div class="space-y-2 text-sm text-blue-200/80">
          <div class="flex items-start gap-2">
            <span class="text-blue-400 mt-0.5">•</span>
            <span>Enable auto-optimization for best performance</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-blue-400 mt-0.5">•</span>
            <span>Use lower audio quality for faster downloads</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-blue-400 mt-0.5">•</span>
            <span>Reduce concurrent downloads if experiencing errors</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-blue-400 mt-0.5">•</span>
            <span>Clear cache periodically to free up memory</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Footer -->
    <div class="p-4 border-t border-gray-700/50 bg-gray-900/30">
      <div class="flex items-center justify-between text-xs text-gray-400">
        <span>Optimization features active</span>
        <span>v2.0.0</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePerformanceStore, type PerformanceSettings } from '@/stores/performance'
import { useOptimizedDownloader } from '@/composables/useOptimizedDownloader'

// Emit events
const emit = defineEmits<{
  close: []
}>()

// Stores and composables
const performanceStore = usePerformanceStore()
const { autoOptimize, clearCache, getOptimizationStats, isOptimizing } = useOptimizedDownloader()

// Local settings state
const localSettings = ref<PerformanceSettings>({
  maxConcurrentDownloads: 3,
  audioQuality: '128k',
  compressionPreset: 'fast',
  chunkSize: 1024 * 1024,
  enableAutoOptimization: true,
  enableStreamCaching: true,
  enableConnectionPooling: true,
  enableMultiThreading: true,
  enableAdaptiveBitrate: true
})

// Optimization stats
const optimizationStats = ref<any>(null)

// Load settings on mount
onMounted(() => {
  loadSettings()
  updateOptimizationStats()
  
  // Update stats every 5 seconds
  setInterval(updateOptimizationStats, 5000)
})

// Load settings from store
const loadSettings = () => {
  const storeSettings = performanceStore.settings
  localSettings.value = {
    ...localSettings.value,
    ...storeSettings
  }
}

// Update settings in store
const updateSettings = () => {
  performanceStore.updateSettings(localSettings.value)
  console.log('[SettingsPanel] Settings updated:', localSettings.value)
}

// Update optimization stats
const updateOptimizationStats = () => {
  optimizationStats.value = getOptimizationStats()
}

// Format bandwidth for display
const formatBandwidth = (bytes: number): string => {
  if (bytes === 0) return '0 B/s'
  if (bytes < 1024) return `${bytes.toFixed(0)} B/s`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB/s`
}

// Toggle functions
const toggleAutoOptimization = () => {
  localSettings.value.enableAutoOptimization = !localSettings.value.enableAutoOptimization
  updateSettings()
}

const toggleStreamCaching = () => {
  localSettings.value.enableStreamCaching = !localSettings.value.enableStreamCaching
  updateSettings()
}

const toggleConnectionPooling = () => {
  localSettings.value.enableConnectionPooling = !localSettings.value.enableConnectionPooling
  updateSettings()
}

const toggleMultiThreading = () => {
  localSettings.value.enableMultiThreading = !localSettings.value.enableMultiThreading
  updateSettings()
}

const toggleAdaptiveBitrate = () => {
  localSettings.value.enableAdaptiveBitrate = !localSettings.value.enableAdaptiveBitrate
  updateSettings()
}

// Reset to defaults
const resetToDefaults = () => {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    localSettings.value = {
      maxConcurrentDownloads: 3,
      audioQuality: '128k',
      compressionPreset: 'fast',
      chunkSize: 1024 * 1024,
      enableAutoOptimization: true,
      enableStreamCaching: true,
      enableConnectionPooling: true,
      enableMultiThreading: true,
      enableAdaptiveBitrate: true
    }
    updateSettings()
    alert('Settings reset to defaults!')
  }
}

// Clear optimization cache
const clearOptimizationCache = () => {
  if (confirm('Are you sure you want to clear the optimization cache?')) {
    clearCache()
    updateOptimizationStats()
    alert('Optimization cache cleared!')
  }
}

// Clear all cache
const clearAllCache = () => {
  if (confirm('Are you sure you want to clear all application cache?')) {
    try {
      // Clear optimization cache
      clearCache()
      
      // Clear browser storage
      localStorage.removeItem('app-cache')
      localStorage.removeItem('track-cache')
      localStorage.removeItem('playlist-cache')
      sessionStorage.clear()
      
      // Reset performance metrics
      performanceStore.resetMetrics()
      
      updateOptimizationStats()
      alert('All cache cleared successfully!')
    } catch (error) {
      console.error('Failed to clear cache:', error)
      alert('Failed to clear cache')
    }
  }
}
</script>

<style scoped>
/* Custom scrollbar for settings content */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(55, 65, 81, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7);
}

/* Focus styles for accessibility */
select:focus,
input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Hover effects for buttons */
button:hover:not(:disabled) {
  transform: translateY(-1px);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

/* Disabled state styling */
button:disabled {
  cursor: not-allowed;
}

select:disabled,
input:disabled {
  cursor: not-allowed;
}

/* Gradient animations */
.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Toggle switch animations */
.relative button span {
  transition: transform 0.2s ease-in-out;
}

/* Stats grid responsive */
@media (max-width: 640px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>