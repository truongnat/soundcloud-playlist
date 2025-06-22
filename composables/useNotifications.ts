import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export interface ToastNotification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

export const useNotifications = () => {
  const settingsStore = useSettingsStore()
  const toasts = ref<ToastNotification[]>([])
  
  // Audio context for notification sounds
  let audioContext: AudioContext | null = null
  
  const initAudioContext = () => {
    if (!audioContext && 'AudioContext' in window) {
      audioContext = new AudioContext()
    }
  }
  
  // Play notification sound
  const playNotificationSound = (type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    if (!settingsStore.notifications.sound) return
    
    try {
      initAudioContext()
      if (!audioContext) return
      
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Different frequencies for different notification types
      const frequencies = {
        success: [523.25, 659.25, 783.99], // C5, E5, G5
        error: [220, 185, 165], // A3, F#3, E3
        warning: [440, 554.37], // A4, C#5
        info: [523.25, 659.25] // C5, E5
      }
      
      const freq = frequencies[type]
      let noteIndex = 0
      
      const playNote = () => {
        if (noteIndex < freq.length) {
          oscillator.frequency.setValueAtTime(freq[noteIndex], audioContext!.currentTime)
          noteIndex++
          setTimeout(playNote, 150)
        } else {
          oscillator.stop()
        }
      }
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      oscillator.type = 'sine'
      oscillator.start()
      
      playNote()
    } catch (error) {
      console.warn('[Notifications] Failed to play sound:', error)
    }
  }
  
  // Show toast notification
  const showToast = (notification: Omit<ToastNotification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const toast: ToastNotification = {
      id,
      duration: 5000,
      ...notification
    }
    
    toasts.value.push(toast)
    
    // Play sound
    playNotificationSound(toast.type)
    
    // Auto-remove after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }
    
    return id
  }
  
  // Remove toast notification
  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  // Clear all toasts
  const clearAllToasts = () => {
    toasts.value.length = 0
  }
  
  // Show desktop notification
  const showDesktopNotification = async (title: string, options?: NotificationOptions) => {
    return await settingsStore.showNotification(title, options)
  }
  
  // Convenience methods for different notification types
  const success = (title: string, message: string, options?: Partial<ToastNotification>) => {
    return showToast({
      title,
      message,
      type: 'success',
      ...options
    })
  }
  
  const error = (title: string, message: string, options?: Partial<ToastNotification>) => {
    return showToast({
      title,
      message,
      type: 'error',
      duration: 8000, // Longer duration for errors
      ...options
    })
  }
  
  const warning = (title: string, message: string, options?: Partial<ToastNotification>) => {
    return showToast({
      title,
      message,
      type: 'warning',
      ...options
    })
  }
  
  const info = (title: string, message: string, options?: Partial<ToastNotification>) => {
    return showToast({
      title,
      message,
      type: 'info',
      ...options
    })
  }
  
  // Download-specific notifications
  const downloadStarted = (trackTitle: string) => {
    success('Download Started', `Started downloading: ${trackTitle}`)
    showDesktopNotification('Download Started', {
      body: `Started downloading: ${trackTitle}`,
      tag: 'download-start'
    })
  }
  
  const downloadCompleted = (trackTitle: string, filePath?: string) => {
    const actions = filePath ? [{
      label: 'Open Folder',
      action: () => {
        // In a real implementation, this would open the file location
        console.log('Opening folder:', filePath)
      }
    }] : undefined
    
    success('Download Completed', `Successfully downloaded: ${trackTitle}`, { actions })
    showDesktopNotification('Download Completed', {
      body: `Successfully downloaded: ${trackTitle}`,
      tag: 'download-complete'
    })
  }
  
  const downloadFailed = (trackTitle: string, errorMessage: string) => {
    error('Download Failed', `Failed to download ${trackTitle}: ${errorMessage}`)
    showDesktopNotification('Download Failed', {
      body: `Failed to download ${trackTitle}`,
      tag: 'download-error'
    })
  }
  
  const batchDownloadCompleted = (completedCount: number, totalCount: number) => {
    if (completedCount === totalCount) {
      success('Batch Download Completed', `Successfully downloaded all ${totalCount} tracks`)
      showDesktopNotification('Batch Download Completed', {
        body: `Successfully downloaded all ${totalCount} tracks`,
        tag: 'batch-complete'
      })
    } else {
      warning('Batch Download Completed', `Downloaded ${completedCount} of ${totalCount} tracks`)
      showDesktopNotification('Batch Download Completed', {
        body: `Downloaded ${completedCount} of ${totalCount} tracks`,
        tag: 'batch-partial'
      })
    }
  }
  
  // Settings-related notifications
  const settingsUpdated = (settingName: string) => {
    info('Settings Updated', `${settingName} has been updated`)
  }
  
  const settingsReset = () => {
    info('Settings Reset', 'All settings have been reset to defaults')
  }
  
  const settingsExported = () => {
    success('Settings Exported', 'Settings have been exported successfully')
  }
  
  const settingsImported = () => {
    success('Settings Imported', 'Settings have been imported successfully')
  }
  
  const cacheCleared = () => {
    success('Cache Cleared', 'Application cache has been cleared')
  }
  
  const optimalSettingsApplied = () => {
    success('Optimal Settings Applied', 'Settings have been optimized for your system')
  }
  
  return {
    // State
    toasts: computed(() => toasts.value),
    
    // Core methods
    showToast,
    removeToast,
    clearAllToasts,
    showDesktopNotification,
    
    // Convenience methods
    success,
    error,
    warning,
    info,
    
    // Download notifications
    downloadStarted,
    downloadCompleted,
    downloadFailed,
    batchDownloadCompleted,
    
    // Settings notifications
    settingsUpdated,
    settingsReset,
    settingsExported,
    settingsImported,
    cacheCleared,
    optimalSettingsApplied
  }
}