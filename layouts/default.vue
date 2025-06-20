<template>
  <UApp class="dark">
    <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 flex">
      <!-- Left Sidebar - Logging (placeholder for future) -->
      <aside class="w-80 bg-gray-900/50 border-r border-gray-700/50 flex-shrink-0">
        <div class="p-4 border-b border-gray-700/50">
          <h2 class="text-lg font-semibold text-gray-300">Activity Logs</h2>
          <p class="text-sm text-gray-500">Coming soon...</p>
        </div>
        <div class="p-4 space-y-2">
          <!-- Placeholder for logging content -->
          <div class="text-sm text-gray-500 italic">
            This panel will show:
            <ul class="mt-2 space-y-1 ml-4">
              <li>• Download progress</li>
              <li>• API requests</li>
              <li>• Error logs</li>
              <li>• System status</li>
            </ul>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Header -->
        <header class="backdrop-blur-md bg-gray-900/80 border-b border-gray-700/50 sticky top-0 z-40">
          <div class="px-6 h-16 flex items-center justify-between">
            <div class="flex items-center gap-8">
              <NuxtLink to="/" class="flex items-center gap-3 hover:scale-105 transition-transform">
                <svg class="w-7 h-7 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.5 0c-6.347 0-11.5 5.153-11.5 11.5 0 6.346 5.153 11.5 11.5 11.5 6.346 0 11.5-5.154 11.5-11.5 0-6.347-5.154-11.5-11.5-11.5zm0 21c-5.243 0-9.5-4.257-9.5-9.5s4.257-9.5 9.5-9.5 9.5 4.257 9.5 9.5-4.257 9.5-9.5 9.5z" />
                </svg>
                <h1 class="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  SoundCloud DL
                </h1>
              </NuxtLink>
              
              <nav class="flex items-center gap-6" role="navigation" aria-label="Main navigation">
                <NuxtLink 
                  to="/" 
                  class="text-gray-400 hover:text-orange-500 transition-all text-sm font-medium relative group"
                  active-class="text-orange-500"
                  aria-label="Go to playlist page"
                >
                  <span>Playlist</span>
                  <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </NuxtLink>
                <NuxtLink 
                  to="/track" 
                  class="text-gray-400 hover:text-orange-500 transition-all text-sm font-medium relative group"
                  active-class="text-orange-500"
                  aria-label="Go to single track page"
                >
                  <span>Single Track</span>
                  <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </NuxtLink>
              </nav>
            </div>
            
            <div class="flex items-center gap-4">
              <!-- Download Queue Toggle Button -->
              <button
                @click="toggleDownloadQueue"
                class="relative p-2 text-gray-400 hover:text-orange-500 transition-all hover:scale-110 rounded-lg hover:bg-gray-800/50"
                :class="{ 'text-orange-500': uiStore.showDownloadQueue }"
                aria-label="Toggle download queue"
              >
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                
                <!-- Download Count Badge -->
                <span v-if="downloadStats.total > 0"
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                  aria-hidden="true">
                  {{ downloadStats.total }}
                </span>
              </button>

              <!-- GitHub Link -->
              <a href="https://github.com/truongnat/playlist-soundcloud" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="text-gray-400 hover:text-orange-500 transition-all hover:scale-110 p-2 rounded-lg hover:bg-gray-800/50"
                 aria-label="View source code on GitHub">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 p-6 overflow-y-auto">
          <div class="max-w-6xl mx-auto">
            <slot />
          </div>
        </main>
      </div>

      <!-- Right Sidebar - Download Queue -->
      <Transition name="slide-right">
        <aside v-if="uiStore.showDownloadQueue"
          class="w-[420px] bg-gray-900/50 border-l border-gray-700/50 flex-shrink-0 flex flex-col"
          role="complementary"
          aria-label="Download queue">
          
          <!-- Download Queue Header -->
          <div class="p-4 border-b border-gray-700/50 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <h2 class="text-lg font-semibold text-gray-200">Download Queue</h2>
              <span v-if="downloadStats.total > 0" 
                class="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full">
                {{ downloadStats.total }}
              </span>
            </div>
            
            <button
              @click="toggleDownloadQueue"
              class="p-1.5 text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-800/50"
              aria-label="Close download queue">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Download Queue Content -->
          <div class="flex-1 overflow-hidden">
            <DownloadQueue 
              ref="downloadQueueRef" 
              @close="toggleDownloadQueue"
              @download-complete="handleDownloadComplete"
              @discard-all="handleDiscardAll" />
          </div>
        </aside>
      </Transition>

      <!-- Download Status Indicator (when queue is hidden) -->
      <Transition name="bounce">
        <button v-if="downloadStats.total > 0 && !uiStore.showDownloadQueue"
          @click="toggleDownloadQueue"
          class="fixed bottom-8 right-8 bg-orange-600 hover:bg-orange-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 z-30"
          :aria-label="`${downloadStats.total} downloads in queue. Click to open download queue.`">
          <div class="relative">
            <!-- Download Icon -->
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>

            <!-- Count Badge -->
            <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-medium rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5"
              aria-hidden="true">
              {{ downloadStats.total }}
            </span>

            <!-- Progress Ring -->
            <svg v-if="downloadStats.active > 0" 
              class="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 32 32"
              aria-hidden="true">
              <circle cx="16" cy="16" r="14" 
                stroke="currentColor" 
                stroke-width="2.5" 
                fill="none" 
                class="opacity-30" />
              <circle cx="16" cy="16" r="14" 
                stroke="currentColor" 
                stroke-width="2.5" 
                fill="none"
                :stroke-dasharray="87.96" 
                :stroke-dashoffset="87.96 - (87.96 * downloadStats.activeProgress / 100)"
                class="transition-all duration-300" />
            </svg>
          </div>
        </button>
      </Transition>

      <!-- Error Boundary for better error handling -->
      <NuxtErrorBoundary @error="handleError">
        <template #error="{ error, clearError }">
          <div class="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
            <div class="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-md mx-4">
              <h2 class="text-xl font-bold text-red-400 mb-4">Something went wrong</h2>
              <p class="text-gray-300 mb-4">{{ error.message || 'An unexpected error occurred' }}</p>
              <div class="flex gap-3">
                <button @click="clearError" 
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                  Try Again
                </button>
                <button @click="navigateTo('/')" 
                  class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors">
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </template>
      </NuxtErrorBoundary>
    </div>
  </UApp>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, computed, provide } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useDownloadQueueStore } from '@/stores/downloadQueue'
