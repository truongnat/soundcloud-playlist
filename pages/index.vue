<template>
  <UApp class="dark">
    <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <!-- Header -->
      <header class="backdrop-blur-md bg-gray-900/80 border-b border-gray-700/50 sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div class="flex items-center gap-8">
            <div class="flex items-center gap-3 hover:scale-105 transition-transform">
              <svg class="w-7 h-7 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M11.5 0c-6.347 0-11.5 5.153-11.5 11.5 0 6.346 5.153 11.5 11.5 11.5 6.346 0 11.5-5.154 11.5-11.5 0-6.347-5.154-11.5-11.5-11.5zm0 21c-5.243 0-9.5-4.257-9.5-9.5s4.257-9.5 9.5-9.5 9.5 4.257 9.5 9.5-4.257 9.5-9.5 9.5z" />
              </svg>
              <h1 class="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                SoundCloud DL
              </h1>
            </div>

            <nav class="flex items-center gap-6">
              <NuxtLink to="/"
                class="text-gray-400 hover:text-orange-500 transition-all text-sm font-medium relative group"
                active-class="text-orange-500">
                <span>Playlist</span>
                <span
                  class="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
              </NuxtLink>
              <NuxtLink to="/track"
                class="text-gray-400 hover:text-orange-500 transition-all text-sm font-medium relative group"
                active-class="text-orange-500">
                <span>Single Track</span>
                <span
                  class="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
              </NuxtLink>
            </nav>
          </div>

          <a href="https://github.com/truongnat/playlist-soundcloud" target="_blank" rel="noopener noreferrer"
            class="text-gray-400 hover:text-orange-500 transition-all hover:scale-110">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <NuxtPage />
      </main>

      <!-- Download Queue Sidebar -->
      <Transition name="slide">
        <aside v-if="uiStore.showDownloadQueue"
          class="w-[420px] border-l border-gray-700 bg-gray-800 fixed right-0 top-0 bottom-0 z-50">
          <DownloadQueue ref="downloadQueueRef" @close="() => uiStore.showDownloadQueue = false"
            @download-complete="handleDownloadComplete" @discard-all="handleDiscardAll" />
        </aside>
      </Transition>

      <!-- Backdrop -->
      <Transition name="fade">
        <div v-if="uiStore.showDownloadQueue" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          @click="() => uiStore.showDownloadQueue = false">
        </div>
      </Transition>

      <!-- Download Indicator -->
      <Transition name="bounce">
        <button v-if="downloadStats.total > 0 && !uiStore.showDownloadQueue"
          @click="() => uiStore.showDownloadQueue = true"
          class="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 z-30">
          <div class="relative">
            <!-- Download Icon -->
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>

            <!-- Count Badge -->
            <span
              class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-medium rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5">
              {{ downloadStats.total }}
            </span>

            <!-- Progress Ring -->
            <svg v-if="downloadStats.active > 0" class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="2.5" fill="none" class="opacity-30" />
              <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="2.5" fill="none"
                :stroke-dasharray="87.96" :stroke-dashoffset="87.96 - (87.96 * downloadStats.activeProgress / 100)"
                class="transition-all duration-300" />
            </svg>
          </div>
        </button>
      </Transition>
    </div>
  </UApp>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useDownloadQueueStore } from '@/stores/downloadQueue'
import type { Track } from '@/types'
import { usePlaylist } from "@/composables/usePlaylist"

const { tracks, loading, error, playlistInfo, fetchPlaylist } = usePlaylist()
const uiStore = useUIStore()
const downloadQueueStore = useDownloadQueueStore()
const downloadQueueRef = ref()
const trackListRef = ref()

// Track download state
const downloadingTracks = ref<string[]>([])
const errorTracks = ref<Record<string, string>>({})

// Computed cho download statistics
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

  items.forEach(item => {
    if (item.status === 'queued') stats.queued++
    else if (['downloading', 'converting'].includes(item.status)) {
      stats.active++
      totalProgress += item.progress
      activeCount++
    }
    else if (item.status === 'completed') stats.completed++
  })

  if (activeCount > 0) {
    stats.activeProgress = Math.round(totalProgress / activeCount)
  }

  return stats
})

const handleDownloadTrack = async (track: Track) => {
  console.log('Adding track to queue:', track.title)
  const trackId = String(track.id)

  // Add to downloading state
  downloadingTracks.value.push(trackId)

  // Add to queue store
  downloadQueueStore.addToQueue(track)

  // Wait for the next tick to ensure the download queue component is mounted
  await nextTick()
  if (downloadQueueRef.value) {
    downloadQueueRef.value.addToQueue(track)
  } else {
    console.warn('downloadQueueRef is not available')
  }
}

const handleDownloadComplete = (trackId: string) => {
  // Remove from downloading state
  const index = downloadingTracks.value.indexOf(trackId)
  if (index !== -1) {
    downloadingTracks.value.splice(index, 1)
  }

  // Remove from error state if exists
  if (errorTracks.value[trackId]) {
    delete errorTracks.value[trackId]
  }
}

const handleDiscardAll = () => {
  // Clear downloading tracks state
  downloadingTracks.value = []
  // Clear error tracks state
  errorTracks.value = {}
}

const handleDownloadAll = async () => {
  if (!tracks.value) return;

  // Filter out tracks that are already being downloaded or have errors
  const tracksToDownload = tracks.value.filter(track => {
    const trackId = track.id.toString();
    return !downloadingTracks.value.includes(trackId) && !errorTracks.value[trackId];
  });

  // Show the download queue
  uiStore.showDownloadQueue = true;

  // Add all tracks to the queue
  for (const track of tracksToDownload) {
    await handleDownloadTrack(track);
    // Add a small delay between each track to prevent overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Khôi phục trạng thái queue khi mount
onMounted(() => {
  // Kiểm tra nếu có download đang chạy hoặc queued thì không mở panel tự động
  // Chỉ hiển thị indicator
})
</script>

<style>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
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
</style>
