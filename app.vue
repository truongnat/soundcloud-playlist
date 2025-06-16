<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <UHeader class="backdrop-blur border-b border-gray-200">
      <template #left>
        <div class="flex items-center space-x-3">
          <UIcon name="i-heroicons-musical-note" class="w-8 h-8 text-orange-500" />
          <h1 class="text-xl font-bold text-gray-900">SoundCloud Playlist</h1>
        </div>
      </template>
      <template #right>
        <UTooltip text="View source on GitHub">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-code-bracket"
            to="https://github.com/your-username/playlist-soundcloud"
            target="_blank"
          />
        </UTooltip>
      </template>
    </UHeader>

    <!-- Main Content -->
    <div class="flex-1 flex">
      <!-- Main Area -->
      <div class="flex-1 min-w-0 py-6">
        <PlaylistInput @fetch-playlist="fetchPlaylist" :loading="loading" />
        <TrackList
          ref="trackListRef"
          :tracks="tracks"
          :loading="loading"
          :error="error"
          :playlist-title="playlistInfo.title"
          :playlist-description="playlistInfo.description"
          :playlist-artwork="playlistInfo.artwork"
          @download-track="handleDownloadTrack"
          @download-all="handleDownloadAll"
        />
      </div>

      <!-- Download Queue Sidebar -->
      <USlideover
        v-model="uiStore.showDownloadQueue"
        :width="450"
      >
        <DownloadQueue
          ref="downloadQueueRef"
          @close="() => uiStore.showDownloadQueue = false"
          @download-complete="handleDownloadComplete"
        />
      </USlideover>
    </div>
  </div>

      <!-- Floating Download Indicator -->
      <Transition name="bounce">
        <div v-if="downloadStats.total > 0 && !uiStore.showDownloadQueue"
          @click="() => uiStore.showDownloadQueue = true"
          class="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 z-30"
          title="Open download queue"
        >
          <div class="relative">
            <!-- Download Icon -->
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>

            <!-- Badge với số lượng -->
            <div class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
              {{ downloadStats.total }}
            </div>

            <!-- Progress ring cho active downloads -->
            <div v-if="downloadStats.active > 0" class="absolute inset-0 -m-1">
              <svg class="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
                <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="2" fill="none"
                  stroke-dasharray="87.96"
                  :stroke-dashoffset="87.96 - (87.96 * downloadStats.activeProgress / 100)"
                  class="transition-all duration-300"/>
              </svg>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, computed } from 'vue'
import { usePlaylist } from './composables/usePlaylist'
import { useUIStore } from '@/stores/ui'
import { useDownloadQueueStore } from '@/stores/downloadQueue'
import type { Track } from '@/types'

const { tracks, loading, error, playlistInfo, fetchPlaylist } = usePlaylist()
const uiStore = useUIStore()
const downloadQueueStore = useDownloadQueueStore()
const downloadQueueRef = ref()
const trackListRef = ref()

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

// Khôi phục trạng thái queue khi mount
onMounted(() => {
  // Kiểm tra nếu có download đang chạy hoặc queued thì không mở panel tự động
  // Chỉ hiển thị indicator
})

const handleDownloadTrack = async (track: Track) => {
  console.log('Adding track to queue:', track.title)

  // Thêm track vào queue store (không tự động mở panel)
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
  if (trackListRef.value) {
    trackListRef.value.handleDownloadComplete(trackId)
  }
}

const handleDownloadAll = async (tracks: Track[]) => {
  console.log('Adding all tracks to queue:', tracks.length)

  // Thêm tất cả tracks vào queue store (không tự động mở panel)
  for (const track of tracks) {
    downloadQueueStore.addToQueue(track)
  }

  // Wait for the next tick to ensure the download queue component is mounted
  await nextTick()
  if (downloadQueueRef.value) {
    tracks.forEach(track => {
      downloadQueueRef.value.addToQueue(track)
    })
  } else {
    console.warn('downloadQueueRef is not available')
  }
}
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
