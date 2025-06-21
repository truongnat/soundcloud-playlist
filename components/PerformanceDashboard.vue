<template>
  <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-200 flex items-center gap-2">
        <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Performance Dashboard
      </h3>
      <button
        @click="toggleExpanded"
        class="p-1 text-gray-400 hover:text-gray-200 transition-colors"
        :aria-label="expanded ? 'Collapse dashboard' : 'Expand dashboard'"
      >
        <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': expanded }" 
             fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <div class="bg-gray-900/50 rounded-lg p-3 text-center">
        <div class="text-sm text-gray-400">Concurrent</div>
        <div class="text-lg font-bold text-blue-400">{{ settings?.maxConcurrentDownloads || 3 }}</div>
      </div>
      <div class="bg-gray-900/50 rounded-lg p-3 text-center">
        <div class="text-sm text-gray-400">Success Rate</div>
        <div class="text-lg font-bold" :class="successRateColor">{{ successRate }}%</div>
      </div>
      <div class="bg-gray-900/50 rounded-lg p-3 text-center">
        <div class="text-sm text-gray-400">Avg Speed</div>
        <div class="text-lg font-bold text-green-400">{{ avgSpeed }}</div>
      </div>
      <div class="bg-gray-900/50 rounded-lg p-3 text-center">
        <div class="text-sm text-gray-400">Threading</div>
        <div class="text-lg font-bold" :class="settings?.enableMultiThreading ? 'text-green-400' : 'text-gray-400'">
          {{ settings?.enableMultiThreading ? 'ON' : 'OFF' }}
        </div>
      </div>
    </div>

    <!-- Expanded Details -->
    <Transition name="slide-down">
      <div v-if="expanded" class="space-y-4">
        <!-- Performance Settings -->
        <div class="bg-gray-900/30 rounded-lg p-4">
          <h4 class="text-md font-medium text-gray-200 mb-3">Performance Settings</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-400 mb-2">Concurrent Downloads</label>
              <select 
                v-model="localSettings.maxConcurrentDownloads"
                @change="updateSettings"
                class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
              >
                <option value="1">1 (Conservative)</option>
                <option value="2">2 (Balanced)</option>
                <option value="3">3 (Recommended)</option>
                <option value="4">4 (Aggressive)</option>
                <option value="5">5 (Maximum)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">Audio Quality</label>
              <select 
                v-model="localSettings.audioQuality"
                @change="updateSettings"
                class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
              >
                <option value="128k">128k (Fast)</option>
                <option value="192k">192k (Good)</option>
                <option value="256k">256k (High)</option>
                <option value="320k">320k (Maximum)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">Compression Preset</label>
              <select 
                v-model="localSettings.compressionPreset"
                @change="updateSettings"
                class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
              >
                <option value="ultrafast">Ultra Fast</option>
                <option value="fast">Fast (Recommended)</option>
                <option value="medium">Medium</option>
                <option value="slow">Slow (Best Quality)</option>
              </select>
            </div>
            <div class="flex items-center">
              <label class="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="localSettings.enableMultiThreading"
                  @change="updateSettings"
                  class="sr-only"
                >
                <div class="relative">
                  <div class="w-10 h-6 bg-gray-600 rounded-full shadow-inner transition-colors"
                       :class="{ 'bg-blue-500': localSettings.enableMultiThreading }"></div>
                  <div class="absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1 transition-transform"
                       :class="{ 'translate-x-4': localSettings.enableMultiThreading }"></div>
                </div>
                <span class="ml-3 text-sm text-gray-300">Multi-threading</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="bg-gray-900/30 rounded-lg p-4">
          <h4 class="text-md font-medium text-gray-200 mb-3">Performance Metrics</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div class="text-sm text-gray-400">Total Downloads</div>
              <div class="text-xl font-bold text-gray-200">{{ metrics.totalDownloads }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-400">Average Conversion Time</div>
              <div class="text-xl font-bold text-yellow-400">{{ avgConversionTime }}s</div>
            </div>
            <div>
              <div class="text-sm text-gray-400">Failed Downloads</div>
              <div class="text-xl font-bold text-red-400">{{ metrics.failedDownloads }}</div>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div v-if="recommendations.length > 0" class="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
          <h4 class="text-md font-medium text-yellow-400 mb-2 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Performance Recommendations
          </h4>
          <ul class="space-y-1">
            <li v-for="recommendation in recommendations" :key="recommendation" 
                class="text-sm text-yellow-300 flex items-start gap-2">
              <span class="text-yellow-500 mt-1">•</span>
              {{ recommendation }}
            </li>
          </ul>
        </div>

        <!-- Auto-optimize Button -->
        <div class="flex justify-center">
          <button
            @click="applyOptimalSettings"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Auto-Optimize Settings
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDownloadPerformance } from '~/composables/useDownloadPerformance'

const { 
  settings, 
  metrics, 
  recommendations, 
  applyOptimalSettings: applyOptimal,
  updateSettings: updatePerformanceSettings 
} = useDownloadPerformance()

const expanded = ref(false)
const localSettings = ref({ 
  maxConcurrentDownloads: 3,
  enableMultiThreading: true,
  compressionPreset: 'fast' as const,
  audioQuality: '320k' as const,
  chunkSize: 1024 * 1024
})

// Computed properties for display
const successRate = computed(() => {
  const rate = metrics.successRate
  if (!rate || isNaN(rate)) {
    return 0
  }
  return Math.round(rate)
})

const successRateColor = computed(() => {
  const rate = successRate.value
  if (rate >= 90) return 'text-green-400'
  if (rate >= 70) return 'text-yellow-400'
  return 'text-red-400'
})

const avgSpeed = computed(() => {
  const speed = metrics.averageDownloadSpeed
  
  // Handle invalid or zero values
  if (!speed || speed === 0 || isNaN(speed)) {
    return '0 B/s'
  }
  
  if (speed > 1024 * 1024) {
    return `${Math.round(speed / (1024 * 1024))}MB/s`
  } else if (speed > 1024) {
    return `${Math.round(speed / 1024)}KB/s`
  }
  return `${Math.round(speed)}B/s`
})

const avgConversionTime = computed(() => {
  const time = metrics.averageConversionTime
  if (!time || isNaN(time)) {
    return 0
  }
  return Math.round(time / 1000)
})

// Watch for settings changes and initialize localSettings
watch(settings, (newSettings) => {
  if (newSettings) {
    localSettings.value = { ...newSettings }
  }
}, { deep: true, immediate: true })

const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const updateSettings = () => {
  updatePerformanceSettings(localSettings.value)
}

const applyOptimalSettings = () => {
  applyOptimal()
  if (settings) {
    localSettings.value = { ...settings }
  }
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>