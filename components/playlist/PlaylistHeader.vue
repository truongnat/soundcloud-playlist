<template>
  <UCard class="overflow-hidden">
    <div class="relative">
      <!-- Background Image with Overlay -->
      <div class="absolute inset-0">
        <img
          v-if="artwork"
          :src="artwork"
          :alt="title"
          class="w-full h-full object-cover filter blur-xl opacity-20"
        />
        <div v-else class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-20"></div>
      </div>

      <!-- Content -->
      <div class="relative flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 p-6">
        <!-- Artwork -->
        <div class="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-300 hover:scale-105">
          <img
            v-if="artwork"
            :src="artwork"
            :alt="title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <UIcon name="i-heroicons-musical-note" class="w-20 h-20 text-white opacity-50" />
          </div>
        </div>
        
        <!-- Info -->
        <div class="flex-1 text-center md:text-left">
          <h1 class="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {{ title }}
          </h1>
          <p v-if="description" class="text-gray-600 mb-6 text-lg">{{ description }}</p>
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <UBadge
              color="blue"
              variant="subtle"
              icon="i-heroicons-musical-note"
              class="text-lg px-4 py-2"
            >
              {{ trackCount }} tracks
            </UBadge>
            <UButton
              @click="$emit('download-all')"
              color="primary"
              size="lg"
              icon="i-heroicons-cloud-arrow-down"
              class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Download All
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  artwork?: string
  trackCount: number
}>()

defineEmits<{
  (e: 'download-all'): void
}>()
</script> 