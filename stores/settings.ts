import { defineStore } from 'pinia'
import { usePerformanceStore } from './performance'

export interface AppSettings {
  // Performance Settings
  maxConcurrentDownloads: number
  audioQuality: 128 | 192 | 256 | 320
  compressionPreset: 'ultrafast' | 'fast' | 'medium' | 'slow'
  enableMultiThreading: boolean
  
  // Download Settings
  autoStartDownloads: boolean
  showNotifications: boolean
  downloadPath: string
  
  // Interface Settings
  theme: 'dark' | 'light' | 'auto'
  showAdvancedOptions: boolean
  autoSaveSettings: boolean
  
  // Advanced Settings
  retryAttempts: number
  timeoutDuration: number
  enableLogging: boolean
  logLevel: 'error' | 'warn' | 'info' | 'debug'
}

export interface NotificationSettings {
  enabled: boolean
  sound: boolean
  desktop: boolean
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: {
      // Performance Settings
      maxConcurrentDownloads: 3,
      audioQuality: 256 as const,
      compressionPreset: 'medium' as const,
      enableMultiThreading: true,
      
      // Download Settings
      autoStartDownloads: true,
      showNotifications: true,
      downloadPath: '~/Downloads',
      
      // Interface Settings
      theme: 'dark' as const,
      showAdvancedOptions: false,
      autoSaveSettings: true,
      
      // Advanced Settings
      retryAttempts: 3,
      timeoutDuration: 30000, // 30 seconds
      enableLogging: true,
      logLevel: 'info' as const
    } as AppSettings,
    
    notifications: {
      enabled: true,
      sound: true,
      desktop: true,
      position: 'top-right' as const
    } as NotificationSettings,
    
