import { defineStore } from 'pinia'
import type { UIState } from '@/types'

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    showDownloadQueue: false,
    shouldKeepQueueOpen: false
  }),

  getters: {
    isQueueVisible: (state) => state.showDownloadQueue
  },

  actions: {
    toggleDownloadQueue() {
      this.showDownloadQueue = !this.showDownloadQueue
    },

    showQueue() {
      this.showDownloadQueue = true
    },

    hideQueue() {
      if (!this.shouldKeepQueueOpen) {
        this.showDownloadQueue = false
      }
    },

    // Đánh dấu cần giữ queue mở khi có download đang chạy
    markKeepQueueOpen() {
      this.shouldKeepQueueOpen = true
      this.showQueue()
    },

    // Reset trạng thái khi không còn download nào
    resetKeepQueueOpen() {
      this.shouldKeepQueueOpen = false
      this.hideQueue()
    }
  }
})
