<template>  <div class="max-w-3xl mx-auto mt-8 px-4">
    <UCard>
      <div class="mb-6">
        <UFormGroup label="Enter your SoundCloud playlist">
          <UInput
            v-model="playlistUrl"
            placeholder="https://soundcloud.com/user/sets/playlist-name"
            :error="error"
            :disabled="loading"
            icon="i-heroicons-magnifying-glass"
            @keyup.enter="handleFetchPlaylist"
          />
          <template #hint>
            <p v-if="!error" class="text-sm">
              Paste any public SoundCloud playlist URL
            </p>
            <p v-else class="text-sm text-red-600">
              {{ error }}
            </p>
          </template>
        </UFormGroup>
      </div>

      <div class="flex items-center justify-between">
        <UButton
          block
          @click="handleFetchPlaylist"
          :disabled="loading || !isValidUrl"
          color="primary"
          variant="solid"
          size="lg"
        >
          <template v-if="loading">
            <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading playlist...
          </template>
          <template v-else>
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
            </svg>
            Get Playlist
          </template>
        </button>
      </div>
    </div>
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
