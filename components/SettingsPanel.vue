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
      </div>
    </div>

    <!-- Settings Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      
      <!-- Performance Settings - Coming Soon -->
      <div class="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30 opacity-50">
        <h3 class="text-md font-medium text-gray-200 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Performance Settings
          <span class="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">Coming Soon</span>
        </h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Max Concurrent Downloads
            </label>
            <select disabled class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed">
              <option>3 (Recommended)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Audio Quality
            </label>
            <select disabled class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed">
              <option>256 kbps (High)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Compression Preset
            </label>
            <select disabled class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed">
              <option>Medium (Better Quality)</option>
            </select>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Multi-threading</label>
              <p class="text-xs text-gray-400">Enable parallel processing for faster downloads</p>
            </div>
            <div class="relative">
              <div class="w-10 h-6 bg-gray-600 rounded-full shadow-inner"></div>
              <div class="absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xs text-gray-500 font-medium">Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Download Settings - Coming Soon -->
      <div class="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30 opacity-50">
        <h3 class="text-md font-medium text-gray-200 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Download Settings
          <span class="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Coming Soon</span>
        </h3>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Auto-start Downloads</label>
              <p class="text-xs text-gray-400">Automatically start downloads when tracks are added</p>
            </div>
            <div class="relative">
              <div class="w-10 h-6 bg-gray-600 rounded-full shadow-inner"></div>
              <div class="absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xs text-gray-500 font-medium">Soon</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Show Notifications</label>
              <p class="text-xs text-gray-400">Display notifications for completed downloads</p>
            </div>
            <div class="relative">
              <div class="w-10 h-6 bg-gray-600 rounded-full shadow-inner"></div>
              <div class="absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xs text-gray-500 font-medium">Soon</span>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Download Directory
            </label>
            <div class="flex gap-2">
              <input
                disabled
                type="text"
                value="~/Downloads"
                class="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
                placeholder="~/Downloads"
              />
              <button
                disabled
                class="px-3 py-2 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed"
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

      <!-- Interface Settings - Coming Soon -->
      <div class="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30 opacity-50">
        <h3 class="text-md font-medium text-gray-200 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
          Interface Settings
          <span class="ml-auto text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">Coming Soon</span>
        </h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Theme
            </label>
            <select disabled class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed">
              <option>Dark</option>
            </select>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Show Advanced Options</label>
              <p class="text-xs text-gray-400">Display advanced configuration options</p>
            </div>
            <div class="relative">
              <div class="w-10 h-6 bg-gray-600 rounded-full shadow-inner"></div>
              <div class="absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xs text-gray-500 font-medium">Soon</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Auto-save Settings</label>
              <p class="text-xs text-gray-400">Automatically save changes as you make them</p>
            </div>
            <div class="relative">
              <div class="w-10 h-6 bg-gray-600 rounded-full shadow-inner"></div>
              <div class="absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xs text-gray-500 font-medium">Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
        <h3 class="text-sm font-medium text-gray-200 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Actions
        </h3>
        
        <div class="space-y-2">
          <button
            disabled
            class="w-full px-3 py-2 bg-gray-600 text-gray-400 rounded-md cursor-not-allowed flex items-center gap-2 text-sm opacity-50"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Auto-Optimize</span>
            <span class="ml-auto text-xs bg-gray-500/30 px-1.5 py-0.5 rounded">Soon</span>
          </button>
          
          <button
            @click="clearCache"
            class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center gap-2 text-sm"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Clear Cache</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Settings Footer -->
    <div class="p-4 border-t border-gray-700/50 bg-gray-900/30">
      <div class="flex items-center justify-between text-xs text-gray-400">
        <span>Settings will be available soon</span>
        <span>v1.0.0</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Emit events
const emit = defineEmits<{
  close: []
}>()

// Reset to defaults (placeholder)
const resetToDefaults = () => {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    alert('Settings reset functionality will be available soon!')
  }
}

// Clear cache
const clearCache = () => {
  if (confirm('Are you sure you want to clear the application cache?')) {
    try {
      localStorage.removeItem('app-cache')
      localStorage.removeItem('track-cache')
      localStorage.removeItem('playlist-cache')
      sessionStorage.clear()
      
      // Show success message
      alert('Cache cleared successfully!')
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
</style>