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
      
      <!-- Permissions Settings -->
      <div class="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
        <h3 class="text-md font-medium text-gray-200 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Browser Permissions
        </h3>
        
        <div class="space-y-4">
          <!-- Permission Status -->
          <div class="bg-gray-900/30 rounded-lg p-3 border border-gray-600/30">
            <h4 class="text-sm font-medium text-gray-200 mb-2">Current Status</h4>
            <div class="space-y-1 text-xs">
              <div v-for="message in permissionMessages" :key="message" 
                   class="flex items-center gap-2"
                   :class="{
                     'text-green-400': message.includes('✓'),
                     'text-red-400': message.includes('✗'),
                     'text-yellow-400': message.includes('?')
                   }">
                <span>{{ message }}</span>
              </div>
            </div>
          </div>

          <!-- Permission Actions -->
          <div class="grid grid-cols-1 gap-2">
            <button
              @click="requestDownloadPermissions"
              :disabled="isRequestingPermissions"
              class="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center gap-2 text-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <span v-if="isRequestingPermissions">Requesting...</span>
              <span v-else>Request Download Permissions</span>
            </button>

            <button
              @click="requestDirectoryAccess"
              :disabled="isRequestingPermissions || !isFileSystemAccessSupported"
              class="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center gap-2 text-sm"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span v-if="!isFileSystemAccessSupported">Directory Access (Not Supported)</span>
              <span v-else-if="isRequestingPermissions">Requesting...</span>
              <span v-else>Request Directory Access</span>
            </button>
          </div>

          <!-- Permission Info -->
          <div class="p-2 bg-blue-900/20 border border-blue-700/30 rounded-md">
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-xs text-blue-300">
                <p class="font-medium mb-1">Permission Benefits:</p>
                <ul class="space-y-1 text-blue-200/80">
                  <li>• Download multiple files without browser blocking</li>
                  <li>• Save files directly to your chosen directory</li>
                  <li>• Better download experience with fewer interruptions</li>
                </ul>
              </div>
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
          <!-- Download Path -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Download Directory
            </label>
            <div class="flex gap-2">
              <input
                v-model="downloadPath"
                @change="updateDownloadPath"
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
            
            <!-- Download Path Info -->
            <div class="mt-2 p-3 bg-amber-900/20 border border-amber-700/30 rounded-md">
              <div class="flex items-start gap-2">
                <svg class="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div class="text-xs text-amber-200">
                  <p class="font-medium mb-2 text-amber-100">⚠️ Browser Security Limitation:</p>
                  <div class="space-y-2 text-amber-200/90">
                    <p><strong>Current behavior:</strong> Files will always download to your browser's default download folder due to security restrictions.</p>
                    <p><strong>This path setting:</strong> For reference only - shows your preferred organization folder.</p>
                    <div class="mt-2 p-2 bg-amber-800/20 rounded border-l-2 border-amber-500">
                      <p class="font-medium text-amber-100 mb-1">💡 Recommended workflow:</p>
                      <ol class="space-y-1 text-xs">
                        <li>1. Files download to browser's default folder</li>
                        <li>2. Manually move/organize files to: <code class="bg-amber-800/40 px-1 rounded">{{ downloadPath }}</code></li>
                        <li>3. Or set up browser to ask download location each time</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Coming Soon Features -->
          <div class="space-y-3 opacity-50">
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
          </div>
        </div>
      </div>

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
            @click="openDownloadsFolder"
            class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2 text-sm"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>Open Downloads Folder</span>
          </button>
          
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
        <span>{{ hasChanges ? 'Unsaved changes' : 'Settings saved' }}</span>
        <span>Last updated: {{ formatTime(lastUpdated) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePermissions } from '@/composables/usePermissions'

// Emit events
const emit = defineEmits<{
  close: []
}>()

// Composables
const {
  downloadPermission,
  directoryPermission,
  isFileSystemAccessSupported,
  requestDownloadPermission,
  requestDirectoryPermission,
  getPermissionStatusMessage
} = usePermissions()

// Reactive state
const downloadPath = ref('~/Downloads')
const lastUpdated = ref(new Date())
const hasChanges = ref(false)
const isRequestingPermissions = ref(false)
const selectedDirectoryHandle = ref<FileSystemDirectoryHandle | null>(null)

// Computed
const permissionMessages = computed(() => getPermissionStatusMessage())

// Load settings from localStorage
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('download-settings')
    if (saved) {
      const settings = JSON.parse(saved)
      downloadPath.value = settings.downloadPath || '~/Downloads'
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

// Save settings to localStorage
const saveSettings = () => {
  try {
    const settings = {
      downloadPath: downloadPath.value
    }
    localStorage.setItem('download-settings', JSON.stringify(settings))
    lastUpdated.value = new Date()
    hasChanges.value = false
    console.log('Settings saved:', settings)
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

// Update download path
const updateDownloadPath = () => {
  hasChanges.value = true
  saveSettings()
}

// Select download path using file picker
const selectDownloadPath = async () => {
  try {
    // Try to use the modern File System Access API
    if ('showDirectoryPicker' in window) {
      const dirHandle = await (window as any).showDirectoryPicker()
      downloadPath.value = dirHandle.name
      updateDownloadPath()
    } else {
      // Fallback: prompt for path
      const path = prompt('Enter download path:', downloadPath.value)
      if (path && path.trim()) {
        downloadPath.value = path.trim()
        updateDownloadPath()
      }
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Failed to select download path:', error)
      // Fallback to prompt
      const path = prompt('Enter download path:', downloadPath.value)
      if (path && path.trim()) {
        downloadPath.value = path.trim()
        updateDownloadPath()
      }
    }
  }
}

// Reset to defaults
const resetToDefaults = () => {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    downloadPath.value = '~/Downloads'
    updateDownloadPath()
  }
}

// Request download permissions
const requestDownloadPermissions = async () => {
  isRequestingPermissions.value = true
  try {
    const granted = await requestDownloadPermission()
    if (granted) {
      alert('Download permissions granted! You can now download multiple files without interruption.')
    } else {
      alert('Download permissions were not granted. Some browsers may still block multiple downloads.')
    }
  } catch (error) {
    console.error('Failed to request download permissions:', error)
    alert('Failed to request download permissions. Please check your browser settings.')
  } finally {
    isRequestingPermissions.value = false
  }
}

// Request directory access
const requestDirectoryAccess = async () => {
  isRequestingPermissions.value = true
  try {
    const dirHandle = await requestDirectoryPermission()
    if (dirHandle) {
      selectedDirectoryHandle.value = dirHandle
      downloadPath.value = dirHandle.name
      updateDownloadPath()
      alert(`Directory access granted! Files can now be saved to: ${dirHandle.name}`)
    } else {
      alert('Directory access was not granted or cancelled.')
    }
  } catch (error) {
    console.error('Failed to request directory access:', error)
    alert('Failed to request directory access. This feature may not be supported in your browser.')
  } finally {
    isRequestingPermissions.value = false
  }
}

// Open downloads folder
const openDownloadsFolder = () => {
  try {
    // Try to open downloads folder using different methods
    if (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Edge')) {
      // For Chrome/Edge, open downloads page
      window.open('chrome://downloads/', '_blank')
    } else if (navigator.userAgent.includes('Firefox')) {
      // For Firefox, open downloads page
      window.open('about:downloads', '_blank')
    } else {
      // Fallback: show instructions
      alert('To access your downloads:\n\n' +
            '• Chrome/Edge: chrome://downloads/\n' +
            '• Firefox: Ctrl+Shift+Y or about:downloads\n' +
            '• Safari: Option+Cmd+L\n' +
            '• Or check your browser\'s Downloads menu')
    }
  } catch (error) {
    console.error('Failed to open downloads folder:', error)
    alert('Unable to open downloads folder automatically.\nPlease check your browser\'s Downloads menu or press Ctrl+J (Cmd+J on Mac).')
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

// Format time
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Initialize on mount
onMounted(() => {
  loadSettings()
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