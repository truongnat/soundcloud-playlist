import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    showDownloadQueue: false,
    shouldKeepQueueOpen: false // Chỉ lưu khi có download đang chạy
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
    },

    // Reset trạng thái khi không còn download nào
    resetKeepQueueOpen() {
      this.shouldKeepQueueOpen = false
    },

    // Kiểm tra và cleanup localStorage khi cần
    checkAndCleanup() {
      if (typeof window !== 'undefined') {
        // Nếu không còn download nào đang chạy, clear localStorage
        const downloadQueueData = localStorage.getItem('download-queue')
        if (downloadQueueData) {
          try {
            const data = JSON.parse(downloadQueueData)
            const hasActiveDownloads = data.queue && Object.values(data.queue).some((item: any) =>
              ['downloading', 'converting', 'queued'].includes(item.status)
            )

            if (!hasActiveDownloads) {
              localStorage.removeItem('download-queue')
              this.shouldKeepQueueOpen = false
            }
          } catch (error) {
            console.warn('Error checking download queue data:', error)
          }
        }
      }
    }
  }
})
