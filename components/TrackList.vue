<template>
  <div class="space-y-8">
    <!-- Playlist Header -->
    <div v-if="playlistTitle || playlistArtwork" class="relative">
      <!-- Banner Image -->
      <div class="relative h-48 md:h-64 lg:h-80 overflow-hidden rounded-lg">
        <img
          v-if="playlistArtwork"
          :src="playlistArtwork"
          :alt="playlistTitle"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        <!-- Playlist Info -->
        <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
            {{ playlistTitle || 'Untitled Playlist' }}
          </h1>
          <p class="text-sm md:text-base text-gray-200">
            {{ tracks?.length || 0 }} tracks
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <USkeleton v-for="i in 6" :key="i" class="h-24 w-full" />
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      :title="error"
      color="red"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Tracks Grid -->
    <TrackGrid
      v-else-if="tracks && tracks.length > 0"
      :tracks="tracks"
      :downloading-tracks="downloadingTracks"
      :error-tracks="errorTracks"
      @download="$emit('download', $event)"
    />

    <!-- Empty State -->
    <UCard v-else class="text-center py-12">
      <template #header>
        <div class="flex items-center justify-center">
          <UIcon name="i-heroicons-musical-note" class="w-12 h-12 text-gray-400" />
        </div>
      </template>
      <p class="text-gray-500">No tracks found in this playlist</p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { Track } from '@/types'
import TrackGrid from './playlist/TrackGrid.vue'

defineProps<{
  tracks?: Track[]
  isLoading?: boolean
  error?: string
  playlistTitle?: string
  playlistArtwork?: string
  downloadingTracks?: string[]
  errorTracks?: Record<string, string>
}>()

defineEmits<{
  (e: 'download', track: Track): void
}>()
</script>

<style scoped>
.space-y-8 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 2rem;
}

.space-y-4 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 1rem;
}
</style>
