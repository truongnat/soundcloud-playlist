import { ref, computed } from 'vue'
import { usePerformanceStore } from '@/stores/performance'
import { useDownloadQueueStore } from '@/stores/downloadQueue'
import { validateAudioFormat, downloadBlob } from '~/utils/audio'
import type { Track } from '@/types'

// Stream URL Cache với TTL
interface CachedStreamUrl {
  url: string
  timestamp: number
  ttl: number
}

class StreamUrlCache {
  private cache = new Map<string, CachedStreamUrl>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  set(trackId: string, url: string, ttl = this.DEFAULT_TTL) {
    this.cache.set(trackId, {
      url,
      timestamp: Date.now(),
      ttl
    })
  }

  get(trackId: string): string | null {
    const cached = this.cache.get(trackId)
    if (!cached) return null

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(trackId)
      return null
    }

    return cached.url
  }

  clear() {
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }
}

// Connection Pool Manager
class ConnectionPool {
  private activeConnections = new Set<string>()
  private readonly maxConnections: number

  constructor(maxConnections = 10) {
    this.maxConnections = maxConnections
  }

  async acquire(trackId: string): Promise<void> {
    while (this.activeConnections.size >= this.maxConnections) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    this.activeConnections.add(trackId)
  }

  release(trackId: string) {
    this.activeConnections.delete(trackId)
  }

  getActiveCount() {
    return this.activeConnections.size
  }
}

// Bandwidth Estimator
class BandwidthEstimator {
  private samples: number[] = []
  private readonly maxSamples = 10

  addSample(bytesPerSecond: number) {
    this.samples.push(bytesPerSecond)
    if (this.samples.length > this.maxSamples) {
      this.samples.shift()
    }
  }

  getEstimate(): number {
    if (this.samples.length === 0) return 0
    return this.samples.reduce((sum, speed) => sum + speed, 0) / this.samples.length
  }

  getRecommendedConcurrency(): number {
    const bandwidth = this.getEstimate()
    if (bandwidth > 2000000) return 5      // >2MB/s
    if (bandwidth > 1000000) return 4      // >1MB/s
    if (bandwidth > 500000) return 3       // >500KB/s
    if (bandwidth > 200000) return 2       // >200KB/s
    return 1                               // <200KB/s
  }

  getRecommendedBitrate(): string {
    const bandwidth = this.getEstimate()
    if (bandwidth > 1000000) return '192k'  // >1MB/s
    if (bandwidth > 500000) return '128k'   // >500KB/s
    return '96k'                            // <500KB/s
  }
}

