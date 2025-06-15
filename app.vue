<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-xl mx-auto px-4 py-4">
        <h1 class="text-2xl font-bold text-gray-900">SoundCloud Playlist Downloader</h1>
      </div>
    </header>
    <main>
      <PlaylistInput @fetch-playlist="fetchPlaylist" :loading="loading" />
      <TrackList
        :tracks="tracks"
        :loading="loading"
        :error="error"
        :playlist-title="playlistInfo.title"
        :playlist-description="playlistInfo.description"
        :playlist-artwork="playlistInfo.artwork"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { usePlaylist } from './composables/usePlaylist'
const { tracks, loading, error, playlistInfo, fetchPlaylist } = usePlaylist()
</script>
