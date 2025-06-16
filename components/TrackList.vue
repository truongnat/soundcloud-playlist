<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <UProgress v-if="loading" animation="carousel" class="mb-4" />

    <UAlert
      v-else-if="error"
      color="red"
      :title="error"
      icon="i-heroicons-exclamation-circle"
      class="mb-4"
    />

    <div v-else>
      <div v-if="tracks.length" class="space-y-6">
        <!-- Playlist Header -->
        <UCard>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-6">
              <UAvatar
                v-if="playlistArtwork"
                :src="playlistArtwork"
                :alt="playlistTitle"
                size="2xl"
              />
              <div>
                <h1 class="text-3xl font-bold mb-2">{{ playlistTitle }}</h1>
                <p v-if="playlistDescription" class="text-gray-600 mb-3">{{ playlistDescription }}</p>
                <UBadge
                  color="gray"
                  variant="subtle"
                  icon="i-heroicons-musical-note"
                >
                  {{ tracks.length }} tracks
                </UBadge>
              </div>
            </div>
            <UButton
              @click="downloadAllTracks"
              color="primary"
              icon="i-heroicons-cloud-arrow-down"
            >
              Download All
            </UButton>
          </div>
        </UCard>

        <!-- Track Cards -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="currentTrack in tracks"
            :key="currentTrack.id"
            class="group hover:shadow-lg transition-shadow"
          >
            <div class="flex space-x-5">
              <div class="relative flex-shrink-0">
                <UAvatar
                  v-if="currentTrack.artwork"
                  :src="currentTrack.artwork"
                  :alt="currentTrack.title"
                  size="2xl"
                />
                <div v-else class="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-musical-note" class="w-12 h-12 text-gray-400" />
                </div>

                <UBadge
                  v-if="activeDownloads.includes(getTrackId(currentTrack.id))"
                  class="absolute -top-2 -right-2"
                  color="primary"
                  variant="solid"
                >
                  <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
                </UBadge>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start space-x-4 mb-2">
                  <div>
                    <h3 class="font-medium text-lg leading-tight line-clamp-2">
                      {{ currentTrack.title }}
                    </h3>
                    <p class="text-sm text-gray-600 mt-1 flex items-center">
                      <UIcon name="i-heroicons-user" class="mr-1 text-gray-400" />
                      {{ currentTrack.artist }}
                    </p>
                  </div>
                  <span class="text-sm text-gray-500 whitespace-nowrap flex items-center">
                    <UIcon name="i-heroicons-clock" class="mr-1 text-gray-400" />
                    {{ formatDuration(currentTrack.duration) }}
                  </span>
                </div>
                <div class="flex items-center space-x-3 mt-4">
                  <UButton
                    @click="downloadTrack(currentTrack)"
                    :disabled="!currentTrack.streamUrl || activeDownloads.includes(getTrackId(currentTrack.id))"
                    color="neutral"
                    variant="soft"
                    icon="i-heroicons-cloud-arrow-down"
                    :class="!currentTrack.streamUrl || activeDownloads.includes(getTrackId(currentTrack.id))
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500'"
                  >
                    <span>
                      {{ !currentTrack.streamUrl 
                        ? 'Unavailable' 
                        : activeDownloads.includes(getTrackId(currentTrack.id)) 
                          ? 'Processing...' 
                          : 'Download' }}
                    </span>
                  </UButton>
                  <UTooltip text="Open in SoundCloud">
                    <UButton
                      :to="currentTrack.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      icon="i-heroicons-arrow-top-right-on-square"
                      color="neutral"
                      variant="ghost"
                    />
                  </UTooltip>
                </div>

                <UAlert
                  v-if="downloadErrors[currentTrack.id]"
                  class="mt-3"
                  color="error"
                  variant="soft"
                  :title="downloadErrors[currentTrack.id]"
                  icon="i-heroicons-exclamation-circle"
                />
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-12">
        <UIcon
          name="i-heroicons-musical-note"
          class="w-16 h-16 mb-4 text-gray-400"
        />
        <p class="text-lg text-gray-500">Enter a SoundCloud playlist URL to see tracks</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Track } from '@/types'

// Props
const props = defineProps<{
  tracks: Track[]
  loading?: boolean
  error?: string
  playlistTitle?: string
  playlistDescription?: string
  playlistArtwork?: string
}>()

const emit = defineEmits<{
  (e: 'download-track', track: Track): void
  (e: 'download-all', tracks: Track[]): void
}>()

const downloadErrors = ref<Record<string, string>>({})
const activeDownloads = ref<string[]>([])

// Format duration from milliseconds to minutes:seconds
const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}:${seconds.padStart(2, '0')}`
}

// Convert track ID to string
const getTrackId = (id: string | number): string => id.toString()

// Download a single track
const downloadTrack = (track: Track) => {
  console.log('TrackList: Starting download for track:', track.title)
  const trackId = getTrackId(track.id)

  if (!track.streamUrl) {
    console.warn('Track not available for download:', track.title)
    downloadErrors.value[trackId] = 'This track is not available for download.'
    return
  }

  if (activeDownloads.value.includes(trackId)) {
    console.log('Track already in active downloads:', track.title)
    return
  }

  console.log('TrackList: Emitting download-track for:', track.title)
  activeDownloads.value.push(trackId)
  emit('download-track', track)
}

// Download all tracks in the playlist
const downloadAllTracks = () => {
  console.log('TrackList: Starting download all')
  const availableTracks = props.tracks.filter(track => track.streamUrl)

  if (availableTracks.length === 0) {
    console.warn('No tracks available for download')
    downloadErrors.value['all'] = 'No tracks available for download.'
    return
  }

  console.log(`TrackList: Emitting download-all with ${availableTracks.length} tracks`)
  emit('download-all', availableTracks)
}

// Handle download completion
const handleDownloadComplete = (trackId: string) => {
  console.log('TrackList: Handling download complete for:', trackId)
  const index = activeDownloads.value.indexOf(trackId)
  if (index !== -1) {
    activeDownloads.value.splice(index, 1)
    console.log('Removed track from activeDownloads:', trackId)
  }
}

defineExpose({
  handleDownloadComplete
})
</script>
