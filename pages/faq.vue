<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-12 text-center">
      <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-6">
        Frequently Asked Questions
      </h1>
      <p class="text-xl text-gray-400 max-w-2xl mx-auto">
        Everything you need to know about downloading SoundCloud playlists and tracks
      </p>
    </div>

    <!-- FAQ Items -->
    <div class="space-y-6">
      <div v-for="(faq, index) in faqs" :key="index" 
           class="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
        <button
          @click="toggleFaq(index)"
          class="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
        >
          <h3 class="text-lg font-semibold text-gray-200">{{ faq.question }}</h3>
          <svg 
            :class="['w-5 h-5 text-gray-400 transition-transform', { 'rotate-180': openFaqs.includes(index) }]"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-96 opacity-100"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="max-h-96 opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div v-show="openFaqs.includes(index)" class="px-6 pb-4 overflow-hidden">
            <div class="text-gray-300 leading-relaxed" v-html="faq.answer"></div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Contact Section -->
    <div class="mt-16 text-center bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border border-blue-500/30">
      <h2 class="text-2xl font-bold text-blue-300 mb-4">Still have questions?</h2>
      <p class="text-gray-300 mb-6">
        Can't find the answer you're looking for? We're here to help!
      </p>
      <a href="mailto:support@soundcloud-playlist.netlify.app" 
         class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Contact Support
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// SEO optimization using composable
useFAQSEO()

const openFaqs = ref<number[]>([])

const faqs = [
  {
    question: "Is it legal to download SoundCloud tracks?",
    answer: "You should only download tracks that you have permission to download or that are available under <strong>Creative Commons licenses</strong>. Always respect copyright laws and artists' rights. We recommend checking the track's license before downloading."
  },
  {
    question: "Is this service free?",
    answer: "Yes! Our SoundCloud playlist downloader is <strong>completely free</strong> to use. There are no hidden fees, subscriptions, or limitations on the number of downloads."
  },
  {
    question: "What audio quality do I get?",
    answer: "We provide high-quality MP3 downloads with bitrates up to <strong>320kbps</strong>, depending on the original track quality available on SoundCloud. You can also choose lower bitrates for faster downloads."
  },
  {
    question: "How many tracks can I download at once?",
    answer: "You can download entire playlists with <strong>unlimited tracks</strong>. Our bulk download feature processes multiple tracks simultaneously for faster completion."
  },
  {
    question: "Do I need to create an account?",
    answer: "<strong>No registration required!</strong> Simply paste your SoundCloud URL and start downloading immediately. We don't collect personal information or require sign-ups."
  },
  {
    question: "What formats are supported?",
    answer: "Currently, we convert all downloads to <strong>MP3 format</strong>, which is compatible with all devices and music players. We're working on adding more formats like FLAC and WAV."
  },
  {
    question: "Why is my download slow?",
    answer: "Download speed depends on your internet connection and SoundCloud's servers. Try reducing the number of concurrent downloads or lowering the audio quality in settings for faster speeds."
  },
  {
    question: "Can I download private playlists?",
    answer: "No, we can only download <strong>public playlists and tracks</strong> that are accessible via direct SoundCloud URLs. Private content requires special permissions that we don't have access to."
  },
  {
    question: "Does this work on mobile devices?",
    answer: "Yes! Our downloader is <strong>fully mobile-responsive</strong> and works on smartphones and tablets. You can download tracks directly to your device's storage."
  },
  {
    question: "What if a track fails to download?",
    answer: "Some tracks may be geo-restricted, removed, or have download limitations set by the artist. Try refreshing the page or check if the track is still available on SoundCloud."
  },
  {
    question: "How do I download an entire playlist?",
    answer: "Simply paste the SoundCloud playlist URL (it should contain '/sets/' in the URL) into our input field, and click 'Load Playlist'. Then use the 'Download All' button to get all tracks at once."
  },
  {
    question: "Is my data safe?",
    answer: "We don't store your downloads or personal data on our servers. All processing happens in your browser, and files are downloaded directly to your device. Check our <a href='/privacy' class='text-blue-400 hover:text-blue-300'>Privacy Policy</a> for details."
  }
]

function toggleFaq(index: number) {
  if (openFaqs.value.includes(index)) {
    openFaqs.value = openFaqs.value.filter(i => i !== index)
  } else {
    openFaqs.value.push(index)
  }
}
</script>

<style scoped>
.max-h-0 {
  max-height: 0;
}

.max-h-96 {
  max-height: 24rem;
}
</style>