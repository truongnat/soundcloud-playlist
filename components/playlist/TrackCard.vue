<template>
  <UCard
    :ui="{
      base: 'relative overflow-hidden transition-all duration-200 hover:shadow-lg',
      header: { base: 'relative aspect-square' },
      body: 'p-4',
      footer: 'p-4 pt-0'
    }"
  >
    <!-- Artwork -->
    <div class="relative w-full h-full">
      <img
        :src="track.artwork || track.artwork_url"
        :alt="track.title"
        class="w-full h-full object-cover"
      />
      
      <!-- Play Button Overlay -->
      <div class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
        <UButton
          color="white"
          variant="solid"
          icon="i-heroicons-play"
          class="w-12 h-12 rounded-full"
          @click.stop
        />
      </div>

      <!-- Download Badge -->
      <UBadge
        v-if="isDownloading"
        color="blue"
        variant="solid"
        class="absolute top-2 right-2"
      >
        <template #icon>
          <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
        </template>
        Downloading
      </UBadge>
    </div>

    <!-- Track Info -->
    <div class="space-y-1">
      <h3 class="font-medium line-clamp-1" :title="track.title">
        {{ track.title }}
      </h3>
      <p class="text-sm text-gray-500 line-clamp-1" :title="track.artist">
        {{ track.artist }}
      </p>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-between">
        <!-- Duration -->
        <span class="text-sm text-gray-500">
          {{ formatDuration(track.duration) }}
        </span>

        <!-- Download Button -->
        <UButton
          :color="isDownloading ? 'gray' : 'primary'"
          :variant="isDownloading ? 'soft' : 'solid'"
          :icon="isDownloading ? 'i-heroicons-arrow-down-tray' : 'i-heroicons-arrow-down-tray'"
          :loading="isDownloading"
          :disabled="isDownloading"
          @click="$emit('download')"
        >
          {{ isDownloading ? 'Downloading...' : 'Download' }}
        </UButton>
      </div>
    </template>

    <!-- Error Alert -->
    <UAlert
      v-if="error"
      :title="error"
      color="red"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      class="absolute inset-0 m-4"
    />
  </UCard>
</template>

<script setup lang="ts">
import type { Track } from '@/types'

defineProps<{
  track: Track
  isDownloading?: boolean
  error?: string
}>()

defineEmits<{
  (e: 'download'): void
}>()

const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 