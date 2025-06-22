import type { Track } from '@/types'
import { useAudioProcessor } from './useAudioProcessor'
import { useDownloadQueueStore } from '@/stores/downloadQueue'
import { usePerformanceStore } from '@/stores/performance'
import { validateAudioFormat, downloadBlob } from '~/utils/audio'
import { sanitizeFilename } from '~/utils/api'

const { convertToMp3 } = useAudioProcessor()

// Global abort controllers và connection pooling
const activeDownloads = new Map<string, AbortController>()
const downloadSemaphore = ref(0)

// Connection pooling để tái sử dụng connections
const connectionPool = new Map<string, Response>()

// Cache cho stream URLs để tránh gọi API nhiều lần
const streamUrlCache = new Map<string, { url: string, expiry: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Worker pool cho parallel processing
let workerPool: Worker[] = []
const MAX_WORKERS = Math.min(navigator.hardwareConcurrency || 4, 4)

export const useOptimizedDownloadQueue = () => {
  const store = useDownloadQueueStore()
  const performanceStore = usePerformanceStore()

  // Initialize worker pool for parallel processing
  const initWorkerPool = () => {
    if (typeof Worker === 'undefined') return
    
    for (let i = 0; i < MAX_WORKERS; i++) {
      try {
        // Create worker for audio processing tasks
        const worker = new Worker(
          URL.createObjectURL(
            new Blob([`
              self.onmessage = function(e) {
                const { type, data } = e.data;
                
                if (type === 'VALIDATE_AUDIO') {
                  // Validate audio format in worker
                  const isMP3 = data[0] === 0xFF && (data[1] & 0xE0) === 0xE0;
                  const isM4A = data[4] === 0x66 && data[5] === 0x74 && data[6] === 0x79 && data[7] === 0x70;
                  
                  self.postMessage({
                    type: 'VALIDATION_RESULT',
                    result: { isMP3, isM4A }
                  });
                }
                
                if (type === 'PROCESS_CHUNKS') {
                  // Process audio chunks in worker
                  const { chunks, totalLength } = data;
                  const result = new Uint8Array(totalLength);
                  let position = 0;
                  
                  for (const chunk of chunks) {
                    result.set(new Uint8Array(chunk), position);
                    position += chunk.length;
                  }
                  
                  self.postMessage({
                    type: 'CHUNKS_PROCESSED',
                    result: result.buffer
                  }, [result.buffer]);
                }
              };
            `], { type: 'application/javascript' })
          )
        )
        workerPool.push(worker)
      } catch (error) {
        console.warn('Failed to create worker:', error)
      }
    }
  }

  // Get available worker
  const getWorker = (): Worker | null => {
    return workerPool.length > 0 ? workerPool[Math.floor(Math.random() * workerPool.length)] : null
  }

  // Optimized stream URL fetching with caching
  const getStreamUrl = async (trackUrl: string, signal: AbortSignal): Promise<string> => {
    // Check cache first
    const cached = streamUrlCache.get(trackUrl)
    if (cached && Date.now() < cached.expiry) {
      console.log('Using cached stream URL')
      return cached.url
    }

    // Parallel API calls for faster response
    const apiCalls = [
      fetch(`/api/stream-mp3?url=${encodeURIComponent(trackUrl)}`, { signal }),
      fetch(`/api/track-fallback?url=${encodeURIComponent(trackUrl)}`, { signal })
    ]

    try {
      // Use Promise.any to get the first successful response
      const response = await Promise.any(apiCalls)
      
      if (!response.ok) {
        throw new Error(`API failed with status ${response.status}`)
      }

      const data = await response.json()
      if (!data?.streamUrl) {
        throw new Error('No stream URL in response')
      }

      // Cache the result
      streamUrlCache.set(trackUrl, {
        url: data.streamUrl,
        expiry: Date.now() + CACHE_DURATION
      })

      return data.streamUrl
    } catch (error) {
      // If Promise.any fails, try sequential fallback
      console.log('Parallel API calls failed, trying sequential fallback')
      
      for (const apiCall of apiCalls) {
        try {
          const response = await apiCall
          if (response.ok) {
            const data = await response.json()
            if (data?.streamUrl) {
              streamUrlCache.set(trackUrl, {
                url: data.streamUrl,
                expiry: Date.now() + CACHE_DURATION
              })
              return data.streamUrl
            }
          }
        } catch (fallbackError) {
          console.warn('Fallback API call failed:', fallbackError)
        }
      }
      
      throw new Error('All API endpoints failed')
    }
  }

  // Optimized download with streaming and chunked processing
  const downloadAudioOptimized = async (
    streamUrl: string, 
    trackId: string, 
    signal: AbortSignal
  ): Promise<Uint8Array> => {
    const response = await fetch(streamUrl, { 
      signal,
      // Add headers for better performance
      headers: {
        'Accept': 'audio/*',
        'Cache-Control': 'no-cache'
      }
    })

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`)
    }

    if (!response.body) {
      throw new Error('No response body')
    }

    const reader = response.body.getReader()
    const contentLength = +(response.headers.get('Content-Length') || 0)
    
    // Use larger chunks for better performance
    const chunks: ArrayBuffer[] = []
    let receivedLength = 0
    const startTime = Date.now()

    // Optimized chunk size based on connection speed
    const OPTIMAL_CHUNK_SIZE = 64 * 1024 // 64KB chunks
    let buffer = new Uint8Array(OPTIMAL_CHUNK_SIZE)
    let bufferPosition = 0

    while (true) {
      if (signal.aborted) {
        throw new Error('Download cancelled')
      }

      const { done, value } = await reader.read()
      if (done) break

      // Buffer small chunks to reduce memory allocations
      if (bufferPosition + value.length <= buffer.length) {
        buffer.set(value, bufferPosition)
        bufferPosition += value.length
      } else {
        // Flush buffer and start new one
        if (bufferPosition > 0) {
          chunks.push(buffer.slice(0, bufferPosition).buffer)
          receivedLength += bufferPosition
        }
        
        // Reset buffer
        buffer = new Uint8Array(Math.max(OPTIMAL_CHUNK_SIZE, value.length))
        buffer.set(value, 0)
        bufferPosition = value.length
      }

      // Update progress more efficiently (every 100ms max)
      const elapsed = Date.now() - startTime
      if (elapsed > 100 && contentLength) {
        const totalReceived = receivedLength + bufferPosition
        const progress = Math.round((totalReceived / contentLength) * 100)
        store.updateTrackProgress(trackId, Math.min(progress, 99)) // Cap at 99% until complete
      }
    }

    // Add final buffer
    if (bufferPosition > 0) {
      chunks.push(buffer.slice(0, bufferPosition).buffer)
      receivedLength += bufferPosition
    }

    // Use worker for chunk processing if available
    const worker = getWorker()
    if (worker && chunks.length > 1) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Worker processing timeout'))
        }, 10000)

        worker.onmessage = (e) => {
          if (e.data.type === 'CHUNKS_PROCESSED') {
            clearTimeout(timeout)
            resolve(new Uint8Array(e.data.result))
          }
        }

        worker.onerror = (error) => {
          clearTimeout(timeout)
          reject(error)
        }

        worker.postMessage({
          type: 'PROCESS_CHUNKS',
          data: { chunks, totalLength: receivedLength }
        })
      })
    }

    // Fallback: combine chunks on main thread
    const result = new Uint8Array(receivedLength)
    let position = 0
    for (const chunk of chunks) {
      const chunkArray = new Uint8Array(chunk)
      result.set(chunkArray, position)
      position += chunkArray.length
    }

    return result
  }

  // Optimized validation using worker
  const validateAudioOptimized = async (data: Uint8Array): Promise<{ isMP3: boolean; isM4A: boolean }> => {
    const worker = getWorker()
    
    if (worker && data.length > 1024) {
      // Use worker for large files
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Validation timeout'))
        }, 5000)

        worker.onmessage = (e) => {
          if (e.data.type === 'VALIDATION_RESULT') {
            clearTimeout(timeout)
            resolve(e.data.result)
          }
        }

        worker.onerror = (error) => {
          clearTimeout(timeout)
          reject(error)
        }

        // Only send first 16 bytes for format detection
        worker.postMessage({
          type: 'VALIDATE_AUDIO',
          data: Array.from(data.slice(0, 16))
        })
      })
    }

    // Fallback: validate on main thread
    return validateAudioFormat(data)
  }

  // Main optimized download function
  const startOptimizedDownload = async (trackId: string): Promise<void> => {
    if (typeof window === 'undefined') {
      console.warn('startOptimizedDownload can only be called on the client side')
      return
    }
    
    const queueItem = store.queue[trackId]
    if (!queueItem || queueItem.status !== 'queued') return

    const abortController = new AbortController()
    activeDownloads.set(trackId, abortController)

    const startTime = Date.now()
    let downloadSpeed = 0
    let conversionTime = 0

    try {
      store.updateTrackStatus(trackId, 'downloading')
      store.updateTrackProgress(trackId, 0)

      const track = queueItem.track
      console.log('Starting optimized download:', track.title)

      // Phase 1: Get stream URL (optimized with caching and parallel calls)
      const streamUrl = await getStreamUrl(track.url, abortController.signal)
      console.log('Got stream URL (optimized)')

      // Phase 2: Download audio (optimized with chunked streaming)
      const downloadStartTime = Date.now()
      const audioData = await downloadAudioOptimized(streamUrl, trackId, abortController.signal)
      const downloadTime = Date.now() - downloadStartTime
      downloadSpeed = audioData.length / (downloadTime / 1000)

      console.log(`Download completed: ${audioData.length} bytes in ${downloadTime}ms`)

      // Phase 3: Validate format (optimized with worker)
      const { isMP3, isM4A } = await validateAudioOptimized(audioData)
      
      if (!isMP3 && !isM4A) {
        throw new Error('Invalid audio format')
      }

      // Phase 4: Convert to MP3 (if needed)
      let mp3Blob: Blob
      if (isMP3) {
        // Skip conversion if already MP3
        mp3Blob = new Blob([audioData], { type: 'audio/mpeg' })
        conversionTime = 0
        console.log('Skipped conversion (already MP3)')
      } else {
        // Convert M4A to MP3
        store.updateTrackStatus(trackId, 'converting')
        const conversionStartTime = Date.now()
        mp3Blob = await convertToMp3(audioData)
        conversionTime = Date.now() - conversionStartTime
        console.log(`Conversion completed in ${conversionTime}ms`)
      }

      // Phase 5: Save file
      const filename = sanitizeFilename(`${track.title}.mp3`)
      await downloadBlob(mp3Blob, filename)

      // Mark as completed
      store.updateTrackStatus(trackId, 'completed')
      store.updateTrackProgress(trackId, 100)
      
      // Update performance metrics
      performanceStore.updateMetrics(downloadSpeed, conversionTime, true)
      
      const totalTime = Date.now() - startTime
      console.log(`Optimized download completed: ${track.title} (Total: ${totalTime}ms, Download: ${downloadTime}ms, Conversion: ${conversionTime}ms)`)

    } catch (error: any) {
      console.error('Optimized download failed:', error)

      if (error.message === 'Download cancelled' || abortController.signal.aborted) {
        console.log('Download was cancelled for track:', trackId)
      } else {
        store.updateTrackStatus(trackId, 'error', error.message)
        store.updateTrackProgress(trackId, 0)
        performanceStore.updateMetrics(downloadSpeed, 0, false)
      }
    } finally {
      activeDownloads.delete(trackId)
    }
  }

  // Optimized batch download with intelligent scheduling
  const startOptimizedBatchDownload = async (): Promise<void> => {
    if (typeof window === 'undefined') {
      console.warn('startOptimizedBatchDownload can only be called on the client side')
      return
    }
    
    const queuedItems = store.queueItems.filter(item => item.status === 'queued')
    if (queuedItems.length === 0) return

    console.log(`Starting optimized batch download of ${queuedItems.length} tracks`)

    // Initialize worker pool
    if (workerPool.length === 0) {
      initWorkerPool()
    }

    // Intelligent concurrency based on system capabilities
    const maxConcurrent = Math.min(
      performanceStore.settings.maxConcurrentDownloads,
      Math.max(1, Math.floor(navigator.hardwareConcurrency / 2))
    )

    console.log(`Using ${maxConcurrent} concurrent downloads with ${workerPool.length} workers`)

    // Process downloads with optimized concurrency
    const downloadPromises: Promise<void>[] = []
    
    for (const item of queuedItems) {
      // Wait for available slot
      while (downloadSemaphore.value >= maxConcurrent) {
        await new Promise(resolve => setTimeout(resolve, 50)) // Reduced wait time
      }
      
      // Start optimized download
      const downloadPromise = startOptimizedDownloadWithSemaphore(item.track.id.toString())
      downloadPromises.push(downloadPromise)
    }
    
    // Wait for all downloads with progress tracking
    const results = await Promise.allSettled(downloadPromises)
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    console.log(`Optimized batch download completed: ${successful} successful, ${failed} failed`)
  }

  // Helper function with semaphore
  const startOptimizedDownloadWithSemaphore = async (trackId: string): Promise<void> => {
    downloadSemaphore.value++
    try {
      await startOptimizedDownload(trackId)
    } catch (error) {
      console.error('Failed to download track:', trackId, error)
    } finally {
      downloadSemaphore.value--
    }
  }

  // Cleanup function
  const cleanup = () => {
    // Cleanup workers
    workerPool.forEach(worker => {
      try {
        worker.terminate()
      } catch (error) {
        console.warn('Error terminating worker:', error)
      }
    })
    workerPool = []

    // Clear caches
    streamUrlCache.clear()
    connectionPool.clear()

    // Cancel active downloads
    activeDownloads.forEach(controller => controller.abort())
    activeDownloads.clear()
  }

  // Initialize on first use
  onMounted(() => {
    initWorkerPool()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    // Optimized methods
    startOptimizedDownload,
    startOptimizedBatchDownload,
    cleanup,
    
    // Stats
    activeDownloads: computed(() => activeDownloads.size),
    workerCount: computed(() => workerPool.length),
    cacheSize: computed(() => streamUrlCache.size)
  }
}