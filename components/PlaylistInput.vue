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
        >          <template v-if="loading">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin mr-2" />
            Loading playlist...
          </template>
          <template v-else>
            <UIcon name="i-heroicons-cloud-arrow-down" class="mr-2" />
            Get Playlist
          </template>
        </UButton>
      </div>
    </UCard>
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
