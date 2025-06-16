import type { Track } from '@/types'
import { useAudioProcessor } from './useAudioProcessor'
import { useDownloadQueueStore } from '@/stores/downloadQueue'

const { convertToMp3 } = useAudioProcessor()

// Global abort controllers để có thể cancel downloads
const activeDownloads = new Map<string, AbortController>()

// Helper for file download
const downloadFile = async (blob: Blob, filename: string): Promise<void> => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

export const useDownloadQueue = () => {
  const store = useDownloadQueueStore()

  // Helper functions
  const getTrackId = (id: string | number): string => id.toString()
  
  const downloadFile = async (blob: Blob, filename: string): Promise<void> => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

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
      console.log('Cancelling download for track:', trackId)
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

      console.log('Got stream URL, downloading...')      // Download the audio file
      let audioData: Uint8Array
      let maxRetries = 3
      let attempt = 0

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

          // Download with progress tracking
          const reader = audioResponse.body.getReader()
          const contentLength = +(audioResponse.headers.get('Content-Length') || 0)
          let receivedLength = 0
          const chunks: Uint8Array[] = []

          while (true) {
            // Kiểm tra cancel trong quá trình download
            if (abortController.signal.aborted) {
              throw new Error('Download cancelled')
            }

            const { done, value } = await reader.read()
            if (done) break

            chunks.push(value)
            receivedLength += value.length

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
          const isMP3 = audioData[0] === 0xFF && (audioData[1] & 0xE0) === 0xE0
          const isM4A = (
            audioData[4] === 0x66 && // f
            audioData[5] === 0x74 && // t
            audioData[6] === 0x79 && // y
            audioData[7] === 0x70    // p
          )
          
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
      store.updateTrackStatus(trackId, 'converting')
      const mp3Blob = await convertToMp3(audioData!)

      // Kiểm tra cancel trước khi save
      if (abortController.signal.aborted) {
        throw new Error('Download cancelled')
      }

      // Save file
      const filename = `${track.title}.mp3`.replace(/[<>:"/\\|?*]/g, '_')
      await downloadFile(mp3Blob, filename)

      // Mark as completed
      store.updateTrackStatus(trackId, 'completed')
      store.updateTrackProgress(trackId, 100)
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
      }
    } finally {
      // Cleanup abort controller
      activeDownloads.delete(trackId)
    }
  }

  // Start all queued downloads
  const startAllDownloads = async (): Promise<void> => {
    const queuedItems = queueItems.value.filter(item => item.status === 'queued')
    
    for (const item of queuedItems) {
      try {
        await startDownload(item.track.id.toString())
      } catch (error) {
        console.error('Failed to download track:', item.track.title, error)
        // Continue with next track
      }
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
