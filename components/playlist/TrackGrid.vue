<template>
  <div class="space-y-6">
    <!-- Grid Container -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">      <TrackCard
        v-for="track in tracks"
        :key="getTrackId(track)"
        :track="track"
        :active-downloads="downloadingTracks || []"
        :download-errors="errorTracks || {}"
        @download="$emit('download', track)"
      />
    </div>

    <!-- Empty State -->
    <UCard
      v-if="!tracks || tracks.length === 0"
      class="text-center py-12"
      :ui="{
        background: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm',
        ring: 'ring-1 ring-gray-200 dark:ring-gray-800',
        shadow: 'shadow-lg',
        rounded: 'rounded-2xl'
      }"
    >
      <UIcon
        name="i-heroicons-musical-note"
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
      />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No tracks found
      </h3>
      <p class="text-gray-500 dark:text-gray-400">
        This playlist appears to be empty or the tracks couldn't be loaded.
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { Track } from '@/types'
import TrackCard from './TrackCard.vue'

const props = defineProps<{
  tracks: Track[]
  downloadingTracks?: string[]
  errorTracks?: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'download', track: Track): void
}>()

const getTrackId = (track: Track): string => {
  return String(track.id)
}
</script>

<style scoped>
.grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style> 