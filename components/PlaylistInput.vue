<template>
  <div class="max-w-xl mx-auto mt-10 px-4">
    <div class="mb-4">
      <label for="playlist-url" class="block text-sm font-medium text-gray-700">SoundCloud Playlist URL</label>
      <div class="mt-1 relative rounded-md shadow-sm">
        <input
          id="playlist-url"
          v-model="playlistUrl"
          type="text"
          placeholder="https://soundcloud.com/user/sets/playlist-name"
          class="block w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pl-3 pr-12 py-2"
          :disabled="loading"
          @keyup.enter="handleFetchPlaylist"
        >
        <div class="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
          <kbd class="inline-flex items-center border border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400">
            Enter ↵
          </kbd>
        </div>
      </div>
      <p class="mt-2 text-sm text-gray-500">
        Paste a SoundCloud playlist URL (e.g., https://soundcloud.com/user/sets/playlist-name)
      </p>
      <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
    </div>
    <button
      @click="handleFetchPlaylist"
      :disabled="loading || !isValidUrl"
      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span v-if="loading">Loading...</span>
      <span v-else>Get Playlist</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const playlistUrl = ref('')
const error = ref('')
const emit = defineEmits(['fetch-playlist'])

defineProps<{
  loading: boolean
}>()

const isValidUrl = computed(() => {
  if (!playlistUrl.value) return false
  try {
    const url = new URL(playlistUrl.value)
    const isValidDomain = url.hostname === 'soundcloud.com'
    const isPlaylist = url.pathname.includes('/sets/')
    return isValidDomain && isPlaylist
  } catch {
    return false
  }
})

const handleFetchPlaylist = () => {
  error.value = ''
  if (!playlistUrl.value) {
    error.value = 'Please enter a SoundCloud playlist URL'
    return
  }
  
  if (!isValidUrl.value) {
    error.value = 'Please enter a valid SoundCloud playlist URL (must contain /sets/)'
    return
  }
  
  emit('fetch-playlist', playlistUrl.value.trim())
}
</script>
