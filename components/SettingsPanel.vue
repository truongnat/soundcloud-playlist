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
          <p class="text-xs text-gray-400">Configure application preferences</p>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
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
        <button
          @click="exportSettings"
          class="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded transition-colors"
          title="Export settings"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Settings Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      
      <!-- Performance Settings -->
      <div class="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
        <h3 class="text-md font-medium text-gray-200 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Performance Settings
        </h3>
        
        <div class="space-y-4">
          <!-- Max Concurrent Downloads -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Max Concurrent Downloads
            </label>
            <select
              v-model="localSettings.maxConcurrentDownloads"
              @change="updateSettings"
              class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="1">1 (Conservative)</option>
              <option value="2">2 (Balanced)</option>
              <option value="3">3 (Recommended)</option>
              <option value="4">4 (Aggressive)</option>
              <option value="5">5 (Maximum)</option>
            </select>
            <p class="text-xs text-gray-400 mt-1">Higher values may improve speed but use more resources</p>
          </div>

          <!-- Audio Quality -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Audio Quality
            </label>
            <select
              v-model="localSettings.audioQuality"
              @change="updateSettings"
              class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="128">128 kbps (Good)</option>
              <option value="192">192 kbps (Better)</option>
              <option value="256">256 kbps (High)</option>
              <option value="320">320 kbps (Best)</option>
            </select>
            <p class="text-xs text-gray-400 mt-1">Higher quality results in larger file sizes</p>
          </div>

          <!-- Compression Preset -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Compression Preset
            </label>
            <select
              v-model="localSettings.compressionPreset"
              @change="updateSettings"
              class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ultrafast">Ultra Fast (Lower Quality)</option>
              <option value="fast">Fast (Good Quality)</option>
              <option value="medium">Medium (Better Quality)</option>
              <option value="slow">Slow (Best Quality)</option>
            </select>
            <p class="text-xs text-gray-400 mt-1">Slower presets provide better compression</p>
          </div>

          <!-- Multi-threading Toggle -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Multi-threading</label>
              <p class="text-xs text-gray-400">Enable parallel processing for faster downloads</p>
            </div>
            <div class="relative">
              <input
                type="checkbox"
                v-model="localSettings.enableMultiThreading"
                @change="updateSettings"
                class="sr-only"
                id="multithreading-toggle"
              />
              <label for="multithreading-toggle" class="cursor-pointer">
                <div class="w-10 h-6 bg-gray-600 rounded-full shadow-inner transition-colors"
                     :class="{ 'bg-blue-500': localSettings.enableMultiThreading }"></div>
                <div class="absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1 transition-transform"
                     :class="{ 'translate-x-4': localSettings.enableMultiThreading }"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Download Settings -->
      <div class="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
        <h3 class="text-md font-medium text-gray-200 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Download Settings
        </h3>
        
        <div class="space-y-4">
          <!-- Auto-start Downloads -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Auto-start Downloads</label>
              <p class="text-xs text-gray-400">Automatically start downloads when tracks are added</p>
            </div>
            <div class="relative">
              <input
                type="checkbox"
                v-model="localSettings.autoStartDownloads"
                @change="updateSettings"
                class="sr-only"
                id="autostart-toggle"
              />
              <label for="autostart-toggle" class="cursor-pointer">
                <div class="w-10 h-6 bg-gray-600 rounded-full shadow-inner transition-colors"
                     :class="{ 'bg-green-500': localSettings.autoStartDownloads }"></div>
                <div class="absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1 transition-transform"
                     :class="{ 'translate-x-4': localSettings.autoStartDownloads }"></div>
              </label>
            </div>
          </div>

          <!-- Show Notifications -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Show Notifications</label>
              <p class="text-xs text-gray-400">Display notifications for completed downloads</p>
            </div>
            <div class="relative">
              <input
                type="checkbox"
                v-model="localSettings.showNotifications"
                @change="updateSettings"
                class="sr-only"
                id="notifications-toggle"
              />
              <label for="notifications-toggle" class="cursor-pointer">
                <div class="w-10 h-6 bg-gray-600 rounded-full shadow-inner transition-colors"
                     :class="{ 'bg-purple-500': localSettings.showNotifications }"></div>
                <div class="absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1 transition-transform"
                     :class="{ 'translate-x-4': localSettings.showNotifications }"></div>
              </label>
            </div>
          </div>

          <!-- Download Path -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Download Directory
            </label>
            <div class="flex gap-2">
              <input
                v-model="localSettings.downloadPath"
                @change="updateSettings"
                type="text"
                class="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="~/Downloads"
              />
              <button
                @click="selectDownloadPath"
                class="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
                title="Browse"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-1">Choose where downloaded files will be saved</p>
          </div>
        </div>
      </div>

      <!-- Interface Settings -->
      <div class="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
        <h3 class="text-md font-medium text-gray-200 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
          Interface Settings
        </h3>
        
        <div class="space-y-4">
          <!-- Theme -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Theme
            </label>
            <select
              v-model="localSettings.theme"
              @change="updateSettings"
              class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>

          <!-- Show Advanced Options -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Show Advanced Options</label>
              <p class="text-xs text-gray-400">Display advanced configuration options</p>
            </div>
            <div class="relative">
              <input
                type="checkbox"
                v-model="localSettings.showAdvancedOptions"
                @change="updateSettings"
                class="sr-only"
                id="advanced-toggle"
              />
              <label for="advanced-toggle" class="cursor-pointer">
                <div class="w-10 h-6 bg-gray-600 rounded-full shadow-inner transition-colors"
                     :class="{ 'bg-orange-500': localSettings.showAdvancedOptions }"></div>
                <div class="absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1 transition-transform"
                     :class="{ 'translate-x-4': localSettings.showAdvancedOptions }"></div>
              </label>
            </div>
          </div>

          <!-- Auto-save Settings -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Auto-save Settings</label>
              <p class="text-xs text-gray-400">Automatically save changes as you make them</p>
            </div>
            <div class="relative">
              <input
                type="checkbox"
                v-model="localSettings.autoSaveSettings"
                @change="updateSettings"
                class="sr-only"
                id="autosave-toggle"
              />
              <label for="autosave-toggle" class="cursor-pointer">
                <div class="w-10 h-6 bg-gray-600 rounded-full shadow-inner transition-colors"
                     :class="{ 'bg-blue-500': localSettings.autoSaveSettings }"></div>
                <div class="absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1 transition-transform"
                     :class="{ 'translate-x-4': localSettings.autoSaveSettings }"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
        <h3 class="text-md font-medium text-gray-200 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Actions
        </h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            @click="applyOptimalSettings"
            class="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 justify-center"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Auto-Optimize
          </button>
          
          <button
            @click="clearCache"
            class="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 justify-center"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Cache
          </button>
        </div>
      </div>
    </div>

    <!-- Settings Footer -->
    <div class="p-4 border-t border-gray-700/50 bg-gray-900/30">
      <div class="flex items-center justify-between text-xs text-gray-400">
        <span>Settings auto-saved</span>
        <span>Last updated: {{ formatTime(lastUpdated) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { usePerformanceStore } from '@/stores/performance'
import { useLogger } from '@/composables/useLogger'

// Emit events
const emit = defineEmits<{
  close: []
}>()

// Stores and composables
const performanceStore = usePerformanceStore()
const logger = useLogger()

// Reactive state
const lastUpdated = ref(new Date())

// Default settings structure
const defaultSettings = {
  // Performance
  maxConcurrentDownloads: 3,
  audioQuality: 256,
  compressionPreset: 'medium',
  enableMultiThreading: true,
  
  // Download
  autoStartDownloads: true,
  showNotifications: true,
  downloadPath: '~/Downloads',
  
  // Interface
  theme: 'dark',
  showAdvancedOptions: false,
  autoSaveSettings: true
}

// Local settings state
const localSettings = ref({ ...defaultSettings })

// Watch for performance store settings changes
watch(() => performanceStore.settings, (newSettings) => {
  if (newSettings) {
    localSettings.value = { 
      ...localSettings.value,
      ...newSettings 
    }
  }
}, { immediate: true })

// Methods
const updateSettings = () => {
  // Update performance store settings
  performanceStore.updateSettings({
    maxConcurrentDownloads: localSettings.value.maxConcurrentDownloads,
    audioQuality: localSettings.value.audioQuality,
    compressionPreset: localSettings.value.compressionPreset,
    enableMultiThreading: localSettings.value.enableMultiThreading
  })
  
  // Save to localStorage for other settings
  localStorage.setItem('app-settings', JSON.stringify(localSettings.value))
  lastUpdated.value = new Date()
  
  logger.logSystem('Settings Updated', 'Application settings have been updated', 'success')
}

const applyOptimalSettings = () => {
  performanceStore.applyOptimalSettings()
  localSettings.value = { 
    ...localSettings.value, 
    ...performanceStore.settings 
  }
  lastUpdated.value = new Date()
  logger.logSystem('Optimal Settings Applied', 'Performance settings optimized automatically', 'success')
}

const resetToDefaults = () => {
  localSettings.value = { ...defaultSettings }
  updateSettings()
  logger.logSystem('Settings Reset', 'All settings have been reset to defaults', 'info')
}

const exportSettings = () => {
  const settingsBlob = new Blob([JSON.stringify(localSettings.value, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(settingsBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `soundcloud-downloader-settings-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  logger.logSystem('Settings Exported', 'Settings configuration exported successfully', 'success')
}

const selectDownloadPath = () => {
  // In a real implementation, this would open a directory picker
  // For now, we'll just show a placeholder
  logger.logSystem('Directory Picker', 'Directory picker would open here', 'info')
}

const clearCache = () => {
  // Clear various caches
  localStorage.removeItem('app-cache')
  sessionStorage.clear()
  
  logger.logSystem('Cache Cleared', 'Application cache has been cleared', 'success')
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Load settings from localStorage on mount
onMounted(() => {
  const savedSettings = localStorage.getItem('app-settings')
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings)
      localSettings.value = { ...defaultSettings, ...parsed }
    } catch (error) {
      console.error('Failed to load saved settings:', error)
    }
  }
  
  logger.logSystem('Settings Panel', 'Settings panel initialized', 'info')
})
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

/* Smooth transitions for toggles */
.transition-transform {
  transition: transform 0.2s ease-in-out;
}

.transition-colors {
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}

/* Focus styles for accessibility */
select:focus,
input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Hover effects for buttons */
button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}
</style>