import type { Track } from '@/types'

// Enhanced error handling
const handleError = (error: Error) => {
  console.error('Layout error:', error)
  // You could also send to error tracking service here
}

const uiStore = useUIStore()
const downloadQueueStore = useDownloadQueueStore()
const downloadQueueRef = ref()

// Track download state
const downloadingTracks = ref<string[]>([])
const errorTracks = ref<Record<string, string>>({})

// Enhanced computed for download statistics with better performance
const downloadStats = computed(() => {
  const items = downloadQueueStore.queueItems
  const stats = {
    total: items.length,
    queued: 0,
    active: 0,
    completed: 0,
    activeProgress: 0
  }

  let totalProgress = 0
  let activeCount = 0

  for (const item of items) {
    switch (item.status) {
      case 'queued':
        stats.queued++
        break
      case 'downloading':
      case 'converting':
        stats.active++
        totalProgress += item.progress
        activeCount++
        break
      case 'completed':
        stats.completed++
        break
    }
  }

  if (activeCount > 0) {
    stats.activeProgress = Math.round(totalProgress / activeCount)
  }

  return stats
})

const toggleDownloadQueue = () => {
  uiStore.showDownloadQueue = !uiStore.showDownloadQueue
}

const handleDownloadTrack = async (track: Track) => {
  try {
    console.log('Adding track to queue:', track.title)
    const trackId = String(track.id)

    // Add to downloading state
    if (!downloadingTracks.value.includes(trackId)) {
      downloadingTracks.value.push(trackId)
    }

    // Add to queue store
    downloadQueueStore.addToQueue(track)

    // Wait for the next tick to ensure the download queue component is mounted
    await nextTick()
    if (downloadQueueRef.value?.addToQueue) {
      downloadQueueRef.value.addToQueue(track)
    } else {
      console.warn('downloadQueueRef is not available')
    }

    // Auto-open download queue if it's closed
    if (!uiStore.showDownloadQueue) {
      uiStore.showDownloadQueue = true
    }
  } catch (error) {
    console.error('Error handling download track:', error)
    errorTracks.value[String(track.id)] = 'Failed to add to download queue'
  }
}

const handleDownloadComplete = (trackId: string) => {
  // Remove from downloading state
  const index = downloadingTracks.value.indexOf(trackId)
  if (index > -1) {
    downloadingTracks.value.splice(index, 1)
  }
  
  // Remove from error state if exists
  delete errorTracks.value[trackId]
}

const handleDiscardAll = () => {
  // Clear downloading tracks state
  downloadingTracks.value.length = 0
  // Clear error tracks state
  Object.keys(errorTracks.value).forEach(key => delete errorTracks.value[key])
}

// Provide functionality to child components
provide('handleDownloadTrack', handleDownloadTrack)
provide('downloadingTracks', downloadingTracks)
provide('errorTracks', errorTracks)

// Enhanced lifecycle management
onMounted(() => {
  // Initialize any necessary state
  console.log('Layout mounted successfully')
})

// SEO and meta improvements
useHead({
  titleTemplate: '%s - SoundCloud DL',
  meta: [
    { name: 'description', content: 'Download SoundCloud playlists and tracks easily' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#1f2937' }
  ]
})
</script>

<style>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(55, 65, 81, 0.3);
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>