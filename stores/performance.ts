import { defineStore } from 'pinia'

export interface PerformanceSettings {
  maxConcurrentDownloads: number
  enableMultiThreading: boolean
  compressionPreset: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow'
  audioQuality: '96k' | '128k' | '192k' | '256k' | '320k'
  chunkSize: number
  enableAutoOptimization: boolean
  enableStreamCaching: boolean
  enableConnectionPooling: boolean
  enableAdaptiveBitrate: boolean
}

export interface PerformanceMetrics {
  averageDownloadSpeed: number
  averageConversionTime: number
  successRate: number
  totalDownloads: number
  failedDownloads: number
}

export const usePerformanceStore = defineStore('performance', {
  state: () => ({
    settings: {
      maxConcurrentDownloads: 3,
      enableMultiThreading: true,
      compressionPreset: 'fast' as const,
      audioQuality: '128k' as const,
      chunkSize: 1024 * 1024, // 1MB chunks
      enableAutoOptimization: true,
      enableStreamCaching: true,
      enableConnectionPooling: true,
      enableAdaptiveBitrate: true
    } as PerformanceSettings,
    
    metrics: {
      averageDownloadSpeed: 0,
      averageConversionTime: 0,
      successRate: 0,
      totalDownloads: 0,
      failedDownloads: 0
    } as PerformanceMetrics
  }),

  getters: {
    recommendations(): string[] {
      const recommendations: string[] = []
      
      if (this.metrics.successRate < 80 && this.metrics.totalDownloads > 0) {
        recommendations.push('Consider reducing concurrent downloads for better stability')
      }
      
      if (this.metrics.averageConversionTime > 30000) { // 30 seconds
        recommendations.push('Try using a faster compression preset')
      }
      
      if (this.metrics.averageDownloadSpeed < 100000 && this.metrics.totalDownloads > 0) { // 100KB/s
        recommendations.push('Check your internet connection or reduce audio quality')
      }
      
      return recommendations
    },

    formattedAverageSpeed(): string {
      const speed = this.metrics.averageDownloadSpeed
      
      if (isNaN(speed) || speed === undefined || speed === null) {
        return '0 B/s'
      }
      
      if (speed === 0) {
        return '0 B/s'
      }
      
      if (speed > 1024 * 1024) {
        return `${Math.round(speed / (1024 * 1024))}MB/s`
      } else if (speed > 1024) {
        return `${Math.round(speed / 1024)}KB/s`
      }
      return `${Math.round(speed)}B/s`
    },

    formattedSuccessRate(): number {
      const rate = this.metrics.successRate
      if (isNaN(rate) || rate === undefined || rate === null) {
        return 0
      }
      return Math.round(rate)
    },

    formattedConversionTime(): number {
      const time = this.metrics.averageConversionTime
      if (isNaN(time) || time === undefined || time === null) {
        return 0
      }
      return Math.round(time / 1000)
    }
  },

  actions: {
    updateMetrics(downloadSpeed: number, conversionTime: number, success: boolean) {
      console.log(`[PerformanceStore] Updating metrics - Speed: ${downloadSpeed} B/s, Time: ${conversionTime}ms, Success: ${success}`)
      
      // Validate input parameters
      const validDownloadSpeed = isNaN(downloadSpeed) || downloadSpeed < 0 ? 0 : downloadSpeed
      const validConversionTime = isNaN(conversionTime) || conversionTime < 0 ? 0 : conversionTime
      
      console.log(`[PerformanceStore] Validated - Speed: ${validDownloadSpeed}, Time: ${validConversionTime}`)
      
      this.metrics.totalDownloads++
      if (!success) {
        this.metrics.failedDownloads++
      }
      
      // Calculate running averages
      const total = this.metrics.totalDownloads
      if (total > 0) {
        const oldAvgSpeed = this.metrics.averageDownloadSpeed
        const oldAvgTime = this.metrics.averageConversionTime
        
        this.metrics.averageDownloadSpeed = 
          (this.metrics.averageDownloadSpeed * (total - 1) + validDownloadSpeed) / total
        this.metrics.averageConversionTime = 
          (this.metrics.averageConversionTime * (total - 1) + validConversionTime) / total
        this.metrics.successRate = 
          ((total - this.metrics.failedDownloads) / total) * 100
        
        console.log(`[PerformanceStore] Updated averages: Speed ${oldAvgSpeed} -> ${this.metrics.averageDownloadSpeed}, Time ${oldAvgTime} -> ${this.metrics.averageConversionTime}`)
      }
      
      // Ensure no NaN values
      if (isNaN(this.metrics.averageDownloadSpeed)) {
        this.metrics.averageDownloadSpeed = 0
      }
      if (isNaN(this.metrics.averageConversionTime)) {
        this.metrics.averageConversionTime = 0
      }
      if (isNaN(this.metrics.successRate)) {
        this.metrics.successRate = 0
      }
      
      console.log(`[PerformanceStore] Final metrics:`, {
        totalDownloads: this.metrics.totalDownloads,
        failedDownloads: this.metrics.failedDownloads,
        averageDownloadSpeed: this.metrics.averageDownloadSpeed,
        averageConversionTime: this.metrics.averageConversionTime,
        successRate: this.metrics.successRate,
        formattedSpeed: this.formattedAverageSpeed,
        formattedRate: this.formattedSuccessRate
      })
    },

    resetMetrics() {
      console.log('[PerformanceStore] Resetting metrics')
      this.metrics = {
        averageDownloadSpeed: 0,
        averageConversionTime: 0,
        successRate: 0,
        totalDownloads: 0,
        failedDownloads: 0
      }
    },

    updateSettings(newSettings: Partial<PerformanceSettings>) {
      console.log('[PerformanceStore] Updating settings:', newSettings)
      this.settings = { ...this.settings, ...newSettings }
    },

    detectOptimalSettings(): PerformanceSettings {
      const cores = navigator.hardwareConcurrency || 4
      const memory = (navigator as any).deviceMemory || 4 // GB
      const connection = (navigator as any).connection
      
      let optimalSettings: PerformanceSettings = { ...this.settings }
      
      // Adjust concurrent downloads based on CPU cores and memory
      if (cores >= 8 && memory >= 8) {
        optimalSettings.maxConcurrentDownloads = 5
      } else if (cores >= 4 && memory >= 4) {
        optimalSettings.maxConcurrentDownloads = 3
      } else {
        optimalSettings.maxConcurrentDownloads = 2
      }
      
      // Adjust quality and preset based on connection
      if (connection) {
        const effectiveType = connection.effectiveType
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          optimalSettings.audioQuality = '128k'
          optimalSettings.compressionPreset = 'ultrafast'
          optimalSettings.maxConcurrentDownloads = 1
        } else if (effectiveType === '3g') {
          optimalSettings.audioQuality = '192k'
          optimalSettings.compressionPreset = 'fast'
        }
      }
      
      // Adjust chunk size based on memory
      if (memory >= 8) {
        optimalSettings.chunkSize = 2 * 1024 * 1024 // 2MB
      } else if (memory <= 2) {
        optimalSettings.chunkSize = 512 * 1024 // 512KB
      }
      
      return optimalSettings
    },

    applyOptimalSettings() {
      const optimal = this.detectOptimalSettings()
      this.settings = optimal
      console.log('[PerformanceStore] Applied optimal settings:', optimal)
    }
  }
})