import { useLogsStore } from '@/stores/logs'

export const useLogger = () => {
  const logsStore = useLogsStore()

  // System logging
  const logAppStart = () => {
    logsStore.logSystem('Application Started', 'SoundCloud DL application initialized', 'success')
  }

  const logPlaylistLoad = (playlistUrl: string, trackCount: number) => {
    logsStore.logSystem(
      'Playlist Loaded',
      `Loaded playlist with ${trackCount} tracks`,
      'success'
    )
    logsStore.logApiRequest('GET', playlistUrl, 200)
  }

  const logPlaylistError = (playlistUrl: string, error: string) => {
    logsStore.logError('Playlist Load Failed', `Failed to load playlist: ${error}`)
    logsStore.logApiRequest('GET', playlistUrl, 400)
  }

  // Download logging
  const logDownloadStart = (trackTitle: string, trackId: string) => {
    logsStore.logDownloadStart(trackTitle, trackId)
  }

  const logDownloadProgress = (trackTitle: string, progress: number) => {
    logsStore.logDownloadProgress(trackTitle, progress)
  }

  const logDownloadComplete = (trackTitle: string) => {
    logsStore.logDownloadComplete(trackTitle)
  }

  const logDownloadError = (trackTitle: string, error: string) => {
    logsStore.logDownloadError(trackTitle, error)
  }

  const logDownloadQueueStart = (trackCount: number) => {
    logsStore.logSystem(
      'Batch Download Started',
      `Starting download of ${trackCount} tracks`,
      'info'
    )
  }

  const logDownloadQueueComplete = (successCount: number, totalCount: number) => {
    const level = successCount === totalCount ? 'success' : 'warning'
    logsStore.logSystem(
      'Batch Download Complete',
      `Downloaded ${successCount}/${totalCount} tracks successfully`,
      level
    )
  }

  // API logging
  const logApiRequest = (method: string, url: string, status?: number, responseTime?: number) => {
    const message = `${method.toUpperCase()} ${url}${status ? ` - ${status}` : ''}${responseTime ? ` (${responseTime}ms)` : ''}`
    logsStore.logApiRequest(method, url, status)
  }

  const logApiError = (method: string, url: string, error: string, status?: number) => {
    logsStore.logError(
      'API Request Failed',
      `${method.toUpperCase()} ${url} failed: ${error}`,
      { method, url, error, status }
    )
  }

  // Error logging
  const logError = (title: string, message: string, error?: any) => {
    logsStore.logError(title, message, error)
  }

  const logValidationError = (field: string, value: string, reason: string) => {
    logsStore.logError(
      'Validation Error',
      `Invalid ${field}: ${reason}`,
      { field, value, reason }
    )
  }

  const logNetworkError = (url: string, error: string) => {
    logsStore.logError(
      'Network Error',
      `Failed to connect to ${url}: ${error}`,
      { url, error }
    )
  }

  // System status logging
  const logSystemStatus = (component: string, status: 'online' | 'offline' | 'error', message?: string) => {
    // Map 'error' to 'warning' since 'logSystem' does not accept 'error' as a level
    const level: 'info' | 'warning' | 'success' =
      status === 'online'
        ? 'success'
        : status === 'offline'
          ? 'warning'
          : 'warning'
    logsStore.logSystem(
      `${component} Status`,
      message || `${component} is ${status}`,
      level
    )
  }

  const logMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      logsStore.logSystem(
        'Memory Usage',
        `Used: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB / Total: ${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        'info'
      )
    }
  }

  const logUserAction = (action: string, details?: any) => {
    logsStore.logSystem(
      'User Action',
      action,
      'info'
    )
  }

  // Utility functions
  const clearLogs = () => {
    logsStore.clearLogs()
    logsStore.logSystem('Logs Cleared', 'All logs have been cleared', 'info')
  }

  const exportLogs = () => {
    logsStore.exportLogs()
    logsStore.logSystem('Logs Exported', 'Logs have been exported to file', 'success')
  }

  // Auto-logging for common scenarios
  const setupAutoLogging = () => {
    // Log unhandled errors
    window.addEventListener('error', (event) => {
      logError(
        'Unhandled Error',
        event.message,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        }
      )
    })

    // Log unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      logError(
        'Unhandled Promise Rejection',
        event.reason?.message || 'Promise rejected',
        event.reason
      )
    })

    // Log page visibility changes
    document.addEventListener('visibilitychange', () => {
      const status = document.hidden ? 'hidden' : 'visible'
      logsStore.logSystem('Page Visibility', `Page is now ${status}`, 'info')
    })

    // Log memory usage periodically (every 5 minutes)
    setInterval(() => {
      logMemoryUsage()
    }, 5 * 60 * 1000)
  }

  return {
    // System
    logAppStart,
    logPlaylistLoad,
    logPlaylistError,
    logSystemStatus,
    logMemoryUsage,
    logUserAction,

    // Downloads
    logDownloadStart,
    logDownloadProgress,
    logDownloadComplete,
    logDownloadError,
    logDownloadQueueStart,
    logDownloadQueueComplete,

    // API
    logApiRequest,
    logApiError,

    // Errors
    logError,
    logValidationError,
    logNetworkError,

    // Utilities
    clearLogs,
    exportLogs,
    setupAutoLogging
  }
}