export const useOptimizedDownloader = () => {
  const performanceStore = usePerformanceStore()
  const downloadQueueStore = useDownloadQueueStore()
  
  // Singletons
  const streamUrlCache = new StreamUrlCache()
  const connectionPool = new ConnectionPool(10)
  const bandwidthEstimator = new BandwidthEstimator()
  
  // State
  const isOptimizing = ref(false)
  const optimizationStats = ref({
    cacheHits: 0,
    cacheMisses: 0,
    averageBandwidth: 0,
    recommendedConcurrency: 3,
    recommendedBitrate: '128k'
  })

  // Computed
  const cacheHitRate = computed(() => {
    const total = optimizationStats.value.cacheHits + optimizationStats.value.cacheMisses
    return total > 0 ? (optimizationStats.value.cacheHits / total * 100).toFixed(1) : '0'
  })

  // Get stream URL with caching
  const getStreamUrlCached = async (track: Track): Promise<string> => {
    const trackId = track.id.toString()
    
    // Check cache first
    const cachedUrl = streamUrlCache.get(trackId)
    if (cachedUrl) {
      optimizationStats.value.cacheHits++
      console.log(`[OptimizedDownloader] Cache hit for track: ${track.title}`)
      return cachedUrl
    }

    optimizationStats.value.cacheMisses++
    console.log(`[OptimizedDownloader] Cache miss for track: ${track.title}`)

    try {
      // Fetch stream URL from API
      const response = await fetch(`/api/soundcloud/stream/${trackId}`)
      if (!response.ok) {
        throw new Error(`Failed to get stream URL: ${response.statusText}`)
      }

      const data = await response.json()
      const streamUrl = data.streamUrl

      if (!streamUrl) {
        throw new Error('No stream URL found')
      }

      // Cache the URL
      streamUrlCache.set(trackId, streamUrl)
      return streamUrl
    } catch (error) {
      console.error(`[OptimizedDownloader] Failed to get stream URL for ${track.title}:`, error)
      throw error
    }
  }

  // Optimized download with connection pooling
  const downloadTrackOptimized = async (track: Track): Promise<void> => {
    const trackId = track.id.toString()
    
    try {
      // Acquire connection from pool
      await connectionPool.acquire(trackId)
      
      // Update status
      downloadQueueStore.updateTrackStatus(trackId, 'downloading')
      downloadQueueStore.updateTrackProgress(trackId, 0)

      const startTime = Date.now()
      let downloadSpeed = 0
      let conversionTime = 0

      // Get stream URL (cached if available)
      const streamUrl = await getStreamUrlCached(track)

      // Download with progress tracking
      const downloadStartTime = Date.now()
      const response = await fetch(streamUrl)
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`)
      }

      const contentLength = parseInt(response.headers.get('content-length') || '0')
      const reader = response.body?.getReader()
      
      if (!reader) {
        throw new Error('Failed to get response reader')
      }

      const chunks: Uint8Array[] = []
      let receivedLength = 0

      // Read stream with progress updates
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        if (value) {
          chunks.push(value)
          receivedLength += value.length
          
          // Update progress
          if (contentLength > 0) {
            const progress = Math.round((receivedLength / contentLength) * 70) // 70% for download
            downloadQueueStore.updateTrackProgress(trackId, progress)
          }
          
          // Calculate current download speed
          const elapsed = (Date.now() - downloadStartTime) / 1000
          if (elapsed > 0) {
            downloadSpeed = receivedLength / elapsed
          }
        }
      }

      // Combine chunks
      const audioData = new Uint8Array(receivedLength)
      let position = 0
      for (const chunk of chunks) {
        audioData.set(chunk, position)
        position += chunk.length
      }

      // Calculate final download speed and add to bandwidth estimator
      const totalDownloadTime = (Date.now() - downloadStartTime) / 1000
      if (totalDownloadTime > 0) {
        downloadSpeed = receivedLength / totalDownloadTime
        bandwidthEstimator.addSample(downloadSpeed)
        
        // Update optimization stats
        optimizationStats.value.averageBandwidth = bandwidthEstimator.getEstimate()
        optimizationStats.value.recommendedConcurrency = bandwidthEstimator.getRecommendedConcurrency()
        optimizationStats.value.recommendedBitrate = bandwidthEstimator.getRecommendedBitrate()
      }

      // Validate audio format
      if (!validateAudioFormat(audioData)) {
        throw new Error('Invalid audio format received')
      }

      // Convert to MP3 if needed
      downloadQueueStore.updateTrackStatus(trackId, 'converting')
      downloadQueueStore.updateTrackProgress(trackId, 75)

      const conversionStartTime = Date.now()
      
      // Use recommended bitrate for conversion
      const bitrate = bandwidthEstimator.getRecommendedBitrate()
      const { useAudioProcessor } = await import('@/composables/useAudioProcessor')
      const { convertToMp3 } = useAudioProcessor()
      const mp3Data = await convertToMp3(audioData)
      
      conversionTime = Date.now() - conversionStartTime
      downloadQueueStore.updateTrackProgress(trackId, 90)

      // Download file
      const filename = `${track.artist} - ${track.title}.mp3`
        .replace(/[<>:"/\\|?*]/g, '_')
        .substring(0, 200)

      await downloadBlob(mp3Data, filename)
      
      // Mark as completed
      downloadQueueStore.updateTrackStatus(trackId, 'completed')
      downloadQueueStore.updateTrackProgress(trackId, 100)

      // Update performance metrics
      performanceStore.updateMetrics(downloadSpeed, conversionTime, true)

      console.log(`[OptimizedDownloader] Completed: ${track.title} (Speed: ${Math.round(downloadSpeed / 1024)}KB/s, Conversion: ${Math.round(conversionTime / 1000)}s)`)

    } catch (error: any) {
      console.error(`[OptimizedDownloader] Failed to download ${track.title}:`, error)
      
      // Update status and metrics
      downloadQueueStore.updateTrackStatus(trackId, 'error', error.message || 'Download failed')
      performanceStore.updateMetrics(0, 0, false)
      
      throw error
    } finally {
      // Always release connection
      connectionPool.release(trackId)
    }
  }

  // Batch download with optimized concurrency
  const downloadBatchOptimized = async (tracks: Track[]): Promise<void> => {
    if (tracks.length === 0) return

    console.log(`[OptimizedDownloader] Starting optimized batch download of ${tracks.length} tracks`)
    
    // Get recommended concurrency based on bandwidth
    const recommendedConcurrency = bandwidthEstimator.getRecommendedConcurrency()
    const maxConcurrent = Math.min(
      performanceStore.settings.maxConcurrentDownloads,
      recommendedConcurrency,
      Math.max(1, Math.floor(navigator.hardwareConcurrency / 2))
    )

    console.log(`[OptimizedDownloader] Using ${maxConcurrent} concurrent downloads (recommended: ${recommendedConcurrency})`)

    // Create semaphore for concurrency control
    let activeTasks = 0
    const maxConcurrentTasks = maxConcurrent

    const downloadPromises = tracks.map(async (track) => {
      // Wait for available slot
      while (activeTasks >= maxConcurrentTasks) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      activeTasks++
      
      try {
        await downloadTrackOptimized(track)
      } catch (error) {
        console.error(`[OptimizedDownloader] Failed to download track ${track.title}:`, error)
      } finally {
        activeTasks--
      }
    })

    // Wait for all downloads to complete
    await Promise.allSettled(downloadPromises)
    
    console.log(`[OptimizedDownloader] Batch download completed`)
  }

  // Auto-optimize settings based on performance
  const autoOptimize = async (): Promise<void> => {
    if (isOptimizing.value) return
    
    isOptimizing.value = true
    
    try {
      console.log('[OptimizedDownloader] Running auto-optimization...')
      
      // Get current performance metrics
      const metrics = performanceStore.metrics
      const currentSettings = performanceStore.settings
      
      // Calculate optimization recommendations
      const recommendations: any = {}
      
      // Adjust concurrency based on success rate and speed
      if (metrics.successRate < 0.8) {
        // Low success rate - reduce concurrency
        recommendations.maxConcurrentDownloads = Math.max(1, currentSettings.maxConcurrentDownloads - 1)
      } else if (metrics.successRate > 0.95 && metrics.averageDownloadSpeed > 500000) {
        // High success rate and good speed - can increase concurrency
        recommendations.maxConcurrentDownloads = Math.min(8, currentSettings.maxConcurrentDownloads + 1)
      }
      
      // Adjust audio quality based on download speed
      if (metrics.averageDownloadSpeed < 200000) { // <200KB/s
        recommendations.audioQuality = '96k'
      } else if (metrics.averageDownloadSpeed > 1000000) { // >1MB/s
        recommendations.audioQuality = '192k'
      }
      
      // Apply recommendations
      if (Object.keys(recommendations).length > 0) {
        performanceStore.updateSettings(recommendations)
        console.log('[OptimizedDownloader] Applied optimizations:', recommendations)
      }
      
    } catch (error) {
      console.error('[OptimizedDownloader] Auto-optimization failed:', error)
    } finally {
      isOptimizing.value = false
    }
  }

  // Clear cache
  const clearCache = () => {
    streamUrlCache.clear()
    optimizationStats.value.cacheHits = 0
    optimizationStats.value.cacheMisses = 0
    console.log('[OptimizedDownloader] Cache cleared')
  }

  // Get optimization stats
  const getOptimizationStats = () => ({
    ...optimizationStats.value,
    cacheHitRate: cacheHitRate.value,
    cacheSize: streamUrlCache.size(),
    activeConnections: connectionPool.getActiveCount()
  })

  return {
    // Methods
    downloadTrackOptimized,
    downloadBatchOptimized,
    autoOptimize,
    clearCache,
    getOptimizationStats,
    
    // State
    isOptimizing,
    optimizationStats,
    
    // Computed
    cacheHitRate
  }
}