import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    showDownloadQueue: false,
    shouldKeepQueueOpen: false // Chỉ lưu khi có download đang chạy
  }),

  persist: {
    key: 'ui-state',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    paths: ['shouldKeepQueueOpen'], // Chỉ persist trạng thái cần thiết
    serializer: {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    }
  },

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
      this.showDownloadQueue = false
      // Chỉ reset shouldKeepQueueOpen khi user chủ động đóng
      this.shouldKeepQueueOpen = false
    },

    // Đánh dấu cần giữ queue mở khi có download đang chạy
    markKeepQueueOpen() {
      this.shouldKeepQueueOpen = true
    },

    // Khôi phục trạng thái queue khi có download đang chạy
    restoreQueueIfNeeded() {
      if (this.shouldKeepQueueOpen) {
        this.showDownloadQueue = true
      }
    }
  }
})
