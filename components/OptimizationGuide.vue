<template>
  <div class="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg p-6 border border-orange-500/30">
    <div class="flex items-center gap-3 mb-4">
      <div class="bg-orange-500/20 rounded-full p-2">
        <svg class="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-orange-300">🚀 Speed Optimization Tips</h3>
        <p class="text-sm text-orange-200/70">Get the fastest download speeds possible</p>
      </div>
    </div>

    <div class="space-y-4">
      <!-- Quick Wins -->
      <div class="bg-orange-900/20 rounded-lg p-4">
        <h4 class="font-medium text-orange-200 mb-3 flex items-center gap-2">
          <span class="text-orange-400">⚡</span>
          Quick Wins (Immediate Impact)
        </h4>
        <div class="space-y-2 text-sm text-orange-100/80">
          <div class="flex items-start gap-2">
            <span class="text-orange-400 mt-1">•</span>
            <span><strong>Enable Auto-Optimization:</strong> Let the system automatically adjust settings for your connection</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-orange-400 mt-1">•</span>
            <span><strong>Use Stream Caching:</strong> Avoid repeated API calls for the same tracks</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-orange-400 mt-1">•</span>
            <span><strong>Lower Audio Quality:</strong> Use 96k or 128k for much faster downloads</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-orange-400 mt-1">•</span>
            <span><strong>Ultra Fast Preset:</strong> Use "ultrafast" compression for quickest processing</span>
          </div>
        </div>
      </div>

      <!-- Hardware Optimization -->
      <div class="bg-blue-900/20 rounded-lg p-4">
        <h4 class="font-medium text-blue-200 mb-3 flex items-center gap-2">
          <span class="text-blue-400">🖥️</span>
          Hardware-Based Settings
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div class="bg-blue-900/30 rounded p-3">
            <div class="font-medium text-blue-200 mb-1">High-End PC</div>
            <div class="text-blue-100/70 space-y-1">
              <div>• 6-8 concurrent downloads</div>
              <div>• 192k audio quality</div>
              <div>• Fast compression preset</div>
            </div>
          </div>
          <div class="bg-blue-900/30 rounded p-3">
            <div class="font-medium text-blue-200 mb-1">Low-End PC</div>
            <div class="text-blue-100/70 space-y-1">
              <div>• 2-3 concurrent downloads</div>
              <div>• 96k audio quality</div>
              <div>• Ultrafast preset</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Network Optimization -->
      <div class="bg-green-900/20 rounded-lg p-4">
        <h4 class="font-medium text-green-200 mb-3 flex items-center gap-2">
          <span class="text-green-400">🌐</span>
          Network Connection Tips
        </h4>
        <div class="space-y-2 text-sm text-green-100/80">
          <div class="flex items-start gap-2">
            <span class="text-green-400 mt-1">•</span>
            <span><strong>Fast Connection (>1MB/s):</strong> Use 5+ concurrent, 192k quality</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-400 mt-1">•</span>
            <span><strong>Medium Connection (500KB/s):</strong> Use 3 concurrent, 128k quality</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-400 mt-1">•</span>
            <span><strong>Slow Connection (<200KB/s):</strong> Use 1-2 concurrent, 96k quality</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-400 mt-1">•</span>
            <span><strong>Mobile/Metered:</strong> Enable adaptive bitrate for automatic adjustment</span>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div v-if="performanceMetrics" class="bg-purple-900/20 rounded-lg p-4">
        <h4 class="font-medium text-purple-200 mb-3 flex items-center gap-2">
          <span class="text-purple-400">📊</span>
          Your Current Performance
        </h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div class="bg-purple-900/30 rounded p-2 text-center">
            <div class="text-purple-100/60 text-xs">Avg Speed</div>
            <div class="text-purple-200 font-medium">{{ performanceMetrics.formattedAverageSpeed }}</div>
          </div>
          <div class="bg-purple-900/30 rounded p-2 text-center">
            <div class="text-purple-100/60 text-xs">Success Rate</div>
            <div class="text-purple-200 font-medium">{{ performanceMetrics.formattedSuccessRate }}%</div>
          </div>
          <div class="bg-purple-900/30 rounded p-2 text-center">
            <div class="text-purple-100/60 text-xs">Conversion</div>
            <div class="text-purple-200 font-medium">{{ performanceMetrics.formattedConversionTime }}s</div>
          </div>
          <div class="bg-purple-900/30 rounded p-2 text-center">
            <div class="text-purple-100/60 text-xs">Downloads</div>
            <div class="text-purple-200 font-medium">{{ performanceMetrics.totalDownloads }}</div>
          </div>
        </div>
      </div>

      <!-- Troubleshooting -->
      <div class="bg-red-900/20 rounded-lg p-4">
        <h4 class="font-medium text-red-200 mb-3 flex items-center gap-2">
          <span class="text-red-400">🔧</span>
          Troubleshooting Common Issues
        </h4>
        <div class="space-y-2 text-sm text-red-100/80">
          <div class="flex items-start gap-2">
            <span class="text-red-400 mt-1">•</span>
            <span><strong>Downloads Failing:</strong> Reduce concurrent downloads to 1-2</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-red-400 mt-1">•</span>
            <span><strong>Very Slow Speed:</strong> Check internet connection, try lower quality</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-red-400 mt-1">•</span>
            <span><strong>Browser Freezing:</strong> Clear cache, reduce concurrent downloads</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-red-400 mt-1">•</span>
            <span><strong>Conversion Errors:</strong> Try ultrafast preset, check available memory</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 pt-2">
        <button
          @click="applyOptimalSettings"
          class="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Auto-Optimize Now
        </button>
        <button
          @click="openSettings"
          class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Manual Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePerformanceStore } from '@/stores/performance'

// Props
interface Props {
  performanceMetrics?: any
}

const props = withDefaults(defineProps<Props>(), {
  performanceMetrics: null
})

// Emits
const emit = defineEmits<{
  'apply-optimal': []
  'open-settings': []
}>()

// Store
const performanceStore = usePerformanceStore()

// Methods
const applyOptimalSettings = () => {
  performanceStore.applyOptimalSettings()
  emit('apply-optimal')
}

const openSettings = () => {
  emit('open-settings')
}
</script>

<style scoped>
/* Responsive grid adjustments */
@media (max-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .md\\:grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Button hover effects */
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

button:active {
  transform: translateY(0);
}

/* Gradient animation */
.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradient 4s ease infinite;
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

/* Smooth transitions */
* {
  transition: all 0.2s ease;
}
</style>