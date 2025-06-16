import type { Track } from '@/types'
import { useAudioProcessor } from './useAudioProcessor'
import { useDownloadQueueStore } from '@/stores/downloadQueue'

const { convertToMp3 } = useAudioProcessor()

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

  // Download processing
  const startDownload = async (trackId: string): Promise<void> => {
    const queueItem = store.queue[trackId]
    if (!queueItem || queueItem.status !== 'queued') return

    try {
      // Update status to downloading using store
      store.updateTrackStatus(trackId, 'downloading')
      store.updateTrackProgress(trackId, 0)

      const track = queueItem.track
      console.log('Starting download:', track.title)

      // Get stream URL from our API
      const response = await fetch(`/api/stream-mp3?url=${encodeURIComponent(track.url)}`)
      if (!response.ok) throw new Error('Failed to get stream URL')
      
      const data = await response.json()
      if (!data?.streamUrl) throw new Error('No stream URL in response')

      console.log('Got stream URL, downloading...')      // Download the audio file
      let audioData: Uint8Array
      let maxRetries = 3
      let attempt = 0

      while (attempt < maxRetries) {
        try {
          const audioResponse = await fetch(data.streamUrl)
          if (!audioResponse.ok) throw new Error('Failed to download audio')
          
          if (!audioResponse.body) throw new Error('No response body')

          // Download with progress tracking
          const reader = audioResponse.body.getReader()
          const contentLength = +(audioResponse.headers.get('Content-Length') || 0)
          let receivedLength = 0
          const chunks: Uint8Array[] = []

          while (true) {
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

      // Convert to MP3
      store.updateTrackStatus(trackId, 'converting')
      const mp3Blob = await convertToMp3(audioData!)

      // Save file
      const filename = `${track.title}.mp3`.replace(/[<>:"/\\|?*]/g, '_')
      await downloadFile(mp3Blob, filename)

      // Mark as completed
      store.updateTrackStatus(trackId, 'completed')
      store.updateTrackProgress(trackId, 100)
    } catch (error: any) {
      console.error('Download failed:', error)

      // Mark as error
      store.updateTrackStatus(trackId, 'error', error.message)
      store.updateTrackProgress(trackId, 0)
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
    startDownload,
    startAllDownloads
  }
}