    // Runtime state
    isInitialized: false,
    lastSaved: new Date(),
    hasUnsavedChanges: false
  }),

  getters: {
    // Performance getters
    performanceSettings: (state) => ({
      maxConcurrentDownloads: state.settings.maxConcurrentDownloads,
      audioQuality: `${state.settings.audioQuality}k` as const,
      compressionPreset: state.settings.compressionPreset,
      enableMultiThreading: state.settings.enableMultiThreading,
      chunkSize: 1024 * 1024 // 1MB default
    }),
    
    // Download settings getters
    downloadSettings: (state) => ({
      autoStart: state.settings.autoStartDownloads,
      notifications: state.settings.showNotifications,
      path: state.settings.downloadPath,
      retries: state.settings.retryAttempts,
      timeout: state.settings.timeoutDuration
    }),
    
    // Interface settings getters
    interfaceSettings: (state) => ({
      theme: state.settings.theme,
      advanced: state.settings.showAdvancedOptions,
      autoSave: state.settings.autoSaveSettings
    }),
    
    // Check if settings are optimal
    isOptimal: (state) => {
      const cores = navigator.hardwareConcurrency || 4
      const memory = (navigator as any).deviceMemory || 4
      
      // Basic optimization checks
      if (cores >= 8 && state.settings.maxConcurrentDownloads < 4) return false
      if (cores <= 2 && state.settings.maxConcurrentDownloads > 2) return false
      if (memory <= 2 && state.settings.audioQuality > 192) return false
      
      return true
    }
  },

  actions: {
    // Initialize settings from localStorage
    async initialize() {
      try {
        const saved = localStorage.getItem('app-settings')
        if (saved) {
          const parsedSettings = JSON.parse(saved)
          this.settings = { ...this.settings, ...parsedSettings }
        }
        
        const savedNotifications = localStorage.getItem('notification-settings')
        if (savedNotifications) {
          const parsedNotifications = JSON.parse(savedNotifications)
          this.notifications = { ...this.notifications, ...parsedNotifications }
        }
        
        // Request notification permission if enabled
        if (this.notifications.desktop && 'Notification' in window) {
          await this.requestNotificationPermission()
        }
        
        this.isInitialized = true
        console.log('[SettingsStore] Initialized with settings:', this.settings)
      } catch (error) {
        console.error('[SettingsStore] Failed to initialize:', error)
        this.isInitialized = true // Continue with defaults
      }
    },

    // Update individual settings
    updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
      this.settings[key] = value
      this.hasUnsavedChanges = true
      
      // Auto-save if enabled
      if (this.settings.autoSaveSettings) {
        this.saveSettings()
      }
      
      // Sync with performance store for performance-related settings
      if (['maxConcurrentDownloads', 'audioQuality', 'compressionPreset', 'enableMultiThreading'].includes(key)) {
        this.syncWithPerformanceStore()
      }
      
      console.log(`[SettingsStore] Updated ${key}:`, value)
    },

    // Update multiple settings at once
    updateSettings(newSettings: Partial<AppSettings>) {
      Object.entries(newSettings).forEach(([key, value]) => {
        if (key in this.settings) {
          (this.settings as any)[key] = value
        }
      })
      
      this.hasUnsavedChanges = true
      
      if (this.settings.autoSaveSettings) {
        this.saveSettings()
      }
      
      this.syncWithPerformanceStore()
      console.log('[SettingsStore] Updated multiple settings:', newSettings)
    },

    // Save settings to localStorage
    saveSettings() {
      try {
        localStorage.setItem('app-settings', JSON.stringify(this.settings))
        localStorage.setItem('notification-settings', JSON.stringify(this.notifications))
        this.lastSaved = new Date()
        this.hasUnsavedChanges = false
        console.log('[SettingsStore] Settings saved successfully')
      } catch (error) {
        console.error('[SettingsStore] Failed to save settings:', error)
      }
    },

    // Reset to default settings
    resetToDefaults() {
      this.settings = {
        maxConcurrentDownloads: 3,
        audioQuality: 256,
        compressionPreset: 'medium',
        enableMultiThreading: true,
        autoStartDownloads: true,
        showNotifications: true,
        downloadPath: '~/Downloads',
        theme: 'dark',
        showAdvancedOptions: false,
        autoSaveSettings: true,
        retryAttempts: 3,
        timeoutDuration: 30000,
        enableLogging: true,
        logLevel: 'info'
      }
      
      this.notifications = {
        enabled: true,
        sound: true,
        desktop: true,
        position: 'top-right'
      }
      
      this.saveSettings()
      this.syncWithPerformanceStore()
      console.log('[SettingsStore] Reset to defaults')
    },

    // Apply optimal settings based on system capabilities
    applyOptimalSettings() {
      const cores = navigator.hardwareConcurrency || 4
      const memory = (navigator as any).deviceMemory || 4
      const connection = (navigator as any).connection
      
      const optimal: Partial<AppSettings> = {}
      
      // CPU-based optimizations
      if (cores >= 8) {
        optimal.maxConcurrentDownloads = 5
        optimal.enableMultiThreading = true
      } else if (cores >= 4) {
        optimal.maxConcurrentDownloads = 3
        optimal.enableMultiThreading = true
      } else {
        optimal.maxConcurrentDownloads = 2
        optimal.enableMultiThreading = false
      }
      
      // Memory-based optimizations
      if (memory <= 2) {
        optimal.audioQuality = 192
        optimal.compressionPreset = 'ultrafast'
      } else if (memory >= 8) {
        optimal.audioQuality = 320
        optimal.compressionPreset = 'slow'
      }
      
      // Connection-based optimizations
      if (connection) {
        const effectiveType = connection.effectiveType
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          optimal.audioQuality = 128
          optimal.maxConcurrentDownloads = 1
          optimal.compressionPreset = 'ultrafast'
        } else if (effectiveType === '3g') {
          optimal.audioQuality = 192
          optimal.maxConcurrentDownloads = 2
        }
      }
      
      this.updateSettings(optimal)
      console.log('[SettingsStore] Applied optimal settings:', optimal)
    },

    // Sync with performance store
    syncWithPerformanceStore() {
      const performanceStore = usePerformanceStore()
      performanceStore.updateSettings({
        maxConcurrentDownloads: this.settings.maxConcurrentDownloads,
        audioQuality: `${this.settings.audioQuality}k` as const,
        compressionPreset: this.settings.compressionPreset,
        enableMultiThreading: this.settings.enableMultiThreading,
        chunkSize: 1024 * 1024
      })
    },

    // Export settings
    exportSettings() {
      const exportData = {
        settings: this.settings,
        notifications: this.notifications,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `soundcloud-downloader-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      console.log('[SettingsStore] Settings exported')
    },

    // Import settings
    async importSettings(file: File) {
      try {
        const text = await file.text()
        const importData = JSON.parse(text)
        
        if (importData.settings) {
          this.settings = { ...this.settings, ...importData.settings }
        }
        
        if (importData.notifications) {
          this.notifications = { ...this.notifications, ...importData.notifications }
        }
        
        this.saveSettings()
        this.syncWithPerformanceStore()
        console.log('[SettingsStore] Settings imported successfully')
        return true
      } catch (error) {
        console.error('[SettingsStore] Failed to import settings:', error)
        return false
      }
    },

    // Clear cache and temporary data
    clearCache() {
      try {
        // Clear various caches
        localStorage.removeItem('app-cache')
        localStorage.removeItem('track-cache')
        localStorage.removeItem('playlist-cache')
        sessionStorage.clear()
        
        // Clear IndexedDB if available
        if ('indexedDB' in window) {
          indexedDB.deleteDatabase('soundcloud-downloader-cache')
        }
        
        console.log('[SettingsStore] Cache cleared successfully')
        return true
      } catch (error) {
        console.error('[SettingsStore] Failed to clear cache:', error)
        return false
      }
    },

    // Notification methods
    async requestNotificationPermission() {
      if (!('Notification' in window)) {
        console.warn('[SettingsStore] Notifications not supported')
        return false
      }
      
      if (Notification.permission === 'granted') {
        return true
      }
      
      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
      }
      
      return false
    },

    async showNotification(title: string, options?: NotificationOptions) {
      if (!this.notifications.enabled || !this.notifications.desktop) {
        return
      }
      
      if (!('Notification' in window)) {
        console.warn('[SettingsStore] Notifications not supported')
        return
      }
      
      if (Notification.permission !== 'granted') {
        const granted = await this.requestNotificationPermission()
        if (!granted) return
      }
      
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)
      
      return notification
    },

    // Theme management
    applyTheme() {
      const theme = this.settings.theme
      const root = document.documentElement
      
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', prefersDark)
        root.classList.toggle('light', !prefersDark)
      } else {
        root.classList.toggle('dark', theme === 'dark')
        root.classList.toggle('light', theme === 'light')
      }
      
      console.log(`[SettingsStore] Applied theme: ${theme}`)
    },

    // Download path management
    async selectDownloadPath() {
      try {
        // In a real implementation, this would use the File System Access API
        // For now, we'll simulate it
        if ('showDirectoryPicker' in window) {
          const dirHandle = await (window as any).showDirectoryPicker()
          this.updateSetting('downloadPath', dirHandle.name)
          return dirHandle.name
        } else {
          // Fallback for browsers that don't support the API
          const path = prompt('Enter download path:', this.settings.downloadPath)
          if (path) {
            this.updateSetting('downloadPath', path)
            return path
          }
        }
      } catch (error) {
        console.error('[SettingsStore] Failed to select download path:', error)
      }
      return null
    }
  }
})