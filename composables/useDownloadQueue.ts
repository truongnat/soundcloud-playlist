import type { Track } from '@/types'
import { nextTick } from 'vue'
import { useAudioProcessor } from './useAudioProcessor'
import { useDownloadPerformance } from './useDownloadPerformance'
import { useDownloadQueueStore } from '@/stores/downloadQueue'
import { validateAudioFormat, downloadBlob } from '~/utils/audio'
import { sanitizeFilename } from '~/utils/api'

const { convertToMp3 } = useAudioProcessor()
const { settings: performanceSettings, updateMetrics } = useDownloadPerformance()

// Global abort controllers để có thể cancel downloads
const activeDownloads = new Map<string, AbortController>()

// Dynamic configuration based on performance settings
const downloadSemaphore = ref(0) // Current active downloads count

export const useDownloadQueue = () => {
  const store = useDownloadQueueStore()

  // Helper functions
  const getTrackId = (id: string | number): string => id.toString()
  
  
  const retryDownload = async (trackId: string): Promise<void> => {
    const queueItem = store.queue[trackId]
    if (!queueItem || !['error', 'retry'].includes(queueItem.status)) return

    // Reset the item state using store action
    store.updateTrackStatus(trackId, 'queued')
    store.updateTrackProgress(trackId, 0)

    // Start the download again
    await startDownload(trackId)
  }

  // Queue state getters từ store
  const queueItems = computed(() => store.queueItems)
  const hasActiveDownloads = computed(() => store.hasActiveDownloads)
  const activeCount = computed(() => store.activeCount)
  const hasCompletedDownloads = computed(() => store.hasCompletedDownloads)

  // Queue management sử dụng store actions
  const addToQueue = (track: Track): void => {
    store.addToQueue(track)
    // Auto-start download if we have available slots
    nextTick(() => {
      if (downloadSemaphore.value < performanceSettings.value.maxConcurrentDownloads) {
        const trackId = track.id.toString()
        const queueItem = store.queue[trackId]
        if (queueItem && queueItem.status === 'queued') {
          startDownloadWithSemaphore(trackId)
        }
      }
    })
  }

  const removeFromQueue = (trackId: string | number): void => {
    store.removeFromQueue(getTrackId(trackId))
  }

  const clearCompleted = (): void => {
    store.clearCompleted()
  }

  const discardAll = (): void => {
    // Cancel tất cả active downloads
    activeDownloads.forEach((controller, trackId) => {
      controller.abort()
    })
    activeDownloads.clear()

    // Discard queue trong store
    store.discardAll()
  }

  // Download processing
  const startDownload = async (trackId: string): Promise<void> => {
    const queueItem = store.queue[trackId]
    if (!queueItem || queueItem.status !== 'queued') return

    // Tạo AbortController cho download này
    const abortController = new AbortController()
    activeDownloads.set(trackId, abortController)

    // Performance tracking
    const startTime = Date.now()
    let downloadStartTime = 0
    let conversionStartTime = 0
    let downloadSpeed = 0

    try {
      // Update status to downloading using store
      store.updateTrackStatus(trackId, 'downloading')
      store.updateTrackProgress(trackId, 0)

      const track = queueItem.track
      console.log('Starting download:', track.title)

      // Kiểm tra nếu đã bị cancel
      if (abortController.signal.aborted) {
        throw new Error('Download cancelled')
      }

      // Get stream URL from our API with fallback
      let data
      try {
        const response = await fetch(`/api/stream-mp3?url=${encodeURIComponent(track.url)}`, {
          signal: abortController.signal
        })
        if (!response.ok) throw new Error(`API failed with status ${response.status}`)

        data = await response.json()
        if (!data?.streamUrl) throw new Error('No stream URL in response')
      } catch (apiError: any) {
        console.log('Main API failed, trying fallback:', apiError.message)

        // Try fallback API
        try {
          const fallbackResponse = await fetch(`/api/track-fallback?url=${encodeURIComponent(track.url)}`, {
            signal: abortController.signal
          })
          if (!fallbackResponse.ok) throw new Error(`Fallback API failed with status ${fallbackResponse.status}`)

          const fallbackData = await fallbackResponse.json()
          if (!fallbackData?.streamUrl) throw new Error('No stream URL in fallback response')

          data = fallbackData
          console.log('Fallback API succeeded')
        } catch (fallbackError: any) {
          throw new Error(`Both main and fallback APIs failed: ${apiError.message} | ${fallbackError.message}`)
        }
      }

      console.log('Got stream URL, downloading...')
      
      // Download the audio file
      let audioData: Uint8Array
      let maxRetries = 3
      let attempt = 0
      downloadStartTime = Date.now()

      while (attempt < maxRetries) {
        try {
          // Kiểm tra cancel trước khi download
          if (abortController.signal.aborted) {
            throw new Error('Download cancelled')
          }

          const audioResponse = await fetch(data.streamUrl, {
            signal: abortController.signal
          })
          if (!audioResponse.ok) throw new Error('Failed to download audio')
          
          if (!audioResponse.body) throw new Error('No response body')

          // Download with progress tracking and performance monitoring
          const reader = audioResponse.body.getReader()
          const contentLength = +(audioResponse.headers.get('Content-Length') || 0)
          let receivedLength = 0
          const chunks: Uint8Array[] = []
          const chunkSize = performanceSettings.value.chunkSize

          while (true) {
            // Kiểm tra cancel trong quá trình download
            if (abortController.signal.aborted) {
              throw new Error('Download cancelled')
            }

            const { done, value } = await reader.read()
            if (done) break

            chunks.push(value)
            receivedLength += value.length

            // Calculate download speed
            const elapsed = (Date.now() - downloadStartTime) / 1000
            downloadSpeed = receivedLength / elapsed // bytes per second

            if (contentLength) {
              store.updateTrackProgress(trackId, Math.round((receivedLength / contentLength) * 100))
            }
          }

          // Verify minimum size (1KB) to catch failed downloads
          if (receivedLength < 1024) {
            throw new Error('Downloaded file too small')
          }

          // Combine chunks
          audioData = new Uint8Array(receivedLength)
          let position = 0
          for (const chunk of chunks) {
            audioData.set(chunk, position)
            position += chunk.length
          }

          // Verify data format
          const { isMP3, isM4A } = validateAudioFormat(audioData)
          
          if (!isMP3 && !isM4A) {
            throw new Error('Invalid audio format')
          }

          break // Success, exit retry loop
          
        } catch (error: any) {
          attempt++
          if (attempt === maxRetries) {
            throw new Error(`Download failed after ${maxRetries} attempts: ${error.message}`)
          }
          console.log(`Retrying download (${attempt}/${maxRetries})...`)
          await new Promise(r => setTimeout(r, 1000 * attempt)) // Exponential backoff
        }
      }

      // Kiểm tra cancel trước khi convert
      if (abortController.signal.aborted) {
        throw new Error('Download cancelled')
      }

      // Convert to MP3
      console.log('Starting conversion for track:', track.title)
      store.updateTrackStatus(trackId, 'converting')
      conversionStartTime = Date.now()
      const mp3Blob = await convertToMp3(audioData!)
      const conversionTime = Date.now() - conversionStartTime
      console.log('Conversion completed for track:', track.title, 'Time:', conversionTime + 'ms')

      // Kiểm tra cancel trước khi save
      if (abortController.signal.aborted) {
        throw new Error('Download cancelled')
      }

      // Save file
      console.log('Saving file for track:', track.title)
      const filename = sanitizeFilename(`${track.title}.mp3`)
      await downloadBlob(mp3Blob, filename)
      console.log('File saved successfully:', filename)

      // Mark as completed
      store.updateTrackStatus(trackId, 'completed')
      store.updateTrackProgress(trackId, 100)
      
      // Update performance metrics
      updateMetrics(downloadSpeed, conversionTime, true)
      console.log(`Download completed: ${track.title} (Speed: ${Math.round(downloadSpeed / 1024)}KB/s, Conversion: ${Math.round(conversionTime / 1000)}s)`)
    } catch (error: any) {
      console.error('Download failed:', error)

      // Kiểm tra nếu là cancel thì không hiển thị error
      if (error.message === 'Download cancelled' || abortController.signal.aborted) {
        console.log('Download was cancelled for track:', trackId)
        // Store sẽ handle việc set status thành cancelled
      } else {
        // Mark as error cho các lỗi khác
        store.updateTrackStatus(trackId, 'error', error.message)
        store.updateTrackProgress(trackId, 0)
        // Update metrics for failed download
        updateMetrics(downloadSpeed, 0, false)
      }
    } finally {
      // Cleanup abort controller
      activeDownloads.delete(trackId)
    }
  }

  // Start all queued downloads with concurrency control
  const startAllDownloads = async (): Promise<void> => {
    const queuedItems = queueItems.value.filter(item => item.status === 'queued')
    
    if (queuedItems.length === 0) return
    
    console.log(`Starting batch download of ${queuedItems.length} tracks with max ${performanceSettings.maxConcurrentDownloads} concurrent downloads`)
    
    // Process downloads with concurrency limit
    const downloadPromises: Promise<void>[] = []
    
    for (const item of queuedItems) {
      // Wait if we've reached the concurrent download limit
      while (downloadSemaphore.value >= performanceSettings.maxConcurrentDownloads) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // Start download with concurrency tracking
      const downloadPromise = startDownloadWithSemaphore(item.track.id.toString())
      downloadPromises.push(downloadPromise)
    }
    
    // Wait for all downloads to complete
    await Promise.allSettled(downloadPromises)
    console.log('Batch download completed')
  }
  
  // Helper function to manage download concurrency
  const startDownloadWithSemaphore = async (trackId: string): Promise<void> => {
    downloadSemaphore.value++
    try {
      await startDownload(trackId)
    } catch (error) {
      console.error('Failed to download track:', trackId, error)
    } finally {
      downloadSemaphore.value--
    }
  }

  return {
    retryDownload,
    queueItems,
    hasActiveDownloads,
    activeCount,
    hasCompletedDownloads,
    addToQueue,
    removeFromQueue,
    clearCompleted,
    discardAll,
    startDownload,
    startAllDownloads
  }
}
