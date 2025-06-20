import { defineStore } from 'pinia'

export interface LogEntry {
  id: string
  timestamp: Date
  type: 'download' | 'api' | 'error' | 'system'
  level: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  details?: any
  progress?: number
}

export const useLogsStore = defineStore('logs', {
  state: () => ({
    logs: [] as LogEntry[],
    maxLogs: 100, // Giới hạn số lượng logs để tránh memory leak
    filters: {
      download: true,
      api: true,
      error: true,
      system: true
    }
  }),

  getters: {
    filteredLogs: (state) => {
      return state.logs
        .filter(log => state.filters[log.type])
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    },

    downloadLogs: (state) => {
      return state.logs.filter(log => log.type === 'download')
    },

    errorLogs: (state) => {
      return state.logs.filter(log => log.type === 'error')
    },

    recentLogs: (state) => {
      return state.logs
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 20)
    },

    logStats: (state) => {
      const stats = {
        total: state.logs.length,
        download: 0,
        api: 0,
        error: 0,
        system: 0
      }

      state.logs.forEach(log => {
        stats[log.type]++
      })

      return stats
    }
  },

  actions: {
    addLog(log: Omit<LogEntry, 'id' | 'timestamp'>) {
      const newLog: LogEntry = {
        ...log,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      }

      this.logs.unshift(newLog)

      // Giới hạn số lượng logs
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(0, this.maxLogs)
      }
    },

    // Download progress logs
    logDownloadStart(trackTitle: string, trackId: string) {
      this.addLog({
        type: 'download',
        level: 'info',
        title: 'Download Started',
        message: `Starting download: ${trackTitle}`,
        details: { trackId, trackTitle }
      })
    },

    logDownloadProgress(trackTitle: string, progress: number) {
      // Tìm log download hiện tại và cập nhật progress
      const existingLogIndex = this.logs.findIndex(
        log => log.type === 'download' && 
               log.details?.trackTitle === trackTitle && 
               log.title === 'Download Progress'
      )

      if (existingLogIndex !== -1) {
        this.logs[existingLogIndex].progress = progress
        this.logs[existingLogIndex].message = `Downloading: ${trackTitle} (${progress}%)`
        this.logs[existingLogIndex].timestamp = new Date()
      } else {
        this.addLog({
          type: 'download',
          level: 'info',
          title: 'Download Progress',
          message: `Downloading: ${trackTitle} (${progress}%)`,
          progress,
          details: { trackTitle }
        })
      }
    },

    logDownloadComplete(trackTitle: string) {
      this.addLog({
        type: 'download',
        level: 'success',
        title: 'Download Complete',
        message: `Successfully downloaded: ${trackTitle}`,
        details: { trackTitle }
      })
    },

    logDownloadError(trackTitle: string, error: string) {
      this.addLog({
        type: 'download',
        level: 'error',
        title: 'Download Failed',
        message: `Failed to download: ${trackTitle}`,
        details: { trackTitle, error }
      })
    },

    // API request logs
    logApiRequest(method: string, url: string, status?: number) {
      this.addLog({
        type: 'api',
        level: status && status >= 400 ? 'error' : 'info',
        title: 'API Request',
        message: `${method.toUpperCase()} ${url}${status ? ` - ${status}` : ''}`,
        details: { method, url, status }
      })
    },

    // Error logs
    logError(title: string, message: string, error?: any) {
      this.addLog({
        type: 'error',
        level: 'error',
        title,
        message,
        details: error
      })
    },

    // System logs
    logSystem(title: string, message: string, level: 'info' | 'warning' | 'success' = 'info') {
      this.addLog({
        type: 'system',
        level,
        title,
        message
      })
    },

    // Utility actions
    clearLogs() {
      this.logs = []
    },

    clearLogsByType(type: LogEntry['type']) {
      this.logs = this.logs.filter(log => log.type !== type)
    },

    toggleFilter(type: keyof typeof this.filters) {
      this.filters[type] = !this.filters[type]
    },

    exportLogs() {
      const logsData = {
        exported_at: new Date().toISOString(),
        logs: this.logs
      }
      
      const blob = new Blob([JSON.stringify(logsData, null, 2)], { 
        type: 'application/json' 
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `soundcloud-dl-logs-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }
})