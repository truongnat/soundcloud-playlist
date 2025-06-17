<template>
  <!-- Grid Container -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">      
    <TrackCard
      v-for="track in tracks"
      :key="getTrackId(track)"
      :track="track"
      :active-downloads="downloadingTracks || []"
      :download-errors="errorTracks || {}"
      @download="$emit('download', track)"
    />
    
    <!-- Empty State -->
    <div v-if="!tracks || tracks.length === 0"
      class="col-span-full bg-white rounded-lg border border-gray-100 p-8 text-center">
      <svg class="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
      <h3 class="text-gray-900 font-medium mb-1">
        No tracks found
      </h3>
      <p class="text-sm text-gray-500">
        This playlist appears to be empty or the tracks couldn't be loaded.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Track } from '@/types'
import TrackCard from './TrackCard.vue'

defineProps<{
  tracks: Track[]
  downloadingTracks?: string[]
  errorTracks?: Record<string, string>
}>()

defineEmits<{
  (e: 'download', track: Track): void
}>()

const getTrackId = (track: Track): string => String(track.id)
</script>