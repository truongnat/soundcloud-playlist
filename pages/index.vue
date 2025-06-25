<template>
  <div class="min-h-screen bg-gray-900 text-white p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold text-center mb-8">
        SoundCloud Playlist Downloader
      </h1>
      
      <div class="bg-gray-800 p-6 rounded-lg">
        <p class="text-center text-gray-300">
          Simple test page - If you see this, the ECONNRESET issue is fixed!
        </p>
        
        <div class="mt-4 text-center">
          <button 
            @click="testClick"
            class="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-lg transition-colors"
          >
            Test Button
          </button>
        </div>
        
        <div v-if="clicked" class="mt-4 text-center text-green-400">
          ✅ Button clicked successfully! Vue is working.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Simple reactive state
const clicked = ref(false)

// Simple method
function testClick() {
  clicked.value = true
  console.log('Button clicked - Vue is working!')
}

// Simple SEO
useHead({
  title: 'SoundCloud Playlist Downloader - Test Page',
  meta: [
    { name: 'description', content: 'Test page for ECONNRESET fix' }
  ]
})

console.log('Simple index page loaded successfully!')
</script>