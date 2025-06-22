<template>
  <div>
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-4">
        SoundCloud Playlist Downloader
      </h1>
      <p class="text-gray-400">Enter a SoundCloud playlist URL to download all tracks</p>
    </div>

    <!-- URL Input Section -->
    <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-700/50 mb-8">
      <PlaylistInput 
        @playlist-loaded="handlePlaylistLoaded"
        @background-job-created="handleBackgroundJobCreated"
        @before-fetch="handleBeforeFetch"
        @error="handleError"
        :loading="loading"
      />
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal
      :show="showConfirmModal"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :additional-info="confirmModal.additionalInfo"
      :confirm-text="confirmModal.confirmText"
      :cancel-text="confirmModal.cancelText"
      :type="confirmModal.type"
      @confirm="handleConfirmReplace"
      @cancel="handleCancelReplace"
    />

    <!-- Background Job Progress -->
    <BackgroundJobProgress 
      v-if="currentJob"
      :job="currentJob"
      @close="closeJobProgress"
    />

    <!-- Error Message -->
    <div v-if="error" 
         class="bg-red-900/20 border border-red-800/50 text-red-200 p-4 rounded-xl mb-8 backdrop-blur-sm">
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Track List -->
    <TrackList 
      v-if="playlistInfo && tracks && tracks.length > 0"
      :tracks="tracks"
      :is-loading="loading"
      :error="error"
      :playlist-title="playlistInfo?.title"
      :playlist-artwork="playlistInfo?.artwork"
      :is-downloading-all="isDownloadingAll"
      :downloading-tracks="Array.from(downloadingTracks).map(String)"
      :error-tracks="{}"
      @download="handleDownloadTrack"
      @download-all="handleDownloadAll"
    />

    <!-- Loading State -->
    <div v-else-if="loading" class="text-center py-12">
      <div class="inline-flex items-center gap-3 text-gray-400">
        <svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading playlist...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, inject, type Ref, onMounted } from 'vue'
import type { Track, PlaylistInfo, PlaylistResponse } from '@/types'
import type { JobStatus } from '@/composables/useBackgroundJobs'
import { usePlaylist } from '@/composables/usePlaylist'
import { useBackgroundJobs } from '@/composables/useBackgroundJobs'
import { useLogger } from '@/composables/useLogger'
import ConfirmModal from '@/components/ConfirmModal.vue'

const { error: playlistError } = usePlaylist()
const { getJobStatus } = useBackgroundJobs()
const logger = useLogger()

// Inject download functionality from layout
const handleDownloadTrack = inject('handleDownloadTrack') as (track: Track) => Promise<void>
const handleDownloadAllTracks = inject('handleDownloadAllTracks') as (tracks: Track[]) => Promise<void>
const downloadingTracks = inject('downloadingTracks') as Ref<string[]>
const errorTracks = inject('errorTracks') as Ref<Record<string, string>>

const tracks = ref<Track[]>([])
const playlistInfo = ref<PlaylistInfo | null>(null)
const loading = ref(false)
const error = ref('')
const isDownloadingAll = ref(false)
const currentJob = ref<JobStatus | null>(null)

// Confirm modal state
const showConfirmModal = ref(false)
const pendingFetchData = ref<{ url: string; useBackground: boolean } | null>(null)
const confirmModal = ref({
  title: '',
  message: '',
  additionalInfo: '',
  confirmText: 'Replace',
  cancelText: 'Cancel',
  type: 'warning' as 'warning' | 'danger' | 'info'
})

async function handlePlaylistLoaded(data: PlaylistResponse) {
  tracks.value = data.tracks
  playlistInfo.value = data.playlistInfo
  error.value = ''
  currentJob.value = null // Clear job when completed
  
  // Log successful playlist load
  logger.logPlaylistLoad(data.playlistInfo.url || 'Unknown URL', data.tracks.length)
  logger.logUserAction(`Loaded playlist: ${data.playlistInfo.title}`)
}

function handleError(errorMessage: string) {
  error.value = errorMessage
  tracks.value = []
  playlistInfo.value = null
  
  // Log playlist error
  logger.logPlaylistError('Unknown URL', errorMessage)
  logger.logError('Playlist Load Failed', errorMessage)
}

async function handleBackgroundJobCreated(job: JobStatus) {
  currentJob.value = job
  error.value = ''
  
  logger.logUserAction(`Started background processing job: ${job.id}`)
  
  // Start polling for job status
  const pollJob = async () => {
    try {
      const updatedJob = await getJobStatus(job.id)
      currentJob.value = updatedJob
      
      if (updatedJob.status === 'completed' && updatedJob.result) {
        logger.logUserAction(`Background job completed: ${job.id}`)
        handlePlaylistLoaded(updatedJob.result)
      } else if (updatedJob.status === 'failed') {
        logger.logError('Background Job Failed', updatedJob.error || 'Unknown error')
        handleError(updatedJob.error || 'Background processing failed')
        currentJob.value = null
      } else if (updatedJob.status === 'processing' || updatedJob.status === 'pending') {
        // Continue polling
        setTimeout(pollJob, 2000)
      }
    } catch (err) {
      console.error('Error polling job status:', err)
      setTimeout(pollJob, 5000) // Retry with longer delay
    }
  }
  
  // Start polling
  setTimeout(pollJob, 1000)
}

