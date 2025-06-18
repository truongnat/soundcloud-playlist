<template>
  <div>
    <PlaylistInput @fetch-playlist="fetchPlaylist" :loading="loading" />
    <TrackList 
      :tracks="tracks" 
      :is-loading="loading" 
      :error="error" 
      :playlist-title="playlistInfo?.title"
      :playlist-artwork="playlistInfo?.artwork"      :downloading-tracks="downloadingTracks ? Array.from(downloadingTracks.value).map(String) : []" 
      :error-tracks="errorTracks ? Object.fromEntries(Array.from(errorTracks.value).map(id => [String(id), 'Failed'])) : {}"
      :is-downloading-all="downloadStats?.active > 0"
      @download="handleDownloadTrack"
      @download-all="handleDownloadAll" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Track, PlaylistInfo, PlaylistResponse } from '~/types'
import { usePlaylist } from '~/composables/usePlaylist'
import { useTrackDownloader } from '~/composables/useTrackDownloader'

const { fetchPlaylist: getPlaylist, error: playlistError } = usePlaylist()
const {
  downloadingTracks,
  errorTracks,
  downloadStats,
  handleDownloadTrack: downloadSingleTrack,
  handleDownloadAll: downloadMultipleTracks
} = useTrackDownloader()

const loading = ref(false)
const error = ref('')
const tracks = ref<Track[]>([])
const playlistInfo = ref<PlaylistInfo | null>(null)

async function fetchPlaylist(url: string) {
  if (!url) return
  
  loading.value = true
  error.value = ''
  tracks.value = []
  playlistInfo.value = null
    try {
    const response = await getPlaylist(url)
    console.log('Playlist response:', response)
    if (response) {
      tracks.value = response.tracks
      playlistInfo.value = response.info
      console.log('Updated tracks:', tracks.value)
      console.log('Updated playlistInfo:', playlistInfo.value)
    }
  } catch (e: any) {
    error.value = playlistError.value || 'Failed to fetch playlist'
  } finally {
    loading.value = false
  }
}

function handleDownloadTrack(track: Track) {
  downloadSingleTrack(track)
}

function handleDownloadAll() {
  if (tracks.value.length === 0) return
  downloadMultipleTracks(tracks.value)
}
</script>
