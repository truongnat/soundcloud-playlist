<template>
  <div class="bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-gray-700/30 overflow-hidden
              hover:border-orange-500/30 transition-all duration-300 shadow-2xl">
    <div class="relative">
      <!-- Background Image with Overlay -->
      <div class="absolute inset-0">
        <img
          v-if="artwork"
          :src="artwork"
          :alt="title"
          class="w-full h-full object-cover filter blur-xl opacity-10"
        />
        <div v-else class="w-full h-full bg-gradient-to-br from-orange-500/20 to-pink-500/20"></div>
      </div>

      <!-- Content -->
      <div class="relative flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 p-8">
        <!-- Artwork -->
        <div class="relative w-48 h-48 rounded-xl overflow-hidden shadow-2xl
                    transform transition-all duration-300 hover:scale-105 hover:shadow-orange-500/20
                    group">
          <img
            v-if="artwork"
            :src="artwork"
            :alt="title"
            class="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
          />
          <div v-else class="w-full h-full bg-gradient-to-br from-orange-500 to-pink-500 
                            flex items-center justify-center">
            <svg class="w-20 h-20 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        </div>
        
        <!-- Info -->
        <div class="flex-1 text-center md:text-left">
          <h1 class="text-4xl font-bold mb-3 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            {{ title }}
          </h1>
          <p v-if="description" class="text-gray-400 mb-6 text-lg">{{ description }}</p>
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <div class="inline-flex items-center px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20
                        text-orange-500 text-lg font-medium">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              {{ trackCount }} tracks
            </div>
            <button
              @click="$emit('download-all')"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium
                     bg-gradient-to-r from-orange-500 to-pink-500 text-white
                     hover:from-orange-600 hover:to-pink-600
                     transition-all duration-300 transform hover:scale-105
                     focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-gray-900
                     shadow-lg hover:shadow-orange-500/25"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download All
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
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