<template>
  <UTooltipProvider>
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
    <UButton
      v-if="downloadStats.total > 0 && !uiStore.showDownloadQueue"
      @click="() => { uiStore.showDownloadQueue = true }"
      :icon="downloadStats.active ? 'i-heroicons-arrow-path' : 'i-heroicons-cloud-arrow-down'"
      color="primary"
      class="fixed bottom-6 right-6 hover:scale-105 transition-transform"
      size="xl"
    >
      <UBadge
        :value="downloadStats.total"
        color="error"
        position="top-right"
      />
      <div v-if="downloadStats.active > 0" class="absolute inset-0 flex items-center justify-center">
        <UProgress
          class="w-12 h-12"
          :value="downloadStats.activeProgress"
          circle
        />
      </div>
    </UButton>
  </UTooltipProvider>
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
