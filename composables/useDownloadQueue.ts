import { ref, computed } from 'vue'
import type { Track, QueueItem } from '@/types'
import { useAudioProcessor } from './useAudioProcessor'

export const useDownloadQueue = () => {
  const downloadQueue = ref<Record<string, QueueItem>>({})
  const isQueueVisible = ref(true)

  // Composables
  const { convertToMp3 } = useAudioProcessor()

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
    const queueItem = downloadQueue.value[trackId]
    if (!queueItem || !['error', 'retry'].includes(queueItem.status)) return

    // Reset the item state
    downloadQueue.value[trackId] = {
      ...queueItem,
      status: 'queued',
      progress: 0,
      error: undefined,
      retries: (queueItem.retries || 0) + 1
    }

    // Start the download again
    await startDownload(trackId)
  }

  // Queue state getters
  const queueItems = computed(() => Object.values(downloadQueue.value))

  const hasActiveDownloads = computed(() => {
    return Object.values(downloadQueue.value).some(item => 
      ['downloading', 'converting'].includes(item.status)
    )
  })

  const activeCount = computed(() => {
    return Object.values(downloadQueue.value).filter(item => 
      ['downloading', 'converting'].includes(item.status)
    ).length
  })

  const hasCompletedDownloads = computed(() => {
    return Object.values(downloadQueue.value).some(item => 
      item.status === 'completed'
    )
  })

  // Queue management
  const addToQueue = (track: Track): void => {
    const trackId = getTrackId(track.id)
    console.log('Adding track to queue:', track.title)
    downloadQueue.value[trackId] = {
      track,
      status: 'queued',
      progress: 0
    }
  }

  const removeFromQueue = (trackId: string | number): void => {
    const id = getTrackId(trackId)
    if (downloadQueue.value[id]?.status === 'queued') {
      const { [id]: removed, ...rest } = downloadQueue.value
      downloadQueue.value = rest
    }
  }

  const clearCompleted = (): void => {
    downloadQueue.value = Object.entries(downloadQueue.value).reduce((acc, [id, item]) => {
      if (item.status !== 'completed') {
        acc[id] = item
      }
      return acc
    }, {} as Record<string, QueueItem>)
  }

  // Download processing
  const startDownload = async (trackId: string): Promise<void> => {
    const queueItem = downloadQueue.value[trackId]
    if (!queueItem || queueItem.status !== 'queued') return

    try {
      // Update status to downloading
      downloadQueue.value[trackId] = {
        ...queueItem,
        status: 'downloading',
        progress: 0,
        error: undefined
      }

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
              downloadQueue.value[trackId].progress = Math.round((receivedLength / contentLength) * 100)
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
      downloadQueue.value[trackId].status = 'converting'
      const mp3Blob = await convertToMp3(audioData!)

      // Save file
      const filename = `${track.title}.mp3`.replace(/[<>:"/\\|?*]/g, '_')
      await downloadFile(mp3Blob, filename)

      // Mark as completed
      downloadQueue.value[trackId] = {
        ...downloadQueue.value[trackId],
        status: 'completed',
        progress: 100
      }    } catch (error: any) {
      console.error('Download failed:', error)
      const queueItem = downloadQueue.value[trackId]
      const retries = (queueItem.retries || 0)
      
      downloadQueue.value[trackId] = {
        ...downloadQueue.value[trackId],
        status: 'error',
        error: error.message,
        retries,
        progress: 0
      }
    }
  }

  return {
    retryDownload,
    downloadQueue,
    isQueueVisible,
    queueItems,
    hasActiveDownloads,
    activeCount,
    hasCompletedDownloads,
    addToQueue,
    removeFromQueue,
    clearCompleted,
    startDownload
  }
}
