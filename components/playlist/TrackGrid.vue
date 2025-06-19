<template>
  <!-- Grid Container -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">      
    <TrackCard
      v-for="track in tracks"
      :key="getTrackId(track)"
      :track="track"
      :active-downloads="downloadingTracks || []"
      :download-errors="errorTracks || {}"
      @download="$emit('download', track)"
    />
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