function closeJobProgress() {
  currentJob.value = null
}

// Handle before fetch - check if we need to confirm replacement
function handleBeforeFetch(data: { url: string; useBackground: boolean }) {
  const hasExistingPlaylist = tracks.value.length > 0 || playlistInfo.value
  const hasActiveDownloads = downloadingTracks.value.length > 0
  const hasActiveJob = currentJob.value && ['pending', 'processing'].includes(currentJob.value.status)

  if (!hasExistingPlaylist && !hasActiveDownloads && !hasActiveJob) {
    // No existing data, proceed directly
    proceedWithFetch(data.url, data.useBackground)
    return
  }

  // Store pending fetch data
  pendingFetchData.value = data

  // Determine the type of confirmation needed
  if (hasActiveDownloads || hasActiveJob) {
    // Active downloads or background job
    const activeCount = downloadingTracks.value.length
    const jobInfo = hasActiveJob ? ` and 1 background job` : ''
    
    confirmModal.value = {
      title: 'Active Downloads Detected',
      message: `You have ${activeCount} active downloads${jobInfo}. Loading a new playlist will clear the current playlist and may interrupt ongoing downloads.`,
      additionalInfo: 'Active downloads will continue in the background, but you won\'t be able to track their progress.',
      confirmText: 'Load New Playlist',
      cancelText: 'Keep Current',
      type: 'warning'
    }
  } else {
    // Just existing playlist without active downloads
    const trackCount = tracks.value.length
    const playlistTitle = playlistInfo.value?.title || 'current playlist'
    
    confirmModal.value = {
      title: 'Replace Current Playlist',
      message: `You have "${playlistTitle}" loaded with ${trackCount} tracks. Do you want to replace it with the new playlist?`,
      additionalInfo: 'This will clear the current track list.',
      confirmText: 'Replace',
      cancelText: 'Keep Current',
      type: 'info'
    }
  }

  showConfirmModal.value = true
}

// Handle confirm replacement
function handleConfirmReplace() {
  showConfirmModal.value = false
  
  if (pendingFetchData.value) {
    // Clear current state
    clearCurrentPlaylist()
    
    // Proceed with fetch
    proceedWithFetch(pendingFetchData.value.url, pendingFetchData.value.useBackground)
    pendingFetchData.value = null
  }
}

// Handle cancel replacement
function handleCancelReplace() {
  showConfirmModal.value = false
  pendingFetchData.value = null
}

// Clear current playlist state
function clearCurrentPlaylist() {
  tracks.value = []
  playlistInfo.value = null
  error.value = ''
  currentJob.value = null
  
  logger.logUserAction('Cleared current playlist for new playlist')
}

// Proceed with actual fetch
async function proceedWithFetch(url: string, useBackground: boolean) {
  // This will be handled by the PlaylistInput component
  // We need to emit an event back to it
  const playlistInputEvent = new CustomEvent('proceed-fetch', {
    detail: { url, useBackground }
  })
  window.dispatchEvent(playlistInputEvent)
}

async function handleDownloadAll() {
  if (!tracks.value || tracks.value.length === 0) return
  
  isDownloadingAll.value = true
  
  try {
    // Filter out tracks that are already being downloaded or have errors
    const tracksToDownload = tracks.value.filter(track => {
      const trackId = track.id.toString()
      return !downloadingTracks.value.includes(trackId) && !errorTracks.value[trackId]
    })

    if (tracksToDownload.length === 0) {
      logger.logUserAction('No new tracks to download')
      return
    }

    // Log batch download start
    logger.logDownloadQueueStart(tracksToDownload.length)
    logger.logUserAction(`Started batch download of ${tracksToDownload.length} tracks`)

    // Use the optimized batch download function - much faster!
    await handleDownloadAllTracks(tracksToDownload)

    // Log batch download completion
    logger.logDownloadQueueComplete(tracksToDownload.length, tracksToDownload.length)
    logger.logUserAction(`Successfully added ${tracksToDownload.length} tracks to download queue`)
    
  } catch (error) {
    logger.logError('Batch Download Failed', error instanceof Error ? error.message : 'Unknown error')
  } finally {
    isDownloadingAll.value = false
  }
}

// Watch for playlist errors
watchEffect(() => {
  if (playlistError.value) {
    error.value = playlistError.value
    logger.logPlaylistError('Unknown URL', playlistError.value)
  }
})

// Log page visit
onMounted(() => {
  logger.logUserAction('Visited playlist page')
  logger.logSystemStatus('Playlist Page', 'online', 'Playlist downloader ready')
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>