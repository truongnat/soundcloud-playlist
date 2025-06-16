import { defineStore } from 'pinia'
import type { Track, QueueItem } from '@/types'

export const useDownloadQueueStore = defineStore('downloadQueue', {
  state: () => ({
    queue: {} as Record<string, QueueItem>
  }),

  getters: {
    queueItems: (state) => Object.values(state.queue),
    hasActiveDownloads: (state) => 
      Object.values(state.queue).some(item => 
        ['downloading', 'converting'].includes(item.status)
      ),
    activeCount: (state) =>
      Object.values(state.queue).filter(item => 
        ['downloading', 'converting'].includes(item.status)
      ).length,
    hasCompletedDownloads: (state) =>
      Object.values(state.queue).some(item => item.status === 'completed'),
    queuedItems: (state) =>
      Object.values(state.queue).filter(item => item.status === 'queued')
  },

  actions: {
    addToQueue(track: Track) {
      const trackId = track.id.toString()
      console.log('Adding track to queue:', track.title)

      if (this.queue[trackId]) {
        if (this.queue[trackId].status === 'error') {
          // If track failed, allow retry by adding it again
          this.queue[trackId] = {
            track,
            status: 'queued',
            progress: 0,
            error: undefined
          }
        }
        return // Skip if already in queue
      }

      this.queue[trackId] = {
        track,
        status: 'queued',
        progress: 0,
        error: undefined
      }


    },

    removeFromQueue(trackId: string) {
      if (this.queue[trackId]?.status === 'queued') {
        const { [trackId]: removed, ...rest } = this.queue
        this.queue = rest
      }
    },

    clearCompleted() {
      this.queue = Object.entries(this.queue).reduce((acc, [id, item]) => {
        if (item.status !== 'completed') {
          acc[id] = item
        }
        return acc
      }, {} as Record<string, QueueItem>)
    },

    updateTrackProgress(trackId: string, progress: number) {
      if (this.queue[trackId]) {
        this.queue[trackId] = {
          ...this.queue[trackId],
          progress
        }
      }
    },

    updateTrackStatus(trackId: string, status: QueueItem['status'], error?: string) {
      if (this.queue[trackId]) {
        this.queue[trackId] = {
          ...this.queue[trackId],
          status,
          error
        }
      }
    },

    // Dừng và xóa toàn bộ queue
    discardAll() {
      // Đánh dấu tất cả downloads đang chạy là cancelled
      Object.keys(this.queue).forEach(trackId => {
        const item = this.queue[trackId]
        if (['downloading', 'converting'].includes(item.status)) {
          this.queue[trackId] = {
            ...item,
            status: 'error',
            error: 'Cancelled by user',
            progress: 0
          }
        }
      })

      // Sau đó xóa toàn bộ queue
      setTimeout(() => {
        this.queue = {}
      }, 100) // Delay nhỏ để UI có thể hiển thị trạng thái cancelled
    }
  }
})
