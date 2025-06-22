import { ref, computed, readonly } from 'vue'

export interface PerformanceSettings {
  maxConcurrentDownloads: number
  enableMultiThreading: boolean
  compressionPreset: 'ultrafast' | 'fast' | 'medium' | 'slow'
  audioQuality: '128k' | '192k' | '256k' | '320k'
  chunkSize: number
}

// Global singleton state
let globalSettings: any = null
let globalMetrics: any = null

export const useDownloadPerformance = () => {
  // Use singleton pattern to ensure same instance across components
  if (!globalSettings) {
    globalSettings = ref<PerformanceSettings>({
      maxConcurrentDownloads: 3,
      enableMultiThreading: true,
      compressionPreset: 'fast',
      audioQuality: '320k',
      chunkSize: 1024 * 1024 // 1MB chunks
    })
  }

  if (!globalMetrics) {
    globalMetrics = ref({
      averageDownloadSpeed: 0,
      averageConversionTime: 0,
      successRate: 0,
      totalDownloads: 0,
      failedDownloads: 0
    })
  }

  const settings = globalSettings
  const metrics = globalMetrics

  // Auto-detect optimal settings based on device capabilities
  const detectOptimalSettings = (): PerformanceSettings => {
    const cores = navigator.hardwareConcurrency || 4
    const memory = (navigator as any).deviceMemory || 4 // GB
    const connection = (navigator as any).connection
    
    let optimalSettings: PerformanceSettings = { ...settings.value }
    
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
  }

  // Apply optimal settings
  const applyOptimalSettings = () => {
    const optimal = detectOptimalSettings()
    settings.value = optimal
    console.log('Applied optimal performance settings:', optimal)
  }

  // Update metrics
  const updateMetrics = (downloadSpeed: number, conversionTime: number, success: boolean) => {
    console.log(`[Performance] Updating metrics - Input: Speed=${downloadSpeed}, Time=${conversionTime}, Success=${success}`)
    
    // Validate input parameters
    const validDownloadSpeed = isNaN(downloadSpeed) || downloadSpeed < 0 ? 0 : downloadSpeed
    const validConversionTime = isNaN(conversionTime) || conversionTime < 0 ? 0 : conversionTime
    
    console.log(`[Performance] Validated: Speed=${validDownloadSpeed}, Time=${validConversionTime}`)
    
    metrics.value.totalDownloads++
    if (!success) {
      metrics.value.failedDownloads++
    }
    
    // Calculate running averages with validation
    const total = metrics.value.totalDownloads
    if (total > 0) {
      const oldAvgSpeed = metrics.value.averageDownloadSpeed
      const oldAvgTime = metrics.value.averageConversionTime
      
      metrics.value.averageDownloadSpeed = 
        (metrics.value.averageDownloadSpeed * (total - 1) + validDownloadSpeed) / total
      metrics.value.averageConversionTime = 
        (metrics.value.averageConversionTime * (total - 1) + validConversionTime) / total
      metrics.value.successRate = 
        ((total - metrics.value.failedDownloads) / total) * 100
      
      console.log(`[Performance] Updated averages: Speed ${oldAvgSpeed} -> ${metrics.value.averageDownloadSpeed}, Time ${oldAvgTime} -> ${metrics.value.averageConversionTime}`)
    }
    
    // Ensure no NaN values
    if (isNaN(metrics.value.averageDownloadSpeed)) {
      metrics.value.averageDownloadSpeed = 0
    }
    if (isNaN(metrics.value.averageConversionTime)) {
      metrics.value.averageConversionTime = 0
    }
    if (isNaN(metrics.value.successRate)) {
      metrics.value.successRate = 0
    }
    
    console.log(`[Performance] Final metrics:`, {
      totalDownloads: metrics.value.totalDownloads,
      failedDownloads: metrics.value.failedDownloads,
      averageDownloadSpeed: metrics.value.averageDownloadSpeed,
      averageConversionTime: metrics.value.averageConversionTime,
      successRate: metrics.value.successRate
    })
  }

  // Get performance recommendations
  const getRecommendations = computed(() => {
    const recommendations: string[] = []
    
    if (metrics.value.successRate < 80) {
      recommendations.push('Consider reducing concurrent downloads for better stability')
    }
    
    if (metrics.value.averageConversionTime > 30000) { // 30 seconds
      recommendations.push('Try using a faster compression preset')
    }
    
    if (metrics.value.averageDownloadSpeed < 100000) { // 100KB/s
      recommendations.push('Check your internet connection or reduce audio quality')
    }
    
    return recommendations
  })

  // Reset metrics for testing
  const resetMetrics = () => {
    metrics.value = {
      averageDownloadSpeed: 0,
      averageConversionTime: 0,
      successRate: 0,
      totalDownloads: 0,
      failedDownloads: 0
    }
    console.log('[Performance] Metrics reset')
  }

  // Initialize with optimal settings
  if (typeof window !== 'undefined') {
    applyOptimalSettings()
  }

  return {
    settings: readonly(settings),
    metrics: readonly(metrics),
    recommendations: getRecommendations,
    detectOptimalSettings,
    applyOptimalSettings,
    updateMetrics,
    resetMetrics,
    updateSettings: (newSettings: Partial<PerformanceSettings>) => {
      settings.value = { ...settings.value, ...newSettings }
    }
  }
}